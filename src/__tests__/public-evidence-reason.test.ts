import { classifyPublicEvidenceReason, publicReasonKey } from "@/lib/public-evidence-reason";

describe("public evidence reason policy", () => {
  it.each([
    ["provider request timed out", "provider_timeout"],
    ["HTTP 429 rate_limit", "rate_limited"],
    ["provider not configured", "configuration_missing"],
    ["database persist failed", "storage_unavailable"],
    ["simulation instruction error", "simulation_rejected"],
    ["notification delivery failed", "delivery_failed"],
    ["http://127.0.0.1 secret=abc", "unknown"],
  ] as const)("classifies without returning raw text", (input, expected) => {
    expect(classifyPublicEvidenceReason(input)).toBe(expected);
    expect(publicReasonKey(input)).toBe(`publicReason_${expected}`);
    expect(publicReasonKey(input)).not.toContain(input);
  });

  it("fails closed for non-string payloads", () => {
    expect(classifyPublicEvidenceReason({ secret: true })).toBe("unknown");
  });
});
