import { z } from 'zod';

const transactionCount = z.object({ buys: z.number(), sells: z.number() }).catch({ buys: 0, sells: 0 });

export const tokenSchema = z.object({
  id: z.string(), symbol: z.string(), name: z.string(), address: z.string(), pairAddress: z.string(),
  dex: z.string(), quoteSymbol: z.string(), price: z.number(), marketCap: z.number().nullable(),
  liquidity: z.number(), volume24h: z.number(), volume1h: z.number(), change24h: z.number(),
  change1h: z.number(), txns5m: transactionCount, ageLabel: z.string(), ageMinutes: z.number(),
  imageUrl: z.string().url().optional(), source: z.string().optional(), dataQuality: z.string().optional(),
  sourceFetchedAt: z.number().optional(), holderCount: z.number().nullable().optional(),
  topHolderPct: z.number().nullable().optional(), sniperPct: z.number().nullable().optional(),
}).passthrough();

export type MarketToken = z.infer<typeof tokenSchema>;

export const trendingSchema = z.object({
  tokens: z.array(tokenSchema),
  source: z.string().default('unknown'),
  dataQuality: z.string().default('unknown'),
  fetchedAt: z.number().optional(),
  error: z.string().optional(),
  nextCursor: z.union([z.string(), z.number()]).nullable().optional(),
  recordCount: z.number().optional(),
  totalCount: z.number().optional(),
  pagination: z.object({ hasMore: z.boolean(), nextCursor: z.string().nullable() }).passthrough().optional(),
  status: z.string().optional(),
  rankingMethod: z.string().optional(),
  freshness: z.object({ isStale: z.boolean().optional(), ageMs: z.number().nullable().optional() }).passthrough().optional(),
}).passthrough();

export type TrendingResponse = z.infer<typeof trendingSchema>;

export const tokenDetailSchema = z.object({
  token: tokenSchema.nullable(),
  observedAt: z.number().nullable().optional(),
  receivedAt: z.number().optional(),
  degraded: z.boolean().optional(),
  error: z.string().optional(),
  priceEvidence: z.object({ safeForAutomation: z.boolean().optional(), freshness: z.string().optional() }).passthrough().optional(),
  securityEvidence: z.object({ safeForAutomation: z.boolean().optional(), flags: z.array(z.string()).optional() }).passthrough().optional(),
  riskEvidence: z.object({ safeForAutomation: z.boolean().optional(), level: z.string().nullable().optional() }).passthrough().optional(),
}).passthrough();

export type TokenDetailResponse = z.infer<typeof tokenDetailSchema>;

export const candleSchema = z.object({ time: z.number(), open: z.number(), high: z.number(), low: z.number(), close: z.number(), volume: z.number() }).passthrough();
export const ohlcvSchema = z.object({ candles: z.array(candleSchema), tf: z.string(), source: z.string(), dataQuality: z.string(), degraded: z.boolean().optional(), quality: z.record(z.string(), z.unknown()).optional() }).passthrough();
export type OhlcvResponse = z.infer<typeof ohlcvSchema>;

const evidenceMetricSchema = z.object({ available: z.boolean(), value: z.union([z.string(), z.number(), z.boolean()]).nullable(), confidence: z.string(), source: z.string().nullable().optional() }).passthrough();
export const holdersSchema = z.object({ holders: z.array(z.object({ address: z.string(), uiAmount: z.number(), pct: z.number(), rank: z.number() }).passthrough()), source: z.string().optional(), evidence: z.record(z.string(), evidenceMetricSchema).optional() }).passthrough();
export type HoldersResponse = z.infer<typeof holdersSchema>;

export const transactionsSchema = z.object({ txns: z.array(z.object({ signature: z.string(), timestamp: z.number(), type: z.enum(['buy', 'sell']), amount: z.number(), amountUsd: z.number(), price: z.number().nullable(), feePayer: z.string().nullable(), source: z.string(), finality: z.string() }).passthrough()), dataQuality: z.string(), quality: z.object({ freshness: z.string().optional(), completeHistory: z.boolean().optional() }).passthrough().optional() }).passthrough();
export type TransactionsResponse = z.infer<typeof transactionsSchema>;

