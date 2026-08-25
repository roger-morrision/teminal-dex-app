# MOBILE-QA — MOBILE-156 warning-free SnipeCard settlement

- Run (UTC): `2026-08-25T23:54:37Z`.
- Scope: canonical `C:\Tuan\devApps\teminal-dex-app` only. CWD and Git top-level resolve to that workspace. `AGENTS.md`, the DEV handoff, requirements checklist, worklog, final audit, prior QA handoff, package scripts, public Expo config, Git history, and status were inspected. No WEB workspace, backend, signing, submission, trading, CopyTrade activation, secrets, or production state was accessed or changed.
- Inspected immutable DEV result: `4721a17737a1ff1aa182119b3b063cced1911fe0` (`test(research): await SnipeCard evidence settlement`), MOBILE-156; base `a0ae4da`. The result changes two asynchronous test teardowns plus evidence documents; product and configuration code are unchanged. The primary worktree has a separate uncommitted Whales/token-logo slice (six tracked paths and four untracked handoff/component paths); it was preserved and excluded from immutable certification.
- Isolation/environment: clean archive of the pinned SHA at `%LOCALAPPDATA%\Temp\mobile-qa-ab155e31-1527-449f-8728-0e138393561c`, Windows 10.0.26100, bundled Node 24.19.0, and root-local package executables. The isolated source was linked read-only to the existing dependency directory. All exports wrote only under that temporary location.

## Acceptance result

| MOBILE-156 acceptance criterion | Result | Independent evidence |
| --- | --- | --- |
| Initial SnipeCard research/removal query settles before teardown | PASS | Focused `SnipeCard.test.tsx` exits 0; the research/open and remove boundary passes after the new `waitFor(fetchTokenDetail)` settlement. |
| Initial SnipeCard visual-threshold query settles before teardown | PASS | Focused test exits 0; positive threshold persistence passes after the new settlement wait. |
| Focused suite is warning-free | PASS | Focused result is 1 suite / 3 tests; final immutable full-result stdout/stderr contains no `act(`, overlapping-act, or warning match. |
| Immutable full regression remains 80 suites / 395 tests | PASS | JSON result reports 80/80 suites and 395/395 tests, zero failed tests, `wasInterrupted: false`. |
| TypeScript release gate | PASS | `tsc --noEmit` exits 0. |
| Source ESLint release gate | PASS | `eslint app src` exits 0 with no findings. |
| Public platform/security configuration remains valid | PASS | Expo public config exits 0; `terminaldex` scheme, Android VIEW intent and biometric permissions, and iOS ATS arbitrary-load denial are present. |
| Android/iOS/web bundle compilation | PASS with carried warning | Android exports 1 Hermes bundle/46 assets (48 files); iOS exports 1 Hermes bundle/23 assets (25 files); web exports 1 Metro JS bundle (20 files). Android still emits the non-fatal Noble exports-map fallback. |
| Exact-build Android startup, navigation, accessibility, large text, offline/retry | BLOCKED | `adb.exe devices -l` produced no output before the 30-second bounded command timeout. A targetable API 37 emulator window exists but exposed no accessibility text and only a non-app wallpaper observation; it cannot prove the pinned bundle or any UI flow. |

## Findings and reconciliation

