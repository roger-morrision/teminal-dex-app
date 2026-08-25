# MOBILE-QA — Latest independent validation

- Run (UTC): `2026-08-25T16:02:00Z`
- Scope: `C:\Tuan\devApps\teminal-dex-app` only — canonical Terminal DEX Expo/mobile client. CWD and Git top-level both resolved to the required workspace before the report lock was acquired. `AGENTS.md` and the DEV handoff were read. No WEB/backend workspace was accessed or modified.
- Inspected DEV commit: `7288c6d80722424474464086ff660c6fb0a2d5a8` (`test(android): lock startup ANR mitigation`, MOBILE-151). Implementation base: `3f3825d1ad831616cc1705a08452b7882ec9c2d5`.
- Scope stability: the current dirty Whales/token-logo and MOBILE-to-WEB handoff files do not overlap `plugins/withAndroidDevMenuSafety.js` or `src/__tests__/android-dev-menu-safety.test.ts`. Immutable acceptance evidence is limited to those committed files. Whole-worktree type/lint/full-suite/export results are shared-worktree regression signals, not clean-release certification.
- Environment: Windows 10.0.26100; bundled Node 24.19.0; Expo SDK 57; `emulator-5554` API 37 (`sdk_gphone64_x86_64`).

## MOBILE-151 acceptance matrix (6 outcomes)

| ID | Result | Independent evidence |
| --- | --- | --- |
| MOBILE-QA-151-01 | PASS | Focused Jest proves the injected configuration is guarded by `BuildConfig.DEBUG` and sets only `shakeGestureEnabled = false`. |
| MOBILE-QA-151-02 | PASS | Focused Jest proves the plugin does not set `devMenuEnabled = false` or `keyboardShortcutsEnabled = false`; source limits the change to the shake gesture. |
| MOBILE-QA-151-03 | PASS | Focused Jest verifies the required `DevMenuConfiguration` Kotlin import is injected. |
| MOBILE-QA-151-04 | PASS | Focused Jest verifies applying the transformation twice yields identical generated Kotlin. |
| MOBILE-QA-151-05 | PASS | Focused Jest verifies non-Kotlin generated source fails closed with the intended message. |
| MOBILE-QA-151-06 | PASS | Focused Jest verifies an unexpected Expo ReactHost template fails closed instead of producing a partial native mutation. |

## Commands and regression evidence

| MOBILE-QA check | Result | Evidence |
| --- | --- | --- |
| Commit scope and whitespace | PASS | `git show --stat 7288c6d` matches the DEV handoff; `git diff --check` exited 0. |
| Focused Android plugin regression | PASS | `node node_modules/jest/bin/jest.js --runInBand --runTestsByPath src/__tests__/android-dev-menu-safety.test.ts` exited 0; 1 suite / 6 assertions pass. |
| TypeScript | PASS (shared-worktree signal) | `node node_modules/typescript/bin/tsc --noEmit` exited 0. |
| Local source ESLint | PASS (shared-worktree signal) | `node node_modules/eslint/bin/eslint.js app src` exited 0 without findings. |
| Full Jest | PASS (shared-worktree signal) | `node node_modules/jest/bin/jest.js --runInBand`: 79 suites / 385 tests passed. |
| Expo public config | PASS | `expo config --type public` resolves the Android safety plugin, Android/iOS/web targets, `terminaldex` scheme/filter, Android biometric permissions, and iOS ATS arbitrary-load denial. |
| Generated Android Kotlin | PASS (static) | Existing `android/app/src/main/java/app/terminaldex/mobile/MainApplication.kt` contains the import and DEBUG-only `DevMenuConfiguration(shakeGestureEnabled = false)` host configuration. |
| Android bundle export | PASS (shared-worktree signal) | `expo export --platform android --output-dir %TEMP%/mobile-qa-export-android-20260825 --max-workers 1` exited 0; 48 files, including a 5.7 MB Hermes bundle. |
| iOS bundle export | PASS (shared-worktree signal) | Equivalent iOS export exited 0; 44 files, including a 5.4 MB Hermes bundle. |
| Web static export | PASS (shared-worktree signal) | Equivalent web export exited 0; 64 files and 25 static routes. Expo forced process exit after successful export. |
| Bundle warning | OPEN / P3 | All exports emit the pre-existing `@noble/hashes` `./crypto.js` exports-map fallback warning. Bundles still complete; no new MOBILE-151 code path is implicated. |
| Expo Doctor | SKIP | No local `expo-doctor` package/executable is installed; no dependency download was attempted. |
| Emulator / ADB developer access | PASS (non-certifying) | Debug package `app.terminaldex.mobile` is installed on API 37. `input keyevent 82` displays the Expo development menu, including Reload, DevTools, React Native dev menu, and Fast Refresh. No fatal/ANR/unresolved-module match was found in the inspected log tail. |

