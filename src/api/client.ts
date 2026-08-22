import { holdersSchema, narrativeSchema, ohlcvSchema, pairsSchema, portfolioAnalyticsSchema, riskSchema, smartMoneySchema, tokenDetailSchema, transactionsSchema, trendingSchema, walletPnlSchema, type HoldersResponse, type NarrativeResponse, type OhlcvResponse, type PairsResponse, type PortfolioAnalyticsResponse, type RiskResponse, type SmartMoneyResponse, type TokenDetailResponse, type TransactionsResponse, type TrendingResponse, type WalletPnlResponse } from './schema';

export type TrendingPeriod = '1h' | '6h' | '24h';
export type TrendingSort = 'trending' | 'gainers' | 'losers' | 'volume' | 'new';
export type DiscoveryMode = TrendingSort | 'new-pairs' | 'hot-searches' | 'surge' | 'nextbc' | 'pump-live' | 'watchlist';
export type DiscoveryFilters = { dex: string; minLiquidity: string; minMarketCap: string };

export class ApiError extends Error {
  constructor(message: string, readonly status?: number) { super(message); }
}

export function getApiOrigin(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/$/, '');
  if (!configured) throw new ApiError('Backend URL is not configured. Set EXPO_PUBLIC_API_URL.');
  if (!/^https?:\/\//i.test(configured)) throw new ApiError('Backend URL must use HTTP or HTTPS.');
  return configured;
}

async function getValidated(url: string, signal?: AbortSignal): Promise<TrendingResponse> {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' }, signal,
  });
  if (!response.ok) throw new ApiError(`Market data request failed (${response.status}).`, response.status);
  const result = trendingSchema.safeParse(await response.json());
  if (!result.success) throw new ApiError('Backend returned an incompatible market data response.');
  return result.data;
}

export async function fetchDiscovery(mode: DiscoveryMode, period: TrendingPeriod, filters: DiscoveryFilters, cursor?: string, signal?: AbortSignal): Promise<TrendingResponse> {
  const special = ['hot-searches', 'surge', 'nextbc', 'pump-live'].includes(mode);
  if (special) return getValidated(`${getApiOrigin()}/api/trending/${mode}`, signal);
  if (mode === 'new-pairs') {
    const query = new URLSearchParams({ limit: '50' });
    if (cursor) query.set('cursor', cursor);
    return getValidated(`${getApiOrigin()}/api/v2/new-pairs?${query}`, signal);
  }
  const query = new URLSearchParams({ period, sort: mode === 'watchlist' ? 'trending' : mode, limit: '50' });
  if (cursor && /^\d+$/.test(cursor)) query.set('cursor', cursor);
  if (filters.dex !== 'All') query.set('dex', filters.dex);
  if (filters.minLiquidity) query.set('minLiquidity', filters.minLiquidity);
  if (filters.minMarketCap) query.set('minMarketCap', filters.minMarketCap);
  return getValidated(`${getApiOrigin()}/api/trending?${query}`, signal);
}

export async function searchTokens(queryText: string, signal?: AbortSignal): Promise<TrendingResponse> {
  const query = new URLSearchParams({ q: queryText.trim() });
  return getValidated(`${getApiOrigin()}/api/search?${query}`, signal);
}

export async function fetchTokenDetail(address: string, signal?: AbortSignal): Promise<TokenDetailResponse> {
  const response = await fetch(`${getApiOrigin()}/api/token/${encodeURIComponent(address)}`, { headers: { Accept: 'application/json' }, signal });
  if (!response.ok) throw new ApiError(`Token detail request failed (${response.status}).`, response.status);
  const result = tokenDetailSchema.safeParse(await response.json());
  if (!result.success) throw new ApiError('Backend returned an incompatible token detail response.');
  return result.data;
}

type TokenPanel = 'holders' | 'txns' | 'risk' | 'narrative' | 'smart-money' | 'pairs';
type TokenPanelResponse = { holders: HoldersResponse; txns: TransactionsResponse; risk: RiskResponse; narrative: NarrativeResponse; 'smart-money': SmartMoneyResponse; pairs: PairsResponse };
const panelSchemas = { holders: holdersSchema, txns: transactionsSchema, risk: riskSchema, narrative: narrativeSchema, 'smart-money': smartMoneySchema, pairs: pairsSchema } as const;

export async function fetchTokenPanel<T extends TokenPanel>(address: string, panel: T, signal?: AbortSignal): Promise<TokenPanelResponse[T]> {
  const response = await fetch(`${getApiOrigin()}/api/token/${encodeURIComponent(address)}/${panel}`, { headers: { Accept: 'application/json' }, signal });
  if (!response.ok) throw new ApiError(`${panel} request failed (${response.status}).`, response.status);
  const result = panelSchemas[panel].safeParse(await response.json());
  if (!result.success) throw new ApiError(`Backend returned incompatible ${panel} data.`);
  return result.data as TokenPanelResponse[T];
}

export async function fetchOhlcv(address: string, timeframe: '5m' | '15m' | '1h' | '4h' | '1d', signal?: AbortSignal): Promise<OhlcvResponse> {
  const query = new URLSearchParams({ tf: timeframe });
  const response = await fetch(`${getApiOrigin()}/api/token/${encodeURIComponent(address)}/ohlcv?${query}`, { headers: { Accept: 'application/json' }, signal });
  if (!response.ok) throw new ApiError(`Chart request failed (${response.status}).`, response.status);
  const result = ohlcvSchema.safeParse(await response.json());
  if (!result.success) throw new ApiError('Backend returned incompatible OHLCV data.');
  return result.data;
}

export async function fetchPortfolioAnalytics(address: string, timeframe: '7d' | '30d' | '90d' | '1y', signal?: AbortSignal): Promise<PortfolioAnalyticsResponse> {
  const query = new URLSearchParams({ address, timeframe });
  const response = await fetch(`${getApiOrigin()}/api/analytics/portfolio?${query}`, { credentials: 'include', headers: { Accept: 'application/json' }, signal });
  if (!response.ok) throw new ApiError(`Portfolio request failed (${response.status}).`, response.status);
  const result = portfolioAnalyticsSchema.safeParse(await response.json());
  if (!result.success) throw new ApiError('Backend returned incompatible portfolio analytics.');
  return result.data;
}

export async function fetchWalletPnl(address: string, signal?: AbortSignal): Promise<WalletPnlResponse> {
  const response = await fetch(`${getApiOrigin()}/api/wallet/${encodeURIComponent(address)}/pnl`, { credentials: 'include', headers: { Accept: 'application/json' }, signal });
  if (!response.ok) throw new ApiError(`Wallet PnL request failed (${response.status}).`, response.status);
  const result = walletPnlSchema.safeParse(await response.json());
  if (!result.success) throw new ApiError('Backend returned incompatible wallet PnL evidence.');
  return result.data;
}
