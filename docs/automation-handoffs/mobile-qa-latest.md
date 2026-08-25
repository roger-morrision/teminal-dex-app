# MOBILE-QA — Latest independent validation

- Run (UTC): 2026-08-25T11:45:15.6920245Z
- Scope: `C:\Tuan\devApps\teminal-dex-app` only — canonical Terminal DEX Expo/mobile client. CWD and git top-level both matched the required workspace; no WEB/backend workspace was accessed or modified.
- Inspected DEV commit: `23ae5bb101f5344889f73e37cdda1b3933475e02` (`feat: surface indexer health evidence`, `MOBILE-146`), with base `ccf1d77`.
- Scope stability: HEAD stayed `23ae5bb` through inspection. Uncommitted Whales/token-row/token-avatar/DEX-logo and MOBILE→WEB handoff files remain outside this DEV slice. This QA report is the only QA-authored repository change.
- Environment: Windows 10.0.26100; bundled Node `v24.19.0`; Expo SDK 57; no responsive Android device/emulator session available.

## MOBILE-146 acceptance matrix (20 outcomes)

| ID | Result | Independent evidence |
| --- | --- | --- |
| MOBILE-146-01 | PASS | Feed Data renders `IndexerHealthCard` from the GET-only `fetchIndexerHealth` reader. |
| MOBILE-146-02 | PASS | Health query is `enabled: tab === "feed"`; Analytics does not enable it. |
| MOBILE-146-03 | PASS | Feed refresh includes `indexerHealth.refetch()` with the other Feed evidence readers. |
| MOBILE-146-04 | PASS | Initial Feed loading waits for connections, diagnostics, and indexer health together. |
| MOBILE-146-05 | PASS | Reader failure maps to an independent `InlineWarning` retry action. |
| MOBILE-146-06 | PASS | Error recovery receives `isFetching`; focused test proves busy/disabled recovery does not invoke retry. |
| MOBILE-146-07 | PASS | `not_configured` is separately localized and rendered. |
| MOBILE-146-08 | PASS | `invalid_contract` is separately localized and rendered. |
| MOBILE-146-09 | PASS | Other unavailable evidence uses the distinct generic-unavailable presentation. |
| MOBILE-146-10 | PASS | Healthy evidence uses the positive status color and `Healthy` accessibility summary. |
| MOBILE-146-11 | PASS | Degraded available evidence uses warning color/style and `Degraded` status semantics. |
| MOBILE-146-12 | PASS | Null tip, freshness, lag, source, and commitment render localized unavailable text, never zero. |
| MOBILE-146-13 | PASS | Non-null `tip` is rendered exactly with locale formatting. |
| MOBILE-146-14 | PASS | `updatedAt` is sent through the existing bounded age presentation; absent timestamp is unavailable. |
| MOBILE-146-15 | PASS | `ingestion.exportLagSlots` is independently surfaced in the evidence summary. |
| MOBILE-146-16 | PASS | Ingestion source and commitment are separately surfaced, with null-safe fallbacks. |
| MOBILE-146-17 | PASS | Bounded quality entries render canonical/not-canonical/unavailable individually. |
| MOBILE-146-18 | PASS | Empty quality map renders its explicit unavailable copy. |
| MOBILE-146-19 | PASS | Card exposes `summary` accessibility labels and explicit observational/non-execution boundary; schema accepts only literal `automationSafe: false`. |
| MOBILE-146-20 | PASS | All new indexed-health copy exists in typed English and Vietnamese maps. |

These outcomes are backed by a manual diff/source review of only the committed slice plus the focused test result below. No runtime-only assertion is being represented as a device pass.

## Commands and regression evidence

