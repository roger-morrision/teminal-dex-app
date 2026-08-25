import {
  aiPaperReportSchema,
  aiPlatformSchema,
  aiRecommendationsSchema,
  aiGmgnHistorySchema,
  alertDeliveriesSchema,
  alertEvaluationHistorySchema,
  bubbleGraphSchema,
  claimMonitorSchema,
  copyExecutionsSchema,
  copyPositionsSchema,
  copyTradeConfigMutationSchema,
  copyTradeConfigsSchema,
  copyTradeHealthSchema,
  feedConnectionsSchema,
  feedDiagnosticsSchema,
  feedHistorySchema,
  socialRadarSchema,
  heatmapSchema,
  indexerHealthSchema,
  holdersSchema,
  manipulationSchema,
  monitorAlertsSchema,
  narrativeSchema,
  ohlcvSchema,
  pairsSchema,
  portfolioAnalyticsSchema,
  riskSchema,
  securityHistorySchema,
  signalsSchema,
  smartMoneySchema,
  snipersSchema,
  swapQuoteSchema,
  swapBuildSchema,
  swapInspectionSchema,
  swapSimulationSchema,
  swapConfirmationSchema,
  swapV2ReadinessSchema,
  tokenDetailSchema,
  topTradersSchema,
  trackFeedSchema,
  transactionsSchema,
  trenchesSchema,
  trendingSchema,
  userAlertMutationSchema,
  userAlertsSchema,
  walletHoldingsSchema,
  walletPnlSchema,
  type AiPaperReport,
  type AiPlatform,
  type AiRecommendation,
  type AiGmgnHistory,
  type AlertDeliveriesResponse,
  type AlertEvaluationHistory,
  type BubbleGraphResponse,
  type ClaimMonitorResponse,
  type CopyExecution,
  type CopyPosition,
  type CopyTradeConfig,
  type CopyTradeHealth,
  type FeedConnectionsResponse,
  type FeedDiagnosticsResponse,
  type FeedHistoryCursor,
  type FeedHistoryResponse,
  type SocialRadarResponse,
  type HeatmapResponse,
  type IndexerHealthResponse,
  type HoldersResponse,
  type ManipulationResponse,
  type MonitorAlertsResponse,
  type NarrativeResponse,
  type OhlcvResponse,
  type PairsResponse,
  type PortfolioAnalyticsResponse,
  type RiskResponse,
  type SecurityHistoryResponse,
  type SignalsResponse,
  type SmartMoneyResponse,
  type SnipersResponse,
  type SwapQuoteResponse,
  type SwapV2Readiness,
  type TokenDetailResponse,
  type TopTradersResponse,
  type TrackFeedResponse,
  type TransactionsResponse,
  type TrenchesResponse,
  type TrendingResponse,
  type UserAlert,
  type UserAlertsResponse,
  type WalletHoldingsResponse,
  type WalletPnlResponse,
} from "./schema";
import { isSolanaAddress } from "@/security/input";
import { recordFeedCounterSample } from "@/lib/feed-recovery";
import { assertMobileRequestPolicy } from "@/security/execution-policy";
import { Platform } from "react-native";

export type TrendingPeriod = "1h" | "6h" | "24h";
export type TrendingSort = "trending" | "gainers" | "losers" | "volume" | "new";
export type DiscoveryMode =
  | TrendingSort
  | "new-pairs"
  | "hot-searches"
  | "surge"
  | "nextbc"
  | "pump-live"
  | "watchlist";
export type DiscoveryFilters = {
  dex: string;
  minLiquidity: string;
  minMarketCap: string;
};

const NON_PAGEABLE_DISCOVERY_MODES: ReadonlySet<DiscoveryMode> = new Set([
  "hot-searches",
  "surge",
  "nextbc",
  "pump-live",
]);

export function getDiscoveryModeCapabilities(mode: DiscoveryMode): {
  period: boolean;
  filters: boolean;
} {
  if (mode === "new-pairs" || NON_PAGEABLE_DISCOVERY_MODES.has(mode)) {
    return { period: false, filters: false };
  }
  return { period: true, filters: mode !== "watchlist" };
}

