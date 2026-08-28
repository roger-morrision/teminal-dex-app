import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createExportServer, injectConsoleCapture, resolveExportFile } from './serve-web-export.mjs';

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'mobile-web-export-'));
  await mkdir(path.join(root, '_expo'), { recursive: true });
  await writeFile(path.join(root, 'index.html'), '<h1>Home</h1>');
  await writeFile(path.join(root, 'whales.html'), '<h1>Whales</h1>');
  await writeFile(path.join(root, '_expo', 'entry.js'), 'globalThis.loaded = true;');
  return root;
}

test('resolves Expo extensionless routes and static assets inside the export root', async (context) => {
  const root = await fixture();
  context.after(() => rm(root, { recursive: true, force: true }));
  assert.equal(await resolveExportFile(root, '/whales?mode=live'), path.join(root, 'whales.html'));
  assert.equal(await resolveExportFile(root, '/_expo/entry.js'), path.join(root, '_expo', 'entry.js'));
  assert.equal(await resolveExportFile(root, '/../outside.txt'), null);
});

test('serves GET and HEAD on loopback-compatible HTTP semantics and rejects mutation methods', async (context) => {
  const root = await fixture();
  const server = createExportServer(root);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  context.after(async () => {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    await rm(root, { recursive: true, force: true });
  });
  const address = server.address();
  assert(address && typeof address === 'object');
  const origin = `http://127.0.0.1:${address.port}`;
  const route = await fetch(`${origin}/whales`);
  assert.equal(route.status, 200);
  assert.equal(route.headers.get('content-type'), 'text/html; charset=utf-8');
  assert.match(await route.text(), /Whales/);
  const head = await fetch(`${origin}/_expo/entry.js`, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
  const mutation = await fetch(`${origin}/whales`, { method: 'POST' });
  assert.equal(mutation.status, 405);
});

test('captures browser console errors only when the explicit diagnostic gate is enabled', async (context) => {
  const root = await fixture();
  const server = createExportServer(root, { captureConsole: true });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  context.after(async () => {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    await rm(root, { recursive: true, force: true });
  });
  const address = server.address();
  assert(address && typeof address === 'object');
  const origin = `http://127.0.0.1:${address.port}`;
  const html = await (await fetch(`${origin}/whales`)).text();
  assert.match(html, /__mobile_browser_console__/);
  assert.match(injectConsoleCapture('<head></head><body></body>'), /console\.error=function/);
  assert.equal((await fetch(`${origin}/__mobile_browser_console__`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ level: 'error', args: ['Minified React error #418'] }) })).status, 204);
  assert.deepEqual(await (await fetch(`${origin}/__mobile_browser_console__`)).json(), [{ level: 'error', args: ['Minified React error #418'] }]);
  assert.equal((await fetch(`${origin}/__mobile_browser_console__`, { method: 'DELETE' })).status, 204);
  assert.deepEqual(await (await fetch(`${origin}/__mobile_browser_console__`)).json(), []);
  assert.equal((await fetch(`${origin}/whales`, { method: 'POST' })).status, 405);
});
