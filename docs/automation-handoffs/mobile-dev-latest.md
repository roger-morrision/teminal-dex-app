# MOBILE DEV → QA handoff

- Story: `MOBILE-147` — private, mutually exclusive Monitor/CopyTrade mutations
- Base: `98de6e2`
- Result: containing commit; QA must pin immutable `HEAD`
- Scope: MOBILE workspace only. WEB was read-only. Concurrent Whale/TokenRow/TokenAvatar/DexLogo work and three MOBILE→WEB drafts were preserved and excluded.

## Changed behavior and files

- `app/(tabs)/monitor.tsx`: redacted toggle/delete failures, sibling-error reset, cross-action mutual exclusion, consistent disabled/busy semantics.
- `app/copytrade.tsx`: redacted pause/delete failures, sibling-error reset, cross-action mutual exclusion, guarded delete confirmation, consistent disabled/busy semantics.
- `src/__tests__/primary-a11y.test.ts`: source contract for privacy and concurrency invariants.
- MOBILE checklist/worklog/audit: evidence and carry-forward.

## Acceptance checklist — 20/20

1. Monitor toggle errors are classified before display.
2. Monitor delete errors are classified before display.
3. Monitor uses localized generic fallback for unknown failures.
4. Monitor retains allowlisted safe public reasons.
5. Monitor toggle is disabled while delete is pending.
6. Monitor delete is disabled while toggle is pending.
7. Monitor toggle reports busy for either pending mutation.
8. Monitor delete reports busy for either pending mutation.
9. Starting toggle clears stale delete failure.
10. Starting delete clears stale toggle failure.
11. CopyTrade pause errors are classified before display.
12. CopyTrade delete errors are classified before display.
13. CopyTrade uses localized generic fallback for unknown failures.
14. CopyTrade retains allowlisted safe public reasons.
15. CopyTrade pause is disabled while delete is pending.
16. CopyTrade delete is disabled while pause is pending.
17. CopyTrade pause reports busy for either pending mutation.
18. CopyTrade delete reports busy for either pending mutation.
19. Starting either CopyTrade action clears the sibling failure.
20. Destructive confirmation cannot open while another strategy mutation is pending.

Each item maps to an independently assertable behavior on a distinct action/state boundary.

## Verification

- `typescript/bin/tsc --noEmit`
- `eslint/bin/eslint.js app src`
- `jest/bin/jest.js --ci --runInBand src/__tests__/primary-a11y.test.ts`
- `jest/bin/jest.js --ci --runInBand`
- `git diff --check`

Record exact final counts from the containing commit. Android runtime remains blocked by `MOBILE-QA-002`; do not infer device passage.

## Known risks and NEXT_QA_ACTION

- `MOBILE-QA-002`: independently exercise rapid alternate actions and screen-reader busy announcements on a responsive Android emulator/device.
- `MOBILE-QA-003`: full clean immutable-suite certification becomes available after the unrelated concurrent slice is committed or isolated; DEV full-suite evidence in the shared worktree is supporting, not clean-baseline release certification.
- `NEXT_QA_ACTION`: pin the containing commit, verify all 20 outcomes, ensure raw sentinel exception text is absent, and confirm the commit excludes concurrent Whale/token-logo files.
