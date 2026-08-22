import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { WalletAuthorizationCache, WalletAuthorization } from '@wallet-ui/react-native-kit';

const KEY = 'terminal-dex:mwa-authorization:v1';
let webValue: WalletAuthorization | undefined;

export const secureWalletCache: WalletAuthorizationCache = {
  async clear() { if (Platform.OS === 'web') webValue = undefined; else await SecureStore.deleteItemAsync(KEY); },
  async get() {
    if (Platform.OS === 'web') return webValue;
    try { const raw = await SecureStore.getItemAsync(KEY); return raw ? JSON.parse(raw) as WalletAuthorization : undefined; } catch { return undefined; }
  },
  async set(value) {
    if (Platform.OS === 'web') { webValue = value; return; }
    await SecureStore.setItemAsync(KEY, JSON.stringify(value), { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
  },
};
