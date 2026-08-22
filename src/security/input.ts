const SOLANA_ADDRESS = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function decodedBase58Length(value: string): number {
  const bytes = [0];
  for (const character of value) {
    let carry = BASE58.indexOf(character);
    for (let index = 0; index < bytes.length; index += 1) { carry += (bytes[index] ?? 0) * 58; bytes[index] = carry & 0xff; carry >>= 8; }
    while (carry > 0) { bytes.push(carry & 0xff); carry >>= 8; }
  }
  for (let index = 0; value[index] === '1' && index < value.length - 1; index += 1) bytes.push(0);
  return bytes.length;
}

export function isSolanaAddress(value: unknown): value is string { return typeof value === 'string' && SOLANA_ADDRESS.test(value) && decodedBase58Length(value) === 32; }
function utf8Bytes(value: string): number { let bytes = 0; for (let index = 0; index < value.length; index += 1) { const code = value.charCodeAt(index); if (code < 0x80) bytes += 1; else if (code < 0x800) bytes += 2; else if (code >= 0xd800 && code <= 0xdbff && value.charCodeAt(index + 1) >= 0xdc00 && value.charCodeAt(index + 1) <= 0xdfff) { bytes += 4; index += 1; } else bytes += 3; } return bytes; }
export function parseBoundedJson(value: unknown, maxBytes = 12_000): unknown { if (typeof value !== 'string' || utf8Bytes(value) > maxBytes) return null; try { return JSON.parse(value); } catch { return null; } }
export function redactSensitive(value: string): string { return value.replace(/[1-9A-HJ-NP-Za-km-z]{32,88}/g, '[REDACTED_BASE58]').replace(/(?:Bearer\s+|signature["'=:\s]+)[A-Za-z0-9+/_=-]{8,}/gi, '[REDACTED_CREDENTIAL]').slice(0, 2_000); }
