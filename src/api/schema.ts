import { z } from 'zod';
import { isSolanaAddress } from '@/security/input';

const transactionCount = z.object({ buys: z.number(), sells: z.number() }).catch({ buys: 0, sells: 0 });
const MAX_PAGE_ROWS = 200;
const MAX_MARKET_ROWS = 100;
const MAX_CANDLES = 1000;
const MAX_EVIDENCE_ROWS = 100;
const MAX_WALLET_HOLDINGS = 500;
const publicKeyString = z.string().refine(isSolanaAddress, 'Expected an exact 32-byte Solana address.');

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
  tokens: z.array(tokenSchema).max(MAX_MARKET_ROWS),
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
  securityEvidence: z.object({ safeForAutomation: z.boolean().optional(), flags: z.array(z.string()).max(MAX_EVIDENCE_ROWS).optional() }).passthrough().optional(),
  riskEvidence: z.object({ safeForAutomation: z.boolean().optional(), level: z.string().nullable().optional() }).passthrough().optional(),
}).passthrough();

export type TokenDetailResponse = z.infer<typeof tokenDetailSchema>;

export const candleSchema = z.object({ time: z.number(), open: z.number(), high: z.number(), low: z.number(), close: z.number(), volume: z.number() }).passthrough();
export const ohlcvSchema = z.object({ candles: z.array(candleSchema).max(MAX_CANDLES), tf: z.string(), source: z.string(), dataQuality: z.string(), degraded: z.boolean().optional(), quality: z.record(z.string(), z.unknown()).optional() }).passthrough();
export type OhlcvResponse = z.infer<typeof ohlcvSchema>;

const evidenceMetricSchema = z.object({ available: z.boolean(), value: z.union([z.string(), z.number(), z.boolean()]).nullable(), confidence: z.string(), source: z.string().nullable().optional() }).passthrough();
export const holdersSchema = z.object({ holders: z.array(z.object({ address: z.string(), uiAmount: z.number(), pct: z.number(), rank: z.number() }).passthrough()).max(MAX_PAGE_ROWS), source: z.string().optional(), evidence: z.record(z.string(), evidenceMetricSchema).optional() }).passthrough();
export type HoldersResponse = z.infer<typeof holdersSchema>;

export const transactionsSchema = z.object({ txns: z.array(z.object({ signature: z.string(), timestamp: z.number(), type: z.enum(['buy', 'sell']), amount: z.number(), amountUsd: z.number(), price: z.number().nullable(), feePayer: z.string().nullable(), source: z.string(), finality: z.string() }).passthrough()).max(MAX_PAGE_ROWS), dataQuality: z.string(), quality: z.object({ freshness: z.string().optional(), completeHistory: z.boolean().optional() }).passthrough().optional() }).passthrough();
export type TransactionsResponse = z.infer<typeof transactionsSchema>;

export const snipersSchema = z.object({ snipers: z.array(z.object({ address: publicKeyString, boughtAt: z.number().nonnegative(), delaySec: z.number().nonnegative().max(300) }).passthrough()).max(10), ts: z.number().optional() }).passthrough();
export type SnipersResponse = z.infer<typeof snipersSchema>;

const providerEvidenceStatusSchema = z.enum(['success', 'empty', 'unavailable', 'not_configured', 'not_queried', 'error']);
const boundedProviderStatusMapSchema = z.record(z.string(), providerEvidenceStatusSchema).refine((value) => Object.keys(value).length <= 10, 'Too many provider statuses.');
export const bubbleGraphSchema = z.object({
  nodes: z.array(z.object({ address: publicKeyString, label: z.string().nullable().optional(), pct: z.number().nonnegative(), source: z.string() }).passthrough()).max(75),
  edges: z.array(z.object({ source: publicKeyString, target: publicKeyString, value: z.number().nonnegative(), signature: z.string().optional() }).passthrough()).max(1000),
  source: z.enum(['holders', 'helius', 'insightx']), edgeSemantics: z.string(),
  provenance: z.object({ graphSource: z.string(), labelSource: z.string(), balanceSource: z.string() }).passthrough(),
  freshness: z.object({ status: z.string(), observedAt: z.number().nullable(), staleAfterMs: z.number().nonnegative() }).passthrough(),
  completeness: z.object({ transactionHistory: z.literal('partial'), acceptedTransfers: z.number().int().nonnegative().nullable() }).passthrough(),
  providers: boundedProviderStatusMapSchema,
  providerEvidence: z.record(z.string(), z.object({ role: z.enum(['graph', 'labels', 'balances']), status: providerEvidenceStatusSchema, fetchedAt: z.number().nullable(), limitation: z.string().max(500).optional() }).passthrough()).refine((value) => Object.keys(value).length <= 10, 'Too many provider evidence entries.'),
  ts: z.number(),
}).passthrough();
export type BubbleGraphResponse = z.infer<typeof bubbleGraphSchema>;

