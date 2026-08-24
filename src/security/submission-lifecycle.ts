export type SubmissionState = "prepared" | "consumed" | "submitted" | "unknown" | "confirmed" | "finalized" | "failed" | "reconciling";
export type SubmissionEvent = "consume" | "submit_ack" | "submit_unknown" | "confirm" | "finalize" | "fail" | "reconcile" | "resolve_confirmed" | "resolve_failed";

const transitions: Record<SubmissionState, Partial<Record<SubmissionEvent, SubmissionState>>> = {
  prepared: { consume: "consumed", fail: "failed" },
  consumed: { submit_ack: "submitted", submit_unknown: "unknown", fail: "failed" },
  submitted: { confirm: "confirmed", submit_unknown: "unknown", fail: "reconciling" },
  unknown: { reconcile: "reconciling" },
  confirmed: { finalize: "finalized", fail: "reconciling" },
  finalized: {}, failed: {},
  reconciling: { resolve_confirmed: "confirmed", resolve_failed: "failed" },
};

export function transitionSubmission(state: SubmissionState, event: SubmissionEvent) {
  const next = transitions[state][event];
  if (!next) throw new Error(`Invalid submission transition: ${state} -> ${event}`);
  return next;
}

export const requiresManualReconciliation = (state: SubmissionState) => state === "unknown" || state === "reconciling";
export const submissionLifecyclePolicy = Object.freeze({
  schemaVersion: "managed-submission-lifecycle-v1",
  blindRetryAllowed: false as const,
  mobileSubmissionEnabled: false as const,
  terminalStates: ["finalized", "failed"] as const,
});
