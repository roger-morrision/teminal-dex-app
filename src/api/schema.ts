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
  bondingProgress: z.number().nullable().optional(), progress: z.number().optional(),
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

export const trenchesSchema = z.object({ newTokens: z.array(tokenSchema), almostBonded: z.array(tokenSchema), migrated: z.array(tokenSchema), fetchedAt: z.number(), recordCount: z.number(), providers: z.array(z.string()), source: z.string(), dataQuality: z.string(), freshness: z.object({ ageMs: z.number().nullable(), staleAfterMs: z.number(), isStale: z.boolean() }).passthrough(), error: z.string().optional() }).passthrough();
export type TrenchesResponse = z.infer<typeof trenchesSchema>;

const publicKeyString = z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/);
export const swapQuoteSchema = z.object({
  quote: z.object({ side: z.enum(['buy', 'sell']), token: z.object({ address: publicKeyString, symbol: z.string(), name: z.string(), price: z.number().positive() }), inputMint: publicKeyString, outputMint: publicKeyString, inAmount: z.string().regex(/^\d+$/), inAmountUi: z.number().positive(), inAmountUiExact: z.string(), inSymbol: z.string(), outAmount: z.string().regex(/^\d+$/), outAmountUi: z.number().positive(), outAmountUiExact: z.string(), outSymbol: z.string(), minOutAmount: z.string().regex(/^\d+$/), minOutUi: z.number().positive(), minOutUiExact: z.string(), priceImpactPct: z.number().nonnegative(), slippageBps: z.number().int().min(1).max(5000), swapUsdValue: z.number().nullable(), route: z.array(z.string()).min(1), contextSlot: z.number().int().positive(), real: z.literal(true) }).passthrough(),
  jupQuote: z.record(z.string(), z.unknown()), quotedAt: z.number(), ts: z.number(),
}).passthrough();
export type SwapQuoteResponse = z.infer<typeof swapQuoteSchema>;

const monitorAlertSchema = z.object({
  id: z.string(), type: z.string(), tokenAddress: publicKeyString, tokenSymbol: z.string(), message: z.string(),
  timestamp: z.number(), txHash: z.string(), source: z.string(), read: z.boolean(),
}).passthrough();
export const monitorAlertsSchema = z.object({
  alerts: z.array(monitorAlertSchema), ts: z.number(), fetchedAt: z.number(), source: z.string(),
  providers: z.array(z.string()), recordCount: z.number(), dataQuality: z.string(),
  freshness: z.object({ isStale: z.boolean(), staleAfterMs: z.number() }).passthrough(), error: z.string().optional(),
}).passthrough();
export type MonitorAlertsResponse = z.infer<typeof monitorAlertsSchema>;

export const userAlertSchema = z.object({
  id: z.string(), userId: z.string().nullable(), chainId: z.literal('solana'), address: publicKeyString,
  type: z.enum(['price', 'percentageChange', 'volumeSpike', 'newPair', 'customFilter']), name: z.string(),
  description: z.string(), conditions: z.record(z.string(), z.unknown()),
  channels: z.array(z.enum(['push', 'email', 'inApp', 'webhook', 'telegram'])).min(1),
  cooldownMinutes: z.number().int().nonnegative(), active: z.boolean(), lastTriggered: z.number().nullable(),
  triggerCount: z.number().int().nonnegative(), createdAt: z.number(), updatedAt: z.number(), persistence: z.literal('database'),
  alertEvidence: z.record(z.string(), z.unknown()).optional(),
}).passthrough();
export const userAlertsSchema = z.object({ success: z.literal(true), count: z.number(), data: z.array(userAlertSchema), persistence: z.literal('database') }).passthrough();
export const userAlertMutationSchema = z.object({ success: z.literal(true), data: userAlertSchema }).passthrough();
export const alertDeliveriesSchema = z.object({ success: z.literal(true), count: z.number(), data: z.array(z.object({
  id: z.string(), alertId: z.string(), eventKey: z.string(), channel: z.string(), status: z.enum(['queued', 'processing', 'delivered', 'failed', 'unavailable']),
  reason: z.string().nullable(), deliveredAt: z.string().datetime().nullable(), createdAt: z.string().datetime(), updatedAt: z.string().datetime(),
}).passthrough()), persistence: z.literal('database') }).passthrough();
export type UserAlert = z.infer<typeof userAlertSchema>;
export type UserAlertsResponse = z.infer<typeof userAlertsSchema>;
export type AlertDeliveriesResponse = z.infer<typeof alertDeliveriesSchema>;

