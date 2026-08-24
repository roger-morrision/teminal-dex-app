import { bytesToBase64 } from "@/security/base64";

describe("bytesToBase64", () => {
  it.each([
    [[], ""],
    [[102], "Zg=="],
    [[102, 111], "Zm8="],
    [[102, 111, 111], "Zm9v"],
    [[0, 255, 16, 128], "AP8QgA=="],
  ])("encodes %j without Node polyfills", (input, expected) => {
    expect(bytesToBase64(Uint8Array.from(input))).toBe(expected);
  });
});
