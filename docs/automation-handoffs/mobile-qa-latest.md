# MOBILE-QA — Latest independent validation

- Run (UTC): `2026-08-25T15:00:00Z`
- Scope: `C:\Tuan\devApps\teminal-dex-app` only — canonical Terminal DEX Expo/mobile client. CWD and Git top-level matched the required workspace; `AGENTS.md` was read. No WEB/backend workspace was accessed or modified.
- Inspected DEV commit: `e3c46cf97a7019c1a48077b11599ba439b024513` (`fix: enforce quote expiry gates`, `MOBILE-150`), base `715d10f`.
- Scope stability: `HEAD` was `e3c46cf` before and after every check. Concurrent uncommitted Whales/token-logo work and MOBILE-to-WEB drafts do not overlap the four MOBILE-150 implementation/test files and were excluded. Full-worktree checks are explicitly marked shared-worktree signals.
- Environment: Windows 10.0.26100; bundled Node runtime; Expo SDK 57. Android SDK platform tools and `emulator-5554` (API emulator) are available, but Terminal DEX is not installed on that emulator.

## MOBILE-150 acceptance matrix (22 outcomes)

All 22 outcomes are independently verified from the committed diff, immutable source, and focused regression. They are source/test-verifiable only; they are not represented as physical-device evidence.

| ID | Result | Independent evidence |
| --- | --- | --- |
| MOBILE-QA-150-01 | PASS | `isSwapQuoteExpired(quotedAt, now)` uses `> 15,000`; focused TTL test proves exact 15,000 ms age stays valid. |
| MOBILE-QA-150-02 | PASS | Focused TTL test proves age 15,001 ms is expired. |
| MOBILE-QA-150-03 | PASS | Helper clamps negative age to zero; focused test proves future clock skew cannot create inferred expiry. |
| MOBILE-QA-150-04 | PASS | Screen clock initializes with `useState(() => Date.now())`, not zero. |
| MOBILE-QA-150-05 | PASS | `prepare` re-evaluates expiry at mutation invocation before preparing an intent. |
| MOBILE-QA-150-06 | PASS | `confirm` re-evaluates expiry at mutation invocation before explicit confirmation. |
| MOBILE-QA-150-07 | PASS | Confirm Pressable has native disabled state when expired. |
| MOBILE-QA-150-08 | PASS | Confirm style applies `styles.disabled` under the same expiry/busy predicate. |
| MOBILE-QA-150-09 | PASS | Confirm accessibility state reports matching disabled/busy state. |
| MOBILE-QA-150-10 | PASS | Buy selector participates in `flowBusy`, including readiness refresh. |
| MOBILE-QA-150-11 | PASS | Sell selector participates in `flowBusy`, including readiness refresh. |
| MOBILE-QA-150-12 | PASS | Amount input uses `editable={!flowBusy}` during readiness refresh. |
| MOBILE-QA-150-13 | PASS | The two buy-mode unit controls (USD and SOL) are disabled/busy during readiness refresh. |
| MOBILE-QA-150-14 | PASS | The two sell-mode unit controls (token and USD) are disabled/busy during readiness refresh. |
| MOBILE-QA-150-15 | PASS | 50-bps slippage control is disabled/busy during readiness refresh. |
| MOBILE-QA-150-16 | PASS | 100-bps slippage control is disabled/busy during readiness refresh. |
| MOBILE-QA-150-17 | PASS | 300-bps slippage control is disabled/busy during readiness refresh. |
| MOBILE-QA-150-18 | PASS | 500-bps slippage control is disabled/busy during readiness refresh. |
| MOBILE-QA-150-19 | PASS | Quote retrieval action is disabled while `flowBusy`, which includes readiness fetching. |
| MOBILE-QA-150-20 | PASS | Prepare action is disabled while `flowBusy`, which includes readiness fetching. |
| MOBILE-QA-150-21 | PASS | Confirm action is disabled while `flowBusy`, which includes readiness fetching. |
| MOBILE-QA-150-22 | PASS | Readiness retry receives `retrying={flowBusy}`; existing busy-safe control cannot overlap other evidence-chain phases. |

## Commands and regression evidence