export const manipulationSchema = z.object({
  address: publicKeyString, symbol: z.string(), score: z.number().int().min(0).max(100), level: z.string(),
  flags: z.array(z.string().max(100)).max(20),
  metrics: z.object({ indexedSwaps: z.number().int().nonnegative(), indexedWallets: z.number().int().nonnegative(), totalIndexedVolumeUsd: z.number().nonnegative(), rapidRoundTripWallets: z.number().int().nonnegative(), roundTripWalletSharePct: z.number().min(0).max(100), topTraderVolumeSharePct: z.number().min(0).max(100), repeatedSizeVolumeSharePct: z.number().min(0).max(100), sampledHolders: z.number().int().nonnegative(), top10HolderPct: z.number().min(0).max(100) }).passthrough(),
  evidence: z.object({ roundTrips: z.array(z.record(z.string(), z.unknown())).max(50), concentratedTraders: z.array(z.object({ wallet: publicKeyString, volumeUsd: z.number().nonnegative(), sharePct: z.number().min(0).max(100) }).passthrough()).max(20), repeatedSizes: z.array(z.record(z.string(), z.unknown())).max(20), holders: z.array(z.object({ address: publicKeyString, percentage: z.number().min(0).max(100) }).passthrough()).max(20) }).passthrough(),
  provenance: z.object({ method: z.literal('indexed_signature_backed_heuristics'), observedAt: z.number(), limitations: z.array(z.string().max(500)).max(20) }).passthrough(),
  unavailable: z.array(z.string().max(200)).max(20),
}).passthrough();
export type ManipulationResponse = z.infer<typeof manipulationSchema>;

export const riskSchema = z.object({ riskScore: z.object({ score: z.number(), riskLevel: z.string(), factors: z.array(z.object({ name: z.string(), description: z.string(), impact: z.string(), scoreImpact: z.number() }).passthrough()), warnings: z.array(z.string()), recommendations: z.array(z.string()) }).passthrough(), riskEvidence: z.record(z.string(), z.unknown()).optional() }).passthrough();
export type RiskResponse = z.infer<typeof riskSchema>;

const securitySnapshotEvidenceSchema = z.object({
  mintAuthority: z.string().max(100).nullable(), freezeAuthority: z.string().max(100).nullable(), isMintRenounced: z.boolean(), isFreezeRenounced: z.boolean(),
  holderCount: z.number().int().nonnegative().nullable(), buyTax: z.number().nonnegative().nullable(), sellTax: z.number().nonnegative().nullable(), isHoneypot: z.boolean().nullable(),
  isLpLocked: z.boolean().nullable(), devHoldingsPct: z.number().min(0).max(100).nullable(), topHolderPct: z.number().min(0).max(100).nullable(), liquidityLockPct: z.number().min(0).max(100).nullable(),
  tokenProgram: z.string().max(100).nullable().optional(), isToken2022: z.boolean().optional(), transferFeeBps: z.number().int().nonnegative().max(10_000).nullable().optional(),
  permanentDelegate: z.string().max(100).nullable().optional(), transferHookProgramId: z.string().max(100).nullable().optional(), securityRiskFlags: z.array(z.string().max(100)).max(20).optional(),
}).passthrough();
export const securityHistorySchema = z.object({ snapshots: z.array(z.object({ id: z.string().max(200), source: z.string().max(100), observedAt: z.number().nonnegative(), evidence: securitySnapshotEvidenceSchema }).passthrough()).max(50), count: z.number().int().nonnegative().max(50), dataQuality: z.enum(['provider_backed', 'unavailable']), synthetic: z.literal(false) }).passthrough().refine((value) => value.count === value.snapshots.length, 'Security snapshot count mismatch.');
export type SecurityHistoryResponse = z.infer<typeof securityHistorySchema>;

export const narrativeSchema = z.object({ narrative: z.object({ primary: z.string(), secondary: z.array(z.string()), confidence: z.number(), sources: z.array(z.string()), description: z.string() }).passthrough(), narrativeEvidence: z.record(z.string(), z.unknown()).optional() }).passthrough();
export type NarrativeResponse = z.infer<typeof narrativeSchema>;

export const smartMoneySchema = z.object({ signals: z.array(z.object({ wallet: z.string(), action: z.enum(['accumulate', 'distribute']), confidence: z.number(), evidence: z.array(z.object({ description: z.string(), timestamp: z.number(), strength: z.number() }).passthrough()), profitEstimate: z.number().optional() }).passthrough()), walletRankingEvidence: z.record(z.string(), z.unknown()).optional() }).passthrough();
export type SmartMoneyResponse = z.infer<typeof smartMoneySchema>;

