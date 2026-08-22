import AsyncStorage from '@react-native-async-storage/async-storage';
import { isSolanaAddress, parseBoundedJson, redactSensitive } from '@/security/input';
import { clearLocalAppData, LOCAL_DATA_KEYS } from '@/settings/privacy';

jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { multiRemove: jest.fn() } }));

describe('untrusted mobile input boundaries', () => {
  it('accepts only base58 values that decode to exactly 32 bytes', () => {
    expect(isSolanaAddress('11111111111111111111111111111111')).toBe(true);
    expect(isSolanaAddress('1111111111111111111111111111111')).toBe(false);
    expect(isSolanaAddress('0OIl1111111111111111111111111111')).toBe(false);
    expect(isSolanaAddress('111111111111111111111111111111111')).toBe(false);
  });

  it('bounds embedded route JSON before parsing', () => {
    expect(parseBoundedJson('{"address":"safe"}', 100)).toEqual({ address: 'safe' });
    expect(parseBoundedJson('{broken', 100)).toBeNull();
    expect(parseBoundedJson(JSON.stringify({ payload: 'x'.repeat(100) }), 20)).toBeNull();
    expect(parseBoundedJson(JSON.stringify({ payload: '💹'.repeat(10) }), 30)).toBeNull();
    expect(parseBoundedJson({ address: 'not-a-string' })).toBeNull();
  });

  it('redacts address-like and credential values and caps diagnostics', () => {
    const address = '11111111111111111111111111111111';
    const output = redactSensitive(`wallet=${address} Authorization: Bearer abcdefghijklmnopqrstuvwxyz ${'x'.repeat(3000)}`);
    expect(output).not.toContain(address);
    expect(output).not.toContain('abcdefghijklmnopqrstuvwxyz');
    expect(output).toContain('[REDACTED_BASE58]');
    expect(output.length).toBeLessThanOrEqual(2000);
  });
});

describe('privacy reset', () => {
  it('removes every known local preference key in one operation', async () => {
    const remove = jest.spyOn(AsyncStorage, 'multiRemove').mockResolvedValue(undefined);
    await clearLocalAppData();
    expect(remove).toHaveBeenCalledWith([...LOCAL_DATA_KEYS]);
  });
});
