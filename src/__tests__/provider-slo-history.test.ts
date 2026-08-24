import { evaluateProviderSloHistory, type TimestampedProviderSloSample } from "@/lib/provider-slo-history";

const sample = (observedAt: number): TimestampedProviderSloSample => ({ configured: true, connected: true, received: 100, decoded: 100, persisted: 100, dropped: 0, ignored: 0, ageMs: 100, cooldownMs: 0, observedAt });

describe("provider SLO history", () => {
  it("requires a bounded, ordered, unique historical window", () => {
    expect(evaluateProviderSloHistory([sample(1), sample(2), sample(3)], 1_000).operational).toBe(true);
    expect(evaluateProviderSloHistory([sample(2), sample(1), sample(3)], 1_000).reasons).toContain("history_not_strictly_ordered");
    expect(evaluateProviderSloHistory([sample(1), sample(1), sample(2)], 1_000).reasons).toContain("duplicate_observation_time");
    expect(evaluateProviderSloHistory([sample(1)], 1_000).reasons).toContain("insufficient_or_oversized_history");
  });

  it("fails when any three-sample window misses a 99 percent target", () => {
    const unhealthy = { ...sample(2), connected: false };
    const result = evaluateProviderSloHistory([sample(1), unhealthy, sample(3)], 1_000);
    expect(result.operational).toBe(false);
    expect(result.healthyRatio).toBeCloseTo(2 / 3);
    expect(result.reasons).toContain("historical_slo_below_target");
  });
});
