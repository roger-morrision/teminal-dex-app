import { evaluateCanaryAttempt, type CanaryAttempt, type CanaryLimits } from "@/security/canary-policy";

const wallet = "11111111111111111111111111111111";
const mint = "So11111111111111111111111111111111111111112";
const limits: CanaryLimits = { allowedWallets: [wallet], allowedMints: [wallet, mint], maxTradeUsd: 10, maxDailyUsd: 50, maxFeeLamports: 10_000, maxLossUsd: 5, expiresAt: 2_000, killSwitchEngaged: false };
const attempt: CanaryAttempt = { wallet, inputMint: wallet, outputMint: mint, tradeUsd: 5, dailyUsdBefore: 10, feeLamports: 1_000, realizedLossUsd: 0, now: 1_000 };

describe("mainnet canary policy", () => {
  it("qualifies an in-policy attempt without granting execution", () => {
    expect(evaluateCanaryAttempt(limits, attempt)).toEqual({ schemaVersion: "mainnet-canary-policy-v1", allowed: true, reasons: [], executionEnabled: false });
  });

  it("fails closed on kill, limits, and expiry", () => {
    const result = evaluateCanaryAttempt({ ...limits, killSwitchEngaged: true, expiresAt: 999 }, { ...attempt, tradeUsd: 100, feeLamports: 20_000 });
    expect(result.reasons).toEqual(expect.arrayContaining(["kill_switch_engaged", "trade_limit_exceeded", "daily_limit_exceeded", "fee_limit_exceeded", "canary_approval_expired"]));
  });
});
