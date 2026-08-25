# MOBILE-QA — MOBILE-154 semantic accessibility release gate

- Run (UTC): `2026-08-25T20:50:49Z`.
- Scope: canonical `C:\Tuan\devApps\teminal-dex-app` only. CWD and Git top-level resolved to that workspace. `AGENTS.md`, DEV handoff, checklist, worklog, final audit, Git history/status, prior QA report, and current runtime/tooling state were inspected. No WEB workspace or backend was accessed or changed.
- Inspected immutable DEV result: `e84603b8ae5ede350ca75ae59b9f7142376f4064` (`test(a11y): restore semantic privacy gate`), MOBILE-154; base `ff9ac32`. The primary worktree concurrently contains the separate uncommitted Whales/logo slice, so all command evidence below was collected from a clean detached checkout pinned exactly to `e84603b`.
- Environment: Windows 10.0.26100; bundled Node runtime; clean checkout at `%TEMP%\mobile-qa-e84603b-run2`; no ADB on PATH and no Expo Doctor package installed. No device, network, signing, submission, trading, or CopyTrade activation was exercised.

## Acceptance result

| MOBILE-154 acceptance criterion | Result | Independent evidence |
| --- | --- | --- |
| Monitor sanitizer assertion is whitespace-tolerant | PASS | The new `publicErrorMessage(\s*toggle.error ?? remove.error` matcher is present and its privacy assertion passes. |
| CopyTrade sanitizer assertion is whitespace-tolerant | PASS | The new `publicErrorMessage(\s*pause.error ?? remove.error` matcher is present and its privacy assertion passes. |
| Focused accessibility Jest: 68/68 | FAIL | `primary-a11y.test.ts`: 66 pass, 2 fail. |
| Full Jest: 80 suites / 397 tests | FAIL | 79 suites pass / 1 fails; 393 tests pass / 2 fail (395 total), exit 1. |
| TypeScript | PASS | `tsc --noEmit` exits 0. |
| Source ESLint | PASS | `eslint app src` exits 0 with no findings. |

## MOBILE-QA-007 — P1 / remaining indentation-coupled release assertions

- Status: OPEN; regression of the stated semantic release-gate objective.
- Evidence: the commit makes only the two sanitizer-call checks whitespace-tolerant. In the same file, line 56 still requires the exact Monitor string `remove.reset();\n    toggle.mutate();`, and line 88 still requires the exact CopyTrade string `remove.reset();\n    pause.mutate();`. The committed screen formatting uses a different indentation, so both tests fail even though the reset/mutate behavior exists.
- Affected files: `src/__tests__/primary-a11y.test.ts`; assertions inspect `app/(tabs)/monitor.tsx` and `app/copytrade.tsx` without a product-code defect demonstrated.
- Reproduction: in a clean checkout of `e84603b`, run `node node_modules/jest/bin/jest.js --runInBand --runTestsByPath src/__tests__/primary-a11y.test.ts`; expect 66 pass / 2 fail. Run the same Jest executable with only `--runInBand`; expect 79 suites / 393 tests pass and this one suite to fail.
- Severity/priority: P1 release gate; user-facing privacy behavior is not shown broken, but the claimed formatting-independent regression protection and full release suite are not restored.
- Regression risk: medium. Further non-semantic formatting can still red-gate the build or lead future maintainers to weaken the wrong tests.
- Exact NEXT_DEV_ACTION: replace the four remaining exact newline/indentation `toContain` checks for `toggleAlert`, `removeAlert`, `pauseStrategy`, and `removeStrategy` with narrowly scoped whitespace-tolerant matchers that still require reset-before-mutate ordering; retain the privacy and mutual-exclusion assertions. Commit the isolated MOBILE-154 follow-up, update the DEV handoff with its exact hash, then request QA rerun.
- WEB contract blocker: none.

## Regression and platform evidence

