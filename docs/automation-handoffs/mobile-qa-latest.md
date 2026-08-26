# MOBILE-QA — MOBILE-157 Noble/Metro compatibility guard

- Run (UTC): `2026-08-26T00:49:04Z`.
- Scope and provenance: canonical `C:\Tuan\devApps\teminal-dex-app` only. CWD and Git top-level were both resolved to that canonical MOBILE workspace before inspection. `AGENTS.md`, the DEV handoff, requirements, worklog, final audit, prior QA report, package scripts, Git history/status, current public Expo config, and the runtime/build lanes were inspected. No WEB workspace, backend, signing, submission, trading, CopyTrade activation, secrets, production data, or external production state was accessed or changed.
- Inspected immutable DEV result: `4ae320373c09f7740e9969095e211d3bec1c517b` (`test(build): guard Noble Metro fallback`), MOBILE-157; base `8d8971d`. It adds five compatibility regressions in `src/__tests__/noble-bundle-compatibility.test.ts` and evidence documentation only. Product/runtime/configuration code is unchanged.
- Scope stability: the primary worktree still has the separate uncommitted Whales/token-logo slice (`.gitignore`, Whale/TokenRow/TokenAvatar sources and four handoffs/component files). It was preserved and excluded. A detached clean worktree at `%LOCALAPPDATA%\Temp\mobile-qa-157-stable` pinned exactly `4ae3203`; it linked only the already-installed dependency tree. HEAD and the primary dirty-path inventory were unchanged immediately before this report was written.
- Environment/device: Windows `10.0.26100`; bundled Node `24.19.0`; local Android Platform Tools `37.0.1-15733141`. `adb devices -l` completed successfully but reported no attached/emulated device. No screenshot/log artifact was retained because no exact-build UI session was available.

## Acceptance result

| MOBILE-157 acceptance criterion | Result | Independent evidence |
| --- | --- | --- |
| Exact nested Curves/Hashes audited pair | PASS | Focused test independently confirms Curves `1.9.7`, its exact Hashes `1.8.0` dependency, and nested Hashes `1.8.0`. |
| Strict-export mismatch is explicit | PASS | Focused test confirms `./crypto` is exported while `./crypto.js` is not; Android export reproduces the bounded warning rather than hiding it. |
| CommonJS fallback remains present | PASS | Focused test confirms nested `@noble/hashes/crypto.js` exists. |
| ESM fallback remains present | PASS | Focused test confirms nested `@noble/hashes/esm/crypto.js` exists. |
| No silent root cryptography override | PASS | Focused test confirms root lockfile overrides for Curves and Hashes are absent. |
| Focused compatibility gate | PASS | `noble-bundle-compatibility.test.ts`: 1 suite / 5 tests, exit 0. |
| TypeScript and source ESLint | PASS | `tsc --noEmit` and `eslint app src` both exit 0 with no findings. |
| Immutable full regression gate | PASS | JSON result: 81/81 suites and 400/400 tests passed, zero failures, `wasInterrupted: false`. This matches the DEV’s immutable expectation and excludes the uncommitted TokenRow slice. |
| Public platform configuration | PASS | Expo public config exits 0 with `terminaldex`, Android `app.terminaldex.mobile`, and iOS `app.terminaldex.mobile`. |
| Android/iOS/web compilation | PASS with known warning | Android: 1 Hermes bundle/46 assets (48 files), iOS: 1 Hermes bundle/23 assets (25 files), web: 1 Metro JS bundle (20 files). Android alone emits the known Noble `./crypto.js` exports-map warning and completes via file-based fallback. |
| Expo Doctor lane | BLOCKED | `node_modules/expo-doctor/build/index.js` is absent; no substitute diagnostic was claimed. |
| Exact-build Android navigation, TalkBack, large text, offline/retry/partial recovery | BLOCKED | ADB is installed and responsive, but device discovery lists no target. No UI, accessibility, navigation, empty/stale/offline/error/retry, or runtime-marker evidence is fabricated. |

## Findings and reconciliation

