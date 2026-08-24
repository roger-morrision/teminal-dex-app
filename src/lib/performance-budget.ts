export type PerformanceSample = { route: string; coldStartMs: number; interactionReadyMs: number; peakMemoryMb: number; droppedFramePct: number; bundleKb: number; deviceClass: "low" | "mid" | "high" };
export type PerformanceBudget = { maxColdStartMs: number; maxInteractionReadyMs: number; maxPeakMemoryMb: number; maxDroppedFramePct: number; maxBundleKb: number };

export function evaluatePerformanceBudget(samples: PerformanceSample[], budget: PerformanceBudget) {
  const valid = samples.length >= 3 && samples.length <= 100 && samples.some((sample) => sample.deviceClass === "low") && samples.some((sample) => sample.deviceClass === "mid");
  const violations = samples.flatMap((sample) => [
    ...(sample.coldStartMs > budget.maxColdStartMs ? [`${sample.route}:cold_start`] : []),
    ...(sample.interactionReadyMs > budget.maxInteractionReadyMs ? [`${sample.route}:interaction_ready`] : []),
    ...(sample.peakMemoryMb > budget.maxPeakMemoryMb ? [`${sample.route}:memory`] : []),
    ...(sample.droppedFramePct > budget.maxDroppedFramePct ? [`${sample.route}:frames`] : []),
    ...(sample.bundleKb > budget.maxBundleKb ? [`${sample.route}:bundle`] : []),
  ]);
  return { schemaVersion: "mobile-performance-budget-v1", qualified: valid && violations.length === 0, representativeSamples: valid, violations };
}
