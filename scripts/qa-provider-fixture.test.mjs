import assert from 'node:assert/strict';
import { once } from 'node:events';
import test from 'node:test';
import { createQaProviderFixture } from './qa-provider-fixture.mjs';

async function fixture() {
  const server = createQaProviderFixture();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  return { server, origin: `http://127.0.0.1:${address.port}` };
}

async function select(origin, scenario) {
  return fetch(`${origin}/__mobile_qa_fixture__/state?scenario=${scenario}`, {
    method: 'POST',
    headers: { 'x-mobile-fixture-control': 'qa-local' },
  });
}

test('serves schema-compatible deterministic current, stale, and empty pages', async (t) => {
  const { server, origin } = await fixture();
  t.after(() => server.close());
  let response = await fetch(`${origin}/api/trending?limit=50`);
  let body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.tokens[0].symbol, 'PUMP');
  assert.deepEqual(body.pagination, { hasMore: true, nextCursor: '1' });
  await select(origin, 'stale');
  body = await (await fetch(`${origin}/api/trending`)).json();
  assert.equal(body.freshness.isStale, true);
  await select(origin, 'empty');
  body = await (await fetch(`${origin}/api/trending`)).json();
  assert.deepEqual(body.tokens, []);
  assert.equal(body.totalCount, 0);
});

test('fails one cursor request and then permits the exact retry', async (t) => {
  const { server, origin } = await fixture();
  t.after(() => server.close());
  assert.equal((await select(origin, 'page-failure-once')).status, 200);
  const failed = await fetch(`${origin}/api/trending?cursor=1`);
  assert.equal(failed.status, 503);
  const retried = await fetch(`${origin}/api/trending?cursor=1`);
  const body = await retried.json();
  assert.equal(retried.status, 200);
  assert.equal(body.tokens[0].symbol, 'BONK');
  assert.deepEqual(body.pagination, { hasMore: false, nextCursor: null });
});

test('keeps fixture control bounded and unavailable without its explicit header', async (t) => {
  const { server, origin } = await fixture();
  t.after(() => server.close());
  assert.equal((await fetch(`${origin}/__mobile_qa_fixture__/state?scenario=offline`, { method: 'POST' })).status, 403);
  assert.equal((await select(origin, 'invented')).status, 400);
  await select(origin, 'offline');
  assert.equal((await fetch(`${origin}/api/trending`)).status, 503);
  assert.equal((await fetch(`${origin}/not-production`)).status, 404);
});
