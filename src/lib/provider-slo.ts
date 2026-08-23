export type ProviderSloSample = {
  configured: boolean;
  connected: boolean;
  received: number;
  decoded: number;
  persisted: number;
  dropped: number;
  ignored: number;
  ageMs: number | null;
  cooldownMs: number;
};

const ratio = (value: number, denominator: number) => denominator > 0 ? value / denominator : null;

export function evaluateProviderSlo(sample: ProviderSloSample, staleAfterMs: number) {
  const validCounts = [sample.received, sample.decoded, sample.persisted, sample.dropped, sample.ignored, sample.cooldownMs, staleAfterMs]
    .every((value) => Number.isSafeInteger(value) && value >= 0);
  const decodeCoverage = validCounts ? ratio(sample.decoded, sample.received) : null;
  const persistenceCoverage = validCounts ? ratio(sample.persisted, sample.decoded) : null;
  const pressureRate = validCounts ? ratio(sample.dropped + sample.ignored, sample.received) : null;
  const fresh = sample.ageMs != null && Number.isFinite(sample.ageMs) && sample.ageMs >= 0 && sample.ageMs <= staleAfterMs;
  const usefulTraffic = sample.received > 0 && sample.decoded > 0 && sample.persisted > 0;
  const reasons = [
    ...(!validCounts ? ["invalid_counters"] : []),
    ...(!sample.configured ? ["not_configured"] : []),
    ...(!sample.connected ? ["not_connected"] : []),
    ...(!usefulTraffic ? ["no_useful_traffic"] : []),
    ...(!fresh ? ["stale_or_missing_observation"] : []),
    ...(sample.cooldownMs > 0 ? ["provider_cooldown"] : []),
    ...(decodeCoverage != null && decodeCoverage < 0.95 ? ["low_decode_coverage"] : []),
    ...(persistenceCoverage != null && persistenceCoverage < 0.99 ? ["low_persistence_coverage"] : []),
    ...(pressureRate != null && pressureRate > 0.01 ? ["excessive_drop_pressure"] : []),
  ];
  return {
    schemaVersion: "provider-slo-evaluation-v1",
    healthy: reasons.length === 0,
    usefulTraffic,
    fresh,
    decodeCoverage,
    persistenceCoverage,
    pressureRate,
    reasons,
  };
}
