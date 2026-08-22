import AsyncStorage from "@react-native-async-storage/async-storage";
import { SETTINGS_STORAGE_KEY } from "./SettingsProvider";
import { TRACKED_WALLETS_KEY } from "@/store/tracked-wallets";
import { RESEARCH_STORAGE_KEY } from "@/store/research";
import { TRACK_FILTER_KEY } from "@/store/track";
import { MONITOR_TABLE_KEY } from "@/store/monitor-table";
import {
  WATCHLIST_SNAPSHOTS_KEY,
  WATCHLIST_WINDOW_KEY,
} from "@/store/discovery";

export const LOCAL_DATA_KEYS = [
  SETTINGS_STORAGE_KEY,
  "terminal-dex:watchlist:v1",
  WATCHLIST_SNAPSHOTS_KEY,
  WATCHLIST_WINDOW_KEY,
  "terminal-dex:discovery-filters:v1",
  "terminal-dex:watch-only-wallet:v1",
  TRACKED_WALLETS_KEY,
  RESEARCH_STORAGE_KEY,
  TRACK_FILTER_KEY,
  MONITOR_TABLE_KEY,
] as const;
export async function clearLocalAppData() {
  await AsyncStorage.multiRemove([...LOCAL_DATA_KEYS]);
}