export function getDiscoveryNextPageParam(
  mode: DiscoveryMode,
  page: TrendingResponse,
  pages: TrendingResponse[],
  pageParams: unknown[] = [],
): string | undefined {
  if (NON_PAGEABLE_DISCOVERY_MODES.has(mode)) return undefined;
  if (page.pagination) {
    return page.pagination.hasMore
      ? (page.pagination.nextCursor ?? undefined)
      : undefined;
  }
  if (page.nextCursor != null) return String(page.nextCursor);
  if (mode === "new-pairs" || page.totalCount == null || page.tokens.length === 0)
    return undefined;
  const lastParam = pageParams.at(-1);
  const offset =
    typeof lastParam === "string" && /^\d+$/.test(lastParam)
      ? Number(lastParam)
      : pages.length === 1
        ? 0
        : pages.slice(0, -1).reduce((total, item) => total + item.tokens.length, 0);
  const nextOffset = offset + page.tokens.length;
  return nextOffset < page.totalCount ? String(nextOffset) : undefined;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
  }
}

export function getDevelopmentApiOrigin(platform: string): string {
  return platform === "android"
    ? "http://10.0.2.2:3000"
    : "http://127.0.0.1:3000";
}

export function getApiOrigin(): string {
  const configured = (
    process.env.EXPO_PUBLIC_API_URL?.trim() ||
    (typeof __DEV__ !== "undefined" && __DEV__
      ? getDevelopmentApiOrigin(Platform.OS)
      : "")
  ).replace(/\/$/, "");
  if (!configured)
    throw new ApiError(
      "Backend URL is not configured. Set EXPO_PUBLIC_API_URL.",
    );
  let url: URL;
  try {
    url = new URL(configured);
  } catch {
    throw new ApiError("Backend URL must be a valid absolute URL.");
  }
  const developmentHost = ["localhost", "127.0.0.1", "::1", "10.0.2.2"].includes(
    url.hostname,
  );
  if (
    url.protocol !== "https:" &&
    !(
      typeof __DEV__ !== "undefined" &&
      __DEV__ &&
      url.protocol === "http:" &&
      developmentHost
    )
  )
    throw new ApiError(
      "Backend URL must use HTTPS; HTTP is limited to loopback development.",
    );
  if (
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  )
    throw new ApiError(
      "Backend URL must be an origin without credentials, paths, query parameters, or fragments.",
    );
  return url.origin;
}

async function getValidated(
  url: string,
  signal?: AbortSignal,
): Promise<TrendingResponse> {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal,
  });
  if (!response.ok)
    throw new ApiError(
      `Market data request failed (${response.status}).`,
      response.status,
    );
  const result = trendingSchema.safeParse(await response.json());
  if (!result.success)
    throw new ApiError(
      "Backend returned an incompatible market data response.",
    );
  return result.data;
}

export async function fetchDiscovery(
  mode: DiscoveryMode,
  period: TrendingPeriod,
  filters: DiscoveryFilters,
  cursor?: string,
  signal?: AbortSignal,
): Promise<TrendingResponse> {
  const validateCursorProgress = (page: TrendingResponse) => {
    const nextCursor = page.pagination?.nextCursor ?? page.nextCursor;
    if (cursor && nextCursor != null && String(nextCursor) === cursor) {
      throw new ApiError("Discovery request returned a non-advancing cursor.");
    }
    return page;
  };
  const special = NON_PAGEABLE_DISCOVERY_MODES.has(mode);
  if (special)
    return getValidated(`${getApiOrigin()}/api/trending/${mode}`, signal);
  if (mode === "new-pairs") {
    const query = new URLSearchParams({ limit: "50" });
    if (cursor) query.set("cursor", cursor);
    return validateCursorProgress(
      await getValidated(`${getApiOrigin()}/api/v2/new-pairs?${query}`, signal),
    );
  }
  const query = new URLSearchParams({
    period,
    sort: mode === "watchlist" ? "trending" : mode,
    limit: "50",
    view: "mobile",
  });
  if (cursor && /^\d+$/.test(cursor)) query.set("cursor", cursor);
  if (filters.dex !== "All") query.set("dex", filters.dex);
  if (filters.minLiquidity) query.set("minLiquidity", filters.minLiquidity);
  if (filters.minMarketCap) query.set("minMarketCap", filters.minMarketCap);
  return validateCursorProgress(
    await getValidated(`${getApiOrigin()}/api/trending?${query}`, signal),
  );
}

