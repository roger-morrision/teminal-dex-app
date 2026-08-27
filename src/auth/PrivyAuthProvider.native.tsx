import '@ethersproject/shims';
import 'fast-text-encoding';
import { PrivyProvider, useLoginWithEmail, useLoginWithOAuth, usePrivy } from '@privy-io/expo';
import Constants from 'expo-constants';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { cleanEmail, PrivyIdentityContext, publicAuthError, type PrivyIdentityState } from './context';

const appId = String(Constants.expoConfig?.extra?.privyAppId ?? '').trim();
const clientId = String(Constants.expoConfig?.extra?.privyClientId ?? '').trim();

function Unconfigured({ children }: { children: ReactNode }) {
  const value = useMemo<PrivyIdentityState>(() => ({ configured: false, ready: true, authenticated: false, busy: false, userLabel: null, error: null, supportsEmailOtp: true, sendEmailCode: async () => false, verifyEmailCode: async () => false, loginWithGoogle: async () => false, openLogin: () => undefined, logout: async () => undefined }), []);
  return <PrivyIdentityContext.Provider value={value}>{children}</PrivyIdentityContext.Provider>;
}

function NativeIdentity({ children }: { children: ReactNode }) {
  const { user, isReady, error: initializationError, logout } = usePrivy();
  const emailLogin = useLoginWithEmail();
  const oauth = useLoginWithOAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const attempt = useCallback(async (operation: () => Promise<unknown>) => { setBusy(true); setError(null); try { await operation(); return true; } catch (cause) { setError(publicAuthError(cause)); return false; } finally { setBusy(false); } }, []);
  const value = useMemo<PrivyIdentityState>(() => ({
    configured: true,
    ready: isReady,
    authenticated: Boolean(user),
    busy,
    userLabel: user?.id ?? null,
    error: initializationError ? publicAuthError(initializationError) : error,
    supportsEmailOtp: true,
    sendEmailCode: (email) => attempt(() => emailLogin.sendCode({ email: cleanEmail(email) })),
    verifyEmailCode: (email, code) => attempt(() => emailLogin.loginWithCode({ email: cleanEmail(email), code: code.trim() })),
    loginWithGoogle: () => attempt(() => oauth.login({ provider: 'google' })),
    openLogin: () => undefined,
    logout: async () => { await attempt(logout); },
  }), [attempt, busy, emailLogin, error, initializationError, isReady, logout, oauth, user]);
  return <PrivyIdentityContext.Provider value={value}>{children}</PrivyIdentityContext.Provider>;
}

export function TerminalPrivyProvider({ children }: { children: ReactNode }) {
  if (!appId || !clientId) return <Unconfigured>{children}</Unconfigured>;
  return <PrivyProvider appId={appId} clientId={clientId}><NativeIdentity>{children}</NativeIdentity></PrivyProvider>;
}

export { usePrivyIdentity } from './context';