| MOBILE-QA check | Result | Evidence |
| --- | --- | --- |
| Changed-file scope / whitespace | PASS | `git show --name-status HEAD` contains only operations, settings, card test, and audit/handoff records; `git diff --check HEAD^ HEAD` clean. |
| TypeScript | PASS (shared-worktree signal) | `node_modules/typescript/bin/tsc --noEmit` exited 0. Unrelated uncommitted mobile files prevent calling this a clean-baseline release gate. |
| Local ESLint | PASS (shared-worktree signal) | `node_modules/eslint/bin/eslint.js app src` exited 0, with the same shared-worktree limitation. |
| Focused regression | PASS | `node_modules/jest/bin/jest.js --ci --runInBand src/__tests__/IndexerHealthCard.test.tsx src/__tests__/schema.test.ts src/__tests__/client.test.ts`: 3/3 suites, 76/76 tests passed. |
| Expo resolved public config | PASS | `node_modules/expo/bin/cli config --type public` exited 0: Expo 57, Android/iOS/web, `terminaldex` scheme, and iOS ATS arbitrary loads disabled. |
| Android runtime/device navigation, recovery, large text, and TalkBack | BLOCKED | Explicit SDK `adb.exe devices -l` probe produced no response in the 30-second QA window. No ADB server or emulator state was modified. |
| Expo Doctor | SKIP | `expo-doctor` is absent locally; no download was attempted. |
| Full Jest / clean immutable release regression | BLOCKED | Do not mix `23ae5bb` with current uncommitted TokenRow/TokenAvatar/Whales/DEX-logo work. |
| Live WEB API compatibility | NOT RUN | No approved mobile runtime endpoint/environment was supplied. WEB remains a read-only external contract. |

## Findings and carry-forward

### MOBILE-QA-001 — P3 / process traceability — partially resolved

- Status: PARTIALLY RESOLVED. The DEV handoff now identifies scope, immutable commit, criteria, and QA scenarios. Repository `AGENTS.md` remains absent.
- Affected files: missing repository-local automation guidance only.
- Regression risk: reduced operating-instruction traceability for future automation.
- Exact NEXT_DEV_ACTION: add repository `AGENTS.md` guidance or explicitly document that none is required.
- WEB contract blocker: none.

### MOBILE-QA-002 — P2 / release-certification blocker — Android runtime unavailable

- Status: OPEN. The explicit Android SDK probe did not yield a responsive device/emulator list; no device interaction was performed.
- Regression risk: installed-build navigation, all tabs/subtabs, loading/stale/empty/filtered-empty/offline/error/retry/partial-page recovery, large text, and assistive traversal remain uncertified.
- Exact NEXT_DEV_ACTION: provide one responsive Android emulator/device via healthy ADB, then certify the five-tab shell and affected Feed Data route at default and enlarged font scale.
- WEB contract blocker: none.

### MOBILE-QA-003 — P2 / release-gate blocker — full suite deferred for concurrent work

- Status: OPEN. The shared worktree contains uncommitted work outside `23ae5bb`; a full suite would not prove the immutable DEV increment.
- Affected files: concurrent `app/(tabs)/whales.tsx`, TokenRow/TokenAvatar/DexLogo work and MOBILE→WEB drafts only.
- Regression risk: no clean-baseline full-suite certification for MOBILE-146.
- Exact NEXT_DEV_ACTION: commit or isolate the concurrent mobile slice, then run `node_modules/jest/bin/jest.js --ci --runInBand` from a clean immutable HEAD.
- WEB contract blocker: none.

## Throughput accounting and release recommendation

- MOBILE-QA findings inspected/reconciled: 3 stable IDs (`MOBILE-QA-001` through `003`); new defects found: 0.
- DEV outcomes available: 20; independently verified: 20 PASS; FAIL: 0; BLOCKED/SKIP/NOT_APPLICABLE among DEV outcomes: 0; remaining to 20: 0.
- External regression lanes not counted as DEV outcomes: `MOBILE-QA-002` Android runtime BLOCKED, `MOBILE-QA-003` clean full-suite BLOCKED, Expo Doctor SKIP, and live WEB compatibility NOT RUN.
- Carry-forward order: MOBILE-QA-002, MOBILE-QA-003, then MOBILE-QA-001.

**MOBILE-QA CONDITIONAL NO-GO for release certification.** `MOBILE-146` meets all 20 committed, source/test-verifiable acceptance outcomes. Do not claim Android runtime, full clean-suite, or release sign-off until MOBILE-QA-002 and MOBILE-QA-003 close.

## Safe evidence references

- No screenshots or runtime logs were produced because no responsive device was available.
- Commands used only the mobile workspace and contain no backend origin, credentials, or provider diagnostics.