export async function searchTokens(
  queryText: string,
  signal?: AbortSignal,
): Promise<TrendingResponse> {
  const query = new URLSearchParams({ q: queryText.trim() });
  return getValidated(`${getApiOrigin()}/api/search?${query}`, signal);
}

export async function fetchTokenDetail(
  address: string,
  signal?: AbortSignal,
): Promise<TokenDetailResponse> {
  if (!isSolanaAddress(address))
    throw new ApiError("Token address must decode to exactly 32 bytes.");
  const response = await fetch(
    `${getApiOrigin()}/api/token/${encodeURIComponent(address)}`,
    { headers: { Accept: "application/json" }, signal },
  );
  if (!response.ok)
    throw new ApiError(
      `Token detail request failed (${response.status}).`,
      response.status,
    );
  const result = tokenDetailSchema.safeParse(await response.json());
  if (!result.success)
    throw new ApiError(
      "Backend returned an incompatible token detail response.",
    );
  if (result.data.token && result.data.token.address !== address)
    throw new ApiError(
      "Backend token identity did not match the requested address.",
    );
  return result.data;
}

type TokenPanel =
  | "holders"
  | "txns"
  | "risk"
  | "narrative"
  | "smart-money"
  | "pairs"
  | "bubble"
  | "manipulation"
  | "snipers"
  | "security-history";
type TokenPanelResponse = {
  holders: HoldersResponse;
  txns: TransactionsResponse;
  risk: RiskResponse;
  narrative: NarrativeResponse;
  "smart-money": SmartMoneyResponse;
  pairs: PairsResponse;
  bubble: BubbleGraphResponse;
  manipulation: ManipulationResponse;
  snipers: SnipersResponse;
  "security-history": SecurityHistoryResponse;
};
const panelSchemas = {
  holders: holdersSchema,
  txns: transactionsSchema,
  risk: riskSchema,
  narrative: narrativeSchema,
  "smart-money": smartMoneySchema,
  pairs: pairsSchema,
  bubble: bubbleGraphSchema,
  manipulation: manipulationSchema,
  snipers: snipersSchema,
  "security-history": securityHistorySchema,
} as const;

export async function fetchTokenPanel<T extends TokenPanel>(
  address: string,
  panel: T,
  signal?: AbortSignal,
): Promise<TokenPanelResponse[T]> {
  if (!isSolanaAddress(address))
    throw new ApiError("Token address must decode to exactly 32 bytes.");
  const response = await fetch(
    `${getApiOrigin()}/api/token/${encodeURIComponent(address)}/${panel}`,
    { headers: { Accept: "application/json" }, signal },
  );
  if (!response.ok)
    throw new ApiError(
      `${panel} request failed (${response.status}).`,
      response.status,
    );
  const result = panelSchemas[panel].safeParse(await response.json());
  if (!result.success)
    throw new ApiError(`Backend returned incompatible ${panel} data.`);
  return result.data as TokenPanelResponse[T];
}

export async function fetchOhlcv(
  address: string,
  timeframe: "5m" | "15m" | "1h" | "4h" | "1d",
  signal?: AbortSignal,
): Promise<OhlcvResponse> {
  if (!isSolanaAddress(address))
    throw new ApiError("Token address must decode to exactly 32 bytes.");
  const query = new URLSearchParams({ tf: timeframe });
  const response = await fetch(
    `${getApiOrigin()}/api/token/${encodeURIComponent(address)}/ohlcv?${query}`,
    { headers: { Accept: "application/json" }, signal },
  );
  if (!response.ok)
    throw new ApiError(
      `Chart request failed (${response.status}).`,
      response.status,
    );
  const result = ohlcvSchema.safeParse(await response.json());
  if (!result.success)
    throw new ApiError("Backend returned incompatible OHLCV data.");
  return result.data;
}

