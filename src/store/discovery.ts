import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DiscoveryFilters } from '@/api/client';

const WATCHLIST_KEY = 'terminal-dex:watchlist:v1';
const FILTERS_KEY = 'terminal-dex:discovery-filters:v1';
export const defaultFilters: DiscoveryFilters = { dex: 'All', minLiquidity: '', minMarketCap: '' };

export async function loadWatchlist(): Promise<string[]> {
  try { const value: unknown = JSON.parse(await AsyncStorage.getItem(WATCHLIST_KEY) ?? '[]'); return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string').slice(0, 100) : []; } catch { return []; }
}
export async function saveWatchlist(value: string[]): Promise<void> { await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(value.slice(0, 100))); }
export async function loadFilters(): Promise<DiscoveryFilters> {
  try { const value = JSON.parse(await AsyncStorage.getItem(FILTERS_KEY) ?? '{}') as Partial<DiscoveryFilters>; return { dex: typeof value.dex === 'string' ? value.dex : 'All', minLiquidity: typeof value.minLiquidity === 'string' ? value.minLiquidity : '', minMarketCap: typeof value.minMarketCap === 'string' ? value.minMarketCap : '' }; } catch { return defaultFilters; }
}
export async function saveFilters(value: DiscoveryFilters): Promise<void> { await AsyncStorage.setItem(FILTERS_KEY, JSON.stringify(value)); }