export const riskSchema = z.object({ riskScore: z.object({ score: z.number(), riskLevel: z.string(), factors: z.array(z.object({ name: z.string(), description: z.string(), impact: z.string(), scoreImpact: z.number() }).passthrough()), warnings: z.array(z.string()), recommendations: z.array(z.string()) }).passthrough(), riskEvidence: z.record(z.string(), z.unknown()).optional() }).passthrough();
export type RiskResponse = z.infer<typeof riskSchema>;

export const narrativeSchema = z.object({ narrative: z.object({ primary: z.string(), secondary: z.array(z.string()), confidence: z.number(), sources: z.array(z.string()), description: z.string() }).passthrough(), narrativeEvidence: z.record(z.string(), z.unknown()).optional() }).passthrough();
export type NarrativeResponse = z.infer<typeof narrativeSchema>;

export const smartMoneySchema = z.object({ signals: z.array(z.object({ wallet: z.string(), action: z.enum(['accumulate', 'distribute']), confidence: z.number(), evidence: z.array(z.object({ description: z.string(), timestamp: z.number(), strength: z.number() }).passthrough()), profitEstimate: z.number().optional() }).passthrough()), walletRankingEvidence: z.record(z.string(), z.unknown()).optional() }).passthrough();
export type SmartMoneyResponse = z.infer<typeof smartMoneySchema>;

export const pairsSchema = z.object({ pairs: z.array(z.object({ pairAddress: z.string(), quoteSymbol: z.string().nullable(), liquidityUsd: z.number(), volume24hUsd: z.number().nullable(), priceUsd: z.number().nullable(), source: z.string(), freshness: z.string(), quoteIdentity: z.string() }).passthrough()), dataQuality: z.string(), quality: z.object({ limitation: z.string().optional() }).passthrough().optional() }).passthrough();
export type PairsResponse = z.infer<typeof pairsSchema>;

const portfolioHoldingSchema = z.object({ mint: z.string(), symbol: z.string(), name: z.string(), uiAmount: z.number(), priceUsd: z.number().nullable().optional(), valueUsd: z.number().nullable().optional(), pctOfPortfolio: z.number().optional(), riskScore: z.number().nullable().optional() }).passthrough();
export const portfolioAnalyticsSchema = z.object({ success: z.literal(true), timestamp: z.number(), data: z.object({ address: z.string(), timeframe: z.string(), holdings: z.array(portfolioHoldingSchema), allocation: z.record(z.string(), z.number()), totalValueUsd: z.number(), tokenCount: z.number(), riskScore: z.number().nullable(), performance: z.null() }).passthrough(), provenance: z.object({ source: z.string(), observedAt: z.number().nullable(), dataQuality: z.string(), derived: z.array(z.string()), unavailable: z.array(z.string()) }).passthrough() }).passthrough();
export type PortfolioAnalyticsResponse = z.infer<typeof portfolioAnalyticsSchema>;

export const walletPnlSchema = z.object({ pnl: z.object({ status: z.enum(['available', 'unavailable']), realizedPnl: z.number().nullable(), unrealizedPnl: z.number().nullable(), totalPnl: z.number().nullable(), pnl7d: z.number().nullable(), pnl30d: z.number().nullable(), winRate: z.number().nullable(), tradeCount: z.number(), equityCurve: z.array(z.object({ ts: z.number(), value: z.number() })), provenance: z.object({ method: z.string(), sources: z.array(z.string()), indexedSwapCount: z.number() }), warnings: z.array(z.string()) }).nullable(), ts: z.number().optional() }).passthrough();
export type WalletPnlResponse = z.infer<typeof walletPnlSchema>;
