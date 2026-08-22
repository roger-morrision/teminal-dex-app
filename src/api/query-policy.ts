import { ApiError } from './client';

export function shouldRetryQuery(failureCount: number, error: Error): boolean {
  if (failureCount >= 2 || error.name === 'AbortError') return false;
  if (error instanceof ApiError && error.status != null && error.status >= 400 && error.status < 500) return false;
  return true;
}

export const queryDefaults = {
  queries: { retry: shouldRetryQuery, staleTime: 15_000, gcTime: 5 * 60_000, networkMode: 'online' as const, refetchOnReconnect: 'always' as const },
  mutations: { retry: false, networkMode: 'always' as const },
};
