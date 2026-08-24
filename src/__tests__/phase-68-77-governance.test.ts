import { emptyExpansionEvidence, evaluateExpansionPhases } from "@/security/phase-68-77-governance";

describe("phases 68-77 governance", () => {
  it("propagates prerequisites and marks external gates", () => {
    const result = evaluateExpansionPhases({ ...emptyExpansionEvidence(), durableEvidenceApi: true });
    expect(result.phases[0]).toMatchObject({ phase: 68, status: "complete" });
    expect(result.phases[1]?.missing).toContain("provider_history_operational");
    expect(result.phases[5]).toMatchObject({ phase: 73, externalEvidenceRequired: true });
    expect(result.phases[9]?.missing).toContain("phase_76");
    expect(result.highestContiguousCompletePhase).toBe(68);
    expect(result.executionEnabled).toBe(false);
  });

  it("never grants execution authority even when every evidence flag is true", () => {
    const complete = Object.fromEntries(Object.keys(emptyExpansionEvidence()).map((key) => [key, true])) as ReturnType<typeof emptyExpansionEvidence>;
    const result = evaluateExpansionPhases(complete);
    expect(result.phases.every((item) => item.status === "complete")).toBe(true);
    expect(result.highestContiguousCompletePhase).toBe(77);
    expect(result.executionEnabled).toBe(false);
    expect(result.copyTradeExecutionEnabled).toBe(false);
  });
});