export const topTraderSchema = z.object({
  rank: z.number().int().positive(), address: publicKeyString, pnlUsd: z.number(), pnlPct: z.number(), winRate: z.number().min(0).max(100),
  trades: z.number().int().nonnegative(), tokenCount: z.number().int().nonnegative().optional(), maxDrawdownPct: z.number().nonnegative().optional(),
  reliability: z.number().min(0).max(100).optional(), bestToken: z.string(), bestTokenPct: z.number(), badge: z.string(), sparkline: z.array(z.number()),
}).passthrough();
export const topTradersSchema = z.object({
  traders: z.array(topTraderSchema), fetchedAt: z.number(), recordCount: z.number(), requestedPeriod: z.string().optional(), periodApplied: z.string().optional(),
  source: z.string(), dataQuality: z.string(), provenance: z.record(z.string(), z.unknown()).optional(),
  freshness: z.object({ latestSourceFetchedAt: z.number().nullable(), ageMs: z.number().nullable(), staleAfterMs: z.number(), isStale: z.boolean() }).passthrough(),
  traderEvidence: z.array(z.record(z.string(), z.unknown())).optional(), error: z.string().optional(),
}).passthrough();
export type TopTrader = z.infer<typeof topTraderSchema>;
export type TopTradersResponse = z.infer<typeof topTradersSchema>;

export const copyTradeHealthSchema = z.object({
  service: z.literal('copytrade'), chain: z.literal('solana'), mode: z.enum(['live-awaiting-signature', 'simulation', 'unavailable']),
  readiness: z.object({ traderData: z.boolean(), walletMonitor: z.boolean(), quote: z.boolean(), walletSignature: z.boolean(), broadcast: z.boolean(), confirmation: z.boolean(), durableStorage: z.boolean(), automationWorker: z.boolean() }),
  providers: z.object({ helius: z.boolean(), gmgn: z.boolean() }), recordCount: z.number(), checkedAt: z.number(),
}).passthrough();
export type CopyTradeHealth = z.infer<typeof copyTradeHealthSchema>;

export const copyTradeConfigSchema = z.object({
  id: z.string(), userId: z.string(), targetWallet: publicKeyString.optional(), sourceWallet: publicKeyString, sourceWalletLabel: z.string().optional(), isActive: z.boolean(), createdAt: z.number(), updatedAt: z.number(),
  sizingMode: z.enum(['fixed_sol', 'percentage', 'proportional']), fixedAmountSol: z.number().positive().optional(), percentage: z.number().positive().max(100).optional(), proportionalRatio: z.number().positive().optional(),
  maxPositionSizeSol: z.number().positive(), maxDailyVolumeSol: z.number().positive(), maxDailyLossSol: z.number().nonnegative(), stopLossPct: z.number().positive().max(100).optional(), takeProfitPct: z.number().positive().optional(),
  maxSlippageBps: z.number().int().min(1).max(5000), maxPriceImpactPct: z.number().positive().max(100), minLiquidityUsd: z.number().nonnegative(), maxMarketCapUsd: z.number().nonnegative(),
  excludedTokens: z.array(publicKeyString), onlyNewLaunches: z.boolean(), maxTokenAgeMinutes: z.number().nonnegative(), copySells: z.boolean(), copyBuys: z.boolean(), delayMs: z.number().int().nonnegative(), maxConcurrentPositions: z.number().int().positive(),
}).passthrough();
export const copyTradeConfigsSchema = z.object({ success: z.literal(true), data: z.array(copyTradeConfigSchema) });
export const copyTradeConfigMutationSchema = z.object({ success: z.literal(true), data: copyTradeConfigSchema });
export type CopyTradeConfig = z.infer<typeof copyTradeConfigSchema>;

export const copyPositionSchema = z.object({ id: z.string(), configId: z.string(), tokenAddress: publicKeyString, tokenSymbol: z.string(), tokenName: z.string(), entryPrice: z.number(), entryAmountSol: z.number(), entryTokenAmount: z.number(), entryTxSignature: z.string(), entryTime: z.number(), sourceTxSignature: z.string(), executionMode: z.enum(['paper', 'live']).optional(), currentPrice: z.number(), currentValueSol: z.number(), unrealizedPnlSol: z.number(), unrealizedPnlPct: z.number(), status: z.enum(['open', 'closed', 'partial']), closedAt: z.number().optional(), realizedPnlSol: z.number().optional() }).passthrough();
export const copyExecutionSchema = z.object({ id: z.string(), userId: z.string(), configId: z.string(), positionId: z.string().optional(), sourceTxSignature: z.string().optional(), executionSignature: z.string().optional(), idempotencyKey: z.string(), eventType: z.enum(['buy', 'sell', 'manual_close', 'stop_loss', 'take_profit']), status: z.enum(['created', 'quoted', 'awaiting_signature', 'submitted', 'confirmed', 'failed', 'expired']), requestedAmountSol: z.number().optional(), quotedAmountSol: z.number().optional(), confirmedAmountSol: z.number().optional(), slippageBps: z.number().optional(), priceImpactPct: z.number().optional(), error: z.string().optional(), createdAt: z.number(), updatedAt: z.number(), executionMode: z.enum(['paper', 'live']).optional() }).passthrough();
export const copyPositionsSchema = z.object({ success: z.literal(true), data: z.array(copyPositionSchema) });
export const copyExecutionsSchema = z.object({ success: z.literal(true), data: z.array(copyExecutionSchema), recordCount: z.number(), source: z.literal('database') });
export type CopyPosition = z.infer<typeof copyPositionSchema>;
export type CopyExecution = z.infer<typeof copyExecutionSchema>;

