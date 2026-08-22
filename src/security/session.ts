import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

export type VerifiedWalletSession = { wallet: string; verifiedAt: number; expiresAt: number };
const KEY = 'terminal-dex:verified-wallet-session:v1';
let webSession: VerifiedWalletSession | null = null;

export async function persistVerifiedSession(wallet: string): Promise<VerifiedWalletSession> {
  const session = { wallet, verifiedAt: Date.now(), expiresAt: Date.now() + 24 * 60 * 60_000 };
  if (Platform.OS === 'web') webSession = session;
  else await SecureStore.setItemAsync(KEY, JSON.stringify(session), { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
  return session;
}

export async function restoreVerifiedSession(): Promise<VerifiedWalletSession | null> {
  let raw: string | null = null;
  if (Platform.OS === 'web') return webSession && webSession.expiresAt > Date.now() ? webSession : null;
  try { raw = await SecureStore.getItemAsync(KEY); } catch { return null; }
  if (!raw) return null;
  try { const session = JSON.parse(raw) as VerifiedWalletSession; if (!session.wallet || session.expiresAt <= Date.now()) { await clearVerifiedSession(); return null; } return session; } catch { await clearVerifiedSession(); return null; }
}

export async function clearVerifiedSession() { webSession = null; if (Platform.OS !== 'web') await SecureStore.deleteItemAsync(KEY); }

export async function requireBiometricUnlock(): Promise<boolean> {
  if (Platform.OS === 'web') return true;
  const [hardware, enrolled] = await Promise.all([LocalAuthentication.hasHardwareAsync(), LocalAuthentication.isEnrolledAsync()]);
  if (!hardware || !enrolled) return false;
  const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Unlock Terminal DEX', cancelLabel: 'Cancel', disableDeviceFallback: false });
  return result.success;
}