| MOBILE-QA check | Result | Evidence |
| --- | --- | --- |
| Committed scope / whitespace | PASS | `git show --stat e3c46cf` matches declared MOBILE-150 files; `git diff --check` for slice and worktree exited 0. |
| Source, safety, API-contract inspection | PASS | MOBILE-150 is local TTL/UI coordination only: no API schema, signing, submission, trading, CopyTrade activation, secrets, or WEB changes. |
| Focused readiness/accessibility regression | PASS | Bundled Node ran Jest: 2/2 suites and 73/73 tests passed. |
| TypeScript | PASS (shared-worktree signal) | `tsc --noEmit` exited 0; unrelated uncommitted mobile files were resolved, so this cannot alone certify a clean immutable release. |
| Local ESLint | PASS (shared-worktree signal) | `eslint app src` exited 0 with the same shared-worktree limitation. |
| Expo resolved public config / platform configuration | PASS | `expo config --type public` exited 0: Android/iOS/web targets, `terminaldex` scheme/filter, biometric permissions, and iOS ATS arbitrary-load denial resolve. No bundle output was written. |
| Android navigation, tabs, states, large text, TalkBack | BLOCKED | ADB reports `emulator-5554`, but `pm path app.terminaldex` exits 1 and Android launch reports no activity. Runtime cannot be tied to `e3c46cf`; no UI result was fabricated. Font scale is `1.0`. |
| Expo Doctor | SKIP | No local `expo-doctor` executable/package; no dependency download attempted. |
| Full Jest / clean immutable release regression | BLOCKED | Unrelated uncommitted Whales/token-logo and MOBILE-to-WEB work remains. Full suite would test mixed state. |
| Live WEB API contract/schema exercise | NOT_APPLICABLE | No MOBILE-150 API/schema delta and no approved live endpoint; WEB remains read-only. |

## Findings and carry-forward

### MOBILE-QA-001 — P3 / process traceability

- Status: RESOLVED. `AGENTS.md` retains the mobile-only boundary and selective-staging requirements.
- Affected files: `AGENTS.md`.
- Regression risk: low.
- Exact NEXT_DEV_ACTION: none.
- WEB contract blocker: none.

### MOBILE-QA-002 — P2 / release-certification blocker — current Android build unavailable

- Status: OPEN (updated evidence). A usable emulator is connected, but it has no installed `app.terminaldex` package/activity. Navigation; tab/subtab coverage; loading/stale/empty/filtered-empty/offline/error/retry/partial-page recovery; large-text layout; and TalkBack disabled/busy announcements remain unverified against MOBILE-150.
- Affected files: current installed Android development build; `app/trade/[address].tsx` acceptance coverage.
- Regression risk: native disabled behavior and assistive announcements are not release-certified.
- Exact NEXT_DEV_ACTION: install a development build proven from `e3c46cf`, then exercise quote, prepare, confirm, readiness retry, default/enlarged font scale, and TalkBack on `emulator-5554`.
- WEB contract blocker: none.

### MOBILE-QA-003 — P2 / release-gate blocker — clean full suite deferred

- Status: OPEN. Unrelated uncommitted files remain in `.gitignore`, `app/(tabs)/whales.tsx`, `expo-env.d.ts`, `src/__tests__/TokenRow.test.tsx`, `src/components/TokenAvatar.tsx`, `src/components/TokenRow.tsx`, `src/components/DexLogo.tsx`, and MOBILE-to-WEB drafts.
- Regression risk: clean immutable full-suite certification is unavailable.
- Exact NEXT_DEV_ACTION: commit or isolate the concurrent mobile slice, then run the complete Jest suite against a clean immutable `HEAD`.
- WEB contract blocker: none.

## Throughput accounting and release recommendation

- MOBILE-QA findings inspected/reconciled: 25 stable IDs (22 MOBILE-150 acceptance IDs and 3 standing QA IDs); new defects found: 0.
- DEV outcomes available: 22; independently verified: 22 PASS; FAIL: 0; BLOCKED/SKIP/NOT_APPLICABLE among DEV outcomes: 0; remaining to required 20: 0.
- Stable blocked/skipped IDs: `MOBILE-QA-002`, `MOBILE-QA-003`; Expo Doctor is SKIP.
- Carry-forward order: `MOBILE-QA-002`, then `MOBILE-QA-003`.

**MOBILE-QA CONDITIONAL NO-GO for release certification.** MOBILE-150 satisfies all 22 committed source/test-verifiable acceptance outcomes. Do not claim Android runtime, clean full-suite, or release sign-off until current-build device evidence and a clean immutable suite close.

## Safe evidence references

- No screenshots were captured. Android output contains no endpoint, credential, provider diagnostic, or private exception text.
- All commands and inspection remained within the canonical mobile workspace and read-only WEB boundary.
