import { walletClassificationHistorySchema, whaleAlertEvidenceSchema, whaleHistorySchema } from "@/api/whale-contracts";

const token = "11111111111111111111111111111111";
const wallet = "So11111111111111111111111111111111111111112";
const hash = "a".repeat(64);
const event = (id: string, observedAt: number) => ({ id, tokenAddress: token, wallet, direction: "buy", amountUsd: 10, observedAt, source: "indexer", sourceIdentity: `signature:${id}`, dataQuality: "observed" });

describe("whale operational contracts", () => {
  it("requires unique descending history and an exact boundary cursor", () => {
    const events = [event("event_0002", 2), event("event_0001", 1)];
    const base = { schema: "whale-history-v1", ownerScoped: false, events, hasMore: true, nextCursor: { beforeObservedAt: 1, beforeId: "event_0001" }, retentionDays: 30, generatedAt: 3, executionEnabled: false };
    expect(whaleHistorySchema.safeParse(base).success).toBe(true);
    expect(whaleHistorySchema.safeParse({ ...base, events: [events[1], events[0]] }).success).toBe(false);
    expect(whaleHistorySchema.safeParse({ ...base, events: [events[0], events[0]] }).success).toBe(false);
    expect(whaleHistorySchema.safeParse({ ...base, executionEnabled: true }).success).toBe(false);
  });

  it("requires versioned classification chronology", () => {
    const row = { id: "class_0002", version: 2, label: "whale", confidence: 0.9, effectiveAt: 2, expiresAt: 5, evidenceHash: hash };
    const base = { schema: "wallet-classification-history-v1", wallet, generatedAt: 3, versions: [row, { ...row, id: "class_0001", version: 1, effectiveAt: 1 }], executionEnabled: false };
    expect(walletClassificationHistorySchema.safeParse(base).success).toBe(true);
    expect(walletClassificationHistorySchema.safeParse({ ...base, versions: [row, row] }).success).toBe(false);
  });

  it("keeps alert evidence evaluated-only and rejects duplicates", () => {
    const base = { schema: "whale-alert-evidence-v1", id: "alert_0001", ownerWallet: wallet, enabled: true, tokenAllowlist: [token], walletAllowlist: [wallet], directions: ["buy"], minimumUsd: 1_000, cooldownSeconds: 60, version: 1, configurationHash: hash, evaluatedOnly: true, executionEnabled: false };
    expect(whaleAlertEvidenceSchema.safeParse(base).success).toBe(true);
    expect(whaleAlertEvidenceSchema.safeParse({ ...base, tokenAllowlist: [token, token] }).success).toBe(false);
    expect(whaleAlertEvidenceSchema.safeParse({ ...base, executionEnabled: true }).success).toBe(false);
  });
});
