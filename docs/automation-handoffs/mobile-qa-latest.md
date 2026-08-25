# MOBILE-QA — MOBILE-154-F1 semantic ordering follow-up

- Run (UTC): `2026-08-25T21:50:54Z`.
- Scope: canonical `C:\Tuan\devApps\teminal-dex-app` only. CWD and Git top-level resolved to that workspace. `AGENTS.md`, DEV handoff, requirements checklist, worklog, final audit, Git history/status, prior QA report, and current tooling were inspected. No WEB workspace or backend was accessed or changed.
- Inspected immutable DEV result: `e0a74cf84b4fadf42e80e70affc66dbc8f18c1a6` (`test(a11y): complete semantic ordering checks`), MOBILE-154-F1; base `7080d95`. The primary worktree contains a separate uncommitted Whales/logo slice, which was preserved and excluded. All gates ran from a clean detached checkout pinned to this exact commit at `%TEMP%\mobile-qa-e0a74cf-run3`; generated exports stayed there.
- Environment: Windows 10.0.26100; bundled Node 24.19.0; local package executables; Android SDK `adb.exe` exists outside PATH but did not return from `adb devices -l` within 60 seconds. No responsive device/emulator session, network contract, signing, submission, trading, or CopyTrade activation was exercised.

## Acceptance result

| MOBILE-154-F1 acceptance criterion | Result | Independent evidence |
| --- | --- | --- |
| Monitor reset-before-toggle semantic ordering is whitespace-tolerant | PASS | Matcher now permits whitespace while requiring `remove.reset()` before `toggle.mutate()`. |
| Monitor reset-before-remove semantic ordering is whitespace-tolerant | PASS | Matcher now permits whitespace while requiring `toggle.reset()` before `remove.mutate()`. |
| CopyTrade reset-before-pause semantic ordering is whitespace-tolerant | PASS | Matcher now permits whitespace while requiring `remove.reset()` before `pause.mutate()`. |
| CopyTrade reset-before-remove semantic ordering is whitespace-tolerant | PASS | Matcher now permits whitespace while requiring `pause.reset()` before `remove.mutate()`. |
| Focused accessibility Jest: 68/68 | PASS | `primary-a11y.test.ts`: 68 passed, exit 0. |
| TypeScript | PASS | `tsc --noEmit` exits 0. |
| Source ESLint | PASS | `eslint app src` exits 0 with no findings. |
| Full Jest: 80 suites / stated 397 tests | PASS with documentation variance | 80 suites and 395 tests pass, exit 0; current test inventory is 395, not the handoff's stated 397. |

## Findings and reconciliation

| MOBILE-QA finding | Status | Evidence / disposition |
| --- | --- | --- |
| MOBILE-QA-007: indentation-coupled semantic release assertions | RESOLVED | Four ordering matchers are narrowly whitespace-tolerant and retain the required reset-before-mutate ordering. Focused 68/68 and full 80/395 regressions pass. |
| MOBILE-QA-154-01 through -15: primary-route Pressable roles | PASS | All 15 parameterized route checks pass in the focused suite. |
| MOBILE-QA-154-16 through -30: primary-route TextInput labels | PASS | All 15 parameterized route checks pass in the focused suite. |
| MOBILE-QA-154-31: Whale scalable tab rail | PASS | Focused test confirms no font-scaling suppression and accessible horizontal recovery. |
| MOBILE-QA-154-32 through -34: Discover, Trenches, Portfolio private read errors | PASS | All three focused checks pass. |
| MOBILE-QA-154-35: Monitor pending-form immutability | PASS | Focused test passes. |
| MOBILE-QA-154-36 through -41: auxiliary private-error boundaries | PASS | All six focused checks pass. |
| MOBILE-QA-154-42: CopyTrade pending-form immutability | PASS | Focused test passes. |
| MOBILE-QA-154-43: immutable provenance launcher | PASS | `start-verified.mjs --help` prints exact inspected commit `e0a74cf…` before Expo help. |
| MOBILE-QA-154-44: public configuration/security intent contract | PASS | Public config returns exit 0; `terminaldex` scheme, Android VIEW intent, biometric permissions, and iOS ATS arbitrary-load denial are present. |
| MOBILE-QA-154-45: Android bundle | PASS | Expo Android export succeeds: one bundle and 46 assets. |
| MOBILE-QA-154-46: iOS bundle | PASS | Expo iOS export succeeds: one bundle and 23 assets. |
| MOBILE-QA-154-47: web bundle | PASS | Expo web export succeeds: one web bundle and static-router metadata. No browser/device navigation evidence was produced. |
| MOBILE-QA-002: exact immutable Android marker, navigation, recovery, large text, TalkBack | BLOCKED / P2 | SDK `adb.exe` is present but `adb devices -l` produced no result within 60 seconds; no device evidence, exact `[MOBILE_BUILD]` marker, or safe screenshot/log exists. |
| MOBILE-QA-004: Noble hashes exports-map fallback | OPEN / P3 | Android export repeats the non-fatal `@noble/hashes` `./crypto.js` exports-map fallback; bundle completes. |
| MOBILE-QA-008: Expo Doctor availability | BLOCKED / P3 | `node_modules/expo-doctor/build/index.js` is absent, so a current Doctor check cannot be claimed. |
| MOBILE-QA-009: full-test acceptance count variance | OPEN / P3 | DEV handoff claims 397 tests; the clean successful full suite contains 395. No test failure exists, but the acceptance/evidence documents need the exact count corrected. |

## Commands and safe artifacts

- `node_modules/typescript/bin/tsc --noEmit` — PASS.
- `node_modules/eslint/bin/eslint.js app src` — PASS, no output/findings.
- `node_modules/jest/bin/jest.js --runInBand --runTestsByPath src/__tests__/primary-a11y.test.ts` — PASS, 68/68.
- `node_modules/jest/bin/jest.js --runInBand` — PASS, 80 suites / 395 tests.
- `node_modules/expo/bin/cli config --type public --json` — PASS.
- `node scripts/start-verified.mjs --help` — PASS; exact pinned commit printed.
- `node_modules/expo/bin/cli export --platform android|ios|web` — PASS; temporary outputs only. Android retains only the non-fatal Noble warning; iOS/web emitted only environment `NO_COLOR` notices.

## Throughput and release recommendation

- Findings inspected/reconciled: 68 distinct, evidence-backed MOBILE-QA checks: 68 focused accessibility/privacy/control assertions, plus independently executed release/config/bundle/device diagnostic lanes. The 68 assertions are distinct controls/routes/boundaries, not viewport variations.
- Current DEV outcomes available: 4 semantic-ordering assertion changes. Outcomes independently verified: 4; PASS: 4; FAIL: 0; BLOCKED: 0; SKIP/NOT_APPLICABLE: device-only interaction and Doctor lanes as separately recorded.
- 20/20 DEV-outcome shortfall: 16. This immutable DEV delta supplies four material outcomes; no additional outcomes were invented. Carry-forward order: (1) obtain a responsive Android/physical-device session and exact marker for `MOBILE-QA-002`, (2) correct the 395-versus-397 evidence claim in `MOBILE-QA-009`, (3) resolve or formally accept `MOBILE-QA-004`, (4) restore an Expo Doctor-capable diagnostic lane.

**MOBILE-QA automated GO; release certification remains CONDITIONAL NO-GO.** `MOBILE-QA-007` is closed and all automated gates pass. Current-device accessibility/recovery and immutable runtime-marker evidence are still required for a full mobile release recommendation. No product code/tests/configuration, WEB files, transactions, signing, submission, trading, CopyTrade activation, secrets, or backend state were changed.
