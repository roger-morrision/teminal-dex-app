import { createUserAlert, fetchAlertDeliveries, fetchDiscovery, fetchMonitorAlerts, fetchOhlcv, fetchPortfolioAnalytics, fetchSwapQuote, fetchTokenDetail, fetchTokenPanel, fetchTrenches, fetchUserAlerts, fetchWalletPnl, searchTokens, setUserAlertActive } from '@/api/client';

const token = { id: 'pair', symbol: 'DEX', name: 'Terminal', address: 'mint', pairAddress: 'pair', dex: 'raydium', quoteSymbol: 'SOL', price: 1, marketCap: 10, liquidity: 5, volume24h: 4, volume1h: 2, change24h: 3, change1h: 1, txns5m: { buys: 1, sells: 0 }, ageLabel: '1h', ageMinutes: 60 };
const jsonResponse = (body: unknown, ok = true, status = 200) => ({ ok, status, json: jest.fn().mockResolvedValue(body) }) as unknown as Response;

describe('backend client routing', () => {
  const originalUrl = process.env.EXPO_PUBLIC_API_URL;
  beforeEach(() => { process.env.EXPO_PUBLIC_API_URL = 'https://terminal.example/'; global.fetch = jest.fn(); });
  afterAll(() => { process.env.EXPO_PUBLIC_API_URL = originalUrl; });

  it('routes special discovery modes to their real endpoints', async () => {
    jest.mocked(fetch).mockResolvedValue(jsonResponse({ tokens: [token], source: 'gmgn', dataQuality: 'provider_live' }));
    await fetchDiscovery('surge', '1h', { dex: 'All', minLiquidity: '', minMarketCap: '' });
    expect(fetch).toHaveBeenCalledWith('https://terminal.example/api/trending/surge', expect.objectContaining({ headers: { Accept: 'application/json' } }));
  });

  it('encodes search terms and validates token detail', async () => {
    jest.mocked(fetch).mockResolvedValueOnce(jsonResponse({ tokens: [token], source: 'search', dataQuality: 'provider_live' })).mockResolvedValueOnce(jsonResponse({ token, receivedAt: 1 }));
    await searchTokens('DEX token'); await fetchTokenDetail('mint');
    expect(jest.mocked(fetch).mock.calls[0]?.[0]).toBe('https://terminal.example/api/search?q=DEX+token');
    expect(jest.mocked(fetch).mock.calls[1]?.[0]).toBe('https://terminal.example/api/token/mint');
  });

  it('rejects an invalid configured origin before a request', async () => {
    process.env.EXPO_PUBLIC_API_URL = 'javascript:alert(1)';
    await expect(searchTokens('DEX')).rejects.toThrow('must use HTTP or HTTPS');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('routes token panels and chart timeframes without leaking parameters', async () => {
    jest.mocked(fetch).mockResolvedValueOnce(jsonResponse({ pairs: [], dataQuality: 'unavailable' })).mockResolvedValueOnce(jsonResponse({ candles: [], tf: '4h', source: 'none', dataQuality: 'unavailable' }));
    await fetchTokenPanel('mint', 'pairs'); await fetchOhlcv('mint', '4h');
    expect(jest.mocked(fetch).mock.calls[0]?.[0]).toBe('https://terminal.example/api/token/mint/pairs');
    expect(jest.mocked(fetch).mock.calls[1]?.[0]).toBe('https://terminal.example/api/token/mint/ohlcv?tf=4h');
  });

  it('requests portfolio and PnL evidence with encoded bounded parameters', async () => {
    jest.mocked(fetch).mockResolvedValueOnce(jsonResponse({ success: true, timestamp: 1, data: { address: 'wallet', timeframe: '30d', holdings: [], allocation: {}, totalValueUsd: 0, tokenCount: 0, riskScore: null, performance: null }, provenance: { source: 'provider_backed_wallet_holdings', observedAt: null, dataQuality: 'unavailable', derived: [], unavailable: ['cost_basis'] } })).mockResolvedValueOnce(jsonResponse({ pnl: null, ts: 1 }));
    await fetchPortfolioAnalytics('wallet', '30d'); await fetchWalletPnl('wallet');
    expect(jest.mocked(fetch).mock.calls[0]?.[0]).toBe('https://terminal.example/api/analytics/portfolio?address=wallet&timeframe=30d');
    expect(jest.mocked(fetch).mock.calls[1]?.[0]).toBe('https://terminal.example/api/wallet/wallet/pnl');
  });

  it('loads Trenches and bounds quote parameters before network access', async () => {
    jest.mocked(fetch).mockResolvedValueOnce(jsonResponse({ newTokens: [], almostBonded: [], migrated: [], fetchedAt: 1, recordCount: 0, providers: [], source: 'none', dataQuality: 'unavailable', freshness: { ageMs: null, staleAfterMs: 60_000, isStale: true } }));
    await fetchTrenches(); expect(jest.mocked(fetch).mock.calls[0]?.[0]).toBe('https://terminal.example/api/trenches');
    await expect(fetchSwapQuote({ token: 'mint', side: 'buy', amount: '1', unit: 'usd', slippageBps: 501 })).rejects.toThrow('slippage');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('uses credentialed owner-scoped alert routes and never invokes evaluation', async () => {
    const address = '11111111111111111111111111111111';
    const alert = { id: 'a', userId: address, chainId: 'solana', address, type: 'price', name: 'Breakout', description: '', conditions: { condition: 'above', targetPrice: 10 }, channels: ['inApp'], cooldownMinutes: 60, active: true, lastTriggered: null, triggerCount: 0, createdAt: 1, updatedAt: 1, persistence: 'database' };
    jest.mocked(fetch).mockResolvedValueOnce(jsonResponse({ alerts: [], ts: 1, fetchedAt: 1, source: 'database', providers: [], recordCount: 0, dataQuality: 'onchain_signatures_only', freshness: { isStale: false, staleAfterMs: 300000 } })).mockResolvedValueOnce(jsonResponse({ success: true, count: 1, data: [alert], persistence: 'database' })).mockResolvedValueOnce(jsonResponse({ success: true, data: alert })).mockResolvedValueOnce(jsonResponse({ success: true, data: { ...alert, active: false } })).mockResolvedValueOnce(jsonResponse({ success: true, count: 0, data: [], persistence: 'database' }));
    await fetchMonitorAlerts(); await fetchUserAlerts(); await createUserAlert({ address, type: 'price', name: 'Breakout', conditions: { condition: 'above', targetPrice: 10 }, cooldownMinutes: 60, channels: ['inApp'] }); await setUserAlertActive('a', false); await fetchAlertDeliveries();
    expect(jest.mocked(fetch).mock.calls.map((call) => call[0])).toEqual(['https://terminal.example/api/monitor/alerts', 'https://terminal.example/api/alerts?limit=100', 'https://terminal.example/api/alerts', 'https://terminal.example/api/alerts', 'https://terminal.example/api/alerts/deliveries?limit=100']);
    expect(jest.mocked(fetch).mock.calls.some((call) => String(call[0]).includes('/evaluate'))).toBe(false);
    expect(jest.mocked(fetch).mock.calls[2]?.[1]).toEqual(expect.objectContaining({ credentials: 'include', method: 'POST' }));
  });
});
