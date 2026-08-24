import { emptyPhase98To109Evidence, evaluatePhases98To109 } from "@/security/phase-98-109-governance";

describe("phases 98-109 governance", () => {
  it("propagates backend and device blockers", () => {
    const result = evaluatePhases98To109(emptyPhase98To109Evidence());
    expect(result.phases[0]).toMatchObject({ phase: 98, status: "blocked", externalEvidenceRequired: true });
    expect(result.phases[1]?.missing).toContain("phase_98");
    expect(result.phases[11]?.missing).toEqual(expect.arrayContaining(["phase_100", "phase_107", "phase_108", "managed_devnet_submission"]));
    expect(result.highestContiguousCompletePhase).toBe(97);
  });

  it("never grants mobile submission authority", () => {
    const complete = Object.fromEntries(Object.keys(emptyPhase98To109Evidence()).map((key) => [key, true])) as ReturnType<typeof emptyPhase98To109Evidence>;
    const result = evaluatePhases98To109(complete);
    expect(result.highestContiguousCompletePhase).toBe(109);
    expect(result.executionEnabled).toBe(false);
    expect(result.mobileSubmissionEnabled).toBe(false);
  });
});
