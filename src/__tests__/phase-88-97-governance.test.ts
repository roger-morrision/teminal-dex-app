import { emptyWhaleExpansionEvidence, evaluateWhaleExpansion } from "@/security/phase-88-97-governance";

describe("phases 88-97 governance", () => {
  it("propagates whale evidence dependencies and external gates", () => {
    const result = evaluateWhaleExpansion({ ...emptyWhaleExpansionEvidence(), evidenceIntegrityProven: true });
    expect(result.phases[0]).toMatchObject({ phase: 88, status: "complete" });
    expect(result.phases[4]).toMatchObject({ phase: 92, externalEvidenceRequired: true });
    expect(result.phases[9]?.missing).toEqual(expect.arrayContaining(["phase_92", "phase_95", "phase_96", "physical_device_release"]));
    expect(result.highestContiguousCompletePhase).toBe(88);
  });

  it("never grants execution authority", () => {
    const complete = Object.fromEntries(Object.keys(emptyWhaleExpansionEvidence()).map((key) => [key, true])) as ReturnType<typeof emptyWhaleExpansionEvidence>;
    const result = evaluateWhaleExpansion(complete);
    expect(result.highestContiguousCompletePhase).toBe(97);
    expect(result.executionEnabled).toBe(false);
  });
});
