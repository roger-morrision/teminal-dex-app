import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { clearVerifiedSession, persistVerifiedSession, requireBiometricUnlock, restoreVerifiedSession } from '@/security/session';

jest.mock('expo-secure-store', () => ({ WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'when-unlocked', setItemAsync: jest.fn(), getItemAsync: jest.fn(), deleteItemAsync: jest.fn() }));
jest.mock('expo-local-authentication', () => ({ hasHardwareAsync: jest.fn(), isEnrolledAsync: jest.fn(), authenticateAsync: jest.fn() }));

describe('verified wallet session security', () => {
  beforeEach(() => jest.clearAllMocks());
  it('persists only bounded wallet identity metadata in secure storage', async () => { await persistVerifiedSession('wallet'); const stored = JSON.parse(jest.mocked(SecureStore.setItemAsync).mock.calls[0]?.[1] ?? '{}'); expect(stored.wallet).toBe('wallet'); expect(stored.expiresAt - stored.verifiedAt).toBe(86_400_000); expect(stored).not.toHaveProperty('signature'); });
  it('clears expired sessions instead of restoring them', async () => { jest.mocked(SecureStore.getItemAsync).mockResolvedValue(JSON.stringify({ wallet: 'wallet', verifiedAt: 1, expiresAt: 2 })); await expect(restoreVerifiedSession()).resolves.toBeNull(); expect(SecureStore.deleteItemAsync).toHaveBeenCalled(); });
  it('requires enrolled biometric authentication', async () => { jest.mocked(LocalAuthentication.hasHardwareAsync).mockResolvedValue(true); jest.mocked(LocalAuthentication.isEnrolledAsync).mockResolvedValue(true); jest.mocked(LocalAuthentication.authenticateAsync).mockResolvedValue({ success: true } as never); await expect(requireBiometricUnlock()).resolves.toBe(true); });
  afterAll(async () => { await clearVerifiedSession(); });
});
