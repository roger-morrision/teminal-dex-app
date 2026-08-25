# MOBILE-QA — Latest independent validation

- Run (UTC): `2026-08-25T14:44:33.7449842Z`
- Scope: `C:\Tuan\devApps\teminal-dex-app` only — canonical Terminal DEX Expo/mobile client. CWD and Git top-level matched; no WEB/backend workspace was accessed or modified.
- Inspected DEV commit: `cd8a7dd53c20c7cf1dd59baec99d82527731ad98` (`fix: lock quote evidence chain`, `MOBILE-149`), base `69864de`.
- Scope stability: `HEAD` stayed at `cd8a7dd` before and after validation. Concurrent uncommitted Whales/token-row/token-avatar/DEX-logo work and MOBILE-to-WEB drafts were excluded and untouched. Checks that resolve the full shared worktree are explicitly labelled as shared-worktree signals.
- Environment: Windows 10.0.26100; bundled Node `v24.19.0`; Expo SDK 57. Android platform tools exist, but `adb devices -l` produced no usable device listing in its bounded probe.

## MOBILE-149 acceptance matrix (33 outcomes)

All results below are independently verified by the immutable committed diff, current unchanged `app/trade/[address].tsx`, and the focused accessibility regression. They are source/test-verifiable outcomes, not physical-device evidence.

| ID | Result | Independent evidence |
| --- | --- | --- |
| MOBILE-149-01 | PASS | Buy side tab is native-disabled and announced disabled/busy while quote retrieval is active. |
| MOBILE-149-02 | PASS | Sell side tab is native-disabled and announced disabled/busy while quote retrieval is active. |
| MOBILE-149-03 | PASS | Amount input is non-editable and announced disabled/busy while quote retrieval is active. |
| MOBILE-149-04 | PASS | SOL unit radio is native-disabled and announced disabled/busy while quote retrieval is active. |
| MOBILE-149-05 | PASS | USD unit radio is native-disabled and announced disabled/busy while quote retrieval is active. |
| MOBILE-149-06 | PASS | 25-bps slippage radio is native-disabled and announced disabled/busy while quote retrieval is active. |
| MOBILE-149-07 | PASS | 50-bps slippage radio is native-disabled and announced disabled/busy while quote retrieval is active. |
| MOBILE-149-08 | PASS | 100-bps slippage radio is native-disabled and announced disabled/busy while quote retrieval is active. |
| MOBILE-149-09 | PASS | 300-bps slippage radio is native-disabled and announced disabled/busy while quote retrieval is active. |
| MOBILE-149-10 | PASS | Buy side tab is locked during verified-intent preparation. |
| MOBILE-149-11 | PASS | Sell side tab is locked during verified-intent preparation. |
| MOBILE-149-12 | PASS | Amount input is non-editable during verified-intent preparation. |
| MOBILE-149-13 | PASS | SOL unit radio is locked during verified-intent preparation. |
| MOBILE-149-14 | PASS | USD unit radio is locked during verified-intent preparation. |
| MOBILE-149-15 | PASS | 25-bps slippage radio is locked during verified-intent preparation. |
| MOBILE-149-16 | PASS | 50-bps slippage radio is locked during verified-intent preparation. |
| MOBILE-149-17 | PASS | 100-bps slippage radio is locked during verified-intent preparation. |
| MOBILE-149-18 | PASS | 300-bps slippage radio is locked during verified-intent preparation. |
| MOBILE-149-19 | PASS | Buy side tab is locked during explicit confirmation. |
| MOBILE-149-20 | PASS | Sell side tab is locked during explicit confirmation. |
| MOBILE-149-21 | PASS | Amount input is non-editable during explicit confirmation. |
| MOBILE-149-22 | PASS | SOL unit radio is locked during explicit confirmation. |
| MOBILE-149-23 | PASS | USD unit radio is locked during explicit confirmation. |
| MOBILE-149-24 | PASS | 25-bps slippage radio is locked during explicit confirmation. |
| MOBILE-149-25 | PASS | 50-bps slippage radio is locked during explicit confirmation. |
| MOBILE-149-26 | PASS | 100-bps slippage radio is locked during explicit confirmation. |
| MOBILE-149-27 | PASS | 300-bps slippage radio is locked during explicit confirmation. |
| MOBILE-149-28 | PASS | Quote refresh is blocked while preparation is pending. |
| MOBILE-149-29 | PASS | Quote refresh is blocked while confirmation is pending. |
| MOBILE-149-30 | PASS | Preparation is blocked while quote retrieval is active. |
| MOBILE-149-31 | PASS | Preparation is blocked while confirmation is pending. |
| MOBILE-149-32 | PASS | Confirmation is blocked while quote retrieval is active. |
| MOBILE-149-33 | PASS | Confirmation is blocked while preparation is pending. |

`flowBusy = quote.isFetching || prepare.isPending || confirm.isPending` is applied to every listed editable/native action state and corresponding accessibility state. The confirmed screen continues to state that signature is locked; no signing, submission, trading, CopyTrade activation, or WEB contract changed.