| MOBILE-QA finding | Status | Evidence / disposition |
| --- | --- | --- |
| MOBILE-QA-154-01 through -15: explicit Pressable role on each audited primary route | PASS | All 15 parameterized primary-route checks passed. |
| MOBILE-QA-154-16 through -30: accessible TextInput label on each audited primary route | PASS | All 15 parameterized primary-route checks passed. |
| MOBILE-QA-154-31: Whale scalable tab rail | PASS | Focused assertion passed: no font-scaling suppression and accessible horizontal tab rail retained. |
| MOBILE-QA-154-32 through -34: Discover, Trenches, and Portfolio raw read-error privacy | PASS | All three focused assertions passed. |
| MOBILE-QA-154-35: Monitor form immutability while pending | PASS | Focused assertion passed. |
| MOBILE-QA-154-36 through -41: auxiliary private read-error boundaries | PASS | All six focused assertions passed. |
| MOBILE-QA-154-42: CopyTrade form immutability while pending | PASS | Focused assertion passed. |
| MOBILE-QA-154-43: exact immutable development provenance launcher | PASS | `scripts/start-verified.mjs --help` printed exact `e84603b…` before Expo help. |
| MOBILE-QA-154-44: public Expo config and Android security/intent contract | PASS | Expo public config exits 0; Android package, `terminaldex` VIEW intent and biometric permissions, and iOS ATS denial are present. |
| MOBILE-QA-154-45: Android bundle | PASS | Expo Android export succeeds: 1 bundle, 46 assets. |
| MOBILE-QA-154-46: iOS bundle | PASS | Expo iOS export succeeds: 1 bundle, 42 assets. |
| MOBILE-QA-154-47: web routing bundle | PASS | Expo web export succeeds with 25 static routes, including primary tabs, auxiliary routes, token and trade patterns. |
| MOBILE-QA-004: Noble hashes exports-map fallback | OPEN / P3 | Reproduced in all three exports; bundles complete. Upstream dependency warning remains non-fatal. |
| MOBILE-QA-002: exact immutable Android marker/device flow | BLOCKED / P2 | No `adb` executable/device is available, so no exact `MOBILE_BUILD` log, navigation, loading/stale/empty/offline/retry, paging, large-text, TalkBack, or partial-page recovery session could be evidenced. |
| MOBILE-QA-008: Expo Doctor availability | BLOCKED / P3 | `node_modules/expo-doctor/build/index.js` is absent; no current Doctor run can be claimed. |

## Commands and safe artifacts

- `node node_modules/typescript/bin/tsc --noEmit` — PASS.
- `node node_modules/eslint/bin/eslint.js app src` — PASS.
- `node node_modules/jest/bin/jest.js --runInBand --runTestsByPath src/__tests__/primary-a11y.test.ts` — FAIL, 66/68 pass; safe console output only.
- `node node_modules/jest/bin/jest.js --runInBand` — FAIL, 79/80 suites and 393/395 tests pass; only `MOBILE-QA-007` fails.
- `node node_modules/expo/bin/cli config --type public` — PASS.
- `node node_modules/expo/bin/cli export --platform android|ios|web` — PASS; temporary outputs only, no screenshot or device log exists.
- `node scripts/start-verified.mjs --help` — PASS; printed the exact inspected commit.

## Throughput and release recommendation

- Findings inspected/reconciled: 47 distinct evidence-backed MOBILE-QA checks in this run (30 route semantics, six auxiliary/privacy checks, five form/provenance/config checks, three bundles, and three standing blockers/findings). No finding was created from a viewport-only variation.
- Current DEV outcomes available: 2 semantic assertion changes; outcomes independently verified: 2; PASS: 0; FAIL: 2; BLOCKED: 0; SKIP/NOT_APPLICABLE: device-only interaction and Doctor checks as recorded above.
- 20/20 DEV-outcome shortfall: 18. The committed increment contains only two material changes; `MOBILE-QA-007` blocks both. Carry-forward order: (1) close `MOBILE-QA-007` with a committed semantic follow-up, (2) rerun full Jest clean, (3) obtain exact current Android marker and device accessibility/recovery evidence for `MOBILE-QA-002`, (4) resolve or formally accept `MOBILE-QA-004`, (5) restore an Expo Doctor-capable diagnostic lane.

**MOBILE-QA NO-GO.** The full regression gate fails. The separate uncommitted Whales/logo slice was not tested, changed, staged, or attributed to MOBILE-154. No transaction signing, submission, trading, CopyTrade activation, backend mutation, secrets, or WEB changes were exercised or enabled.