| MOBILE-QA finding | Status / priority | Evidence, affected files, regression risk, and exact NEXT_DEV_ACTION |
| --- | --- | --- |
| MOBILE-QA-157-01 nested version pin | PASS / P3 | `src/__tests__/noble-bundle-compatibility.test.ts`; the explicitly audited nested pair is locked. Risk: dependency drift. NEXT_DEV_ACTION: retain the guard and review any lockfile version change. |
| MOBILE-QA-157-02 strict exports boundary | PASS / P3 | Same test plus Android export warning. Risk: Metro behavior may change under a package/toolchain upgrade. NEXT_DEV_ACTION: preserve the warning as release evidence; do not suppress it through resolver overrides. |
| MOBILE-QA-157-03 CommonJS fallback file | PASS / P3 | Focused guard confirms `crypto.js`. Risk: package-layout removal. NEXT_DEV_ACTION: fail the build review if the file disappears; obtain an upstream supported export before removing the guard. |
| MOBILE-QA-157-04 ESM fallback file | PASS / P3 | Focused guard confirms `esm/crypto.js`. Risk: package-layout removal. NEXT_DEV_ACTION: same as MOBILE-QA-157-03. |
| MOBILE-QA-157-05 root override prohibition | PASS / P2 | Focused guard rejects silent root Curves/Hashes override. Risk: a future override could alter wallet cryptography transitively. NEXT_DEV_ACTION: require a separately reviewed MOBILE security/compatibility change for any override. |
| MOBILE-QA-004 Noble exports-map fallback | CONDITIONALLY ACCEPTED / P3 | All five compatibility assumptions and Android/iOS/web bundle gates pass; Android still prints the precise `./crypto.js` strict-exports fallback warning. This is not a clean upstream fix. NEXT_DEV_ACTION: track the upstream export-map fix and retest against any Expo/Metro, wallet-standard-util, or Noble upgrade. |
| MOBILE-QA-002 immutable Android runtime/accessibility | BLOCKED / P2 | `adb devices -l` returned only `List of devices attached`. Affected evidence lane: all relevant mobile screens and recovery states. NEXT_DEV_ACTION: attach/start API 37 or a physical development device, launch the exact verified SHA, capture the bounded build marker, then exercise navigation, large text, TalkBack, loading/stale/empty/filtered-empty/offline/error/retry/partial-page recovery. |
| MOBILE-QA-008 Expo Doctor availability | BLOCKED / P3 | Doctor entrypoint is absent locally. NEXT_DEV_ACTION: restore a repository-local executable Doctor diagnostic lane without changing historical evidence or relying on a global install. |
| MOBILE-QA-010 clean-worktree launcher evidence | OPEN / P3 | A clean pinned Git worktree is now available; this run used exports, not a persistent verified Metro/device session. NEXT_DEV_ACTION: when a device is attached, use `npm run dev:verified` from a clean worktree and correlate the exact mount marker before runtime certification. |

## Commands and safe evidence

- `git diff --check 8d8971d 4ae3203` — PASS; only the compatibility regression and documentation increment are present.
- `node .../jest/bin/jest.js --runInBand src/__tests__/noble-bundle-compatibility.test.ts` — PASS, 5/5.
- `node .../typescript/bin/tsc --noEmit` — PASS.
- `node .../eslint/bin/eslint.js app src` — PASS, no findings.
- `node .../jest/bin/jest.js --runInBand --silent --json --outputFile jest-results.json` — PASS, immutable 81 suites / 400 tests, zero failures and no interruption.
- `node .../expo/bin/cli config --type public --json` — PASS.
- `node .../expo/bin/cli export --platform android|ios|web --output-dir <temporary>` — PASS; generated output stayed only in the clean temporary worktree. Android warning is retained under MOBILE-QA-004.
- `adb.exe version` — PASS; `adb.exe devices -l` — PASS command / BLOCKED device evidence (no listed target).

## Throughput and release recommendation

- Findings independently inspected/reconciled this run: five distinct new MOBILE-157 compatibility outcomes, plus four carried release-evidence blockers/statuses. No generic command, duplicate viewport, or cosmetic split was counted as an additional DEV outcome.
- Current DEV outcomes available: 5. Independently verified: 5 PASS; FAIL: 0; BLOCKED within DEV acceptance: 0; SKIP/NOT_APPLICABLE: 0. Required-20 shortfall: **15**, because this narrow test-only DEV delta contains only five material compatibility outcomes. The independent regression/build lanes were exhausted without padding.
- Carry-forward order: (1) MOBILE-QA-002 exact-build Android/physical-device certification, (2) immutable QA of the still-uncommitted Whales/token-logo slice after its own DEV commit and handoff, (3) upstream resolution/re-review of MOBILE-QA-004, (4) MOBILE-QA-008 Doctor lane, then (5) MOBILE-QA-010 verified-launcher runtime evidence.

**MOBILE-QA conditional GO for MOBILE-157 only. Overall mobile release remains CONDITIONAL NO-GO:** the bounded Noble compatibility contract is independently green, but no device is attached for exact-build runtime/accessibility certification and Expo Doctor remains unavailable. No product code, test, configuration, WEB file, or external state was modified.
