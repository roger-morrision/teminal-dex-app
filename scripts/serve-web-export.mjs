import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
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

export function createExportServer(root) {
  const canonicalRoot = path.resolve(root);
  return createServer(async (request, response) => {
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
  createExportServer(root).listen(parsedPort, '127.0.0.1', () => {
    console.log(`Serving MOBILE static export from ${root} at http://127.0.0.1:${parsedPort}`);
  });
}
