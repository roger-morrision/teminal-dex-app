# MOBILE-QA validation handoff — MOBILE-159

- Run: 2026-08-26T02:54:08Z
- Inspected DEV commit: `a1b057ca26cd79838e22dbfe512b83ac76dd962d` (`chore(expo): align SDK 57 patch versions`); base `c6ea00c`.
- Scope: PASS. `cwd` and Git top-level resolve to `C:\Tuan\devApps\teminal-dex-app`. The primary worktree has an unrelated dirty Whales/token-logo/MOBILE-to-WEB slice, so validation used a clean detached checkout of the exact DEV commit with the repository's installed dependencies. No product code, test, or configuration was edited.
- Environment: Windows; bundled Node; `%LOCALAPPDATA%\Temp\mobile-qa-159-a1b057c-2`; `adb devices -l` did not return within 90 seconds. No device outcome was inferred.

## Acceptance results

| DEV criterion | Result | Independent evidence |
| --- | --- | --- |
| Expo 57 patch alignment | PASS | Declared `~57.0.16`, locked `57.0.16`; local `expo install --check` exited 0. |
| Constants patch alignment | PASS | Declared `~57.0.14`, locked `57.0.14`; live diagnostic passed. |
| Dev Client patch alignment | PASS | Declared `~57.0.15`, locked `57.0.15`; live diagnostic passed. |
| Router patch alignment | PASS | Declared `~57.0.16`, locked `57.0.16`; live diagnostic passed. |
| Local quality command contract | PASS | `package-scripts.test.ts` 6/6, including no implicit `npx`/global resolution. |
| TypeScript and source ESLint | PASS | `tsc --noEmit` and `eslint app src` exited 0. |
| Immutable regression suite | PASS with finding | 81 suites / 401 tests passed; one React `act()` warning is `MOBILE-QA-013`. |
| Public Expo config | PASS | Android/iOS/web resolve; iOS ATS remains HTTPS-only and Android has biometric-only permissions. |
| Android export | CONDITIONAL PASS | 1 Hermes bundle / 46 assets; known Noble warning remains `MOBILE-QA-004`. |
| iOS export | PASS | 1 bundle / 23 assets. |
| Web export | PASS | 1 static bundle / 20 output files. |

## MOBILE-QA reconciled finding inventory (20)

| ID | Result | Evidence and exact next action |
| --- | --- | --- |
| MOBILE-QA-001 | PASS | DEV delta is package/lockfile/release-doc only; no API, UI, signing, submission, trading, or CopyTrade activation path changed. |
| MOBILE-QA-002 | BLOCKED P1 | ADB discovery non-responsive at 90 seconds. **NEXT_DEV_ACTION:** provide a responsive Android target with exact `a1b057c` development build/marker. |
| MOBILE-QA-003 | PASS | QA checkout was pinned before evidence; concurrent primary-worktree changes were excluded. |
| MOBILE-QA-004 | CONDITIONAL PASS P2 | Android export succeeds but logs Noble `./crypto.js` strict-exports fallback; focused guard passes 5/5. **NEXT_DEV_ACTION:** retain audited disposition; remediate only with full platform revalidation. |
| MOBILE-QA-005 | PASS | Full immutable Jest gate passed 81/401. |
| MOBILE-QA-006 | RESOLVED | No mixed-state test evidence: pinned commit remained stable throughout the QA run. |
| MOBILE-QA-007 | PASS | Semantic accessibility ordering gate remains green within full Jest. |
| MOBILE-QA-008 | BLOCKED P2 | Local CLI rejects `expo doctor`; no standalone `expo-doctor` executable is installed. **NEXT_DEV_ACTION:** add/run an isolated repository-local Doctor evidence lane. |
| MOBILE-QA-009 | PASS | Immutable count is 81 suites / 401 tests, matching MOBILE-159 handoff. |
| MOBILE-QA-010 | BLOCKED P2 | No physical-device TalkBack/VoiceOver, dynamic-type, offline/reconnect, background/restore, or performance evidence. **NEXT_DEV_ACTION:** execute the device matrix after QA-002. |
| MOBILE-QA-011 | BLOCKED P2 | DEV reports 11 moderate audit findings, but this runtime has no `npm`/local npm CLI to obtain exact advisory IDs. **NEXT_DEV_ACTION:** capture `npm audit --package-lock-only --json` in isolated dependency maintenance; do not auto-remediate. |
| MOBILE-QA-012 | PASS | `diagnostics:expo` command contract passes 6/6 and live compatibility check reports dependencies up to date. |
| MOBILE-QA-013 | FAIL P2 | Full Jest output has one `console.error`: “An update to SnipeCard inside a test was not wrapped in act(...)”. Focused SnipeCard is 3/3 and warning-free, indicating full-suite/order settlement risk. Affected: `src/__tests__/SnipeCard.test.tsx`. **NEXT_DEV_ACTION:** reproduce under full ordering, await/flush pending query update, then require warning-free full run. |
| MOBILE-QA-014 | PASS | Exact-checkout TypeScript compilation succeeded. |
| MOBILE-QA-015 | PASS | Exact-checkout source-owned ESLint succeeded with zero reported warnings/errors. |
| MOBILE-QA-016 | PASS | Public config has no secret/endpoint leakage and preserves deep-link and native privacy boundaries. |
| MOBILE-QA-017 | PASS | Android bundled without unresolved-module failure (1 Hermes/46 assets). |
| MOBILE-QA-018 | PASS | iOS bundled successfully (1 bundle/23 assets). |
| MOBILE-QA-019 | PASS | Static web export succeeded (1 bundle/20 files). |
| MOBILE-QA-020 | PASS | All four SDK dependency declarations and lock entries agree with the live compatibility diagnostic. |

## Commands/evidence

```text
expo install --check                              PASS: Dependencies are up to date
tsc --noEmit                                      PASS
eslint app src                                    PASS
jest package-scripts                              PASS 6/6
jest noble-bundle-compatibility                   PASS 5/5
jest --ci --runInBand                             PASS 81 suites / 401 tests; one act() warning
expo config --type public                         PASS
expo export --platform android                    CONDITIONAL PASS: 1 bundle / 46 assets
expo export --platform ios                        PASS: 1 bundle / 23 assets
expo export --platform web                        PASS: 1 bundle / 20 files
expo doctor                                       BLOCKED: unsupported by local CLI
adb devices -l                                    BLOCKED: no response in 90 seconds
```

The initial sandboxed diagnostic could not open Expo's user native-module cache (`EPERM`); a repeat in its normal cache context passed. This is environment permission evidence, not a package incompatibility. Full-suite log: `%LOCALAPPDATA%\Temp\mobile-qa-159-a1b057c-2\mobile-qa-full-jest.stderr.log`.

## Release recommendation

**MOBILE-QA: NO-GO.** SDK patch alignment is accepted, but release is blocked by `MOBILE-QA-013` (full-suite test warning), `MOBILE-QA-002`/`010` (no exact-device evidence), `MOBILE-QA-008` (Doctor unavailable), and `MOBILE-QA-011` (untriaged audit findings). `MOBILE-QA-004` remains conditional, not resolved.

## 20/20 reconciliation

- Findings inspected/reconciled: 20.
- Material DEV outcomes available: 4; independently verified: 4/4 PASS.
- Remaining to 20 DEV outcomes: 16; no padding applied.
- Carry-forward order: `MOBILE-QA-013`, `MOBILE-QA-002`, `MOBILE-QA-010`, `MOBILE-QA-008`, `MOBILE-QA-011`, `MOBILE-QA-004`.
