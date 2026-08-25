export type PublicEvidenceReason =
  | "provider_timeout"
  | "rate_limited"
  | "configuration_missing"
  | "storage_unavailable"
  | "simulation_rejected"
  | "delivery_failed"
  | "unknown";

export function classifyPublicEvidenceReason(value: unknown): PublicEvidenceReason {
  if (typeof value !== "string") return "unknown";
  const normalized = value.toLowerCase();
  if (/timeout|timed out|deadline/.test(normalized)) return "provider_timeout";
  if (/rate.?limit|too many requests|\b429\b/.test(normalized)) return "rate_limited";
  if (/config|not configured|missing (?:key|url|provider)/.test(normalized)) return "configuration_missing";
  if (/storage|database|persist|disk/.test(normalized)) return "storage_unavailable";
  if (/simulat|revert|instruction error/.test(normalized)) return "simulation_rejected";
  if (/deliver|channel|notification/.test(normalized)) return "delivery_failed";
  return "unknown";
}

export function publicReasonKey(value: unknown) {
  return `publicReason_${classifyPublicEvidenceReason(value)}` as const;
}