export const pairsSchema = z.object({ pairs: z.array(z.object({ pairAddress: z.string(), quoteSymbol: z.string().nullable(), liquidityUsd: z.number(), volume24hUsd: z.number().nullable(), priceUsd: z.number().nullable(), source: z.string(), freshness: z.string(), quoteIdentity: z.string() }).passthrough()), dataQuality: z.string(), quality: z.object({ limitation: z.string().optional() }).passthrough().optional() }).passthrough();
export type PairsResponse = z.infer<typeof pairsSchema>;

const portfolioHoldingSchema = z.object({ mint: z.string(), symbol: z.string(), name: z.string(), uiAmount: z.number(), priceUsd: z.number().nullable().optional(), valueUsd: z.number().nullable().optional(), pctOfPortfolio: z.number().optional(), riskScore: z.number().nullable().optional() }).passthrough();
export const portfolioAnalyticsSchema = z.object({ success: z.literal(true), timestamp: z.number(), data: z.object({ address: z.string(), timeframe: z.string(), holdings: z.array(portfolioHoldingSchema).max(MAX_WALLET_HOLDINGS), allocation: z.record(z.string(), z.number()), totalValueUsd: z.number(), tokenCount: z.number(), riskScore: z.number().nullable(), performance: z.null() }).passthrough(), provenance: z.object({ source: z.string(), observedAt: z.number().nullable(), dataQuality: z.string(), derived: z.array(z.string()).max(MAX_EVIDENCE_ROWS), unavailable: z.array(z.string()).max(MAX_EVIDENCE_ROWS) }).passthrough() }).passthrough();
export type PortfolioAnalyticsResponse = z.infer<typeof portfolioAnalyticsSchema>;

export const walletPnlSchema = z.object({ pnl: z.object({ status: z.enum(['available', 'unavailable']), realizedPnl: z.number().nullable(), unrealizedPnl: z.number().nullable(), totalPnl: z.number().nullable(), pnl7d: z.number().nullable(), pnl30d: z.number().nullable(), winRate: z.number().nullable(), tradeCount: z.number(), equityCurve: z.array(z.object({ ts: z.number(), value: z.number() })).max(2000), provenance: z.object({ method: z.string(), sources: z.array(z.string()).max(50), indexedSwapCount: z.number() }), warnings: z.array(z.string()).max(MAX_EVIDENCE_ROWS) }).nullable(), ts: z.number().optional() }).passthrough();
export type WalletPnlResponse = z.infer<typeof walletPnlSchema>;

export const trenchesSchema = z.object({ newTokens: z.array(tokenSchema).max(MAX_PAGE_ROWS), almostBonded: z.array(tokenSchema).max(MAX_PAGE_ROWS), migrated: z.array(tokenSchema).max(MAX_PAGE_ROWS), fetchedAt: z.number(), recordCount: z.number(), providers: z.array(z.string()).max(50), source: z.string(), dataQuality: z.string(), freshness: z.object({ ageMs: z.number().nullable(), staleAfterMs: z.number(), isStale: z.boolean() }).passthrough(), error: z.string().optional() }).passthrough();
export type TrenchesResponse = z.infer<typeof trenchesSchema>;

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
  alerts: z.array(monitorAlertSchema).max(MAX_PAGE_ROWS), ts: z.number(), fetchedAt: z.number(), source: z.string(),
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
export const userAlertsSchema = z.object({ success: z.literal(true), count: z.number(), data: z.array(userAlertSchema).max(MAX_PAGE_ROWS), persistence: z.literal('database') }).passthrough();
export const userAlertMutationSchema = z.object({ success: z.literal(true), data: userAlertSchema }).passthrough();
export const alertDeliveriesSchema = z.object({ success: z.literal(true), count: z.number(), data: z.array(z.object({
  id: z.string(), alertId: z.string(), eventKey: z.string(), channel: z.string(), status: z.enum(['queued', 'processing', 'delivered', 'failed', 'unavailable']),
  reason: z.string().nullable(), deliveredAt: z.string().datetime().nullable(), createdAt: z.string().datetime(), updatedAt: z.string().datetime(),
}).passthrough()).max(MAX_WALLET_HOLDINGS), persistence: z.literal('database') }).passthrough();
export type UserAlert = z.infer<typeof userAlertSchema>;
export type UserAlertsResponse = z.infer<typeof userAlertsSchema>;
export type AlertDeliveriesResponse = z.infer<typeof alertDeliveriesSchema>;

