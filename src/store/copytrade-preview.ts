import AsyncStorage from "@react-native-async-storage/async-storage";
import { boundedCopyNumber } from "@/lib/copytrade-config";

export const COPYTRADE_PREVIEW_KEY = "terminal-dex:copytrade-preview:v1";

export type CopyTradePreviewPreferences = {
  priorityFeeSol: string;
  minHolderCount: string;
  antiMev: boolean;
  trailingStopPct: string;
  exitLadder: [
    { triggerPct: string; sellPct: string },
    { triggerPct: string; sellPct: string },
  ];
};

export const defaultCopyTradePreviewPreferences: CopyTradePreviewPreferences = {
  priorityFeeSol: "0.001",
  minHolderCount: "100",
  antiMev: true,
  trailingStopPct: "10",
  exitLadder: [
    { triggerPct: "25", sellPct: "50" },
    { triggerPct: "50", sellPct: "50" },
  ],
};

const numberText = (value: unknown, fallback: string) => {
  if (typeof value !== "string") return fallback;
  const bounded = boundedCopyNumber(value);
  return bounded && bounded === value ? bounded : fallback;
};

export function sanitizeCopyTradePreviewPreferences(
  value: unknown,
): CopyTradePreviewPreferences {
  const input =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Partial<CopyTradePreviewPreferences>)
      : {};
  const ladder = Array.isArray(input.exitLadder) ? input.exitLadder : [];
  const level = (index: 0 | 1) => {
    const item = ladder[index];
    const fallback = defaultCopyTradePreviewPreferences.exitLadder[index];
    return {
      triggerPct: numberText(item?.triggerPct, fallback.triggerPct),
      sellPct: numberText(item?.sellPct, fallback.sellPct),
    };
  };
  return {
    priorityFeeSol: numberText(
      input.priorityFeeSol,
      defaultCopyTradePreviewPreferences.priorityFeeSol,
    ),
    minHolderCount: numberText(
      input.minHolderCount,
      defaultCopyTradePreviewPreferences.minHolderCount,
    ),
    antiMev:
      typeof input.antiMev === "boolean"
        ? input.antiMev
        : defaultCopyTradePreviewPreferences.antiMev,
    trailingStopPct: numberText(
      input.trailingStopPct,
      defaultCopyTradePreviewPreferences.trailingStopPct,
    ),
    exitLadder: [level(0), level(1)],
  };
}

export type CopyTradePreviewError =
  | "priorityFee"
  | "holders"
  | "trailingStop"
  | "ladderOrder"
  | "ladderAllocation";

export function validateCopyTradePreviewPreferences(
  value: CopyTradePreviewPreferences,
) {
  const priorityFeeSol = Number(value.priorityFeeSol);
  const minHolderCount = Number(value.minHolderCount);
  const trailingStopPct = Number(value.trailingStopPct);
  const ladder = value.exitLadder.map((item) => ({
    triggerPct: Number(item.triggerPct),
    sellPct: Number(item.sellPct),
  }));
  const errors: CopyTradePreviewError[] = [];
  if (!(priorityFeeSol >= 0 && priorityFeeSol <= 0.01))
    errors.push("priorityFee");
  if (!(Number.isInteger(minHolderCount) && minHolderCount >= 0))
    errors.push("holders");
  if (!(trailingStopPct > 0 && trailingStopPct < 100))
    errors.push("trailingStop");
  if (
    !ladder.every(
      (item) => item.triggerPct > 0 && item.sellPct > 0 && item.sellPct <= 100,
    ) ||
    !(ladder[1]!.triggerPct > ladder[0]!.triggerPct)
  )
    errors.push("ladderOrder");
  if (ladder.reduce((sum, item) => sum + item.sellPct, 0) > 100)
    errors.push("ladderAllocation");
  return {
    valid: errors.length === 0,
    errors,
    preview: {
      priorityFeeSol,
      minHolderCount,
      antiMev: value.antiMev,
      trailingStopPct,
      exitLadder: [ladder[0]!, ladder[1]!] as [
        { triggerPct: number; sellPct: number },
        { triggerPct: number; sellPct: number },
      ],
    },
  };
}

export async function loadCopyTradePreviewPreferences() {
  try {
    return sanitizeCopyTradePreviewPreferences(
      JSON.parse((await AsyncStorage.getItem(COPYTRADE_PREVIEW_KEY)) ?? "{}"),
    );
  } catch {
    return defaultCopyTradePreviewPreferences;
  }
}

export async function saveCopyTradePreviewPreferences(
  value: CopyTradePreviewPreferences,
) {
  await AsyncStorage.setItem(
    COPYTRADE_PREVIEW_KEY,
    JSON.stringify(sanitizeCopyTradePreviewPreferences(value)),
  );
}
