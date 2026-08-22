import AsyncStorage from '@react-native-async-storage/async-storage';
import { SETTINGS_STORAGE_KEY } from './SettingsProvider';

export const LOCAL_DATA_KEYS = [SETTINGS_STORAGE_KEY, 'terminal-dex:watchlist:v1', 'terminal-dex:discovery-filters:v1', 'terminal-dex:watch-only-wallet:v1'] as const;
export async function clearLocalAppData() { await AsyncStorage.multiRemove([...LOCAL_DATA_KEYS]); }