const trackTypeSchema = z.enum(['pumpfun_live', 'surge', 'smart_buy', 'smart_take_profit', 'kol_buy', 'kol_take_profit', 'whale_buy', 'whale_sell']);
export const trackFeedSchema = z.object({
  notifications: z.array(z.object({
    id: z.string().max(300), type: trackTypeSchema, title: z.string().max(200), message: z.string().max(1000), tokenAddress: publicKeyString, tokenSymbol: z.string().max(100),
    wallet: publicKeyString.optional(), amountUsd: z.number().nullable().optional(), confidence: z.number().nullable().optional(), profitEstimateUsd: z.number().nullable().optional(), transactionType: z.string().max(50).optional(),
    observedAt: z.number().nonnegative(), source: z.string().max(200), dataQuality: z.string().max(200), txHash: z.string().max(200).optional(),
    market: z.object({ symbol: z.string().max(100).nullable(), imageUrl: z.string().url().nullable(), sourceFetchedAt: z.number().nullable(), freshnessSeconds: z.number().nonnegative().nullable(), priceUsd: z.number().nonnegative().nullable(), marketCap: z.number().nonnegative().nullable(), holders: z.number().int().nonnegative().nullable(), volume1h: z.number().nonnegative().nullable(), change1h: z.number().nullable() }).passthrough(),
  }).passthrough()).max(100),
  ts: z.number(), generatedAt: z.string().datetime().optional(),
  thresholds: z.object({ surgeMinChange1h: z.number(), whaleMinUsd: z.number().nonnegative() }).passthrough().optional(),
  gates: z.object({ surgeMinLiquidityUsd: z.number().nonnegative(), surgeMinVolume1hUsd: z.number().nonnegative(), surgeMaxDataAgeSeconds: z.number().nonnegative() }).passthrough().optional(),
  coverage: z.object({
    pumpfunLive: z.object({ recordCount: z.number().int().nonnegative(), source: z.string(), dataQuality: z.string(), latestObservedAt: z.number().nullable() }).passthrough(),
    smartMoney: z.object({ recordCount: z.number().int().nonnegative(), source: z.string(), dataQuality: z.string(), latestObservedAt: z.number().nullable() }).passthrough(),
    whaleTransactions: z.object({ recordCount: z.number().int().nonnegative(), source: z.string(), dataQuality: z.string(), latestObservedAt: z.number().nullable() }).passthrough(),
    suppressed: z.object({ surge: z.number().int().nonnegative() }).passthrough(),
  }).passthrough().optional(),
  error: z.string().max(200).optional(), detail: z.string().max(500).optional(),
}).passthrough().refine((value) => new Set(value.notifications.map((item) => item.id)).size === value.notifications.length, 'Track event IDs must be unique.');
export type TrackFeedResponse = z.infer<typeof trackFeedSchema>;
export type TrackNotification = TrackFeedResponse['notifications'][number];

export const topTraderSchema = z.object({
  rank: z.number().int().positive(), address: publicKeyString, pnlUsd: z.number(), pnlPct: z.number(), winRate: z.number().min(0).max(100),
  trades: z.number().int().nonnegative(), tokenCount: z.number().int().nonnegative().optional(), maxDrawdownPct: z.number().nonnegative().optional(),
  reliability: z.number().min(0).max(100).optional(), bestToken: z.string(), bestTokenPct: z.number(), badge: z.string(), sparkline: z.array(z.number()).max(MAX_WALLET_HOLDINGS),
}).passthrough();
export const topTradersSchema = z.object({
  traders: z.array(topTraderSchema).max(MAX_PAGE_ROWS), fetchedAt: z.number(), recordCount: z.number(), requestedPeriod: z.string().optional(), periodApplied: z.string().optional(),
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
  excludedTokens: z.array(publicKeyString).max(MAX_WALLET_HOLDINGS), onlyNewLaunches: z.boolean(), maxTokenAgeMinutes: z.number().nonnegative(), copySells: z.boolean(), copyBuys: z.boolean(), delayMs: z.number().int().nonnegative(), maxConcurrentPositions: z.number().int().positive(),
}).passthrough();
export const copyTradeConfigsSchema = z.object({ success: z.literal(true), data: z.array(copyTradeConfigSchema).max(MAX_EVIDENCE_ROWS) });
export const copyTradeConfigMutationSchema = z.object({ success: z.literal(true), data: copyTradeConfigSchema });
export type CopyTradeConfig = z.infer<typeof copyTradeConfigSchema>;

