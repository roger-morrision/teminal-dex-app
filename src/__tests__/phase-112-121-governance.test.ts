import { emptyPhase112To121Evidence, evaluatePhases112To121 } from "@/security/phase-112-121-governance";

describe("phases 112-121 governance", () => {
  it("propagates operations dependencies", () => {
    const result = evaluatePhases112To121({ ...emptyPhase112To121Evidence(), releaseProvenance: true });
    expect(result.phases[0]).toMatchObject({ phase: 112, status: "complete" });
    expect(result.phases[4]?.missing).toEqual(expect.arrayContaining(["phase_113", "phase_114", "backupRestore"]));
    expect(result.phases[9]?.missing).toEqual(expect.arrayContaining(["phase_113", "phase_120", "finalProductionAcceptance"]));
    expect(result.highestContiguousCompletePhase).toBe(112);
  });

  it("never self-approves production", () => {
    const complete = Object.fromEntries(Object.keys(emptyPhase112To121Evidence()).map((key) => [key, true])) as ReturnType<typeof emptyPhase112To121Evidence>;
    const result = evaluatePhases112To121(complete);
    expect(result.highestContiguousCompletePhase).toBe(121);
    expect(result.productionAccepted).toBe(false);
    expect(result.executionEnabled).toBe(false);
  });
});
