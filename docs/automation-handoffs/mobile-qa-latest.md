# MOBILE-QA — Latest independent validation

- Run (UTC): `2026-08-25T18:52:46Z` (completed 2026-08-26, Asia/Bangkok).
- Scope: canonical `C:\Tuan\devApps\teminal-dex-app` only. CWD and Git top-level resolved to that path before the MOBILE QA/report lock. `AGENTS.md`, DEV handoff, requirements, worklog, final audit, history, status, and runtime were inspected. No WEB workspace, backend API mutation, product code, test, or configuration was changed.
- Inspected DEV commit: `290933fb824b242b892d12d753cb707e05ec3c1f` (`MOBILE-153`, immutable runtime provenance). Base: `f73c3a0`.
- Scope stability: the primary worktree has concurrent Whales/token-logo changes, but none overlap the nine committed MOBILE-153 files. All certification commands ran in a clean detached temporary checkout pinned to `290933f`; results below are immutable except where stated.
- Environment/device: Windows 10.0.26100; bundled Node `v24.19.0`; Expo SDK 57; API 37 `emulator-5554` development client `app.terminaldex.mobile` (installed `2026-08-25 23:31:16`, predating the commit).

## MOBILE-153 acceptance matrix (7 outcomes)

| ID | Result | Independent evidence |
| --- | --- | --- |
| MOBILE-QA-153-01 | PASS | `build-provenance.test.ts` proves the verified launcher derives the public provenance value from immutable Git `HEAD`; clean checkout resolves exact `290933fb824b242b892d12d753cb707e05ec3c1f`. |
| MOBILE-QA-153-02 | PASS | Running `scripts/start-verified.mjs` in the tracked-dirty primary worktree exits 1 before Metro with `Verified development requires a clean tracked worktree.` |
| MOBILE-QA-153-03 | PASS | Clean launcher starts Metro and reports the exact commit. `expo config --type public` with `MOBILE_BUILD_COMMIT=290933…` exposes only `extra.mobileBuildCommit` with that hash. |
| MOBILE-QA-153-04 | PASS | Focused regression verifies ordinary sessions expose `mobileBuildCommit: null` rather than an inferred value. |
| MOBILE-QA-153-05 | PASS | Focused regression and source inspection confirm `MOBILE_BUILD_COMMIT` is passed only to the child Expo process and interactive output remains inherited. |
| MOBILE-QA-153-06 | PASS | Source/targeted test confirms the app mount marker is development-only and bounded to a commit hash or `unverified`; it contains no origin, credential, wallet, signing, submission, or transaction data. |
| MOBILE-QA-153-07 | BLOCKED | API 37 cold-launches the exact verified Metro bundle and logs `Running "main"`, but neither `ReactNativeJS`, device log, nor Metro output contains `[MOBILE_BUILD] commit=290933…`. The required immutable device-log proof is therefore absent. |

## Commands and regression evidence

| MOBILE-QA check | Result | Evidence |
| --- | --- | --- |
| Commit scope / whitespace | PASS | `git diff --check f73c3a0..290933f` exits 0; nine files match the DEV handoff. |
| Focused provenance regression | PASS | `jest --runInBand --runTestsByPath src/__tests__/build-provenance.test.ts`: 1 suite / 7 tests pass. |
| TypeScript | PASS | `tsc --noEmit` exits 0 in the clean pinned checkout. |
| Local source ESLint | PASS | `eslint app src` exits 0 without findings in the clean pinned checkout. |
| Full Jest | FAIL / P2 | 79 suites / 393 tests pass; `src/__tests__/primary-a11y.test.ts` fails two indentation-sensitive `toContain` expectations. Reproduced unchanged at base `f73c3a0`: inherited, not caused by MOBILE-153, but still a release gate failure. |
| Expo public config | PASS | Android/iOS/web config, `terminaldex` scheme/filter, ATS denial, plugins, and the supplied provenance hash resolve correctly. |
| Android bundle export | PASS with P3 warning | Android export completes: 1 Hermes bundle and 46 assets. Existing non-fatal Noble `./crypto.js` exports-map fallback persists. Generated output is outside the repository. |
| Expo Doctor | SKIP | No local `expo-doctor` executable; no package install/download attempted. |
| API 37 runtime | BLOCKED | Clean `dev:verified --localhost --port 8093` starts and serves a bundle; ADB reverse plus a cold deep link reports `TotalTime: 4647` and React Native mounts. The first warm delivery produced `DevLauncherAppLoader` `App react context shouldn't be created before`; cold retry avoids it. No current-marker evidence, safe retained screenshot, or certifying accessibility traversal exists. |

## Findings and carry-forward

### MOBILE-QA-001 — P3 / process traceability

