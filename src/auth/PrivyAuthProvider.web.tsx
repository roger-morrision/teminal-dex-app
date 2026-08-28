import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import Constants from 'expo-constants';
import { useMemo, type ReactNode } from 'react';
import { PrivyIdentityContext, publicAuthError, type PrivyIdentityState } from './context';

const appId = String(Constants.expoConfig?.extra?.privyAppId ?? '').trim();
const clientId = String(Constants.expoConfig?.extra?.privyClientId ?? '').trim();
const configured = appId.length === 25;

function Identity({ children }: { children: ReactNode }) {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const value = useMemo<PrivyIdentityState>(() => ({ configured: true, ready, authenticated, busy: !ready, userLabel: user?.email?.address ?? user?.id ?? null, error: null, supportsEmailOtp: false, sendEmailCode: async () => false, verifyEmailCode: async () => false, loginWithGoogle: async () => { login(); return true; }, openLogin: login, logout }), [authenticated, login, logout, ready, user]);
  return <PrivyIdentityContext.Provider value={value}>{children}</PrivyIdentityContext.Provider>;
}

function Unconfigured({ children }: { children: ReactNode }) {
  const value = useMemo<PrivyIdentityState>(() => ({ configured: false, ready: true, authenticated: false, busy: false, userLabel: null, error: publicAuthError(null), supportsEmailOtp: false, sendEmailCode: async () => false, verifyEmailCode: async () => false, loginWithGoogle: async () => false, openLogin: () => undefined, logout: async () => undefined }), []);
  return <PrivyIdentityContext.Provider value={value}>{children}</PrivyIdentityContext.Provider>;
}

export function TerminalPrivyProvider({ children }: { children: ReactNode }) {
  if (!configured) return <Unconfigured>{children}</Unconfigured>;
  return <PrivyProvider appId={appId} clientId={clientId || undefined} config={{ loginMethods: ['email', 'google', 'wallet'], appearance: { theme: 'dark', accentColor: '#4cf5ae', showWalletLoginFirst: false }, embeddedWallets: { ethereum: { createOnLogin: 'off' }, solana: { createOnLogin: 'off' } } }}><Identity>{children}</Identity></PrivyProvider>;
}

export { usePrivyIdentity } from './context';
