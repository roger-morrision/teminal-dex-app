import AsyncStorage from "@react-native-async-storage/async-storage";
import type { MarketToken } from "@/api/schema";

export const MONITOR_TABLE_KEY = "terminal-dex:monitor-table:v1";

export type MonitorWindow = "1h" | "6h" | "24h";
export type MonitorPreset = "market" | "liquidity" | "flow";
export type MonitorDensity = "compact" | "comfortable";
export type MonitorDirection = "all" | "positive" | "negative";
export type MonitorSortKey =
  | "change1h"
  | "volume1h"
  | "liquidity"
  | "marketCap";
export type MonitorSort = {
  key: MonitorSortKey;
  direction: "asc" | "desc";
};

export type MonitorTablePreferences = {
  window: MonitorWindow;
  preset: MonitorPreset;
  density: MonitorDensity;
  query: string;
  dex: string;
  direction: MonitorDirection;
  minLiquidity: string;
  minMarketCap: string;
  minVolume: string;
  sorts: MonitorSort[];
};

export const defaultMonitorTablePreferences: MonitorTablePreferences = {
  window: "1h",
  preset: "market",
  density: "compact",
  query: "",
  dex: "all",
  direction: "all",
  minLiquidity: "0",
  minMarketCap: "0",
  minVolume: "0",
  sorts: [{ key: "change1h", direction: "desc" }],
};

const WINDOWS = new Set<MonitorWindow>(["1h", "6h", "24h"]);
const PRESETS = new Set<MonitorPreset>(["market", "liquidity", "flow"]);
const DENSITIES = new Set<MonitorDensity>(["compact", "comfortable"]);
const DIRECTIONS = new Set<MonitorDirection>(["all", "positive", "negative"]);
const SORT_KEYS = new Set<MonitorSortKey>([
  "change1h",
  "volume1h",
  "liquidity",
  "marketCap",
]);

function boundedText(value: unknown, maxLength: number, fallback = "") {
  return typeof value === "string" ? value.slice(0, maxLength) : fallback;
}

function threshold(value: unknown) {
  if (typeof value !== "string" || !/^\d{1,12}(?:\.\d{0,2})?$/.test(value))
    return "0";
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? value : "0";
}

export function sanitizeMonitorTablePreferences(
  value: unknown,
): MonitorTablePreferences {
  const input =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Partial<MonitorTablePreferences>)
      : {};
  const sorts = Array.isArray(input.sorts)
    ? input.sorts
        .flatMap((item) =>
          item &&
          typeof item === "object" &&
          SORT_KEYS.has(item.key as MonitorSortKey) &&
          (item.direction === "asc" || item.direction === "desc")
            ? [item as MonitorSort]
            : [],
        )
        .filter(
          (item, index, all) =>
            all.findIndex((candidate) => candidate.key === item.key) === index,
        )
        .slice(0, 2)
    : [];
  return {
    window: WINDOWS.has(input.window as MonitorWindow)
      ? (input.window as MonitorWindow)
      : defaultMonitorTablePreferences.window,
    preset: PRESETS.has(input.preset as MonitorPreset)
      ? (input.preset as MonitorPreset)
      : defaultMonitorTablePreferences.preset,
    density: DENSITIES.has(input.density as MonitorDensity)
      ? (input.density as MonitorDensity)
      : defaultMonitorTablePreferences.density,
    query: boundedText(input.query, 80),
    dex: boundedText(input.dex, 40, "all").toLowerCase() || "all",
    direction: DIRECTIONS.has(input.direction as MonitorDirection)
      ? (input.direction as MonitorDirection)
      : "all",
    minLiquidity: threshold(input.minLiquidity),
    minMarketCap: threshold(input.minMarketCap),
    minVolume: threshold(input.minVolume),
    sorts: sorts.length ? sorts : defaultMonitorTablePreferences.sorts,
  };
}

export async function loadMonitorTablePreferences() {
  try {
    return sanitizeMonitorTablePreferences(
      JSON.parse((await AsyncStorage.getItem(MONITOR_TABLE_KEY)) ?? "{}"),
    );
  } catch {
    return defaultMonitorTablePreferences;
  }
}

export async function saveMonitorTablePreferences(
  value: MonitorTablePreferences,
) {
  await AsyncStorage.setItem(
    MONITOR_TABLE_KEY,
    JSON.stringify(sanitizeMonitorTablePreferences(value)),
  );
}

export function monitorTableActiveFilters(value: MonitorTablePreferences) {
  return [
    value.query.trim(),
    value.dex !== "all",
    value.direction !== "all",
    Number(value.minLiquidity) > 0,
    Number(value.minMarketCap) > 0,
    Number(value.minVolume) > 0,
  ].filter(Boolean).length;
}

function sortValue(token: MarketToken, key: MonitorSortKey) {
  return key === "marketCap" ? (token.marketCap ?? -1) : token[key];
}

export function filterAndSortMonitorTokens(
  tokens: MarketToken[],
  preferences: MonitorTablePreferences,
) {
  const query = preferences.query.trim().toLowerCase();
  const minLiquidity = Number(preferences.minLiquidity);
  const minMarketCap = Number(preferences.minMarketCap);
  const minVolume = Number(preferences.minVolume);
  return tokens
    .map((token, index) => ({ token, index }))
    .filter(({ token }) => {
      const identity = `${token.symbol} ${token.name} ${token.address}`.toLowerCase();
      return (
        (!query || identity.includes(query)) &&
        (preferences.dex === "all" ||
          token.dex.toLowerCase() === preferences.dex) &&
        (preferences.direction === "all" ||
          (preferences.direction === "positive"
            ? token.change1h >= 0
            : token.change1h < 0)) &&
        token.liquidity >= minLiquidity &&
        (minMarketCap <= 0 ||
          (token.marketCap != null && token.marketCap >= minMarketCap)) &&
        token.volume1h >= minVolume
      );
    })
    .sort((left, right) => {
      for (const sort of preferences.sorts) {
        const delta = sortValue(left.token, sort.key) - sortValue(right.token, sort.key);
        if (delta) return sort.direction === "asc" ? delta : -delta;
      }
      return left.index - right.index;
    })
    .map(({ token }) => token);
}

export function toggleMonitorSort(
  sorts: MonitorSort[],
  key: MonitorSortKey,
): MonitorSort[] {
  const existing = sorts.find((item) => item.key === key);
  if (!existing) {
    const next: MonitorSort[] = [{ key, direction: "desc" }, ...sorts];
    return next.slice(0, 2);
  }
  if (existing.direction === "desc")
    return sorts.map((item) =>
      item.key === key ? { ...item, direction: "asc" as const } : item,
    );
  const remaining = sorts.filter((item) => item.key !== key);
  return remaining.length ? remaining : defaultMonitorTablePreferences.sorts;
}
