import { evaluateProviderSlo } from "@/lib/provider-slo";

describe("provider SLO evaluation", () => {
  it("requires useful fresh persisted traffic, not nominal configuration", () => {
    const nominal = evaluateProviderSlo({ configured: true, connected: true, received: 0, decoded: 0, persisted: 0, dropped: 0, ignored: 0, ageMs: null, cooldownMs: 0 }, 60_000);
    expect(nominal.healthy).toBe(false);
    expect(nominal.reasons).toEqual(expect.arrayContaining(["no_useful_traffic", "stale_or_missing_observation"]));
  });

  it("qualifies fresh high-coverage traffic and rejects pressure", () => {
    expect(evaluateProviderSlo({ configured: true, connected: true, received: 100, decoded: 100, persisted: 100, dropped: 0, ignored: 0, ageMs: 1_000, cooldownMs: 0 }, 60_000).healthy).toBe(true);
    const pressured = evaluateProviderSlo({ configured: true, connected: true, received: 100, decoded: 98, persisted: 95, dropped: 3, ignored: 1, ageMs: 1_000, cooldownMs: 10_000 }, 60_000);
    expect(pressured.reasons).toEqual(expect.arrayContaining(["provider_cooldown", "low_persistence_coverage", "excessive_drop_pressure"]));
  });
});
