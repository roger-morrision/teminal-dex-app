import { trendingSchema } from '@/api/schema';

const token = { id: 'pair', symbol: 'DEX', name: 'Terminal', address: 'mint', pairAddress: 'pair', dex: 'raydium', quoteSymbol: 'SOL', price: 1, marketCap: 10, liquidity: 5, volume24h: 4, volume1h: 2, change24h: 3, change1h: 1, txns5m: { buys: 1, sells: 0 }, ageLabel: '1h', ageMinutes: 60 };
describe('trendingSchema', () => { it('accepts the backend contract and preserves evidence', () => { expect(trendingSchema.parse({ tokens: [token], source: 'database', dataQuality: 'stored_provider_observations', freshness: { isStale: false } }).tokens[0]?.symbol).toBe('DEX'); }); it('rejects unsafe malformed values', () => { expect(trendingSchema.safeParse({ tokens: [{ ...token, price: '1' }] }).success).toBe(false); }); });
