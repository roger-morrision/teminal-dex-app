import { evaluatePerformanceBudget, type PerformanceBudget, type PerformanceSample } from "@/lib/performance-budget";

const budget: PerformanceBudget = { maxColdStartMs: 3_000, maxInteractionReadyMs: 2_000, maxPeakMemoryMb: 300, maxDroppedFramePct: 2, maxBundleKb: 6_000 };
const sample = (route: string, deviceClass: PerformanceSample["deviceClass"]): PerformanceSample => ({ route, deviceClass, coldStartMs: 1_000, interactionReadyMs: 500, peakMemoryMb: 100, droppedFramePct: 0, bundleKb: 5_000 });

describe("mobile performance budgets", () => {
  it("requires representative low and mid device samples", () => {
    expect(evaluatePerformanceBudget([sample("/whales", "low"), sample("/discover", "mid"), sample("/token", "high")], budget).qualified).toBe(true);
    expect(evaluatePerformanceBudget([sample("/a", "high"), sample("/b", "high"), sample("/c", "high")], budget)).toMatchObject({ qualified: false, representativeSamples: false });
  });

  it("names every exceeded route budget", () => {
    const bad = { ...sample("/whales", "low"), coldStartMs: 4_000, peakMemoryMb: 400 };
    const result = evaluatePerformanceBudget([bad, sample("/discover", "mid"), sample("/token", "high")], budget);
    expect(result.violations).toEqual(expect.arrayContaining(["/whales:cold_start", "/whales:memory"]));
  });
});