## Commands and regression evidence

| MOBILE-QA check | Result | Evidence |
| --- | --- | --- |
| Committed scope / whitespace | PASS | `git diff-tree --name-status -r cd8a7dd` returned only the six declared MOBILE-149 files; `git diff --check cd8a7dd^ cd8a7dd` was clean. |
| Source and safety inspection | PASS | All quote inputs and actions use the one `flowBusy` boundary; no execution authority was added. |
| TypeScript | PASS (shared-worktree signal) | Bundled Node ran `node_modules/typescript/bin/tsc --noEmit` with exit 0. |
| Local ESLint | PASS (shared-worktree signal) | Bundled Node ran `node_modules/eslint/bin/eslint.js app src` with exit 0. |
| Focused accessibility regression | PASS (shared-worktree signal) | `node_modules/jest/bin/jest.js --ci --runInBand src/__tests__/primary-a11y.test.ts`: 1/1 suite and 68/68 tests passed, including the new quote-lock guard. |
| Expo resolved public config / platform bundle configuration | PASS (shared-worktree signal) | `node_modules/expo/bin/cli config --type public` exited 0; SDK 57 resolves Android/iOS/web, `terminaldex` intent scheme/filter, Android biometric permissions, and iOS ATS arbitrary-load denial. No generated bundle was written. |
| Android device/emulator navigation, pending interaction, offline/retry, large text, TalkBack | BLOCKED | Android platform tools are installed, but the bounded `adb devices -l` probe returned no usable listing. No runtime evidence was fabricated. |
| Expo Doctor | SKIP | `node_modules/expo-doctor` is absent locally; no package download was attempted. |
| Full Jest / clean immutable release regression | BLOCKED | The shared worktree has concurrent uncommitted Whales/logo and MOBILE-to-WEB work. Running the full suite would test mixed state and cannot certify MOBILE-149. |
| Live WEB API contract/schema exercise | NOT RUN | No approved mobile runtime endpoint/environment was supplied. WEB remains a read-only external contract and the DEV change has no API schema delta. |

## Findings and carry-forward

### MOBILE-QA-001 — P3 / process traceability

- Status: RESOLVED. `AGENTS.md` records the exact MOBILE boundary, WEB read-only restriction, selective staging, safety boundary, and scheduled-writer lock requirement.
- Affected files: `AGENTS.md`.
- Regression risk: low.
- Exact NEXT_DEV_ACTION: none.
- WEB contract blocker: none.

### MOBILE-QA-002 — P2 / release-certification blocker — Android runtime unavailable

- Status: OPEN. No responsive Android emulator/device was available through ADB. Navigation, pending-form interaction, retry/offline recovery, enlarged-text layout, and TalkBack disabled/busy announcements remain unverified on-device.
- Affected files: five-tab shell and `app/trade/[address].tsx`.
- Regression risk: native disabled behavior and assistive announcements are not release-certified.
- Exact NEXT_DEV_ACTION: provide one responsive Android emulator/device through healthy ADB, then exercise quote, prepare, and confirm pending phases at default and enlarged font scale with TalkBack.
- WEB contract blocker: none.

### MOBILE-QA-003 — P2 / release-gate blocker — clean full suite deferred

- Status: OPEN. The working tree includes unrelated uncommitted changes in `app/(tabs)/whales.tsx`, `src/components/TokenAvatar.tsx`, `src/components/TokenRow.tsx`, `src/components/DexLogo.tsx`, `src/__tests__/TokenRow.test.tsx`, and MOBILE-to-WEB drafts.
- Regression risk: clean immutable full-suite certification is unavailable for MOBILE-149.
- Exact NEXT_DEV_ACTION: commit or isolate the concurrent mobile slice, then run `node_modules/jest/bin/jest.js --ci --runInBand` against a clean immutable `HEAD`.
- WEB contract blocker: none.

## Throughput accounting and release recommendation

- MOBILE-QA findings inspected/reconciled: 3 stable IDs; new defects found: 0.
- DEV outcomes available: 33; independently verified: 33 PASS; FAIL: 0; BLOCKED/SKIP/NOT_APPLICABLE among DEV outcomes: 0; remaining to 20: 0.
- Stable blocked/skipped IDs: `MOBILE-QA-002`, `MOBILE-QA-003`; Expo Doctor is SKIP and live WEB compatibility is NOT RUN.
- Carry-forward order: MOBILE-QA-002, MOBILE-QA-003.

**MOBILE-QA CONDITIONAL NO-GO for release certification.** MOBILE-149 meets all 33 committed source/test-verifiable acceptance outcomes. Do not claim Android runtime, clean full-suite, or release sign-off until MOBILE-QA-002 and MOBILE-QA-003 close.

## Safe evidence references

- No screenshots or runtime logs were produced because no responsive device was available.
- Commands used only the mobile workspace and contain no backend origin, credentials, provider diagnostics, or private exception text.
