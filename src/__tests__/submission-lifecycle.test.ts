import { requiresManualReconciliation, submissionLifecyclePolicy, transitionSubmission } from "@/security/submission-lifecycle";

describe("managed submission lifecycle", () => {
  it("requires consume-before-submit and finality", () => {
    expect(transitionSubmission("prepared", "consume")).toBe("consumed");
    expect(transitionSubmission("consumed", "submit_ack")).toBe("submitted");
    expect(transitionSubmission("submitted", "confirm")).toBe("confirmed");
    expect(transitionSubmission("confirmed", "finalize")).toBe("finalized");
    expect(() => transitionSubmission("prepared", "submit_ack")).toThrow("Invalid submission transition");
  });

  it("sends unknown outcomes to reconciliation and forbids blind retry", () => {
    const unknown = transitionSubmission("consumed", "submit_unknown");
    expect(requiresManualReconciliation(unknown)).toBe(true);
    expect(transitionSubmission(unknown, "reconcile")).toBe("reconciling");
    expect(submissionLifecyclePolicy.blindRetryAllowed).toBe(false);
    expect(submissionLifecyclePolicy.mobileSubmissionEnabled).toBe(false);
  });
});
