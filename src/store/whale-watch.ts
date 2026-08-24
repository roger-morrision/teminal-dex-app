import AsyncStorage from "@react-native-async-storage/async-storage";
import type { WhaleEventDirection, WhaleEventSort } from "@/lib/whale-activity";

export const WHALE_WATCH_PREFERENCES_KEY = "terminal-dex:whale-watch:v1";
export type WhaleWatchMode =
  | "live"
  | "accumulating"
  | "distributing"
  | "wallets"
  | "alerts";
export type WhaleWatchPreferences = {
  mode: WhaleWatchMode;
  direction: WhaleEventDirection;
  minimumUsd: 0 | 25_000 | 100_000;
  sort: WhaleEventSort;
};

export const defaultWhaleWatchPreferences: WhaleWatchPreferences = {
  mode: "live",
  direction: "all",
  minimumUsd: 0,
  sort: "latest",
};

export function parseWhaleWatchPreferences(value: unknown): WhaleWatchPreferences {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return defaultWhaleWatchPreferences;
  }
  const input = value as Record<string, unknown>;
  const mode = ["live", "accumulating", "distributing", "wallets", "alerts"].includes(String(input.mode))
    ? (input.mode as WhaleWatchMode)
    : "live";
  const direction = ["all", "buy", "sell"].includes(String(input.direction))
    ? (input.direction as WhaleEventDirection)
    : "all";
  const minimumUsd = input.minimumUsd === 25_000 || input.minimumUsd === 100_000
    ? input.minimumUsd
    : 0;
  const sort = input.sort === "largest" ? "largest" : "latest";
  return { mode, direction, minimumUsd, sort };
}

export async function loadWhaleWatchPreferences(): Promise<WhaleWatchPreferences> {
  try {
    return parseWhaleWatchPreferences(
      JSON.parse((await AsyncStorage.getItem(WHALE_WATCH_PREFERENCES_KEY)) ?? "{}"),
    );
  } catch {
    return defaultWhaleWatchPreferences;
  }
}

export async function saveWhaleWatchPreferences(value: WhaleWatchPreferences): Promise<void> {
  await AsyncStorage.setItem(
    WHALE_WATCH_PREFERENCES_KEY,
    JSON.stringify(parseWhaleWatchPreferences(value)),
  );
}