export async function fetchPortfolioAnalytics(
  address: string,
  timeframe: "7d" | "30d" | "90d" | "1y",
  signal?: AbortSignal,
): Promise<PortfolioAnalyticsResponse> {
  const query = new URLSearchParams({ address, timeframe });
  const response = await fetch(
    `${getApiOrigin()}/api/analytics/portfolio?${query}`,
    { credentials: "include", headers: { Accept: "application/json" }, signal },
  );
  if (!response.ok)
    throw new ApiError(
      `Portfolio request failed (${response.status}).`,
      response.status,
    );
  const result = portfolioAnalyticsSchema.safeParse(await response.json());
  if (!result.success)
    throw new ApiError("Backend returned incompatible portfolio analytics.");
  return result.data;
}

export async function fetchWalletPnl(
  address: string,
  signal?: AbortSignal,
): Promise<WalletPnlResponse> {
  const response = await fetch(
    `${getApiOrigin()}/api/wallet/${encodeURIComponent(address)}/pnl`,
    { credentials: "include", headers: { Accept: "application/json" }, signal },
  );
  if (!response.ok)
    throw new ApiError(
      `Wallet PnL request failed (${response.status}).`,
      response.status,
    );
  const result = walletPnlSchema.safeParse(await response.json());
  if (!result.success)
    throw new ApiError("Backend returned incompatible wallet PnL evidence.");
  return result.data;
}

export async function fetchTrenches(
  signal?: AbortSignal,
): Promise<TrenchesResponse> {
  const response = await fetch(`${getApiOrigin()}/api/trenches`, {
    headers: { Accept: "application/json" },
    signal,
  });
  if (!response.ok)
    throw new ApiError(
      `Trenches request failed (${response.status}).`,
      response.status,
    );
  const result = trenchesSchema.safeParse(await response.json());
  if (!result.success)
    throw new ApiError("Backend returned incompatible Trenches data.");
  return result.data;
}

export async function fetchSwapQuote(
  input: {
    token: string;
    side: "buy" | "sell";
    amount: string;
    unit: "usd" | "sol" | "token";
    slippageBps: number;
  },
  signal?: AbortSignal,
): Promise<SwapQuoteResponse> {
  if (
    !/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(input.amount) ||
    Number(input.amount) <= 0 ||
    !Number.isInteger(input.slippageBps) ||
    input.slippageBps < 1 ||
    input.slippageBps > 500
  )
    throw new ApiError("Enter a valid amount and slippage from 0.01% to 5%.");
  const query = new URLSearchParams({
    token: input.token,
    side: input.side,
    amount: input.amount,
    unit: input.unit,
    slippageBps: String(input.slippageBps),
  });
  const response = await fetch(`${getApiOrigin()}/api/swap/quote?${query}`, {
    credentials: "include",
    headers: { Accept: "application/json" },
    signal,
  });
  if (!response.ok)
    throw new ApiError(
      `Quote request failed (${response.status}).`,
      response.status,
    );
  const result = swapQuoteSchema.safeParse(await response.json());
  if (!result.success)
    throw new ApiError("Backend returned an incompatible swap quote.");
  return result.data;
}

export async function fetchSwapV2Readiness(signal?: AbortSignal): Promise<SwapV2Readiness> {
  return readEvidence("/api/swap/v2-readiness", swapV2ReadinessSchema, "Swap readiness request failed", signal);
}

