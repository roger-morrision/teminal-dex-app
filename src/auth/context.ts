import { createContext, useContext } from 'react';

export type PrivyIdentityState = {
  configured: boolean;
  ready: boolean;
  authenticated: boolean;
  busy: boolean;
  userLabel: string | null;
  error: string | null;
  supportsEmailOtp: boolean;
  sendEmailCode(email: string): Promise<boolean>;
  verifyEmailCode(email: string, code: string): Promise<boolean>;
  loginWithGoogle(): Promise<boolean>;
  openLogin(): void;
  logout(): Promise<void>;
};

export const PrivyIdentityContext = createContext<PrivyIdentityState | null>(null);

export function usePrivyIdentity() {
  const value = useContext(PrivyIdentityContext);
  if (!value) throw new Error('usePrivyIdentity must be inside TerminalPrivyProvider');
  return value;
}

export function cleanEmail(value: string) {
  return value.trim().toLowerCase();
}

export function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail(value));
}

export function publicAuthError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  if (message.includes('cancel') || message.includes('closed')) return 'Login was cancelled.';
  if (message.includes('code') || message.includes('otp')) return 'The verification code is invalid or expired.';
  if (message.includes('network') || message.includes('fetch')) return 'Privy could not be reached. Check your connection and retry.';
  return 'Authentication could not be completed. Please retry.';
}
