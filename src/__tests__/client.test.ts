import { fetchDiscovery, fetchTokenDetail, searchTokens } from '@/api/client';

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
});