| MOBILE-QA finding | Status | Evidence / affected files / exact NEXT_DEV_ACTION |
| --- | --- | --- |
| MOBILE-QA-156-01: research/removal async settlement | PASS / P2 | Affected `src/__tests__/SnipeCard.test.tsx`. The first changed case now completes its initial token-detail query before teardown and retains distinct research/remove behavior. NEXT_DEV_ACTION: none. |
| MOBILE-QA-156-02: threshold async settlement | PASS / P2 | Affected `src/__tests__/SnipeCard.test.tsx`. The changed threshold case persists `2.5` then completes its initial token-detail query before teardown. NEXT_DEV_ACTION: none. |
| MOBILE-QA-156-03: failed token-evidence recovery regression | PASS / P2 | The focused third case still reaches retry after a failed first request and resolves on the second request. Regression risk: low; product code is unchanged. NEXT_DEV_ACTION: none. |
| MOBILE-QA-154-01 through MOBILE-QA-154-15: primary-route Pressable semantics | PASS | Fifteen distinct parameterized route assertions remain included in the clean 395-test result. NEXT_DEV_ACTION: none. |
| MOBILE-QA-154-16 through MOBILE-QA-154-30: primary-route TextInput labels | PASS | Fifteen distinct parameterized input-label assertions remain included in the clean result. NEXT_DEV_ACTION: none. |
| MOBILE-QA-154-31: scalable Whale tab rail | PASS | The accessibility regression remains green in the immutable full gate. NEXT_DEV_ACTION: none. |
| MOBILE-QA-154-32 through MOBILE-QA-154-34: Discover/Trenches/Portfolio private read errors | PASS | Three independently tested public-error boundaries remain green. NEXT_DEV_ACTION: none. |
| MOBILE-QA-154-35: Monitor creation-form immutability | PASS | Pending-state control locking remains green. NEXT_DEV_ACTION: none. |
| MOBILE-QA-154-36 through MOBILE-QA-154-41: auxiliary private-error boundaries | PASS | Six independently tested redaction/recovery boundaries remain green. NEXT_DEV_ACTION: none. |
| MOBILE-QA-154-42: CopyTrade pending-form immutability | PASS | Pending-state control locking remains green. NEXT_DEV_ACTION: none. |
| MOBILE-QA-007: semantic ordering assertions | RESOLVED / P1 | Current immutable full gate remains clean at 80/395. NEXT_DEV_ACTION: none. |
| MOBILE-QA-009: immutable full-test count variance | RESOLVED / P3 | MOBILE-156 confirms the immutable count remains 80/395; the excluded concurrent TokenRow slice is not part of this result. NEXT_DEV_ACTION: preserve attribution until that slice has its own DEV handoff. |
| MOBILE-QA-002: exact immutable Android marker, navigation, large text, TalkBack, recovery | BLOCKED / P2 (carried) | Android SDK 37.0.1 is installed, but device discovery did not respond. No runtime, navigation, offline, stale, empty, filtered-empty, error, retry, partial-page recovery, TalkBack, or large-text claim is made. NEXT_DEV_ACTION: restore responsive ADB access to API 37 or provide a physical Android development build, launch the exact verified bundle, capture `[MOBILE_BUILD] commit=4721a177…`, then exercise the listed flows. |
| MOBILE-QA-004: Noble hashes exports-map fallback | OPEN / P3 (carried) | Android export completes but warns that `@noble/hashes` does not export `./crypto.js`; Metro falls back to file-based resolution. NEXT_DEV_ACTION: resolve or formally accept this dependency warning in an immutable build-focused MOBILE slice. |
| MOBILE-QA-008: Expo Doctor availability | BLOCKED / P3 (carried) | `node_modules/expo-doctor/build/index.js` is absent. NEXT_DEV_ACTION: restore a locally executable Doctor diagnostic lane without rewriting historical release evidence. |
| MOBILE-QA-010: verified-launcher from clean isolated checkout | SKIP / P3 (carried) | The archive isolation intentionally lacks `.git`, so `dev:verified` cannot bind a launcher to HEAD; it was not used as runtime proof. NEXT_DEV_ACTION: use a clean Git worktree with locally installed dependencies after the concurrent slice is isolated. |

## Commands and safe evidence

- `git diff --check a0ae4da 4721a17` and source diff — PASS; only two `waitFor(fetchTokenDetail)` additions in the test plus evidence documents.
- `node .../typescript/bin/tsc --noEmit` — PASS, exit 0.
- `node .../eslint/bin/eslint.js app src` — PASS, exit 0/no findings.
- `node .../jest/bin/jest.js --runInBand src/__tests__/SnipeCard.test.tsx` — PASS, 1 suite / 3 tests.
- `node .../jest/bin/jest.js --runInBand --silent --json` — PASS, 80 suites / 395 tests; JSON confirms zero failures and no interruption. Safe stdout/stderr scan found no React `act` or overlapping-act warning.
- `node .../expo/bin/cli config --type public --json` — PASS.
- `node .../expo/bin/cli export --platform android|ios|web --output-dir <temporary>` — PASS. Android warning retained as `MOBILE-QA-004`; no generated output was placed in the repository.
- `adb.exe version` — PASS (37.0.1-15733141); `adb.exe devices -l` — BLOCKED after 30 seconds with no output. The API 37 emulator window was observable but not testable; no screenshot was retained.

## Throughput and release recommendation

- Findings inspected/reconciled: 69 distinct carried accessibility/privacy/control assertions (MOBILE-QA-154-01 through -42 plus resolved IDs) and three SnipeCard behavioral checks, backed by the clean 395-test immutable result; five independent release/config/export gates and four carried diagnostics were also reconciled. The 20 explicitly named MOBILE-QA-156/MOBILE-QA-154 checks are distinct behavioral or semantic boundaries, not command counts or viewport variants.
- Current DEV outcomes available: 2 material asynchronous-settlement outcomes. Outcomes independently verified: 2 PASS; FAIL: 0; BLOCKED: 0; SKIP/NOT_APPLICABLE: 0. Required-20 shortfall: 18 material DEV outcomes unavailable in this test-only delta.
- Carry-forward order: (1) `MOBILE-QA-002` responsive Android/physical-device certification, (2) immutable QA of the separate Whales/token-logo slice after its DEV commit and handoff, (3) `MOBILE-QA-004` dependency-warning disposition, (4) `MOBILE-QA-008` Expo Doctor lane, then (5) `MOBILE-QA-010` clean-worktree launcher evidence.

**MOBILE-QA automated GO for MOBILE-156’s test-settlement increment; overall release remains CONDITIONAL NO-GO.** The repaired asynchronous test evidence is green, but exact-build Android runtime/accessibility and the carried diagnostic lanes remain unresolved. No product code, tests, configuration, WEB files, or external state was modified.
