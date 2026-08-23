import { copyTradeShadowEvidenceSchema } from "@/api/schema";

const record = {
  id: "shadow_123",
  strategyId: "strategy-1",
  strategyVersion: "v1",
  tokenAddress: "11111111111111111111111111111111",
  decidedAt: 1,
  intendedAction: "paper_buy",
  passedChecks: ["liquidity", "impact"],
  blockers: [],
  providerFamilies: ["rpc", "dex"],
  quote: { inputAmount: "100", expectedOutput: "200", minimumOutput: "190", priceImpactPct: 0.1, feeLamports: 5000, observedAt: 1 },
  outcome: { status: "open", returnPct: null, observedAt: null },
} as const;

describe("CopyTrade shadow evidence", () => {
  it("accepts bounded paper evidence and rejects execution authority", () => {
    const payload = { schema: "copytrade-shadow-evidence-v1", generatedAt: 1, executionEnabled: false, records: [record] };
    expect(copyTradeShadowEvidenceSchema.safeParse(payload).success).toBe(true);
    expect(copyTradeShadowEvidenceSchema.safeParse({ ...payload, executionEnabled: true }).success).toBe(false);
  });

  it("requires quote evidence for paper trades and blockers for rejected decisions", () => {
    const base = { schema: "copytrade-shadow-evidence-v1", generatedAt: 1, executionEnabled: false };
    expect(copyTradeShadowEvidenceSchema.safeParse({ ...base, records: [{ ...record, quote: null }] }).success).toBe(false);
    expect(copyTradeShadowEvidenceSchema.safeParse({ ...base, records: [{ ...record, intendedAction: "reject", quote: null, blockers: [] }] }).success).toBe(false);
    expect(copyTradeShadowEvidenceSchema.safeParse({ ...base, records: [record, record] }).success).toBe(false);
  });
});
