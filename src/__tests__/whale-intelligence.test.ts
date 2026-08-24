import { calculateWhalePortfolioExposure, corroborateWhaleEvent, evaluateWhaleFlowQuality, evaluateWhaleOperations, summarizeWhaleOutcomes } from "@/lib/whale-intelligence";

describe("whale intelligence foundations", () => {
  it("separates missing amounts from known zero values", () => {
    expect(evaluateWhaleFlowQuality([{ amountUsd: 100, direction: "buy", wallet: "a" }, { amountUsd: null, direction: "sell", wallet: null }, { amountUsd: 0, direction: "sell", wallet: "b" }])).toMatchObject({ eventCount: 3, knownAmountCount: 2, missingAmountCount: 1, amountCoverage: 2 / 3, knownNetUsd: 100, uniqueKnownWallets: 2 });
  });

  it("distinguishes confirmed, partial, conflicting, and unavailable providers", () => {
    const row = { provider: "a", direction: "buy" as const, tokenAddress: "t", wallet: "w", amountUsd: 100 };
    expect(corroborateWhaleEvent([]).status).toBe("unavailable");
    expect(corroborateWhaleEvent([row]).status).toBe("partial");
    expect(corroborateWhaleEvent([row, { ...row, provider: "b" }]).status).toBe("confirmed");
    expect(corroborateWhaleEvent([row, { ...row, provider: "b", direction: "sell" }]).status).toBe("conflicting");
  });

  it("reports outcomes and portfolio intersections without prediction or advice", () => {
    expect(summarizeWhaleOutcomes([{ observedAt: 1, netUsd: 10, subsequentReturnPct: 5 }, { observedAt: 2, netUsd: -2, subsequentReturnPct: null }])).toMatchObject({ observations: 2, resolved: 1, coverage: 0.5, averageSubsequentReturnPct: 5, predictiveClaim: false, executionEnabled: false });
    expect(calculateWhalePortfolioExposure([{ tokenAddress: "a", valueUsd: 25 }, { tokenAddress: "b", valueUsd: 75 }], new Set(["a"]))).toMatchObject({ totalUsd: 100, exposedUsd: 25, exposureRatio: 0.25, advice: false, executionEnabled: false });
  });

  it("requires bounded ordered healthy operational windows", () => {
    const sample = (observedAt: number) => ({ observedAt, received: 100, persisted: 100, ageMs: 10, classificationDrift: 0, gapDetected: false });
    expect(evaluateWhaleOperations([sample(1), sample(2), sample(3)], 100).operational).toBe(true);
    expect(evaluateWhaleOperations([sample(2), sample(1), { ...sample(3), gapDetected: true }], 100).reasons).toEqual(expect.arrayContaining(["unordered_history", "unhealthy_whale_window"]));
  });
});
