# MOBILE-QA — MOBILE-155 immutable test-count evidence correction

- Run (UTC): `2026-08-25T22:49:37Z`.
- Scope: canonical `C:\Tuan\devApps\teminal-dex-app` only. CWD and Git top-level normalized to that workspace. `AGENTS.md`, the DEV handoff, requirements checklist, worklog, final audit, Git history/status, prior QA handoff, package scripts, and public Expo configuration were inspected. No WEB workspace, backend, signing, submission, trading, CopyTrade activation, secrets, or production state was accessed or changed.
- Inspected immutable DEV result: `c550705c6a43c91cae5f68138d26ddb94b2f84bd` (`docs(release): correct immutable test evidence`), MOBILE-155; base `0b0c12b`. This delta changes only release-evidence documents. The primary worktree also contains an unrelated uncommitted Whales/token-logo slice (six tracked paths and four handoffs/component paths); it was preserved and excluded.
- Isolation/environment: detached QA worktree at `C:\Tuan\devApps\teminal-dex-app\.mobile-qa-c550705`, Windows 10.0.26100, bundled Node 24.19.0, root-local package executables. The pinned checkout stayed clean at the inspected SHA. Its launcher emitted that SHA before stopping because a detached worktree has no local `node_modules`; this is an environment/setup limitation, not runtime-launch evidence.

## Acceptance result

| MOBILE-155 acceptance criterion | Result | Independent evidence |
| --- | --- | --- |
| Correct immutable suite evidence to 80 suites / 395 tests | PASS | Clean pinned full Jest exits 0: 80 suites, 395 tests. |
| Attribute the two-test difference to the separate concurrent TokenRow slice | PASS | `git show c550705:src/__tests__/TokenRow.test.tsx` contains 8 `it(...)` blocks; the primary dirty worktree contains 10. |
| Preserve MOBILE-154-F1 semantic accessibility regression | PASS | `primary-a11y.test.ts` exits 0: 68 tests. |
| TypeScript release gate | PASS | `tsc --noEmit` exits 0. |
| Source ESLint release gate | PASS | `eslint app src` exits 0 with no findings. |
| Public platform/security configuration remains valid | PASS | Expo public config exits 0; `terminaldex` scheme, Android VIEW intent and biometric permissions, and iOS ATS arbitrary-load denial are present. |
| Exact-build Android startup/navigation/accessibility evidence | BLOCKED | `adb.exe devices -l` returned no device list or diagnostic output after 90 seconds; no emulator/device evidence was fabricated. |

## Findings and reconciliation

