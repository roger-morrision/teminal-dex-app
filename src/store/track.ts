import AsyncStorage from "@react-native-async-storage/async-storage";

export const TRACK_FILTER_KEY = "terminal-dex:track-filter:v1";
export const TRACK_FILTERS = ["all", "wallet", "kol", "social"] as const;
export type TrackFilter = (typeof TRACK_FILTERS)[number];

export async function loadTrackFilter(): Promise<TrackFilter> {
  try {
    const value = await AsyncStorage.getItem(TRACK_FILTER_KEY);
    return TRACK_FILTERS.includes(value as TrackFilter)
      ? (value as TrackFilter)
      : "all";
  } catch {
    return "all";
  }
}

export async function saveTrackFilter(value: TrackFilter): Promise<void> {
  if (!TRACK_FILTERS.includes(value))
    throw new Error("Unsupported Track filter.");
  await AsyncStorage.setItem(TRACK_FILTER_KEY, value);
}
