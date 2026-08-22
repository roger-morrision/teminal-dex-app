import { tokenDetailSchema, trendingSchema, type TokenDetailResponse, type TrendingResponse } from './schema';

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
