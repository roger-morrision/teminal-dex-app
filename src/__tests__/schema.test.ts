import { aiPaperReportSchema, aiPlatformSchema, aiRecommendationsSchema, alertDeliveriesSchema, copyTradeConfigSchema, copyTradeHealthSchema, monitorAlertsSchema, ohlcvSchema, portfolioAnalyticsSchema, swapQuoteSchema, topTradersSchema, transactionsSchema, trenchesSchema, trendingSchema, userAlertsSchema, walletPnlSchema } from '@/api/schema';

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

describe('Monitor and alert evidence schemas', () => {
  const address = '11111111111111111111111111111111';
  it('requires signed observation provenance and durable alert ownership', () => {
    expect(monitorAlertsSchema.safeParse({ alerts: [{ id: 'sig', type: 'onchain_buy', tokenAddress: address, tokenSymbol: 'SOL', message: 'confirmed', timestamp: 1, txHash: 'sig', source: 'rpc', read: false }], ts: 1, fetchedAt: 1, source: 'database', providers: ['solana_token_transactions'], recordCount: 1, dataQuality: 'onchain_signatures_only', freshness: { isStale: false, staleAfterMs: 300000 } }).success).toBe(true);
    expect(userAlertsSchema.safeParse({ success: true, count: 1, persistence: 'database', data: [{ id: 'a', userId: address, chainId: 'solana', address, type: 'price', name: 'Breakout', description: '', conditions: { condition: 'above', targetPrice: 10 }, channels: ['inApp'], cooldownMinutes: 60, active: true, lastTriggered: null, triggerCount: 0, createdAt: 1, updatedAt: 1, persistence: 'database' }] }).success).toBe(true);
  });
  it('rejects fabricated delivery success without timestamps', () => { expect(alertDeliveriesSchema.safeParse({ success: true, count: 1, persistence: 'database', data: [{ id: 'd', alertId: 'a', eventKey: 'e', channel: 'inApp', status: 'delivered', reason: null, deliveredAt: null }] }).success).toBe(false); });
});

describe('CopyTrade evidence schemas', () => {
  const address = '11111111111111111111111111111111';
  it('preserves ranking provenance and execution readiness limitations', () => {
    expect(topTradersSchema.safeParse({ traders: [{ rank: 1, address, pnlUsd: 5, pnlPct: 2, winRate: 50, trades: 2, bestToken: 'SOL', bestTokenPct: 2, badge: 'Degen', sparkline: [1, 5] }], fetchedAt: 1, recordCount: 1, source: 'indexed Solana swaps', dataQuality: 'indexed_observed', freshness: { latestSourceFetchedAt: 1, ageMs: 0, staleAfterMs: 120000, isStale: false } }).success).toBe(true);
    const health = copyTradeHealthSchema.parse({ service: 'copytrade', chain: 'solana', mode: 'simulation', readiness: { traderData: true, walletMonitor: false, quote: false, walletSignature: false, broadcast: false, confirmation: false, durableStorage: true, automationWorker: false }, providers: { helius: false, gmgn: false }, recordCount: 1, checkedAt: 1 });
    expect(health.readiness.walletSignature).toBe(false);
  });
  it('rejects configs with out-of-bounds financial risk fields', () => { expect(copyTradeConfigSchema.safeParse({ id: 'c', userId: address, sourceWallet: address, isActive: false, createdAt: 1, updatedAt: 1, sizingMode: 'fixed_sol', fixedAmountSol: 1, maxPositionSizeSol: 1, maxDailyVolumeSol: 1, maxDailyLossSol: 0, maxSlippageBps: 5001, maxPriceImpactPct: 5, minLiquidityUsd: 0, maxMarketCapUsd: 0, excludedTokens: [], onlyNewLaunches: false, maxTokenAgeMinutes: 60, copySells: true, copyBuys: true, delayMs: 0, maxConcurrentPositions: 1 }).success).toBe(false); });
});

describe('AI advisory and simulation schemas', () => {
  const address = '11111111111111111111111111111111';
  it('requires recommendation evidence to declare execution disabled', () => { const recommendation = { tokenAddress: address, tokenSymbol: 'SOL', chain: 'solana', score: 80, confidence: 70, category: 'monitor', modelVersion: 'v1', createdAt: '2026-08-22T00:00:00.000Z', recommendationEvidence: { status: 'advisory_current', safeForAdvisoryUse: true, executionEnabled: false, providerFamilies: ['rpc', 'dex'], missingFeatures: [], expired: false, costsIncluded: true, pointInTime: true }, outcomes: { total: 1, resolved: 1, wins: 1, losses: 0, avgReturnPct: 2 } }; const base = { success: true, data: { readOnly: true, recommendations: [recommendation] } }; expect(aiRecommendationsSchema.safeParse(base).success).toBe(true); expect(aiRecommendationsSchema.safeParse({ ...base, data: { ...base.data, recommendations: [{ ...recommendation, recommendationEvidence: { ...recommendation.recommendationEvidence, executionEnabled: true } }] } }).success).toBe(false); });
  it('requires paper mode, kill switch, and read-only delivery', () => { const result = aiPaperReportSchema.safeParse({ success: true, data: { mode: 'simulation', executionEnabled: false, readOnly: true, generatedAt: 1, config: { enabled: true, startingCashUsd: 1000, positionSizeUsd: 10, maxOpenPositions: 2, minScore: 70, minConfidence: 70, takeProfitPct: 20, stopLossPct: 10, feeBps: 10, slippageBps: 20 }, summary: { equityUsd: 1000, totalPnlUsd: 0, realizedPnlUsd: 0, unrealizedPnlUsd: 0, openPositions: 0, closedTrades: 0, winRate: null, maxDrawdownPct: 0, markCoverage: 1, unavailableMarks: 0 }, analytics: { profitFactor: null, expectancyUsd: null, totalFeesUsd: 0, totalSlippageCostUsd: 0 }, risk: { entriesAllowed: true, dailyLossLimitHit: false, cooldownActive: false }, readiness: { status: 'collecting', executionEnabled: false, killSwitch: true, note: 'advisory', checks: { simulationOnly: true } }, operations: { status: 'healthy' }, positions: [], closedTrades: [], dailyPerformance: [], potentialPool: [] } }); expect(result.success).toBe(true); });
  it('rejects governance that enables execution', () => { expect(aiPlatformSchema.safeParse({ success: true, executionEnabled: true, data: { schema: 'ai-platform-readiness-v1', phases: [], metrics: {}, phase31: { status: 'blocked', blockers: [], checks: {}, executionEnabled: false } } }).success).toBe(false); });
});
