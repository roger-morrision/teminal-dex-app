import { summarizeShadowOutcomes } from "@/lib/shadow-analytics";

describe("CopyTrade shadow analytics", () => {
  it("computes cohort coverage, return, win rate, and output drift", () => {
    const result = summarizeShadowOutcomes([
      { id: "a", strategyId: "s", strategyVersion: "1", action: "paper_buy", returnPct: 10, expectedOutput: 100, observedOutput: 90 },
      { id: "b", strategyId: "s", strategyVersion: "1", action: "paper_sell", returnPct: -5, expectedOutput: 100, observedOutput: 100 },
      { id: "c", strategyId: "s", strategyVersion: "1", action: "hold", returnPct: null, expectedOutput: null, observedOutput: null },
    ]);
    expect(result).toMatchObject({ total: 3, resolved: 2, coverage: 2 / 3, winRate: 0.5, averageReturnPct: 2.5, averageOutputDrift: 0.05, executionEnabled: false });
  });

  it("rejects duplicate evidence identities", () => {
    const row = { id: "a", strategyId: "s", strategyVersion: "1", action: "hold" as const, returnPct: null, expectedOutput: null, observedOutput: null };
    expect(() => summarizeShadowOutcomes([row, row])).toThrow("unique");
  });
});
