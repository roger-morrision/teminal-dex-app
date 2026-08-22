import type { CreateCopyTradeInput } from "@/api/client";

export type CopySizingMode = "fixed_sol" | "percentage" | "proportional";
export type CopyTradeDraft = {
  sizingMode: CopySizingMode;
  fixedAmountSol: string;
  percentage: string;
  proportionalRatio: string;
  maxPositionSizeSol: string;
  maxDailyVolumeSol: string;
  maxDailyLossSol: string;
  stopLossPct: string;
  takeProfitPct: string;
  maxSlippageBps: string;
  maxPriceImpactPct: string;
  minLiquidityUsd: string;
  maxMarketCapUsd: string;
  maxTokenAgeMinutes: string;
  delayMs: string;
  maxConcurrentPositions: string;
  onlyNewLaunches: boolean;
  copyBuys: boolean;
  copySells: boolean;
};

export const defaultCopyTradeDraft: CopyTradeDraft = {
  sizingMode: "fixed_sol",
  fixedAmountSol: "0.05",
  percentage: "5",
  proportionalRatio: "0.1",
  maxPositionSizeSol: "0.1",
  maxDailyVolumeSol: "0.5",
  maxDailyLossSol: "0.1",
  stopLossPct: "20",
  takeProfitPct: "50",
  maxSlippageBps: "100",
  maxPriceImpactPct: "3",
  minLiquidityUsd: "10000",
  maxMarketCapUsd: "1000000",
  maxTokenAgeMinutes: "60",
  delayMs: "1000",
  maxConcurrentPositions: "2",
  onlyNewLaunches: false,
  copyBuys: true,
  copySells: true,
};

export type CopyTradeConfigError =
  | "sizing"
  | "positionCap"
  | "dailyLimits"
  | "exitLimits"
  | "quoteLimits"
  | "marketFilters"
  | "timing"
  | "direction";

export type CopyTradeSafetyControls = {
  priorityFeeSol: number;
  minHolderCount: number;
  antiMev: boolean;
  trailingStopPct: number;
  exitLadder: [
    { triggerPct: number; sellPct: number },
    { triggerPct: number; sellPct: number },
  ];
};

export const defaultCopyTradeSafetyControls: CopyTradeSafetyControls = {
  priorityFeeSol: 0.001,
  minHolderCount: 100,
  antiMev: true,
  trailingStopPct: 10,
  exitLadder: [
    { triggerPct: 25, sellPct: 50 },
    { triggerPct: 50, sellPct: 50 },
  ],
};

export function boundedCopyNumber(value: string) {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const [whole = "", ...fractions] = cleaned.split(".");
  return `${whole.slice(0, 12)}${fractions.length ? `.${fractions.join("").slice(0, 6)}` : ""}`;
}

export function buildPausedCopyTradeInput(
  draft: CopyTradeDraft,
  trader: { address: string; label: string },
  safety: CopyTradeSafetyControls = defaultCopyTradeSafetyControls,
): { input: CreateCopyTradeInput | null; errors: CopyTradeConfigError[] } {
  const number = (key: keyof CopyTradeDraft) => Number(draft[key]);
  const fixedAmountSol = number("fixedAmountSol");
  const percentage = number("percentage");
  const proportionalRatio = number("proportionalRatio");
  const maxPositionSizeSol = number("maxPositionSizeSol");
  const maxDailyVolumeSol = number("maxDailyVolumeSol");
  const maxDailyLossSol = number("maxDailyLossSol");
  const stopLossPct = number("stopLossPct");
  const takeProfitPct = number("takeProfitPct");
  const maxSlippageBps = number("maxSlippageBps");
  const maxPriceImpactPct = number("maxPriceImpactPct");
  const minLiquidityUsd = number("minLiquidityUsd");
  const maxMarketCapUsd = number("maxMarketCapUsd");
  const maxTokenAgeMinutes = number("maxTokenAgeMinutes");
  const delayMs = number("delayMs");
  const maxConcurrentPositions = number("maxConcurrentPositions");
  const errors: CopyTradeConfigError[] = [];
  const sizingValid =
    draft.sizingMode === "fixed_sol"
      ? fixedAmountSol > 0 && fixedAmountSol <= maxPositionSizeSol
      : draft.sizingMode === "percentage"
        ? percentage > 0 && percentage <= 100
        : proportionalRatio > 0 && proportionalRatio <= 10;
  if (!sizingValid) errors.push("sizing");
  if (!(maxPositionSizeSol > 0)) errors.push("positionCap");
  if (!(maxDailyVolumeSol >= maxPositionSizeSol && maxDailyLossSol >= 0))
    errors.push("dailyLimits");
  if (!(stopLossPct > 0 && stopLossPct < 100 && takeProfitPct > 0))
    errors.push("exitLimits");
  if (!(
    Number.isInteger(maxSlippageBps) &&
    maxSlippageBps >= 1 &&
    maxSlippageBps <= 500 &&
    maxPriceImpactPct > 0 &&
    maxPriceImpactPct <= 5
  ))
    errors.push("quoteLimits");
  if (!(minLiquidityUsd >= 0 && maxMarketCapUsd > 0 && maxTokenAgeMinutes >= 0))
    errors.push("marketFilters");
  if (!(
    Number.isInteger(delayMs) &&
    delayMs >= 0 &&
    Number.isInteger(maxConcurrentPositions) &&
    maxConcurrentPositions >= 1 &&
    maxConcurrentPositions <= 20
  ))
    errors.push("timing");
  if (!draft.copyBuys && !draft.copySells) errors.push("direction");
  if (errors.length) return { input: null, errors };
  return {
    errors,
    input: {
      sourceWallet: trader.address,
      sourceWalletLabel: trader.label,
      isActive: false,
      sizingMode: draft.sizingMode,
      fixedAmountSol,
      percentage,
      proportionalRatio,
      maxPositionSizeSol,
      maxDailyVolumeSol,
      maxDailyLossSol,
      stopLossPct,
      takeProfitPct,
      maxSlippageBps,
      maxPriceImpactPct,
      priorityFeeLamports: Math.round(safety.priorityFeeSol * 1_000_000_000),
      antiMev: safety.antiMev,
      minHolderCount: safety.minHolderCount,
      trailingStopPct: safety.trailingStopPct,
      exitLadder: safety.exitLadder,
      minLiquidityUsd,
      maxMarketCapUsd,
      excludedTokens: [],
      onlyNewLaunches: draft.onlyNewLaunches,
      maxTokenAgeMinutes,
      copySells: draft.copySells,
      copyBuys: draft.copyBuys,
      delayMs,
      maxConcurrentPositions,
    },
  };
}
