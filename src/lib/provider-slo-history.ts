import { evaluateProviderSlo, type ProviderSloSample } from "@/lib/provider-slo";

export type TimestampedProviderSloSample = ProviderSloSample & { observedAt: number };

export function evaluateProviderSloHistory(samples: TimestampedProviderSloSample[], staleAfterMs: number) {
  const ordered = samples.every((sample, index) => index === 0 || samples[index - 1]!.observedAt < sample.observedAt);
  const unique = new Set(samples.map((sample) => sample.observedAt)).size === samples.length;
  const bounded = samples.length >= 3 && samples.length <= 288;
  const evaluations = samples.map((sample) => evaluateProviderSlo(sample, staleAfterMs));
  const healthyWindows = evaluations.filter((item) => item.healthy).length;
  const healthyRatio = evaluations.length ? healthyWindows / evaluations.length : 0;
  const reasons = [
    ...(!bounded ? ["insufficient_or_oversized_history"] : []),
    ...(!ordered ? ["history_not_strictly_ordered"] : []),
    ...(!unique ? ["duplicate_observation_time"] : []),
    ...(healthyRatio < 0.99 ? ["historical_slo_below_target"] : []),
  ];
  return {
    schemaVersion: "provider-slo-history-v1",
    operational: reasons.length === 0,
    sampleCount: samples.length,
    healthyWindows,
    healthyRatio,
    reasons,
  };
}
