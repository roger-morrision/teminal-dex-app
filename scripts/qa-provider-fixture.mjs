import { createServer } from 'node:http';
import { Buffer } from 'node:buffer';
import { pathToFileURL } from 'node:url';

const HOST = '127.0.0.1';
const DEFAULT_PORT = 3099;
const scenarios = new Set(['current', 'empty', 'stale', 'offline', 'page-failure-once']);

function token(address, symbol, dex, liquidity, observedAt) {
  return {
    id: `fixture-${symbol.toLowerCase()}`,
    symbol,
    name: `${symbol} deterministic QA token`,
    address,
    pairAddress: `fixture-pair-${symbol.toLowerCase()}`,
    dex,
    quoteSymbol: 'SOL',
    price: symbol === 'PUMP' ? 0.0125 : 0.0042,
    marketCap: symbol === 'PUMP' ? 1250000 : 420000,
    liquidity,
    volume24h: liquidity * 3,
    volume1h: liquidity / 4,
    change24h: symbol === 'PUMP' ? 8.4 : -3.2,
    change1h: symbol === 'PUMP' ? 1.8 : -0.7,
    txns5m: { buys: 4, sells: 2 },
    ageLabel: '2h',
    ageMinutes: 120,
    source: 'mobile_qa_fixture',
    dataQuality: 'deterministic_test_fixture',
    sourceFetchedAt: observedAt,
  };
}

function json(response, status, body, origin) {
  const payload = JSON.stringify(body);
  response.writeHead(status, {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'content-type,x-mobile-fixture-control',
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
    Vary: 'Origin',
  });
  response.end(payload);
}

export function createQaProviderFixture() {
  let scenario = 'current';
  let pageFailureConsumed = false;
  const server = createServer((request, response) => {
    const origin = request.headers.origin ?? 'http://127.0.0.1';
    const url = new URL(request.url ?? '/', 'http://fixture.local');
    if (request.method === 'OPTIONS') return json(response, 204, {}, origin);
    if (url.pathname === '/__mobile_qa_fixture__/state') {
      if (request.method === 'GET') return json(response, 200, { scenario, pageFailureConsumed }, origin);
      if (request.method !== 'POST' || request.headers['x-mobile-fixture-control'] !== 'qa-local') {
        return json(response, 403, { error: 'Fixture control denied.' }, origin);
      }
      const next = url.searchParams.get('scenario');
      if (!next || !scenarios.has(next)) return json(response, 400, { error: 'Unknown fixture scenario.' }, origin);
      scenario = next;
      pageFailureConsumed = false;
      return json(response, 200, { scenario, pageFailureConsumed }, origin);
    }
    if (url.pathname !== '/api/trending') return json(response, 404, { error: 'Fixture route unavailable.' }, origin);
    if (request.method !== 'GET' && request.method !== 'HEAD') return json(response, 405, { error: 'Method not allowed.' }, origin);
    if (scenario === 'offline') return json(response, 503, { error: 'Controlled provider outage.' }, origin);
    const cursor = url.searchParams.get('cursor');
    if (scenario === 'page-failure-once' && cursor === '1' && !pageFailureConsumed) {
      pageFailureConsumed = true;
      return json(response, 503, { error: 'Controlled one-shot cursor outage.' }, origin);
    }
    const now = scenario === 'stale' ? 1_700_000_000_000 : 1_800_000_000_000;
    const tokens = scenario === 'empty'
      ? []
      : cursor === '1'
        ? [token('11111111111111111111111111111112', 'BONK', 'letsbonk', 500000, now)]
        : [token('11111111111111111111111111111111', 'PUMP', 'Pump.fun', 900000, now)];
    const hasMore = scenario !== 'empty' && !cursor;
    return json(response, 200, {
      tokens,
      source: 'mobile_qa_fixture',
      dataQuality: 'deterministic_test_fixture',
      fetchedAt: now,
      recordCount: tokens.length,
      totalCount: scenario === 'empty' ? 0 : 2,
      pagination: { hasMore, nextCursor: hasMore ? '1' : null },
      freshness: { isStale: scenario === 'stale', ageMs: scenario === 'stale' ? 100000000000 : 0 },
    }, origin);
  });
  return server;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const requested = Number.parseInt(process.env.MOBILE_QA_FIXTURE_PORT ?? '', 10);
  const port = Number.isInteger(requested) && requested >= 1024 && requested <= 65535 ? requested : DEFAULT_PORT;
  const server = createQaProviderFixture();
  server.listen(port, HOST, () => {
    console.log(`MOBILE QA provider fixture listening on http://127.0.0.1:${port}.`);
    console.log('This deterministic fixture is test-only and never a production data source.');
  });
}
