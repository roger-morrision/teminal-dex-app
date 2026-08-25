# MOBILE-QA — Latest independent validation

- Run (UTC): `2026-08-25T17:48:55Z`
- Scope: `C:\Tuan\devApps\teminal-dex-app` only — canonical Terminal DEX Expo/mobile client. CWD and Git top-level both resolved to the required workspace before the MOBILE QA/report lock was acquired. `AGENTS.md`, the DEV handoff, requirements checklist, worklog, final audit, Git history/status, and runtime were inspected. No WEB/backend workspace was accessed or modified.
- Inspected DEV commit: `a96bb61ee0c8c31d888fcff6e9fba03b66c69e23` (`fix(android): route local API through emulator host`, MOBILE-152). Base: `d9d5622`.
- Scope stability: unrelated uncommitted Whales/token-logo files and MOBILE-to-WEB drafts do not overlap the committed MOBILE-152 client files. Immutable acceptance evidence is limited to `src/api/client.ts` and `src/__tests__/client.test.ts`. TypeScript, lint, full suite, and bundle results are shared-worktree signals, not clean-release certification.
- Environment/device: Windows 10.0.26100; bundled Node `v24.19.0`; Expo SDK 57; `emulator-5554` API 37 (`sdk_gphone64_x86_64`), debug package `app.terminaldex.mobile`.

## MOBILE-152 acceptance matrix (6 outcomes)

| ID | Result | Independent evidence |
| --- | --- | --- |
| MOBILE-QA-152-01 | PASS | Focused client regression confirms configured origin normalization/precedence; the change preserves the explicit environment-origin branch. |
| MOBILE-QA-152-02 | PASS | Focused client regression confirms an unconfigured Android development build resolves `http://10.0.2.2:3000`. |
| MOBILE-QA-152-03 | PASS | Focused client regression confirms iOS, web, Windows, and unknown development platforms remain on `http://127.0.0.1:3000`. |
| MOBILE-QA-152-04 | PASS | Focused client regression confirms invalid configured origins are rejected before a request, production permits only HTTPS, and Android emulator HTTP is development-only. |
| MOBILE-QA-152-05 | PASS | Host `GET /api/trending` returned HTTP 200 and API 37 successfully pinged `10.0.2.2` (0% loss, 2.208 ms), establishing that the selected Android host route is reachable. |
| MOBILE-QA-152-06 | BLOCKED | API 37 renders Whales Live with 23 historical items, `Running "main"`, and no inspected fatal/ANR/unresolved-module/configuration-error match. Its installed development client `lastUpdateTime` is `2026-08-25 23:31:16`, before MOBILE-152; no persistent current Metro service/version hash established that the rendered bundle is `a96bb61`. This is non-certifying runtime evidence only. |

## Commands and regression evidence

| MOBILE-QA check | Result | Evidence |
| --- | --- | --- |
| Commit scope and whitespace | PASS | `git show --stat d9d5622..a96bb61` contains the documented client/test changes; `git diff --check d9d5622..a96bb61` exited 0. |
| Focused routing regression | PASS | `node node_modules/jest/bin/jest.js --runInBand --runTestsByPath src/__tests__/client.test.ts` exited 0: 1 suite / 35 tests. |
| TypeScript | PASS (shared-worktree signal) | `node node_modules/typescript/bin/tsc --noEmit` exited 0. |
| Local source ESLint | PASS (shared-worktree signal) | `node node_modules/eslint/bin/eslint.js app src` exited 0 without findings. |
| Full Jest | PASS (shared-worktree signal) | `node node_modules/jest/bin/jest.js --runInBand` exited 0: 79 suites / 390 tests. |
| Expo public config | PASS | `expo config --type public` resolves Android/iOS/web, the `terminaldex` scheme/filter, biometric permissions, ATS denial, and both custom Android plugins. |
| Android bundle export | PASS (shared-worktree signal) | Android export wrote 48 files to an ephemeral temp directory. No generated output was retained in the repository. |
| Expo Doctor | SKIP | No local `expo-doctor` package/executable is installed; no dependency download was attempted. |
| Android runtime/semantics | BLOCKED (exact-commit certification) | API 37 is online, the app process is alive/focused, and the Whales accessibility tree exposes search, selected Live view, historical evidence, filters, and labelled relationship rows. See `MOBILE-QA-152-06` for immutable-build limitation. |
| Bundle warning | OPEN / P3 | Android export emits the existing `@noble/hashes` `./crypto.js` exports-map fallback warning. Export completes; no MOBILE-152 path is implicated. |

