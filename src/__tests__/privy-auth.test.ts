import { cleanEmail, publicAuthError, validEmail } from '@/auth/context';

describe('Privy authentication boundary', () => {
  it('normalizes valid email identities without accepting malformed input', () => {
    expect(cleanEmail('  User@Example.COM ')).toBe('user@example.com');
    expect(validEmail('  User@Example.COM ')).toBe(true);
    expect(validEmail('missing-domain@')).toBe(false);
    expect(validEmail('two words@example.com')).toBe(false);
  });

  it('returns bounded user-safe errors without exposing provider payloads', () => {
    expect(publicAuthError(new Error('OTP token secret=abc expired'))).toBe('The verification code is invalid or expired.');
    expect(publicAuthError(new Error('fetch failed for internal host'))).toBe('Privy could not be reached. Check your connection and retry.');
    expect(publicAuthError({ providerResponse: 'sensitive' })).toBe('Authentication could not be completed. Please retry.');
  });
});