export const copyPositionSchema = z.object({ id: z.string(), configId: z.string(), tokenAddress: publicKeyString, tokenSymbol: z.string(), tokenName: z.string(), entryPrice: z.number(), entryAmountSol: z.number(), entryTokenAmount: z.number(), entryTxSignature: z.string(), entryTime: z.number(), sourceTxSignature: z.string(), executionMode: z.enum(['paper', 'live']).optional(), currentPrice: z.number(), currentValueSol: z.number(), unrealizedPnlSol: z.number(), unrealizedPnlPct: z.number(), status: z.enum(['open', 'closed', 'partial']), closedAt: z.number().optional(), realizedPnlSol: z.number().optional() }).passthrough();
export const copyExecutionSchema = z.object({ id: z.string(), userId: z.string(), configId: z.string(), positionId: z.string().optional(), sourceTxSignature: z.string().optional(), executionSignature: z.string().optional(), idempotencyKey: z.string(), eventType: z.enum(['buy', 'sell', 'manual_close', 'stop_loss', 'take_profit']), status: z.enum(['created', 'quoted', 'awaiting_signature', 'submitted', 'confirmed', 'failed', 'expired']), requestedAmountSol: z.number().optional(), quotedAmountSol: z.number().optional(), confirmedAmountSol: z.number().optional(), slippageBps: z.number().optional(), priceImpactPct: z.number().optional(), error: z.string().optional(), createdAt: z.number(), updatedAt: z.number(), executionMode: z.enum(['paper', 'live']).optional() }).passthrough();
export const copyPositionsSchema = z.object({ success: z.literal(true), data: z.array(copyPositionSchema).max(MAX_PAGE_ROWS) });
export const copyExecutionsSchema = z.object({ success: z.literal(true), data: z.array(copyExecutionSchema).max(MAX_WALLET_HOLDINGS), recordCount: z.number(), source: z.literal('database') });
export type CopyPosition = z.infer<typeof copyPositionSchema>;
export type CopyExecution = z.infer<typeof copyExecutionSchema>;

const recommendationEvidenceSchema = z.object({ status: z.enum(['invalid_or_incomplete', 'expired', 'incomplete', 'advisory_current']), safeForAdvisoryUse: z.boolean(), executionEnabled: z.literal(false), providerFamilies: z.array(z.string()), missingFeatures: z.array(z.string()), expired: z.boolean(), costsIncluded: z.boolean(), pointInTime: z.boolean() }).passthrough();
export const aiRecommendationsSchema = z.object({ success: z.literal(true), data: z.object({ recommendations: z.array(z.object({
  tokenAddress: publicKeyString, tokenSymbol: z.string(), chain: z.string(), score: z.number().min(0).max(100), confidence: z.number().min(0).max(100), category: z.string(), modelVersion: z.string(), createdAt: z.string().datetime(), recommendationEvidence: recommendationEvidenceSchema,
  outcomes: z.object({ total: z.number().int().nonnegative(), resolved: z.number().int().nonnegative(), wins: z.number().int().nonnegative(), losses: z.number().int().nonnegative(), avgReturnPct: z.number().nullable() }),
}).passthrough()).max(MAX_PAGE_ROWS), readOnly: z.literal(true) }) });
export type AiRecommendation = z.infer<typeof aiRecommendationsSchema>['data']['recommendations'][number];