const recommendationEvidenceSchema = z.object({ status: z.enum(['invalid_or_incomplete', 'expired', 'incomplete', 'advisory_current']), safeForAdvisoryUse: z.boolean(), executionEnabled: z.literal(false), providerFamilies: z.array(z.string()), missingFeatures: z.array(z.string()), expired: z.boolean(), costsIncluded: z.boolean(), pointInTime: z.boolean() }).passthrough();
export const aiRecommendationsSchema = z.object({ success: z.literal(true), data: z.object({ recommendations: z.array(z.object({
  tokenAddress: publicKeyString, tokenSymbol: z.string(), chain: z.string(), score: z.number().min(0).max(100), confidence: z.number().min(0).max(100), category: z.string(), modelVersion: z.string(), createdAt: z.string().datetime(), recommendationEvidence: recommendationEvidenceSchema,
  outcomes: z.object({ total: z.number().int().nonnegative(), resolved: z.number().int().nonnegative(), wins: z.number().int().nonnegative(), losses: z.number().int().nonnegative(), avgReturnPct: z.number().nullable() }),
}).passthrough()), readOnly: z.literal(true) }) });
export type AiRecommendation = z.infer<typeof aiRecommendationsSchema>['data']['recommendations'][number];

const paperPositionSchema = z.object({ id: z.string(), tokenAddress: publicKeyString, tokenSymbol: z.string(), entryPrice: z.number(), notionalUsd: z.number(), currentPrice: z.number().nullable(), markStatus: z.enum(['live', 'unavailable']), unrealizedPnlUsd: z.number().nullable(), returnPct: z.number().nullable() }).passthrough();
const closedPaperPositionSchema = z.object({ id: z.string(), tokenAddress: publicKeyString, tokenSymbol: z.string(), realizedPnlUsd: z.number(), returnPct: z.number(), exitReason: z.string() }).passthrough();
export const aiPaperReportSchema = z.object({ success: z.literal(true), data: z.object({
  mode: z.literal('simulation'), executionEnabled: z.literal(false), readOnly: z.literal(true), generatedAt: z.number(),
  config: z.object({ enabled: z.boolean(), startingCashUsd: z.number(), positionSizeUsd: z.number(), maxOpenPositions: z.number().int(), minScore: z.number(), minConfidence: z.number(), takeProfitPct: z.number(), stopLossPct: z.number(), feeBps: z.number(), slippageBps: z.number() }).passthrough(),
  summary: z.object({ equityUsd: z.number(), totalPnlUsd: z.number(), realizedPnlUsd: z.number(), unrealizedPnlUsd: z.number(), openPositions: z.number().int().nonnegative(), closedTrades: z.number().int().nonnegative(), winRate: z.number().nullable(), maxDrawdownPct: z.number().nonnegative(), markCoverage: z.number().min(0).max(1), unavailableMarks: z.number().int().nonnegative() }).passthrough(),
  analytics: z.object({ profitFactor: z.number().nullable(), expectancyUsd: z.number().nullable(), totalFeesUsd: z.number(), totalSlippageCostUsd: z.number() }).passthrough(),
  risk: z.object({ entriesAllowed: z.boolean(), dailyLossLimitHit: z.boolean(), cooldownActive: z.boolean() }).passthrough(),
  readiness: z.object({ status: z.string(), executionEnabled: z.literal(false), killSwitch: z.literal(true), note: z.string(), checks: z.record(z.string(), z.boolean()) }).passthrough(),
  operations: z.object({ status: z.string() }).passthrough(), positions: z.array(paperPositionSchema), closedTrades: z.array(closedPaperPositionSchema),
  dailyPerformance: z.array(z.object({ date: z.string(), trades: z.number().int().nonnegative(), winRate: z.number(), realizedPnlUsd: z.number(), feesUsd: z.number().optional() }).passthrough()),
  potentialPool: z.array(z.object({ tokenAddress: publicKeyString, tokenSymbol: z.string().nullable(), score: z.number(), confidence: z.number(), priority: z.number(), observations: z.number(), monitoredMinutes: z.number(), riskScore: z.number().nullable(), socialScore: z.number().nullable(), lifecycle: z.string(), status: z.string(), requiredMonitoringMinutes: z.number() }).passthrough()),
}).passthrough() });
export type AiPaperReport = z.infer<typeof aiPaperReportSchema>['data'];

export const aiPlatformSchema = z.object({ success: z.literal(true), data: z.object({ schema: z.literal('ai-platform-readiness-v1'), phases: z.array(z.object({ phase: z.number().int(), title: z.string(), status: z.string(), evidenceCount: z.number().int().nonnegative(), simulationOnly: z.literal(true) })), metrics: z.record(z.string(), z.number().nullable()), phase31: z.object({ status: z.string(), blockers: z.array(z.string()), checks: z.record(z.string(), z.boolean()), executionEnabled: z.literal(false) }).passthrough() }).passthrough(), executionEnabled: z.literal(false) });
export type AiPlatform = z.infer<typeof aiPlatformSchema>['data'];