- Status: RESOLVED. MOBILE-only boundary and selective-staging guidance remain in `AGENTS.md`.
- Affected files: `AGENTS.md`. Regression risk: low. Exact NEXT_DEV_ACTION: none. WEB contract blocker: none.

### MOBILE-QA-002 — P2 / release-certification blocker — immutable Android marker absent

- Status: OPEN (updated). Exact source and Metro provenance are established, and API 37 mounts `main` after a cold start, but the required `[MOBILE_BUILD] commit=<exact HEAD>` device/Metro marker never appears. A warm deep-link delivery also crashes the installed, pre-M153 development client in Expo DevLauncher before JS mounts.
- Affected files: `app/_layout.tsx`; `app.config.js`; Android development-client/runtime. Regression risk: no immutable proof for UI, routing, recovery, large-text, TalkBack, or quote evidence.
- Reproduction: start clean `npm run dev:verified -- --localhost --port 8093`; `adb reverse tcp:8093 tcp:8093`; cold-open `terminaldex://expo-development-client/?url=exp://127.0.0.1:8093`; inspect `ReactNativeJS` and Metro logs.
- Exact NEXT_DEV_ACTION: rebuild/install a development client matching immutable MOBILE-153, cold and warm launch it against `dev:verified`, and preserve a safe log showing the exact marker before completing accessibility and recovery checks. WEB contract blocker: none.

### MOBILE-QA-003 — P2 / clean immutable regression isolation

- Status: RESOLVED / superseded. A clean pinned checkout is now available and was used for TypeScript, lint, focused testing, config, full Jest, and Android export. The release-gate failure is separately tracked as MOBILE-QA-005.
- Affected files: concurrent primary worktree. Regression risk: low for MOBILE-153 evidence. Exact NEXT_DEV_ACTION: retain isolated-checkout practice while concurrent slices are active. WEB contract blocker: none.

### MOBILE-QA-004 — P3 / dependency warning — Noble hashes export fallback

- Status: OPEN / unchanged. Android export still falls back to file resolution for nested `@noble/hashes/crypto.js`, but completes.
- Affected files: transitive `@solana/wallet-standard-util` dependency tree. Regression risk: a future Metro/package update could convert this warning into failure.
- Exact NEXT_DEV_ACTION: assess a compatible upstream dependency update in an isolated MOBILE dependency slice. WEB contract blocker: none.

### MOBILE-QA-005 — P2 / release-gate failure — stale indentation-coupled accessibility assertions

- Status: OPEN (inherited; independently reproduced at `f73c3a0` and `290933f`). `primary-a11y.test.ts` expects two exact indentation strings around `publicErrorMessage` in `app/(tabs)/monitor.tsx` and `app/copytrade.tsx`; the private-error behavior remains present, but both assertions fail.
- Affected files: `src/__tests__/primary-a11y.test.ts`, `app/(tabs)/monitor.tsx`, `app/copytrade.tsx`. Regression risk: full Jest cannot certify release and source formatting can produce false failures.
- Exact NEXT_DEV_ACTION: replace only the brittle whitespace-coupled assertions with semantic privacy/mutation checks, then rerun the focused test and complete full suite. WEB contract blocker: none.

## Throughput and release recommendation

- Findings inspected/reconciled: 11 stable MOBILE-QA IDs (seven MOBILE-153 outcomes plus four standing/release findings).
- DEV outcomes available: 7; independently assessed: 7; PASS: 6; FAIL: 0; BLOCKED: 1; SKIP: 0; NOT_APPLICABLE: 0.
- Required 20-outcome shortfall: 13. The DEV delta exposes seven material outcomes; no cosmetic finding was added to fill the gap. Stable blocked/skipped IDs: `MOBILE-QA-002`, `MOBILE-QA-004`, `MOBILE-QA-005`, and Expo Doctor SKIP.
- Carry-forward order: `MOBILE-QA-005` (restore clean full suite), `MOBILE-QA-002` (matching dev client plus exact marker), `MOBILE-QA-004` (upstream warning).

**MOBILE-QA NO-GO for release certification.** MOBILE-153 source, configuration, launcher, lint, TypeScript, and Android bundling are sound. Do not claim release readiness until the full Jest gate is restored and the API 37 session emits the exact immutable build marker; no transaction, signing, submission, trading, or CopyTrade activation was exercised or enabled.

## Safe evidence references

- No screenshot or raw accessibility dump was retained. The transient dump triggered the privacy filter, so its contents were discarded.
- Device evidence retained only as non-sensitive command outcomes: cold launch `TotalTime: 4647`, React Native `Running "main"`, and the bounded DevLauncher exception class above.
- No WEB code, backend state, secrets, production data, product source, tests, or configuration was modified.
