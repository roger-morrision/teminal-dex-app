# MOBILE DEV → QA handoff

- Story: `MOBILE-148` — atomic Monitor and CopyTrade creation forms
- Base: `1c6c3e4`
- Result: containing commit; QA must pin immutable `HEAD`
- Scope: MOBILE only. WEB remained read-only. Concurrent Whale/TokenRow/TokenAvatar/DexLogo work and MOBILE→WEB drafts were preserved and excluded.

## User value and acceptance

While create requests are pending, the user must not be able to change the payload shown on screen, close the review, or trigger contradictory control changes. Native disabled behavior and assistive disabled state must agree. No execution authority changes.

## Outcomes (36 material controls)

- Monitor (8): name, address, threshold, three signal choices, above, below.
- CopyTrade (28): close; three sizing modes; active sizing value; twelve server risk/limit values; three behavior toggles; priority fee, holder minimum, trailing stop; Anti-MEV; four exit-ladder values.
- Every text input uses `editable={!pending}` plus disabled accessibility state.
- Every radio/checkbox/button/choice uses native `disabled` plus disabled accessibility state.
- `AGENTS.md` closes `MOBILE-QA-001` process traceability but is not counted among the 36 product outcomes.

Findings reconciled: 36. Outcomes complete: 36. Remaining to required 20: 0. No padding, placeholders, or documentation-only outcomes.

## Changed files

- `AGENTS.md`
- `app/(tabs)/monitor.tsx`
- `app/copytrade.tsx`
- `src/__tests__/primary-a11y.test.ts`
- MOBILE checklist, worklog, final audit, and this handoff

## Verification

- `typescript/bin/tsc --noEmit`
- `eslint/bin/eslint.js app src`
- focused `primary-a11y.test.ts`
- full Jest
- Expo public config
- `git diff --check`

## Risks and NEXT_QA_ACTION

- `MOBILE-QA-002` remains blocked until ADB exposes a responsive Android emulator/device.
- `MOBILE-QA-003` clean immutable certification still requires isolation/commit of concurrent Whale/logo work; shared-worktree full-suite evidence is supporting only.
- NEXT_QA_ACTION: pin the containing commit; verify all 36 controls are frozen while pending, assistive state matches native state, `AGENTS.md` has the exact MOBILE/WEB boundary, and the commit excludes all concurrent files.
