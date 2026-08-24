import { expansionEvidenceSchema } from "@/api/expansion-evidence";

const record = { id: "evidence:phase68:1", phase: 68, kind: "automated", observedAt: 100, persistedAt: 101, expiresAt: null, subject: "regression", artifactHash: "a".repeat(64), verified: true, verifier: "ci" };
const envelope = { schema: "terminal-dex-expansion-evidence-v1", generatedAt: 102, ownerWallet: "11111111111111111111111111111111", records: [record], executionEnabled: false, copyTradeExecutionEnabled: false };

describe("expansion evidence envelope", () => {
  it("accepts bounded durable evidence and rejects forged authority", () => {
    expect(expansionEvidenceSchema.safeParse(envelope).success).toBe(true);
    expect(expansionEvidenceSchema.safeParse({ ...envelope, executionEnabled: true }).success).toBe(false);
  });

  it("rejects duplicate IDs and impossible chronology", () => {
    expect(expansionEvidenceSchema.safeParse({ ...envelope, records: [record, record] }).success).toBe(false);
    expect(expansionEvidenceSchema.safeParse({ ...envelope, records: [{ ...record, persistedAt: 99 }] }).success).toBe(false);
  });
});
