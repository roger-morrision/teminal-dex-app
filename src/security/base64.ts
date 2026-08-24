const alphabet =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

export function bytesToBase64(bytes: Uint8Array): string {
  let encoded = "";

  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index] ?? 0;
    const second = bytes[index + 1];
    const third = bytes[index + 2];
    const packed = first * 65_536 + (second ?? 0) * 256 + (third ?? 0);

    encoded += alphabet[(packed >>> 18) & 63];
    encoded += alphabet[(packed >>> 12) & 63];
    encoded += second === undefined ? "=" : alphabet[(packed >>> 6) & 63];
    encoded += third === undefined ? "=" : alphabet[packed & 63];
  }

  return encoded;
}