const paperPositionSchema = z.object({ id: z.string(), tokenAddress: publicKeyString, tokenSymbol: z.string(), entryPrice: z.number(), notionalUsd: z.number(), currentPrice: z.number().nullable(), markStatus: z.enum(['live', 'unavailable']), unrealizedPnlUsd: z.number().nullable(), returnPct: z.number().nullable() }).passthrough();
const closedPaperPositionSchema = z.object({ id: z.string(), tokenAddress: publicKeyString, tokenSymbol: z.string(), realizedPnlUsd: z.number(), returnPct: z.number(), exitReason: z.string() }).passthrough();
const paperHealthBoundarySchema = z.object({ simulationOnly: z.literal(true), executionEnabled: z.literal(false) }).passthrough();
const reasonCountsSchema = z.record(z.string().max(100), z.number().int().nonnegative()).refine((value) => Object.keys(value).length <= 50, 'Too many health reason categories.');
const paperOperationalHealthSchema = paperHealthBoundarySchema.extend({ schemaVersion: z.literal('paper-operational-health-v1'), status: z.enum(['healthy', 'degraded']), cycleStatus: z.string().max(50), failedOrAbandoned24h: z.number().int().nonnegative(), openPositions: z.number().int().nonnegative(), qualifiedOpenPositions: z.number().int().nonnegative(), markCoverageApplicable: z.boolean(), freshMarks: z.number().int().nonnegative(), freshMarkCoverage: z.number().min(0).max(1).nullable(), leaseValid: z.boolean(), reasons: z.array(z.string().max(100)).max(20) });
const paperMutationHealthSchema = paperHealthBoundarySchema.extend({ schemaVersion: z.literal('paper-mutation-health-v2'), auditedMutations: z.number().int().nonnegative(), qualifiedMutations: z.number().int().nonnegative(), excludedMutations: z.number().int().nonnegative(), duplicateKeys: z.number().int().nonnegative(), staleProcessing: z.number().int().nonnegative(), manualReview: z.number().int().nonnegative(), recoveryPolicy: z.literal('fail_closed_no_automatic_replay'), healthy: z.boolean(), reasons: z.array(z.string().max(100)).max(20) });
const paperJobLeaseHealthSchema = paperHealthBoundarySchema.extend({ schemaVersion: z.literal('paper-job-lease-health-v1'), status: z.enum(['healthy_active', 'healthy_idle', 'degraded']), observedLeases: z.number().int().nonnegative(), qualifiedLeases: z.number().int().nonnegative(), excludedLeases: z.number().int().nonnegative(), activeLeases: z.number().int().nonnegative(), expiredLeases: z.number().int().nonnegative(), contentionFree: z.boolean(), reasonCounts: reasonCountsSchema });
const paperCycleHistoryHealthSchema = paperHealthBoundarySchema.extend({ schemaVersion: z.literal('paper-cycle-history-health-v2'), status: z.enum(['qualified_history', 'collecting_or_invalid', 'unavailable']), observedCycles: z.number().int().nonnegative(), qualifiedCycles: z.number().int().nonnegative(), excludedCycles: z.number().int().nonnegative(), qualifiedTerminalCycles: z.number().int().nonnegative(), runningCycles: z.number().int().nonnegative(), contentionFree: z.boolean(), fencingEvidenceRequired: z.literal(true), minimumHistory: z.number().int().positive(), historyReady: z.boolean(), reasonCounts: reasonCountsSchema });
export const aiPaperReportSchema = z.object({ success: z.literal(true), data: z.object({
  mode: z.literal('simulation'), executionEnabled: z.literal(false), readOnly: z.literal(true), generatedAt: z.number(),
  config: z.object({ enabled: z.boolean(), startingCashUsd: z.number(), positionSizeUsd: z.number(), maxOpenPositions: z.number().int(), minScore: z.number(), minConfidence: z.number(), takeProfitPct: z.number(), stopLossPct: z.number(), feeBps: z.number(), slippageBps: z.number() }).passthrough(),
  summary: z.object({ equityUsd: z.number(), totalPnlUsd: z.number(), realizedPnlUsd: z.number(), unrealizedPnlUsd: z.number(), openPositions: z.number().int().nonnegative(), closedTrades: z.number().int().nonnegative(), winRate: z.number().nullable(), maxDrawdownPct: z.number().nonnegative(), markCoverage: z.number().min(0).max(1), unavailableMarks: z.number().int().nonnegative() }).passthrough(),
  analytics: z.object({ profitFactor: z.number().nullable(), expectancyUsd: z.number().nullable(), totalFeesUsd: z.number(), totalSlippageCostUsd: z.number() }).passthrough(),
  risk: z.object({ entriesAllowed: z.boolean(), dailyLossLimitHit: z.boolean(), cooldownActive: z.boolean() }).passthrough(),
  readiness: z.object({ status: z.string(), executionEnabled: z.literal(false), killSwitch: z.literal(true), note: z.string(), checks: z.record(z.string(), z.boolean()) }).passthrough(),
  operations: paperOperationalHealthSchema, mutationHealth: paperMutationHealthSchema, jobLeaseHealth: paperJobLeaseHealthSchema, cycleHistoryHealth: paperCycleHistoryHealthSchema,
  positions: z.array(paperPositionSchema).max(MAX_PAGE_ROWS), closedTrades: z.array(closedPaperPositionSchema).max(MAX_PAGE_ROWS),
  dailyPerformance: z.array(z.object({ date: z.string(), trades: z.number().int().nonnegative(), winRate: z.number(), realizedPnlUsd: z.number(), feesUsd: z.number().optional() }).passthrough()).max(MAX_WALLET_HOLDINGS),
  potentialPool: z.array(z.object({ tokenAddress: publicKeyString, tokenSymbol: z.string().nullable(), score: z.number(), confidence: z.number(), priority: z.number(), observations: z.number(), monitoredMinutes: z.number(), riskScore: z.number().nullable(), socialScore: z.number().nullable(), lifecycle: z.string(), status: z.string(), requiredMonitoringMinutes: z.number() }).passthrough()).max(MAX_PAGE_ROWS),
}).passthrough() });
export type AiPaperReport = z.infer<typeof aiPaperReportSchema>['data'];

