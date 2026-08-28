import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const MIME_TYPES = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.webp', 'image/webp'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
]);

function safeRequestPath(requestUrl) {
  try {
    return decodeURIComponent(new URL(requestUrl ?? '/', 'http://127.0.0.1').pathname);
  } catch {
    return null;
  }
}

export async function resolveExportFile(root, requestUrl) {
  const pathname = safeRequestPath(requestUrl);
  if (!pathname || pathname.includes('\0')) return null;
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const candidates = path.extname(relative)
    ? [relative]
    : [`${relative}.html`, path.join(relative, 'index.html')];
  const canonicalRoot = path.resolve(root);

  for (const candidate of candidates) {
    const absolute = path.resolve(canonicalRoot, candidate);
    if (absolute !== canonicalRoot && !absolute.startsWith(`${canonicalRoot}${path.sep}`)) continue;
    try {
      if ((await stat(absolute)).isFile()) return absolute;
    } catch {
      // Try the next bounded static-export candidate.
    }
  }
  return null;
}

export function contentTypeFor(filePath) {
  return MIME_TYPES.get(path.extname(filePath).toLowerCase()) ?? 'application/octet-stream';
}

const CONSOLE_PATH = '/__mobile_browser_console__';
const CONSOLE_CAPTURE = `<script>(function(){var send=function(level,args){try{fetch('${CONSOLE_PATH}',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({level:level,args:Array.prototype.map.call(args,function(value){try{return typeof value==='string'?value:JSON.stringify(value)}catch(_){return String(value)}})})})}catch(_){}};var original=console.error;console.error=function(){send('error',arguments);return original.apply(console,arguments)};window.addEventListener('error',function(event){send('window-error',[event.message])});window.addEventListener('unhandledrejection',function(event){send('unhandled-rejection',[String(event.reason)])})})();</script>`;

export function injectConsoleCapture(html) {
  return html.includes('</head>') ? html.replace('</head>', `${CONSOLE_CAPTURE}</head>`) : `${CONSOLE_CAPTURE}${html}`;
}

export function createExportServer(root, { captureConsole = false } = {}) {
  const canonicalRoot = path.resolve(root);
  const browserConsole = [];
  return createServer(async (request, response) => {
    const pathname = safeRequestPath(request.url);
    if (captureConsole && pathname === CONSOLE_PATH) {
      if (request.method === 'GET') {
        response.writeHead(200, { 'Cache-Control': 'no-store', 'Content-Type': 'application/json; charset=utf-8' });
        response.end(JSON.stringify(browserConsole));
        return;
      }
      if (request.method === 'DELETE') {
        browserConsole.length = 0;
        response.writeHead(204);
        response.end();
        return;
      }
      if (request.method === 'POST') {
        let body = '';
        for await (const chunk of request) {
          body += chunk;
          if (body.length > 65_536) break;
        }
        try {
          const entry = JSON.parse(body);
          browserConsole.push({ level: String(entry.level ?? 'error').slice(0, 64), args: Array.isArray(entry.args) ? entry.args.map((value) => String(value).slice(0, 2_000)).slice(0, 20) : [] });
        } catch {
          browserConsole.push({ level: 'capture-error', args: ['Malformed browser console report'] });
        }
        if (browserConsole.length > 200) browserConsole.splice(0, browserConsole.length - 200);
        response.writeHead(204);
        response.end();
        return;
      }
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { Allow: 'GET, HEAD' });
      response.end('Method not allowed');
      return;
    }
    const filePath = await resolveExportFile(canonicalRoot, request.url);
    if (!filePath) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }
    response.writeHead(200, {
      'Cache-Control': 'no-store',
      'Content-Type': contentTypeFor(filePath),
      'X-Content-Type-Options': 'nosniff',
    });
    if (request.method === 'HEAD') response.end();
    else if (captureConsole && path.extname(filePath).toLowerCase() === '.html') response.end(injectConsoleCapture(await readFile(filePath, 'utf8')));
    else createReadStream(filePath).pipe(response);
  });
}

function optionValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const positionalRoot = process.argv.slice(2).find((argument) => !argument.startsWith('--'));
  const root = path.resolve(positionalRoot ?? 'dist');
  const parsedPort = Number.parseInt(optionValue('--port') ?? '8095', 10);
  if (!Number.isInteger(parsedPort) || parsedPort < 1024 || parsedPort > 65535) {
    console.error('Export server port must be an integer from 1024 through 65535.');
    process.exit(1);
  }
  try {
    if (!(await stat(root)).isDirectory()) throw new Error('not a directory');
  } catch {
    console.error(`Static export directory is unavailable: ${root}`);
    process.exit(1);
  }
  createExportServer(root, { captureConsole: process.argv.includes('--capture-console') }).listen(parsedPort, '127.0.0.1', () => {
    console.log(`Serving MOBILE static export from ${root} at http://127.0.0.1:${parsedPort}`);
  });
}