## Findings and carry-forward

### MOBILE-QA-001 — P3 / process traceability

- Status: RESOLVED. MOBILE-only boundary and selective-staging guidance remain present in `AGENTS.md`.
- Affected files: `AGENTS.md`.
- Regression risk: low.
- Exact NEXT_DEV_ACTION: none.
- WEB contract blocker: none.

### MOBILE-QA-002 — P2 / release-certification blocker — exact Android build and UI flow not certified

- Status: OPEN (updated). The emulator now has a debuggable Terminal DEX APK, but its package `lastUpdateTime` (`2026-08-25 23:31:16`) predates MOBILE-151's implementation commit (`3f3825d`, `23:34:05 +0700`). It can demonstrate retained ADB Dev Menu access, not the updated shake-sensor behavior. The app opened its development-client shell; no current Metro session was available to exercise Whales/navigation, states, large text, TalkBack, or the quote flow.
- Affected files: `plugins/withAndroidDevMenuSafety.js`; Android development client/runtime.
- Regression risk: the exact APK's cold/warm startup and physical accessibility behavior remain uncertified.
- Exact NEXT_DEV_ACTION: build and install a development APK from immutable `7288c6d`, then verify cold and warm launch, Whales mount, Android Developer Options shake gesture remains disabled, ADB/keyboard developer controls remain enabled, default/enlarged text, and TalkBack traversal.
- WEB contract blocker: none.

### MOBILE-QA-003 — P2 / release-gate blocker — clean immutable full suite deferred

- Status: OPEN. Unrelated uncommitted Whales/token-logo files and MOBILE-to-WEB drafts remain in the worktree. The passing full suite, lint, and exports are useful shared-worktree signals only.
- Affected files: current concurrent mobile worktree.
- Regression risk: no clean immutable release certification.
- Exact NEXT_DEV_ACTION: commit or isolate the concurrent MOBILE slice, then rerun TypeScript, lint, full Jest, and platform exports against a clean immutable HEAD.
- WEB contract blocker: none.

### MOBILE-QA-004 — P3 / dependency warning — Noble hashes export fallback

- Status: OPEN / known non-fatal. Metro resolves `@noble/hashes/crypto.js` through a file fallback because the nested package exports map omits that subpath. Android, iOS, and web bundles complete.
- Affected files: transitive `@solana/wallet-standard-util` dependency tree.
- Regression risk: future Metro/package updates could turn the fallback into a bundle failure.
- Exact NEXT_DEV_ACTION: assess a compatible upstream dependency update in a separately isolated MOBILE dependency slice; retain the warning until then.
- WEB contract blocker: none.

## Throughput accounting and release recommendation

- MOBILE-QA findings inspected/reconciled: 10 stable IDs (6 MOBILE-151 acceptance IDs and 4 standing QA findings).
- DEV outcomes available: 6; independently verified: 6 PASS; FAIL: 0; BLOCKED/SKIP/NOT_APPLICABLE among DEV outcomes: 0.
- Required 20-outcome shortfall: 14. MOBILE-151 provides only six material, non-duplicative acceptance outcomes. No cosmetic findings were added to fill the quota.
- Stable blocked/skipped IDs: `MOBILE-QA-002`, `MOBILE-QA-003`, `MOBILE-QA-004`; Expo Doctor is SKIP.
- Carry-forward order: `MOBILE-QA-002`, `MOBILE-QA-003`, `MOBILE-QA-004`.

**MOBILE-QA CONDITIONAL NO-GO for release certification.** MOBILE-151's six committed source/test-verifiable outcomes pass. Do not claim release readiness until an APK built from `7288c6d` is installed and independently exercised, and the concurrent worktree is isolated for a clean immutable regression run.

## Safe evidence references

- No screenshots were retained. The ephemeral emulator UI dump only confirmed the development menu and contained no credentials, endpoints, provider diagnostics, or private exception text.
- No MOBILE product code, tests, configuration, WEB code, or production state was modified.