## Findings and carry-forward

### MOBILE-QA-001 — P3 / process traceability

- Status: RESOLVED. MOBILE-only boundary and selective-staging guidance remain present in `AGENTS.md`.
- Affected files: `AGENTS.md`.
- Regression risk: low.
- Exact NEXT_DEV_ACTION: none.
- WEB contract blocker: none.

### MOBILE-QA-002 — P2 / release-certification blocker — exact Android build and UI flow not certified

- Status: OPEN (updated). The available API 37 client predates MOBILE-152 and no current Metro bundle identity was available. It demonstrates host reachability and a live Whales accessibility tree only; it cannot certify the `a96bb61` routing branch, retry/recovery, large-text, TalkBack, or quote flow.
- Affected files: `src/api/client.ts`; Android development-client/runtime.
- Regression risk: Android development routing could differ in an exact current bundle despite source/test evidence.
- Exact NEXT_DEV_ACTION: serve or install a development client from immutable `a96bb61`, cold/warm launch it with no `EXPO_PUBLIC_API_URL`, verify the Whales request reaches `10.0.2.2:3000`, then exercise loading, error/retry, offline/reconnect, large text, and TalkBack.
- WEB contract blocker: none.

### MOBILE-QA-003 — P2 / release-gate blocker — clean immutable full suite deferred

- Status: OPEN. Unrelated uncommitted Whales/token-logo files and MOBILE-to-WEB drafts remain in the worktree. Passing full-suite, lint, and export results are useful shared-worktree signals only.
- Affected files: current concurrent mobile worktree.
- Regression risk: no clean immutable release certification.
- Exact NEXT_DEV_ACTION: commit or isolate the concurrent MOBILE slice, then rerun TypeScript, lint, full Jest, and platform exports against a clean immutable HEAD.
- WEB contract blocker: none.

### MOBILE-QA-004 — P3 / dependency warning — Noble hashes export fallback

- Status: OPEN / known non-fatal. Metro resolves `@noble/hashes/crypto.js` through a file fallback because the nested package exports map omits that subpath. Android export completes.
- Affected files: transitive `@solana/wallet-standard-util` dependency tree.
- Regression risk: future Metro/package updates could turn the fallback into a bundle failure.
- Exact NEXT_DEV_ACTION: assess a compatible upstream dependency update in a separately isolated MOBILE dependency slice; retain the warning until then.
- WEB contract blocker: none.

## Throughput accounting and release recommendation

- MOBILE-QA findings inspected/reconciled: 10 stable IDs (6 MOBILE-152 acceptance IDs and 4 standing QA findings).
- DEV outcomes available: 6; independently assessed: 6; PASS: 5; FAIL: 0; BLOCKED: 1; SKIP: 0; NOT_APPLICABLE: 0.
- Required 20-outcome shortfall: 14. MOBILE-152 provides six material, non-duplicative outcomes; no cosmetic findings were added to fill the quota.
- Stable blocked/skipped IDs: `MOBILE-QA-002`, `MOBILE-QA-003`, `MOBILE-QA-004`; Expo Doctor is SKIP.
- Carry-forward order: `MOBILE-QA-002`, `MOBILE-QA-003`, `MOBILE-QA-004`.

**MOBILE-QA CONDITIONAL NO-GO for release certification.** MOBILE-152's five source/device-reachability outcomes pass. Do not claim release readiness until a current immutable `a96bb61` development bundle is installed/served and exercised on API 37, and the concurrent worktree is isolated for a clean immutable regression run.

## Safe evidence references

- No screenshots or log files were retained. The transient Android UI dump contained no credentials, endpoints, provider diagnostics, or private exception text.
- No MOBILE product code, tests, configuration, WEB code, or production state was modified.
