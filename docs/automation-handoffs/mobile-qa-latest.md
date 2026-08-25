# MOBILE-QA — Latest independent validation

- Run (UTC): `2026-08-25T12:44:50.3679014Z`
- Scope: `C:\Tuan\devApps\teminal-dex-app` only — canonical Terminal DEX Expo/mobile client. CWD and Git top-level matched the required workspace; no WEB/backend workspace was accessed or modified. `AGENTS.md` is absent.
- Inspected DEV commit: `d8d93777ba57458a7bf489174befcf6ad6187f9c` (`fix: harden private mutation recovery`, `MOBILE-147`), base `98de6e2`.
- Scope stability: HEAD remained `d8d9377` before and after validation. Existing uncommitted Whales/token-row/token-avatar/DEX-logo and MOBILE→WEB handoff work was not part of this slice. Static tooling signals from the shared worktree are not a clean-baseline release gate.
- Environment: Windows 10.0.26100; bundled Node `v24.19.0`; Expo SDK 57. No responsive Android device/emulator session was available.

## MOBILE-147 acceptance matrix (20 outcomes)

| ID | Result | Independent evidence |
| --- | --- | --- |
| MOBILE-147-01 | PASS | Monitor toggle error is rendered only through `publicErrorMessage`. |
| MOBILE-147-02 | PASS | Monitor delete error is rendered only through `publicErrorMessage`. |
| MOBILE-147-03 | PASS | Monitor unknown mutation failures use localized `actionCouldNotComplete` fallback. |
| MOBILE-147-04 | PASS | Monitor retains allowlisted public-error classification via the shared classifier. |
| MOBILE-147-05 | PASS | Monitor toggle is disabled while either toggle or delete is pending. |
| MOBILE-147-06 | PASS | Monitor delete is disabled while either toggle or delete is pending. |
| MOBILE-147-07 | PASS | Monitor toggle exposes `busy` for either pending mutation. |
| MOBILE-147-08 | PASS | Monitor delete exposes `busy` for either pending mutation. |
| MOBILE-147-09 | PASS | Starting Monitor toggle synchronously resets stale delete failure. |
| MOBILE-147-10 | PASS | Starting Monitor delete synchronously resets stale toggle failure. |
| MOBILE-147-11 | PASS | CopyTrade pause error is rendered only through `publicErrorMessage`. |
| MOBILE-147-12 | PASS | CopyTrade delete error is rendered only through `publicErrorMessage`. |
| MOBILE-147-13 | PASS | CopyTrade unknown mutation failures use localized `actionCouldNotComplete` fallback. |
| MOBILE-147-14 | PASS | CopyTrade retains allowlisted public-error classification via the shared classifier. |
| MOBILE-147-15 | PASS | CopyTrade pause is disabled while pause or delete is pending. |
| MOBILE-147-16 | PASS | CopyTrade delete is disabled while pause or delete is pending. |
| MOBILE-147-17 | PASS | CopyTrade pause exposes `busy` for either pending mutation. |
| MOBILE-147-18 | PASS | CopyTrade delete exposes `busy` for either pending mutation. |
| MOBILE-147-19 | PASS | Starting either CopyTrade mutation resets the sibling mutation error. |
| MOBILE-147-20 | PASS | CopyTrade delete confirmation returns before opening while either mutation is pending. |

All results are based on an independent committed diff/source review plus the focused regression result below. They are not represented as physical-device evidence.

## Commands and regression evidence

