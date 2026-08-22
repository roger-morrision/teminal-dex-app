import AsyncStorage from '@react-native-async-storage/async-storage';
import { SETTINGS_STORAGE_KEY } from './SettingsProvider';
import { TRACKED_WALLETS_KEY } from '@/store/tracked-wallets';
import { RESEARCH_STORAGE_KEY } from '@/store/research';

export const LOCAL_DATA_KEYS = [SETTINGS_STORAGE_KEY, 'terminal-dex:watchlist:v1', 'terminal-dex:discovery-filters:v1', 'terminal-dex:watch-only-wallet:v1', TRACKED_WALLETS_KEY, RESEARCH_STORAGE_KEY] as const;
export async function clearLocalAppData() { await AsyncStorage.multiRemove([...LOCAL_DATA_KEYS]); }