| MOBILE-QA finding | Status | Evidence / NEXT_DEV_ACTION |
| --- | --- | --- |
| MOBILE-QA-009: immutable full-test count variance | RESOLVED / P3 | MOBILE-155 correctly states 80 suites / 395 tests for immutable MOBILE-154-F1. The separate dirty TokenRow slice accounts for the 397 primary-worktree count. NEXT_DEV_ACTION: preserve this attribution until the concurrent slice has its own immutable result. |
| MOBILE-QA-007: semantic ordering assertions | RESOLVED / P1 | Focused 68/68 and full 80/395 rerun pass at the corrected immutable result. NEXT_DEV_ACTION: none for this closed regression. |
| MOBILE-QA-154-01 through MOBILE-QA-154-15: primary-route Pressable roles | PASS | Fifteen distinct parameterized route assertions pass in the focused accessibility suite. |
| MOBILE-QA-154-16 through MOBILE-QA-154-30: primary-route TextInput labels | PASS | Fifteen distinct parameterized route assertions pass in the focused accessibility suite. |
| MOBILE-QA-154-31: scalable Whale tab rail | PASS | Focused assertion confirms scalable text and accessible horizontal recovery. |
| MOBILE-QA-154-32 through MOBILE-QA-154-34: Discover/Trenches/Portfolio private read errors | PASS | Three distinct public-error boundary assertions pass. |
| MOBILE-QA-154-35: Monitor creation-form immutability | PASS | Focused pending-state assertion passes. |
| MOBILE-QA-154-36 through MOBILE-QA-154-41: auxiliary private-error boundaries | PASS | Six distinct error-redaction assertions pass. |
| MOBILE-QA-154-42: CopyTrade pending-form immutability | PASS | Focused pending-state assertion passes. |
| MOBILE-QA-002: exact immutable Android marker, navigation, large text, TalkBack, recovery | BLOCKED / P2 | SDK ADB discovery remained silent after 90 seconds. NEXT_DEV_ACTION: provide a responsive API 37 emulator or physical Android development build, then capture the exact `[MOBILE_BUILD]` marker and exercise navigation, offline/retry, large text, and TalkBack. |
| MOBILE-QA-004: Noble hashes exports-map fallback | OPEN / P3 (carried) | No export was rerun because MOBILE-155 has no source/config delta; prior evidence is non-fatal. NEXT_DEV_ACTION: resolve or formally accept the dependency warning in an immutable build-focused slice. |
| MOBILE-QA-008: Expo Doctor availability | BLOCKED / P3 (carried) | `node_modules/expo-doctor/build/index.js` is absent in the pinned checkout. NEXT_DEV_ACTION: restore a locally executable Doctor diagnostic lane without changing release evidence retrospectively. |
| MOBILE-QA-010: verified-launcher execution from isolated checkout | SKIP / P3 | `start-verified.mjs --help` printed `c550705…`, then could not resolve the isolated checkout's missing local Expo CLI. This is not a product failure and supplied no runtime claim. NEXT_DEV_ACTION: run the launcher only after dependency installation in a clean isolated checkout. |

## Commands and safe evidence

- `git diff c550705^ c550705` — documentation-only MOBILE-155 delta.
- `git show c550705:src/__tests__/TokenRow.test.tsx` and current primary-file inspection — PASS, 8 immutable versus 10 dirty-worktree test blocks.
- `node_modules/typescript/bin/tsc --noEmit` — PASS.
- `node_modules/eslint/bin/eslint.js app src` — PASS, no output/findings.
- `node_modules/jest/bin/jest.js --runInBand --runTestsByPath src/__tests__/primary-a11y.test.ts` — PASS, 68/68.
- `node_modules/jest/bin/jest.js --runInBand` — PASS, 80 suites / 395 tests. One existing SnipeCard React `act(...)` console warning was emitted; it did not fail the suite and is not attributable to this documentation-only delta.
- `node_modules/expo/bin/cli config --type public --json` — PASS.
- Android SDK `adb.exe devices -l` — BLOCKED after 90 seconds with no output; no screenshot/log is available.

## Throughput and release recommendation

- Findings inspected/reconciled: 68 distinct focused accessibility/privacy/control outcomes plus five independent release/config/count checks and four carried/blocked diagnostic findings. The 68 focused assertions are distinct routes or behavioral boundaries, not viewport variants or duplicated defects.
- Current DEV outcomes available: 1 material evidence correction. Outcomes independently verified: 1 PASS; FAIL: 0; BLOCKED: 0; SKIP/NOT_APPLICABLE: runtime-only lanes listed separately.
- 20/20 shortfall: 19 material DEV outcomes are unavailable in this documentation-only delta. Carry-forward order: (1) `MOBILE-QA-002` responsive Android/physical-device certification, (2) immutable QA of the separate Whales/token-logo slice only after its DEV commit and handoff, (3) `MOBILE-QA-004` dependency-warning disposition, (4) `MOBILE-QA-008` Expo Doctor lane, then (5) `MOBILE-QA-010` clean-checkout launcher run with locally installed dependencies.

**MOBILE-QA automated GO for MOBILE-155 evidence correction; overall release remains CONDITIONAL NO-GO.** The count variance is closed, but device-owned accessibility/recovery and immutable runtime-marker evidence remain outstanding. No product code, tests, configuration, WEB files, or external state was modified.
