import { trendingSchema, type TrendingResponse } from './schema';

export type TrendingPeriod = '1h' | '6h' | '24h';
export type TrendingSort = 'trending' | 'gainers' | 'losers' | 'volume' | 'new';

export class ApiError extends Error {
  constructor(message: string, readonly status?: number) { super(message); }
}

export function getApiOrigin(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/$/, '');
  if (!configured) throw new ApiError('Backend URL is not configured. Set EXPO_PUBLIC_API_URL.');
  if (!/^https?:\/\//i.test(configured)) throw new ApiError('Backend URL must use HTTP or HTTPS.');
  return configured;
}

export async function fetchTrending(period: TrendingPeriod, sort: TrendingSort, signal?: AbortSignal): Promise<TrendingResponse> {
  const query = new URLSearchParams({ period, sort, limit: '50' });
  const response = await fetch(`${getApiOrigin()}/api/trending?${query}`, {
    headers: { Accept: 'application/json' }, signal,
  });
  if (!response.ok) throw new ApiError(`Market data request failed (${response.status}).`, response.status);
  const result = trendingSchema.safeParse(await response.json());
  if (!result.success) throw new ApiError('Backend returned an incompatible market data response.');
  return result.data;
}