export const aiPlatformSchema = z.object({ success: z.literal(true), data: z.object({ schema: z.literal('ai-platform-readiness-v1'), phases: z.array(z.object({ phase: z.number().int(), title: z.string(), status: z.string(), evidenceCount: z.number().int().nonnegative(), simulationOnly: z.literal(true) })), metrics: z.record(z.string(), z.number().nullable()), phase31: z.object({ status: z.string(), blockers: z.array(z.string()), checks: z.record(z.string(), z.boolean()), executionEnabled: z.literal(false) }).passthrough() }).passthrough(), executionEnabled: z.literal(false) });
export type AiPlatform = z.infer<typeof aiPlatformSchema>['data'];

const freshnessSchema = z.object({ isStale: z.boolean(), staleAfterMs: z.number().nonnegative(), ageMs: z.number().nullable().optional(), latestSourceFetchedAt: z.number().nullable().optional(), reason: z.string().nullable().optional() }).passthrough();
export const marketSignalSchema = z.object({
  id: z.string(), type: z.enum(['On-chain Buy', 'On-chain Sell', 'Smart Buy', 'Smart Sell', 'Whale Move', 'New Listing', 'Pump Alert', 'Liquidity Add', 'Dev Sell']),
  token: z.string(), tokenAddress: publicKeyString.optional(), description: z.string(), time: z.string(), ts: z.number().optional(), wallet: publicKeyString.optional(), amount: z.number().optional(), amountUsd: z.number().optional(), amountToken: z.number().optional(), profitEstimate: z.number().optional(), txHash: z.string().optional(), source: z.string().optional(), explorerUrl: z.string().url().optional(), evidence: z.array(z.string()).optional(),
}).passthrough();
export const signalsSchema = z.object({
  signals: z.array(marketSignalSchema).max(MAX_MARKET_ROWS), signalEvidence: z.array(z.record(z.string(), z.unknown())).max(MAX_EVIDENCE_ROWS).optional(), fetchedAt: z.number(), recordCount: z.number().int().nonnegative(), totalCount: z.number().int().nonnegative(), hasMore: z.boolean(), nextBefore: z.number().nullable(), nextCursor: z.string().nullable(), counts: z.record(z.string(), z.number()), source: z.string(), providers: z.array(z.string()).max(50).optional(), dataQuality: z.string(), reason: z.string().nullable(), ingestion: z.object({ status: z.string(), lastStartedAt: z.number().nullable(), lastFinishedAt: z.number().nullable(), lastSuccessAt: z.number().nullable(), processedCount: z.number().nonnegative(), error: z.string().nullable() }).passthrough().optional(), freshness: freshnessSchema, requestId: z.string(),
}).passthrough();
export type MarketSignal = z.infer<typeof marketSignalSchema>;
export type SignalsResponse = z.infer<typeof signalsSchema>;

export const heatmapSchema = z.object({
  heatmap: z.array(z.object({ symbol: z.string(), name: z.string(), address: publicKeyString, price: z.number().nonnegative(), change24h: z.number(), volume24h: z.number().nonnegative(), marketCap: z.number().nonnegative().nullable(), liquidity: z.number().nonnegative(), dex: z.string(), imageUrl: z.string().optional(), pairUrl: z.string().optional(), trustFlags: z.array(z.string()).max(50), source: z.string().optional() }).passthrough()).max(MAX_MARKET_ROWS),
  fetchedAt: z.number(), recordCount: z.number().int().nonnegative(), providers: z.array(z.string()), source: z.string(), trustSummary: z.object({ warningRecordCount: z.number().int().nonnegative(), lowLiquidityCount: z.number().int().nonnegative(), noPriceCount: z.number().int().nonnegative(), transactionCountUnavailable: z.number().int().nonnegative(), suspiciousMetadataCount: z.number().int().nonnegative(), nonCanonicalMintCount: z.number().int().nonnegative(), incompleteMetricCount: z.number().int().nonnegative(), inputRecordCount: z.number().int().nonnegative(), excludedRecordCount: z.number().int().nonnegative() }).passthrough(), freshness: freshnessSchema, error: z.string().nullable().optional(), reason: z.string().nullable(),
}).passthrough();
export type HeatmapResponse = z.infer<typeof heatmapSchema>;

