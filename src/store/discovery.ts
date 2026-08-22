import AsyncStorage from "@react-native-async-storage/async-storage";
import type { DiscoveryFilters } from "@/api/client";
import { tokenSchema, type MarketToken } from "@/api/schema";
import { isSolanaAddress } from "@/security/input";

const WATCHLIST_KEY = "terminal-dex:watchlist:v1";
export const WATCHLIST_SNAPSHOTS_KEY = "terminal-dex:watchlist-snapshots:v1";
export const WATCHLIST_WINDOW_KEY = "terminal-dex:watchlist-window:v1";
const FILTERS_KEY = "terminal-dex:discovery-filters:v1";
export const defaultFilters: DiscoveryFilters = {
  dex: "All",
  minLiquidity: "",
  minMarketCap: "",
};

export async function loadWatchlist(): Promise<string[]> {
  try {
    const value: unknown = JSON.parse(
      (await AsyncStorage.getItem(WATCHLIST_KEY)) ?? "[]",
    );
    return Array.isArray(value)
      ? [
          ...new Set(
            value.filter(
              (item): item is string =>
                typeof item === "string" && isSolanaAddress(item),
            ),
          ),
        ].slice(0, 100)
      : [];
  } catch {
    return [];
  }
}
export async function saveWatchlist(value: string[]): Promise<void> {
  const safe = [...new Set(value.filter(isSolanaAddress))].slice(0, 100);
  await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(safe));
}
export async function loadWatchlistSnapshots(): Promise<
  Record<string, MarketToken>
> {
  try {
    const value: unknown = JSON.parse(
      (await AsyncStorage.getItem(WATCHLIST_SNAPSHOTS_KEY)) ?? "{}",
    );
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(
      Object.entries(value)
        .slice(0, 100)
        .flatMap(([address, snapshot]) => {
          const parsed = tokenSchema.safeParse(snapshot);
          return isSolanaAddress(address) &&
            parsed.success &&
            parsed.data.address === address
            ? [[address, parsed.data]]
            : [];
        }),
    );
  } catch {
    return {};
  }
}
export async function saveWatchlistSnapshots(
  value: Record<string, MarketToken>,
): Promise<void> {
  const safe = Object.fromEntries(
    Object.entries(value)
      .flatMap(([address, snapshot]) => {
        const parsed = tokenSchema.safeParse(snapshot);
        return isSolanaAddress(address) &&
          parsed.success &&
          parsed.data.address === address
          ? [[address, parsed.data]]
          : [];
      })
      .slice(0, 100),
  );
  await AsyncStorage.setItem(WATCHLIST_SNAPSHOTS_KEY, JSON.stringify(safe));
}
export async function loadWatchlistWindow(): Promise<"1h" | "6h" | "24h"> {
  const value = await AsyncStorage.getItem(WATCHLIST_WINDOW_KEY);
  return value === "1h" || value === "6h" ? value : "24h";
}
export async function saveWatchlistWindow(
  value: "1h" | "6h" | "24h",
): Promise<void> {
  await AsyncStorage.setItem(WATCHLIST_WINDOW_KEY, value);
}
export async function loadFilters(): Promise<DiscoveryFilters> {
  try {
    const value = JSON.parse(
      (await AsyncStorage.getItem(FILTERS_KEY)) ?? "{}",
    ) as Partial<DiscoveryFilters>;
    return {
      dex: typeof value.dex === "string" ? value.dex : "All",
      minLiquidity:
        typeof value.minLiquidity === "string" ? value.minLiquidity : "",
      minMarketCap:
        typeof value.minMarketCap === "string" ? value.minMarketCap : "",
    };
  } catch {
    return defaultFilters;
  }
}
export async function saveFilters(value: DiscoveryFilters): Promise<void> {
  await AsyncStorage.setItem(FILTERS_KEY, JSON.stringify(value));
}