async function postSwapGate<T>(path: string, body: unknown, schema: { safeParse(value: unknown): { success: true; data: T } | { success: false } }, failure: string): Promise<T> {
  assertMobileRequestPolicy(path, "POST");
  const response = await fetch(`${getApiOrigin()}${path}`, { method: "POST", credentials: "include", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!response.ok) throw new ApiError(`${failure} (${response.status}).`, response.status);
  const parsed = schema.safeParse(await response.json());
  if (!parsed.success) throw new ApiError(`Backend returned incompatible ${failure.toLowerCase()} evidence.`);
  return parsed.data;
}

export async function prepareVerifiedSwapIntent(quote: SwapQuoteResponse, userPublicKey: string) {
  const built = await postSwapGate("/api/swap/build", { quoteResponse: quote.jupQuote, userPublicKey, quotedAt: quote.quotedAt }, swapBuildSchema, "Unsigned transaction build failed");
  const idempotencyKey = `mobile-${quote.quotedAt}-${quote.quote.contextSlot}`;
  const inspection = await postSwapGate("/api/swap/intents/inspect", { transaction: built.swapTransaction, quoteResponse: quote.jupQuote, quotedAt: quote.quotedAt, userPublicKey, idempotencyKey }, swapInspectionSchema, "Transaction inspection failed");
  const simulation = await postSwapGate("/api/swap/intents/simulate", { intentId: inspection.intent.id, transaction: built.swapTransaction, userPublicKey }, swapSimulationSchema, "Transaction simulation failed");
  return { inspection, simulation };
}

export async function confirmVerifiedSwapIntent(quote: SwapQuoteResponse, prepared: Awaited<ReturnType<typeof prepareVerifiedSwapIntent>>, userPublicKey: string) {
  const { intent } = prepared.inspection;
  const simulationSlot = prepared.simulation.simulation.slot;
  return postSwapGate("/api/swap/intents/confirm", {
    intentId: intent.id, confirmationKey: `mobile-confirm-${intent.id}`, acknowledgement: "I_CONFIRM_SIMULATED_UNSIGNED_SWAP", userPublicKey,
    transactionHash: intent.transactionHash, quoteHash: intent.quoteHash, inputMint: quote.quote.inputMint, outputMint: quote.quote.outputMint,
    inAmount: quote.quote.inAmount, quotedOutAmount: quote.quote.outAmount, minimumOutAmount: quote.quote.minOutAmount,
    slippageBps: quote.quote.slippageBps, simulationSlot,
  }, swapConfirmationSchema, "Explicit confirmation failed");
}

async function jsonRequest(path: string, init: RequestInit, failure: string) {
  assertMobileRequestPolicy(path, init.method ?? "GET");
  const response = await fetch(`${getApiOrigin()}${path}`, {
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
    ...init,
  });
  if (!response.ok)
    throw new ApiError(`${failure} (${response.status}).`, response.status);
  return response.json();
}

export async function fetchMonitorAlerts(
  signal?: AbortSignal,
): Promise<MonitorAlertsResponse> {
  const result = monitorAlertsSchema.safeParse(
    await jsonRequest(
      "/api/monitor/alerts",
      { signal },
      "Monitor feed request failed",
    ),
  );
  if (!result.success)
    throw new ApiError("Backend returned incompatible monitor evidence.");
  return result.data;
}

export async function fetchUserAlerts(
  signal?: AbortSignal,
): Promise<UserAlertsResponse> {
  const result = userAlertsSchema.safeParse(
    await jsonRequest(
      "/api/alerts?limit=100",
      { signal },
      "Alert definitions request failed",
    ),
  );
  if (!result.success)
    throw new ApiError("Backend returned incompatible alert definitions.");
  return result.data;
}

export async function fetchAlertDeliveries(
  signal?: AbortSignal,
): Promise<AlertDeliveriesResponse> {
  const result = alertDeliveriesSchema.safeParse(
    await jsonRequest(
      "/api/alerts/deliveries?limit=100",
      { signal },
      "Delivery evidence request failed",
    ),
  );
  if (!result.success)
    throw new ApiError("Backend returned incompatible delivery evidence.");
  return result.data;
}

export async function fetchAlertEvaluations(cursor?: { evaluatedAt: number; id: string } | null, signal?: AbortSignal): Promise<AlertEvaluationHistory> {
  const query = new URLSearchParams({ limit: "50" });
  if (cursor) {
    if (!Number.isSafeInteger(cursor.evaluatedAt) || cursor.evaluatedAt <= 0 || !/^[A-Za-z0-9_-]{8,64}$/.test(cursor.id)) throw new ApiError("Invalid alert evaluation cursor.");
    query.set("cursorAt", String(cursor.evaluatedAt)); query.set("cursorId", cursor.id);
  }
  const result = alertEvaluationHistorySchema.safeParse(await jsonRequest(`/api/alerts/evaluations?${query}`, { signal }, "Alert evaluation history request failed"));
  if (!result.success) throw new ApiError("Backend returned incompatible alert evaluation evidence.");
  const first = result.data.data[0];
  if (cursor && first && (first.evaluatedAt > cursor.evaluatedAt || (first.evaluatedAt === cursor.evaluatedAt && first.id >= cursor.id))) throw new ApiError("Backend returned non-advancing alert evaluation history.");
  return result.data;
}

export async function fetchTrackFeed(
  signal?: AbortSignal,
): Promise<TrackFeedResponse> {
  return readEvidence(
    "/api/in-app-notifications",
    trackFeedSchema,
    "Track feed request failed",
    signal,
  );
}

export async function fetchFeedHistory(
  cursor?: FeedHistoryCursor | null,
  signal?: AbortSignal,
): Promise<FeedHistoryResponse> {
  const query = new URLSearchParams({ limit: "50" });
  if (cursor) {
    query.set("beforeSequence", cursor.beforeSequence);
    query.set("beforeId", cursor.beforeId);
  }
  const page = await readEvidence(
    `/api/feed/history?${query}`,
    feedHistorySchema,
    "Feed history request failed",
    signal,
  );
  const first = page.events[0];
  if (cursor && first) {
    const sequenceOrder = first.replaySequence.length === cursor.beforeSequence.length
      ? first.replaySequence.localeCompare(cursor.beforeSequence)
      : first.replaySequence.length - cursor.beforeSequence.length;
    if (sequenceOrder > 0 || (sequenceOrder === 0 && first.id >= cursor.beforeId)) {
      throw new ApiError("Backend returned non-advancing feed history.");
    }
  }
  return page;
}

export async function fetchSocialRadar(signal?: AbortSignal): Promise<SocialRadarResponse> {
  const result = socialRadarSchema.safeParse(
    await jsonRequest(
      "/api/ai/social/radar",
      { signal },
      "Social tracking request failed",
    ),
  );
  if (!result.success) throw new ApiError("Backend returned incompatible social tracking evidence.");
  return result.data;
}

export type CreateAlertInput = {
  address: string;
  type: "price" | "percentageChange" | "volumeSpike";
  name: string;
  conditions: Record<string, unknown>;
  cooldownMinutes: number;
  channels: ["inApp"];
};
export async function createUserAlert(
  input: CreateAlertInput,
): Promise<UserAlert> {
  const result = userAlertMutationSchema.safeParse(
    await jsonRequest(
      "/api/alerts",
      { method: "POST", body: JSON.stringify(input) },
      "Alert creation failed",
    ),
  );
  if (!result.success)
    throw new ApiError("Backend returned an incompatible created alert.");
  return result.data.data;
}

export async function setUserAlertActive(
  id: string,
  active: boolean,
): Promise<UserAlert> {
  const result = userAlertMutationSchema.safeParse(
    await jsonRequest(
      "/api/alerts",
      { method: "PUT", body: JSON.stringify({ id, active }) },
      "Alert update failed",
    ),
  );
  if (!result.success)
    throw new ApiError("Backend returned an incompatible updated alert.");
  return result.data.data;
}

export async function deleteUserAlert(id: string): Promise<void> {
  await jsonRequest(
    `/api/alerts?id=${encodeURIComponent(id)}`,
    { method: "DELETE" },
    "Alert deletion failed",
  );
}

export async function fetchTopTraders(
  period: "1D" | "7D" | "30D",
  signal?: AbortSignal,
): Promise<TopTradersResponse> {
  const query = new URLSearchParams({ period, sort: "pnlUsd" });
  const result = topTradersSchema.safeParse(
    await jsonRequest(
      `/api/top-traders?${query}`,
      { signal },
      "Trader rankings request failed",
    ),
  );
  if (!result.success)
    throw new ApiError(
      "Backend returned incompatible trader ranking evidence.",
    );
  return result.data;
}

export async function fetchCopyTradeHealth(
  signal?: AbortSignal,
): Promise<CopyTradeHealth> {
  const result = copyTradeHealthSchema.safeParse(
    await jsonRequest(
      "/api/copytrade/health",
      { signal },
      "CopyTrade readiness request failed",
    ),
  );
  if (!result.success)
    throw new ApiError("Backend returned incompatible CopyTrade readiness.");
  return result.data;
}

export async function fetchCopyTradeConfigs(
  signal?: AbortSignal,
): Promise<CopyTradeConfig[]> {
  const result = copyTradeConfigsSchema.safeParse(
    await jsonRequest(
      "/api/copytrade/configs",
      { signal },
      "CopyTrade strategies request failed",
    ),
  );
  if (!result.success)
    throw new ApiError("Backend returned incompatible CopyTrade strategies.");
  return result.data.data;
}

export type CreateCopyTradeInput = Omit<
  CopyTradeConfig,
  "id" | "userId" | "createdAt" | "updatedAt"
>;
export async function createPausedCopyTradeConfig(
  input: CreateCopyTradeInput,
): Promise<CopyTradeConfig> {
  if (input.isActive)
    throw new ApiError(
      "New mobile CopyTrade strategies must be created paused for explicit safety review.",
    );
  const result = copyTradeConfigMutationSchema.safeParse(
    await jsonRequest(
      "/api/copytrade/configs",
      { method: "POST", body: JSON.stringify(input) },
      "CopyTrade strategy creation failed",
    ),
  );
  if (!result.success || result.data.data.isActive)
    throw new ApiError(
      "Backend did not preserve the paused strategy safety gate.",
    );
  return result.data.data;
}

export async function pauseCopyTradeConfig(
  id: string,
): Promise<CopyTradeConfig> {
  const result = copyTradeConfigMutationSchema.safeParse(
    await jsonRequest(
      `/api/copytrade/configs/${encodeURIComponent(id)}`,
      { method: "PUT", body: JSON.stringify({ isActive: false }) },
      "CopyTrade pause failed",
    ),
  );
  if (!result.success || result.data.data.isActive)
    throw new ApiError("Backend did not confirm the strategy is paused.");
  return result.data.data;
}

export async function deleteCopyTradeConfig(id: string): Promise<void> {
  await jsonRequest(
    `/api/copytrade/configs/${encodeURIComponent(id)}`,
    { method: "DELETE" },
    "CopyTrade deletion failed",
  );
}
export async function fetchCopyPositions(
  signal?: AbortSignal,
): Promise<CopyPosition[]> {
  const result = copyPositionsSchema.safeParse(
    await jsonRequest(
      "/api/copytrade/positions",
      { signal },
      "CopyTrade positions request failed",
    ),
  );
  if (!result.success)
    throw new ApiError("Backend returned incompatible CopyTrade positions.");
  return result.data.data;
}
export async function fetchCopyExecutions(
  signal?: AbortSignal,
): Promise<CopyExecution[]> {
  const result = copyExecutionsSchema.safeParse(
    await jsonRequest(
      "/api/copytrade/executions",
      { signal },
      "CopyTrade executions request failed",
    ),
  );
  if (!result.success)
    throw new ApiError(
      "Backend returned incompatible CopyTrade execution evidence.",
    );
  return result.data.data;
}

export async function fetchAiRecommendations(
  signal?: AbortSignal,
): Promise<AiRecommendation[]> {
  const result = aiRecommendationsSchema.safeParse(
    await jsonRequest(
      "/api/ai/recommendations?view=public&limit=50",
      { signal },
      "AI recommendations request failed",
    ),
  );
  if (!result.success)
    throw new ApiError(
      "Backend returned incompatible AI recommendation evidence.",
    );
  return result.data.data.recommendations;
}
export async function fetchAiPaperReport(
  signal?: AbortSignal,
): Promise<AiPaperReport> {
  const result = aiPaperReportSchema.safeParse(
    await jsonRequest(
      "/api/ai/paper-trading?view=public",
      { signal },
      "Paper report request failed",
    ),
  );
  if (!result.success)
    throw new ApiError("Backend returned incompatible paper-trading evidence.");
  return result.data.data;
}
export async function fetchAiPlatform(
  signal?: AbortSignal,
): Promise<AiPlatform> {
  const result = aiPlatformSchema.safeParse(
    await jsonRequest(
      "/api/ai/platform",
      { signal },
      "AI governance request failed",
    ),
  );
  if (!result.success)
    throw new ApiError("Backend returned incompatible AI governance evidence.");
  return result.data.data;
}

export async function fetchAiGmgnHistory(
  signal?: AbortSignal,
): Promise<AiGmgnHistory> {
  const result = aiGmgnHistorySchema.safeParse(
    await jsonRequest(
      "/api/ai/gmgn-gems",
      { signal },
      "GMGN discovery history request failed",
    ),
  );
  if (!result.success)
    throw new ApiError("Backend returned incompatible GMGN discovery evidence.");
  return result.data.data;
}

export type SignalFilter =
  | "All"
  | "On-chain Buy"
  | "On-chain Sell"
  | "Smart Buy"
  | "Smart Sell"
  | "Dev Sell"
  | "Whale Move";
async function readEvidence<T>(
  path: string,
  schema: {
    safeParse: (
      value: unknown,
    ) => { success: true; data: T } | { success: false };
  },
  failure: string,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(`${getApiOrigin()}${path}`, {
    credentials: "include",
    headers: { Accept: "application/json" },
    signal,
  });
  const result = schema.safeParse(await response.json());
  if (result.success) return result.data;
  if (!response.ok)
    throw new ApiError(`${failure} (${response.status}).`, response.status);
  throw new ApiError(`Backend returned incompatible ${failure.toLowerCase()}.`);
}
export async function fetchSignals(
  input: { hours: 24 | 168; type: SignalFilter; cursor?: string },
  signal?: AbortSignal,
): Promise<SignalsResponse> {
  const query = new URLSearchParams({
    limit: "40",
    hours: String(input.hours),
  });
  if (input.type !== "All") query.set("type", input.type);
  if (input.cursor) query.set("cursor", input.cursor);
  const page = await readEvidence(
    `/api/signals?${query}`,
    signalsSchema,
    "Signals request failed",
    signal,
  );
  if (input.cursor && page.nextCursor === input.cursor) {
    throw new ApiError("Signals request returned a non-advancing cursor.");
  }
  return page;
}
export async function fetchHeatmap(
  signal?: AbortSignal,
): Promise<HeatmapResponse> {
  return readEvidence(
    "/api/heatmap",
    heatmapSchema,
    "Heatmap request failed",
    signal,
  );
}
export async function fetchClaimMonitor(
  signal?: AbortSignal,
): Promise<ClaimMonitorResponse> {
  return readEvidence(
    "/api/claim-monitor?limit=30",
    claimMonitorSchema,
    "Claim monitor request failed",
    signal,
  );
}
export async function fetchFeedConnections(
  signal?: AbortSignal,
): Promise<
  FeedConnectionsResponse & {
    counterDelta: ReturnType<typeof recordFeedCounterSample>;
  }
> {
  const response = await readEvidence(
    "/api/feed/connections",
    feedConnectionsSchema,
    "Feed inventory request failed",
    signal,
  );
  return { ...response, counterDelta: recordFeedCounterSample(response) };
}
export async function fetchFeedDiagnostics(
  signal?: AbortSignal,
): Promise<FeedDiagnosticsResponse> {
  return readEvidence(
    "/api/feed/diagnostics?limit=20",
    feedDiagnosticsSchema,
    "Feed diagnostics request failed",
    signal,
  );
}
export async function fetchIndexerHealth(
  signal?: AbortSignal,
): Promise<IndexerHealthResponse> {
  return readEvidence(
    "/api/indexer/health",
    indexerHealthSchema,
    "Indexer health request failed",
    signal,
  );
}
export async function fetchWalletHoldings(
  address: string,
  signal?: AbortSignal,
): Promise<WalletHoldingsResponse> {
  if (!isSolanaAddress(address))
    throw new ApiError("Wallet address must decode to exactly 32 bytes.");
  const result = walletHoldingsSchema.safeParse(
    await jsonRequest(
      `/api/wallet/${encodeURIComponent(address)}`,
      { signal },
      "Wallet holdings request failed",
    ),
  );
  if (!result.success || result.data.wallet.address !== address)
    throw new ApiError("Backend returned incompatible wallet holdings.");
  return result.data;
}