| MOBILE-QA check | Result | Evidence |
| --- | --- | --- |
| Committed scope / whitespace | PASS | `git diff-tree --name-status -r HEAD` matched the seven declared files; `git diff --check HEAD^ HEAD` was clean. |
| TypeScript | PASS (shared-worktree signal) | `node_modules/typescript/bin/tsc --noEmit` through bundled Node exited 0. |
| Local ESLint | PASS (shared-worktree signal) | `node_modules/eslint/bin/eslint.js app src` through bundled Node exited 0. |
| Focused privacy/accessibility regression | PASS (shared-worktree signal) | `node_modules/jest/bin/jest.js --ci --runInBand src/__tests__/primary-a11y.test.ts`: 1/1 suite, 65/65 tests passed. |
| Expo resolved public config | PASS | `node_modules/expo/bin/cli config --type public` exited 0: Expo 57, Android/iOS/web, `terminaldex` scheme, iOS ATS arbitrary loads disabled, and Android intent filter present. |
| Android runtime/device navigation, mutation recovery, large text, and TalkBack | BLOCKED | SDK `adb.exe` was found, but the bounded `adb devices -l` probe did not complete with a device listing. No device interaction evidence exists. |
| Expo Doctor | SKIP | `expo-doctor` is absent locally; no download was attempted. |
| Full Jest / clean immutable release regression | BLOCKED | The shared worktree contains concurrent uncommitted files outside `d8d9377`; a full suite would not certify this immutable DEV increment. |
| Live WEB API compatibility | NOT RUN | No approved mobile runtime endpoint/environment was supplied. WEB remains a read-only external contract. |

## Findings and carry-forward

### MOBILE-QA-001 — P3 / process traceability — partially resolved

- Status: PARTIALLY RESOLVED. The DEV handoff identifies the immutable commit, scope, acceptance criteria, and QA scenarios; repository `AGENTS.md` remains absent.
- Affected files: missing repository-local automation guidance only.
- Regression risk: reduced operating-instruction traceability for future automation.
- Exact NEXT_DEV_ACTION: add repository `AGENTS.md` guidance or explicitly document that none is required.
- WEB contract blocker: none.

### MOBILE-QA-002 — P2 / release-certification blocker — Android runtime unavailable

- Status: OPEN. The Android SDK executable was present but its bounded device-list probe provided no usable device/emulator evidence; no navigation, mutation, offline/retry, large-text, or TalkBack scenario was exercised.
- Reproducible environment: Windows host, Android SDK platform-tools; `adb.exe devices -l` produced no completed listing within 30 seconds.
- Affected files: runtime certification across the five-tab shell, Monitor, and CopyTrade routes.
- Regression risk: installed-build mutual-exclusion semantics and screen-reader busy announcements remain uncertified.
- Exact NEXT_DEV_ACTION: provide one responsive Android emulator/device via healthy ADB, then exercise both rapid alternate mutations and screen-reader busy state at default and enlarged font scale.
- WEB contract blocker: none.

### MOBILE-QA-003 — P2 / release-gate blocker — full suite deferred for concurrent work

- Status: OPEN. The working tree contains unrelated uncommitted changes in `app/(tabs)/whales.tsx`, `src/components/TokenAvatar.tsx`, `src/components/TokenRow.tsx`, `src/components/DexLogo.tsx`, `src/__tests__/TokenRow.test.tsx`, and MOBILE→WEB drafts.
- Regression risk: no clean-baseline full-suite certification for MOBILE-147.
- Exact NEXT_DEV_ACTION: commit or isolate the concurrent mobile slice, then run `node_modules/jest/bin/jest.js --ci --runInBand` from a clean immutable HEAD.
- WEB contract blocker: none.

## Throughput accounting and release recommendation

- MOBILE-QA findings inspected/reconciled: 3 stable IDs (`MOBILE-QA-001` through `003`); new defects found: 0.
- DEV outcomes available: 20; independently verified: 20 PASS; FAIL: 0; BLOCKED/SKIP/NOT_APPLICABLE among DEV outcomes: 0; remaining to 20: 0.
- Stable blocked/skipped IDs: `MOBILE-QA-002` (Android runtime), `MOBILE-QA-003` (clean full suite); Expo Doctor SKIP; live WEB compatibility NOT RUN.
- Carry-forward order: MOBILE-QA-002, MOBILE-QA-003, then MOBILE-QA-001.

**MOBILE-QA CONDITIONAL NO-GO for release certification.** MOBILE-147 meets all 20 committed, source/test-verifiable acceptance outcomes. Do not claim Android runtime, clean full-suite, or release sign-off until MOBILE-QA-002 and MOBILE-QA-003 close.

## Safe evidence references

- No screenshots or runtime logs were produced because no responsive device was available.
- Commands used only the mobile workspace and contain no backend origin, credentials, provider diagnostics, or private exception text.
