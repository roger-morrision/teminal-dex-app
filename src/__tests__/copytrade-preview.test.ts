import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  COPYTRADE_PREVIEW_KEY,
  defaultCopyTradePreviewPreferences,
  loadCopyTradePreviewPreferences,
  sanitizeCopyTradePreviewPreferences,
  saveCopyTradePreviewPreferences,
  validateCopyTradePreviewPreferences,
} from "@/store/copytrade-preview";

describe("device-local CopyTrade preview controls", () => {
  beforeEach(() => AsyncStorage.clear());

  it("sanitizes bounded fields and restores the fixed two-level ladder", () => {
    expect(
      sanitizeCopyTradePreviewPreferences({
        priorityFeeSol: "0.001",
        minHolderCount: "100x",
        antiMev: false,
        trailingStopPct: "10",
        exitLadder: [
          { triggerPct: "20", sellPct: "40" },
          { triggerPct: "40", sellPct: "60" },
          { triggerPct: "60", sellPct: "100" },
        ],
      }),
    ).toEqual({
      priorityFeeSol: "0.001",
      minHolderCount: "100",
      antiMev: false,
      trailingStopPct: "10",
      exitLadder: [
        { triggerPct: "20", sellPct: "40" },
        { triggerPct: "40", sellPct: "60" },
      ],
    });
  });

  it("round-trips preferences and recovers corrupted local storage", async () => {
    const value = { ...defaultCopyTradePreviewPreferences, antiMev: false };
    await saveCopyTradePreviewPreferences(value);
    expect(await loadCopyTradePreviewPreferences()).toEqual(value);
    await AsyncStorage.setItem(COPYTRADE_PREVIEW_KEY, "bad-json");
    expect(await loadCopyTradePreviewPreferences()).toEqual(
      defaultCopyTradePreviewPreferences,
    );
  });

  it("validates fee, holder, trailing, ordered ladder, and allocation gates", () => {
    expect(
      validateCopyTradePreviewPreferences({
        priorityFeeSol: "0.02",
        minHolderCount: "1.5",
        antiMev: false,
        trailingStopPct: "100",
        exitLadder: [
          { triggerPct: "50", sellPct: "60" },
          { triggerPct: "25", sellPct: "60" },
        ],
      }),
    ).toMatchObject({
      valid: false,
      errors: [
        "priorityFee",
        "holders",
        "trailingStop",
        "ladderOrder",
        "ladderAllocation",
      ],
    });
    expect(
      validateCopyTradePreviewPreferences(defaultCopyTradePreviewPreferences),
    ).toMatchObject({ valid: true, errors: [] });
  });
});