export const claimMonitorSchema = z.object({
  generatedAt: z.number(), health: z.enum(['healthy', 'degraded', 'unhealthy']), source: z.literal('solana-rpc'), mode: z.literal('rpc-polling'), programId: publicKeyString, programIds: z.array(publicKeyString).max(20), rpcEndpoint: z.string(), signaturesScanned: z.number().int().nonnegative(), claimsDetected: z.number().int().nonnegative(), firstClaims: z.number().int().nonnegative(), fakeClaims: z.number().int().nonnegative(), events: z.array(z.object({ signature: z.string(), slot: z.number().int().nonnegative(), blockTime: z.number().int().nullable(), programId: publicKeyString, instruction: z.string(), platform: z.enum(['github', 'unknown']), amountLamports: z.number().nonnegative().nullable(), amountSol: z.number().nonnegative().nullable(), feePayer: publicKeyString.nullable(), status: z.enum(['confirmed', 'failed', 'fake_or_unpaid', 'detected']), isFirstClaim: z.boolean(), isFakeClaim: z.boolean(), logs: z.array(z.string()).max(MAX_EVIDENCE_ROWS), explorerUrl: z.string().url() }).passthrough()).max(MAX_EVIDENCE_ROWS), error: z.string().optional(),
}).passthrough();
export type ClaimMonitorResponse = z.infer<typeof claimMonitorSchema>;

export const walletHoldingsSchema = z.object({ wallet: z.object({
  address: publicKeyString, label: z.string().optional(), tokens: z.array(z.object({ mint: publicKeyString, symbol: z.string(), name: z.string(), amount: z.number().nonnegative(), uiAmount: z.number().nonnegative(), decimals: z.number().int().nonnegative().max(18), priceUsd: z.number().nonnegative().nullable(), valueUsd: z.number().nonnegative().nullable(), pctOfPortfolio: z.number().nonnegative().max(100) }).passthrough()).max(MAX_WALLET_HOLDINGS), totalValueUsd: z.number().nonnegative(), tokenCount: z.number().int().nonnegative(), solBalance: z.number().nonnegative(), solValueUsd: z.number().nonnegative(),
}).passthrough(), ts: z.number() }).passthrough();
export type WalletHoldingsResponse = z.infer<typeof walletHoldingsSchema>;

const feedRecordsSchema = z.object({
  pairs: z.number().int().nonnegative(), transactions: z.number().int().nonnegative(),
  candles: z.number().int().nonnegative(), total: z.number().int().nonnegative(),
  lastPersistedAt: z.number().nullable().optional(), persistenceAgeMs: z.number().nonnegative().nullable().optional(),
  freshness: z.enum(['fresh', 'stale', 'unavailable']).optional(),
}).passthrough();
export const feedConnectionsSchema = z.object({
  success: z.literal(true), chain: z.literal('solana'), generatedAt: z.number(),
  source: z.literal('runtime_provider_inventory'), runtimeScope: z.enum(['durable-indexer-heartbeat', 'local-process']),
  healthSummary: z.object({ healthy: z.number().int().nonnegative(), degraded: z.number().int().nonnegative(), unhealthy: z.number().int().nonnegative(), receiving: z.number().int().nonnegative() }),
  connections: z.array(z.object({
    id: z.string(), label: z.string(), method: z.enum(['api', 'websocket', 'rpc', 'storage']),
    status: z.string(), health: z.string(), receiving: z.boolean(), deliveryStatus: z.string(), configured: z.boolean(), records: feedRecordsSchema,
  }).passthrough()).max(50),
  ingestionJobs: z.array(z.object({ id: z.string(), jobType: z.string(), providerLabel: z.string(), status: z.string(), tokensProcessed: z.number().int().nonnegative(), tokensFailed: z.number().int().nonnegative(), startedAt: z.union([z.string(), z.date()]) }).passthrough()).max(100),
}).passthrough();
export type FeedConnectionsResponse = z.infer<typeof feedConnectionsSchema>;

export const feedDiagnosticsSchema = z.object({
  generatedAt: z.number(), runtimeScope: z.enum(['durable-indexer-heartbeat', 'local-process']),
  realtimeEvidence: z.object({ timestamp: z.string().nullable(), timestampValid: z.boolean() }).passthrough(),
  quality: z.object({ rpc: z.string(), websocket: z.string(), eventPersistence: z.string(), decoder: z.string() }).passthrough(),
  persistenceEvidence: z.object({ status: z.enum(['complete', 'unavailable']), error: z.string().nullable() }).passthrough(),
  observabilityEvidence: z.object({ status: z.enum(['complete', 'unavailable']), error: z.string().nullable() }).passthrough(),
  replayEvidence: z.object({ status: z.enum(['complete', 'unavailable']), error: z.string().nullable() }).passthrough(),
  actions: z.array(z.string()).max(100), degraded: z.boolean(),
}).passthrough();
export type FeedDiagnosticsResponse = z.infer<typeof feedDiagnosticsSchema>;
