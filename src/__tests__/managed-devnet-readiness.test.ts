import { emptyManagedDevnetEvidence, evaluateManagedDevnetReadiness } from "@/security/managed-devnet-readiness";

describe("managed devnet readiness", () => {
  it("names every absent approval and proof", () => {
    const result = evaluateManagedDevnetReadiness(emptyManagedDevnetEvidence());
    expect(result.readyForExternalDevnetRun).toBe(false);
    expect(result.missing).toEqual(expect.arrayContaining(["custodyApproved", "androidWalletCertified", "reconciliationVerified", "killSwitchVerified"]));
  });

  it("never enables mobile, mainnet, or CopyTrade execution", () => {
    const complete = Object.fromEntries(Object.keys(emptyManagedDevnetEvidence()).map((key) => [key, true])) as ReturnType<typeof emptyManagedDevnetEvidence>;
    expect(evaluateManagedDevnetReadiness(complete)).toMatchObject({ readyForExternalDevnetRun: true, mobileSubmissionEnabled: false, mainnetEnabled: false, copyTradeExecutionEnabled: false });
  });
});
