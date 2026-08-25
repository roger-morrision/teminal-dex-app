import { useMobileWallet } from '@wallet-ui/react-native-kit';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState, Platform } from 'react-native';
import { getApiOrigin } from '@/api/client';
import { clearVerifiedSession, persistVerifiedSession, requireBiometricUnlock, restoreVerifiedSession, type VerifiedWalletSession } from './session';
import { secureWalletCache } from './wallet-cache';
import { clearAppCookies } from './cookie-revocation';
import { bytesToBase64 } from './base64';

type WalletSessionState = { session: VerifiedWalletSession | null; accountAddress: string | null; locked: boolean; busy: boolean; error: string | null; connectAndVerify: () => Promise<void>; unlock: () => Promise<void>; disconnect: () => Promise<void> };
const Context = createContext<WalletSessionState | null>(null);

export function WalletSessionProvider({ children }: { children: ReactNode }) {
  const wallet = useMobileWallet(); const [session, setSession] = useState<VerifiedWalletSession | null>(null); const [locked, setLocked] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null);
  useEffect(() => { void restoreVerifiedSession().then((value) => { setSession(value); setLocked(Boolean(value)); }); }, []);
  useEffect(() => { let backgroundedAt = 0; const subscription = AppState.addEventListener('change', (state) => { if (state === 'background') backgroundedAt = Date.now(); if (state === 'active' && session && Date.now() - backgroundedAt > 60_000) setLocked(true); }); return () => subscription.remove(); }, [session]);

  const unlock = useCallback(async () => { setBusy(true); setError(null); try { const valid = await restoreVerifiedSession(); if (!valid) { setSession(null); setLocked(false); setError('Wallet session expired. Verify ownership again.'); return; } if (!await requireBiometricUnlock()) { setError('Biometric or device authentication is required.'); return; } setSession(valid); setLocked(false); } finally { setBusy(false); } }, []);
  const connectAndVerify = useCallback(async () => {
    if (Platform.OS !== 'android') { setError('Native wallet ownership verification currently requires an Android development build. Watch-only portfolio access remains available.'); return; }
    setBusy(true); setError(null);
    try {
      const account = wallet.account ?? await wallet.connect(); const walletAddress = String(account.address);
      const challengeResponse = await fetch(`${getApiOrigin()}/api/copytrade/identity/challenge`, { credentials: 'include', headers: { Accept: 'application/json' } });
      if (!challengeResponse.ok) throw new Error(`Ownership challenge failed (${challengeResponse.status}).`);
      const challenge = await challengeResponse.json() as { nonce?: string; message?: string };
      if (!challenge.nonce || !challenge.message) throw new Error('Backend returned an invalid ownership challenge.');
      const signed = await wallet.signMessages(new TextEncoder().encode(challenge.message));
      const verifyResponse = await fetch(`${getApiOrigin()}/api/copytrade/identity/verify`, { method: 'POST', credentials: 'include', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ wallet: walletAddress, signature: bytesToBase64(signed) }) });
      if (!verifyResponse.ok) throw new Error(`Wallet ownership verification failed (${verifyResponse.status}).`);
      const result = await verifyResponse.json() as { success?: boolean; wallet?: string };
      if (!result.success || result.wallet !== walletAddress) throw new Error('Backend did not confirm the connected wallet.');
      const verified = await persistVerifiedSession(walletAddress); setSession(verified); setLocked(false);
    } catch { setError('Wallet verification failed.'); } finally { setBusy(false); }
  }, [wallet]);
  const disconnect = useCallback(async () => { setBusy(true); try { await clearVerifiedSession(); await secureWalletCache.clear(); await clearAppCookies().catch(() => undefined); await wallet.disconnect().catch(() => undefined); setSession(null); setLocked(false); setError(null); } finally { setBusy(false); } }, [wallet]);
  const value = useMemo(() => ({ session, accountAddress: wallet.account ? String(wallet.account.address) : null, locked, busy, error, connectAndVerify, unlock, disconnect }), [session, wallet.account, locked, busy, error, connectAndVerify, unlock, disconnect]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useWalletSession() { const value = useContext(Context); if (!value) throw new Error('useWalletSession must be inside WalletSessionProvider'); return value; }
