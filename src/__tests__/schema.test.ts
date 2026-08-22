import { ohlcvSchema, portfolioAnalyticsSchema, swapQuoteSchema, transactionsSchema, trenchesSchema, trendingSchema, walletPnlSchema } from '@/api/schema';

const token = { id: 'pair', symbol: 'DEX', name: 'Terminal', address: 'mint', pairAddress: 'pair', dex: 'raydium', quoteSymbol: 'SOL', price: 1, marketCap: 10, liquidity: 5, volume24h: 4, volume1h: 2, change24h: 3, change1h: 1, txns5m: { buys: 1, sells: 0 }, ageLabel: '1h', ageMinutes: 60 };
describe('trendingSchema', () => { it('accepts the backend contract and preserves evidence', () => { expect(trendingSchema.parse({ tokens: [token], source: 'database', dataQuality: 'stored_provider_observations', freshness: { isStale: false } }).tokens[0]?.symbol).toBe('DEX'); }); it('rejects unsafe malformed values', () => { expect(trendingSchema.safeParse({ tokens: [{ ...token, price: '1' }] }).success).toBe(false); }); });

describe('token intelligence schemas', () => {
  it('rejects malformed candles instead of drawing invented values', () => { expect(ohlcvSchema.safeParse({ candles: [{ time: 1, close: '1' }], tf: '1h', source: 'x', dataQuality: 'live' }).success).toBe(false); });
  it('preserves transaction finality and partial-quality evidence', () => { const result = transactionsSchema.parse({ txns: [{ signature: 's', timestamp: 1, type: 'buy', amount: 2, amountUsd: 3, price: null, feePayer: null, source: 'gmgn', finality: 'provider_reported' }], dataQuality: 'observed_partial', quality: { completeHistory: false } }); expect(result.quality?.completeHistory).toBe(false); });
});

describe('portfolio evidence schemas', () => {
  it('requires the backend to declare unavailable analytics', () => { const result = portfolioAnalyticsSchema.parse({ success: true, timestamp: 1, data: { address: 'wallet', timeframe: '30d', holdings: [], allocation: {}, totalValueUsd: 0, tokenCount: 0, riskScore: null, performance: null }, provenance: { source: 'provider', observedAt: null, dataQuality: 'unavailable', derived: [], unavailable: ['cost_basis', 'realized_pnl'] } }); expect(result.provenance.unavailable).toContain('cost_basis'); });
  it('does not coerce missing unrealized PnL to zero', () => { const result = walletPnlSchema.parse({ pnl: { status: 'unavailable', realizedPnl: null, unrealizedPnl: null, totalPnl: null, pnl7d: null, pnl30d: null, winRate: null, tradeCount: 0, equityCurve: [], provenance: { method: 'fifo', sources: [], indexedSwapCount: 0 }, warnings: [] } }); expect(result.pnl?.unrealizedPnl).toBeNull(); });
});

describe('Trenches and quote safety schemas', () => {
  it('requires all three launch lanes and freshness evidence', () => { expect(trenchesSchema.safeParse({ newTokens: [], almostBonded: [], migrated: [], fetchedAt: 1, recordCount: 0, providers: [], source: 'none', dataQuality: 'unavailable', freshness: { ageMs: null, staleAfterMs: 60_000, isStale: true } }).success).toBe(true); });
  it('rejects a nominal quote without exact raw amounts and context', () => { expect(swapQuoteSchema.safeParse({ quote: { side: 'buy', real: true }, jupQuote: {}, quotedAt: 1, ts: 1 }).success).toBe(false); });
});
