import {
  boundedCopyNumber,
  buildPausedCopyTradeInput,
  defaultCopyTradeDraft,
  type CopyTradeDraft,
} from "@/lib/copytrade-config";

const trader = {
  address: "11111111111111111111111111111111",
  label: "Smart #1",
};
const build = (value: Partial<CopyTradeDraft> = {}) =>
  buildPausedCopyTradeInput({ ...defaultCopyTradeDraft, ...value }, trader);

describe("CopyTrade paused configuration", () => {
  it("builds the complete supported backend payload and always remains paused", () => {
    const result = build({ onlyNewLaunches: true, copySells: false });
    expect(result.errors).toEqual([]);
    expect(result.input).toMatchObject({
      sourceWallet: trader.address,
      isActive: false,
      sizingMode: "fixed_sol",
      fixedAmountSol: 0.05,
      maxPositionSizeSol: 0.1,
      stopLossPct: 20,
      takeProfitPct: 50,
      minLiquidityUsd: 10_000,
      maxMarketCapUsd: 1_000_000,
      maxTokenAgeMinutes: 60,
      onlyNewLaunches: true,
      copyBuys: true,
      copySells: false,
      priorityFeeLamports: 1_000_000,
      antiMev: true,
      minHolderCount: 100,
      trailingStopPct: 10,
    });
  });
  it("validates percentage and proportional sizing independently", () => {
    expect(
      build({ sizingMode: "percentage", percentage: "25" }).input?.percentage,
    ).toBe(25);
    expect(
      build({ sizingMode: "percentage", percentage: "101" }).errors,
    ).toContain("sizing");
    expect(
      build({ sizingMode: "proportional", proportionalRatio: "0.25" }).input
        ?.proportionalRatio,
    ).toBe(0.25);
    expect(
      build({ sizingMode: "proportional", proportionalRatio: "0" }).errors,
    ).toContain("sizing");
  });
  it("fails closed across quote, exit, timing, daily, and direction gates", () => {
    const result = build({
      maxDailyVolumeSol: "0.01",
      stopLossPct: "100",
      maxSlippageBps: "501",
      delayMs: "1.5",
      copyBuys: false,
      copySells: false,
    });
    expect(result.input).toBeNull();
    expect(result.errors).toEqual(
      expect.arrayContaining([
        "dailyLimits",
        "exitLimits",
        "quoteLimits",
        "timing",
        "direction",
      ]),
    );
  });
  it("bounds numeric input length and decimal precision", () => {
    expect(boundedCopyNumber("12x.3456789.0")).toBe("12.345678");
    expect(boundedCopyNumber("123456789012345")).toBe("123456789012");
  });
});
