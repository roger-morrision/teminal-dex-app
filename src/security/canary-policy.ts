export type CanaryLimits = { allowedWallets: string[]; allowedMints: string[]; maxTradeUsd: number; maxDailyUsd: number; maxFeeLamports: number; maxLossUsd: number; expiresAt: number; killSwitchEngaged: boolean };
export type CanaryAttempt = { wallet: string; inputMint: string; outputMint: string; tradeUsd: number; dailyUsdBefore: number; feeLamports: number; realizedLossUsd: number; now: number };

export function evaluateCanaryAttempt(limits: CanaryLimits, attempt: CanaryAttempt) {
  const reasons = [
    ...(limits.killSwitchEngaged ? ["kill_switch_engaged"] : []),
    ...(!limits.allowedWallets.includes(attempt.wallet) ? ["wallet_not_allowed"] : []),
    ...(!limits.allowedMints.includes(attempt.inputMint) || !limits.allowedMints.includes(attempt.outputMint) ? ["mint_not_allowed"] : []),
    ...(!Number.isFinite(attempt.tradeUsd) || attempt.tradeUsd <= 0 || attempt.tradeUsd > limits.maxTradeUsd ? ["trade_limit_exceeded"] : []),
    ...(!Number.isFinite(attempt.dailyUsdBefore) || attempt.dailyUsdBefore < 0 || attempt.dailyUsdBefore + attempt.tradeUsd > limits.maxDailyUsd ? ["daily_limit_exceeded"] : []),
    ...(!Number.isSafeInteger(attempt.feeLamports) || attempt.feeLamports < 0 || attempt.feeLamports > limits.maxFeeLamports ? ["fee_limit_exceeded"] : []),
    ...(!Number.isFinite(attempt.realizedLossUsd) || attempt.realizedLossUsd < 0 || attempt.realizedLossUsd >= limits.maxLossUsd ? ["loss_limit_reached"] : []),
    ...(!Number.isSafeInteger(limits.expiresAt) || limits.expiresAt <= attempt.now ? ["canary_approval_expired"] : []),
  ];
  return { schemaVersion: "mainnet-canary-policy-v1", allowed: reasons.length === 0, reasons, executionEnabled: false as const };
}
