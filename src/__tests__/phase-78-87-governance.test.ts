import { emptyOperationalExpansionEvidence, evaluateOperationalExpansion } from "@/security/phase-78-87-governance";

describe("phases 78-87 governance", () => {
  it("fails closed and propagates operational dependencies", () => {
    const result = evaluateOperationalExpansion({ ...emptyOperationalExpansionEvidence(), authoritativeEvidenceApi: true });
    expect(result.phases[0]).toMatchObject({ phase: 78, status: "complete" });
    expect(result.phases[5]).toMatchObject({ phase: 83, externalEvidenceRequired: true });
    expect(result.phases[9]?.missing).toContain("phase_86");
    expect(result.highestContiguousCompletePhase).toBe(78);
  });

  it("never converts complete evidence into client authority", () => {
    const complete = Object.fromEntries(Object.keys(emptyOperationalExpansionEvidence()).map((key) => [key, true])) as ReturnType<typeof emptyOperationalExpansionEvidence>;
    const result = evaluateOperationalExpansion(complete);
    expect(result.highestContiguousCompletePhase).toBe(87);
    expect(result.executionEnabled).toBe(false);
    expect(result.copyTradeExecutionEnabled).toBe(false);
  });
});
