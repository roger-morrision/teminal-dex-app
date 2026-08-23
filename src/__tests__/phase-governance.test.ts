import { emptyProductionEvidence, evaluateProductionPhases } from "@/security/phase-governance";

describe("ten-phase production governance", () => {
  it("fails closed and propagates dependency blockers", () => {
    const result = evaluateProductionPhases({ ...emptyProductionEvidence(), automatedRegression: true, providerReadinessFresh: true });
    expect(result.phases[0]).toEqual({ phase: 1, status: "complete", missing: [] });
    expect(result.phases[1]?.missing).toContain("android_wallet_device");
    expect(result.phases[4]?.missing).toContain("phase_4");
    expect(result.phases[8]?.missing).toContain("phase_8");
    expect(result.highestCompletePhase).toBe(1);
    expect(result.executionEnabled).toBe(false);
  });

  it("never grants mobile execution authority even with complete evidence", () => {
    const complete = Object.fromEntries(Object.keys(emptyProductionEvidence()).map((key) => [key, true])) as ReturnType<typeof emptyProductionEvidence>;
    const result = evaluateProductionPhases(complete);
    expect(result.phases.every((phase) => phase.status === "complete")).toBe(true);
    expect(result.highestCompletePhase).toBe(10);
    expect(result.executionEnabled).toBe(false);
    expect(result.copyTradeExecutionEnabled).toBe(false);
  });
});
