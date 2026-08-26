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

---

# MOBILE-QA validation handoff — MOBILE-160

- Run: 2026-08-26T03:46:52.9669154Z.
- Inspected DEV commit: `12c8f98b9c3bfc43d6154e22db8b4c35c4998fc7` (`test(research): await rendered query settlement`); base `55326ce`.
- Scope: PASS. The current directory and Git top-level are the canonical mobile workspace. The primary worktree contains the unrelated uncommitted Whales/token-logo/MOBILE-to-WEB slice listed below, so all executable evidence was obtained from a clean temporary archive of exactly `12c8f98` with a junction to the existing dependency tree. No product code, configuration, or test was edited.
- Environment: Windows, bundled Node 24.19.0, Expo 57 local CLI, `%LOCALAPPDATA%\Temp\mobile-qa-160-12c8f98`. No emulator/device result was inferred.

## Current DEV acceptance results

| MOBILE-QA acceptance criterion | Result | Independent evidence |
| --- | --- | --- |
| Initial research/removal waits for visible settlement | PASS | Focused `SnipeCard` test passes; it observes `Token unavailable` after the distinct open/remove controls before asserting one query. |
| Threshold editing waits for visible settlement | PASS | Focused test persists the positive visual threshold, then observes `Token unavailable` before asserting one query. |
| Failed evidence retry waits for recovery settlement | PASS | Focused test observes Retry removal after recovery and verifies exactly two queries. |
| Full rendered-settlement regression | PASS | Immutable `jest --ci --runInBand`: 81/81 suites and 401/401 tests; explicit scan found `MOBILE-QA_REACT_ACT_WARNING_COUNT=0`. |
| TypeScript / source ESLint | PASS | Exact archive `tsc --noEmit` and `eslint app src` both exited 0. |
| Local dependency diagnostic | PASS | `expo install --check` reported “Dependencies are up to date” when run with its normal user cache. Sandboxed attempt was EPERM cache-only and was not treated as a dependency failure. |
| Public config and bundle exports | PASS with condition | Public config resolves Android/iOS/web. iOS and web exports pass; Android export completes (1 Hermes bundle/46 assets) with the carried Noble strict-exports warning. |

## MOBILE-QA reconciled finding inventory (20)

| ID | Result | Evidence, regression risk, and exact NEXT_DEV_ACTION |
| --- | --- | --- |
| MOBILE-QA-001 | PASS | MOBILE-160 changes test settlement only; no API, UI behavior, secret, signing, submission, trading, or CopyTrade activation boundary changed. |
| MOBILE-QA-002 | BLOCKED P1 | No responsive exact-build Android target was available in this run. **NEXT_DEV_ACTION:** provide a responsive Android emulator/device carrying the immutable build marker. |
| MOBILE-QA-003 | PASS | Archive was created from `12c8f98`; concurrent primary-worktree paths were excluded. |
| MOBILE-QA-004 | CONDITIONAL PASS P2 | Android export succeeds but logs the known Noble `./crypto.js` strict-exports fallback. **NEXT_DEV_ACTION:** retain the audited guard and require full platform revalidation for any dependency/resolver change. |
| MOBILE-QA-005 | PASS | Immutable full Jest gate passes 81/401. |
| MOBILE-QA-006 | RESOLVED | No mixed-state evidence was used; dirty paths remained untouched. |
| MOBILE-QA-007 | PASS | Semantic accessibility ordering regression remains green within the complete immutable suite. |
| MOBILE-QA-008 | BLOCKED P2 | Local Expo CLI explicitly rejects `expo doctor`; no standalone `expo-doctor` is installed. **NEXT_DEV_ACTION:** provide an isolated repository-local Doctor evidence lane. |
| MOBILE-QA-009 | PASS | Immutable test count is 81 suites / 401 tests, matching the MOBILE-160 handoff’s isolated expectation. |
| MOBILE-QA-010 | BLOCKED P2 | TalkBack/VoiceOver, enlarged text, offline/reconnect, background/restore, and performance need physical-device evidence. **NEXT_DEV_ACTION:** run the device matrix after QA-002. |
| MOBILE-QA-011 | BLOCKED P2 | The reported 11 moderate audit items still cannot be enumerated: neither npm on PATH nor a local npm CLI is available. **NEXT_DEV_ACTION:** capture `npm audit --package-lock-only --json` in an isolated dependency-maintenance run; do not auto-remediate. |
| MOBILE-QA-012 | PASS | Repository-local Expo compatibility diagnostic reports all dependencies up to date. |
| MOBILE-QA-013 | RESOLVED | Both focused 3/3 and immutable full 81/401 evidence are free of React `act()`/overlapping-act warnings; prior order-dependent warning is not reproduced. |
| MOBILE-QA-014 | PASS | Exact archive TypeScript compilation succeeds. |
| MOBILE-QA-015 | PASS | Exact archive source-owned ESLint succeeds with no reported warnings/errors. |
| MOBILE-QA-016 | PASS | Resolved public config retains the `terminaldex` scheme, iOS ATS denial of arbitrary loads, Android biometric permissions, and no exposed endpoint/secret. |
| MOBILE-QA-017 | CONDITIONAL PASS | Android Hermes export: 1 bundle/46 assets, with no unresolved-module failure; see QA-004 warning. |
| MOBILE-QA-018 | PASS | iOS export: 1 Hermes bundle/23 assets. |
| MOBILE-QA-019 | PASS | Web static export: 1 bundle; completed without bundle failure. |
| MOBILE-QA-020 | PASS | Expo, Constants, Dev Client, and Router remain aligned; local diagnostic confirms no compatibility drift. |

## Scope change and safe evidence

- `qa_scope_changed` applies only to the primary worktree, not the inspected archive. Excluded paths at start/end: `.gitignore`, `app/(tabs)/whales.tsx`, `expo-env.d.ts`, `src/__tests__/TokenRow.test.tsx`, `src/components/TokenAvatar.tsx`, `src/components/TokenRow.tsx`, `src/components/DexLogo.tsx`, and three untracked MOBILE-to-WEB handoffs.
- Commands/results: focused SnipeCard 3/3 PASS; full Jest 81/401 PASS and warning count 0; TypeScript PASS; ESLint PASS; local Expo dependency check PASS; public config PASS; Android export CONDITIONAL PASS (Noble warning); iOS/web export PASS; `expo doctor` BLOCKED.
- No screenshots, device logs, backend-origin data, credentials, or provider diagnostics were captured.

## Release recommendation

**MOBILE-QA: CONDITIONAL NO-GO.** MOBILE-160 closes `MOBILE-QA-013`, but release certification remains blocked by exact-device/runtime evidence (`MOBILE-QA-002`/`010`), unavailable Doctor evidence (`MOBILE-QA-008`), untriaged audit advisories (`MOBILE-QA-011`), and the conditionally accepted Noble warning (`MOBILE-QA-004`).

## 20/20 reconciliation

- Findings inspected/reconciled: 20.
- Material DEV outcomes available: 3; independently verified: 3/3 PASS.
- Remaining to 20 DEV outcomes: 17. No padding applied; the remaining slots require device ownership, Expo Doctor availability, audit-advisory enumeration, Noble ownership, or the excluded concurrent Whales/token-logo slice.
- Carry-forward order: `MOBILE-QA-002`, `MOBILE-QA-010`, `MOBILE-QA-008`, `MOBILE-QA-011`, `MOBILE-QA-004`.

---

# MOBILE-QA validation handoff — MOBILE-161

- Run: 2026-08-26T04:44:33.3723738Z.
- Inspected DEV commit: `1372483f6fd9fc6523706cdc648e67df449c9ad2` (`test(security): guard audit runtime boundary`); base `b73b47a`.
- Scope: PASS. Current directory and Git top-level resolve to the canonical mobile workspace. The primary worktree retains an unrelated uncommitted Whales/token-logo/MOBILE-to-WEB slice, so executable evidence used a clean temporary archive of exactly `1372483` with the existing dependencies attached as a junction. No product code, tests, or configuration were edited.
- Environment: Windows, bundled Node 24.19.0, Expo 57 local CLI, `%LOCALAPPDATA%\Temp\mobile-qa-161-1372483`. No responsive Android target was available; no runtime result was inferred.

## Current DEV acceptance results

| MOBILE-QA criterion | Result | Independent evidence |
| --- | --- | --- |
| `uuid` excluded from direct app dependencies | PASS | Focused boundary test passes. |
| `xcode` excluded from direct app dependencies | PASS | Focused boundary test passes. |
| Expo config plugins excluded from direct app dependencies | PASS | Focused boundary test passes. |
| `xcode` remains behind Expo configuration tooling | PASS | Focused boundary test passes. |
| Audited transitive package versions are pinned | PASS | Focused boundary test passes. |
| Audited packages have no `app`/`src` runtime imports | PASS | Focused boundary test passes. |
| Regression, config, and bundles | PASS with condition | Immutable Jest 82/407, TypeScript, ESLint, and local compatibility diagnostic pass; Android exports with carried Noble warning, iOS/web export cleanly. |

## MOBILE-QA reconciled finding inventory (20)

| ID | Result | Evidence, regression risk, and exact NEXT_DEV_ACTION |
| --- | --- | --- |
| MOBILE-QA-001 | PASS | MOBILE-161 is a test-only security boundary; no product/API/wallet/transaction path changed. |
| MOBILE-QA-002 | BLOCKED P1 | Exact-build Android emulator/device evidence unavailable. **NEXT_DEV_ACTION:** provide a responsive target and immutable build marker. |
| MOBILE-QA-003 | PASS | Archive pinned to `1372483`; unrelated dirty paths excluded. |
| MOBILE-QA-004 | CONDITIONAL PASS P2 | Android bundle completes but retains Noble `./crypto.js` strict-exports fallback. **NEXT_DEV_ACTION:** maintain audited guard; revalidate all platforms before dependency/resolver changes. |
| MOBILE-QA-005 | PASS | Immutable full Jest passes 82 suites / 407 tests. |
| MOBILE-QA-006 | RESOLVED | No mixed-state test evidence; primary worktree remained untouched. |
| MOBILE-QA-007 | PASS | Semantic accessibility ordering tests remain green in full regression. |
| MOBILE-QA-008 | BLOCKED P2 | Local CLI rejects `expo doctor`; no standalone executable exists. **NEXT_DEV_ACTION:** add an isolated repository-local Doctor evidence lane. |
| MOBILE-QA-009 | PASS | Exact archive establishes current committed baseline at 82 suites / 407 tests. |
| MOBILE-QA-010 | BLOCKED P2 | Device TalkBack/VoiceOver, enlarged text, offline/reconnect, background/restore, and performance evidence remain unavailable. **NEXT_DEV_ACTION:** execute device matrix after QA-002. |
| MOBILE-QA-011 | PARTIALLY VERIFIED P2 | Six regression checks bound the reported 11 moderate, zero high/critical audit exposure to `uuid` 7.0.3 via `xcode`/Expo tooling, but raw production audit cannot be regenerated because no npm executable exists. **NEXT_DEV_ACTION:** run `npm audit --package-lock-only --omit=dev --json` in isolated dependency maintenance and re-evaluate compatible Expo/xcode updates; do not force downgrade/remediation. |
| MOBILE-QA-012 | PASS | `expo install --check` reports dependencies up to date. |
| MOBILE-QA-013 | RESOLVED | SnipeCard settlement remains warning-free in the complete immutable suite. |
| MOBILE-QA-014 | PASS | Exact archive TypeScript compilation passes. |
| MOBILE-QA-015 | PASS | Exact archive source ESLint passes. |
| MOBILE-QA-016 | PASS | Public config retains HTTPS/ATS, deep-link, biometric, and no-secret boundaries. |
| MOBILE-QA-017 | CONDITIONAL PASS | Android export: one Hermes bundle/46 assets, no unresolved-module failure; see QA-004. |
| MOBILE-QA-018 | PASS | iOS export: one Hermes bundle/23 assets. |
| MOBILE-QA-019 | PASS | Web static export: one bundle, completed without bundle failure. |
| MOBILE-QA-020 | PASS | Expo patch compatibility remains aligned according to the local diagnostic. |

## Safe evidence, scope change, and release

- `qa_scope_changed` applies to the primary worktree only. Excluded at start/end: `.gitignore`, `app/(tabs)/whales.tsx`, `expo-env.d.ts`, `src/__tests__/TokenRow.test.tsx`, `src/components/TokenAvatar.tsx`, `src/components/TokenRow.tsx`, `src/components/DexLogo.tsx`, and three untracked MOBILE-to-WEB handoffs.
- Commands/results: dependency-audit boundary Jest 6/6 PASS; full Jest 82/407 PASS; TypeScript PASS; ESLint PASS; local compatibility diagnostic PASS; config PASS; Android export CONDITIONAL PASS (Noble warning); iOS/web PASS. Production audit raw rerun and device runtime were BLOCKED; no screenshots/logs/secrets/backend origins captured.
- **MOBILE-QA release recommendation: CONDITIONAL NO-GO.** The guard reduces regression risk but does not resolve the upstream advisory. `MOBILE-QA-002`, `010`, `008`, `011`, and `004` remain release follow-ups.

## 20/20 reconciliation

- Findings inspected/reconciled: 20.
- Material DEV outcomes available: 6; independently verified: 6/6 PASS.
- Remaining to 20 DEV outcomes: 14. No padding applied; remaining capacity depends on upstream audit remediation, exact device ownership, Doctor availability, Noble ownership, or the excluded concurrent slice.
- Carry-forward order: `MOBILE-QA-011`, `MOBILE-QA-002`, `MOBILE-QA-010`, `MOBILE-QA-008`, `MOBILE-QA-004`.

---

# MOBILE-QA validation handoff — MOBILE-162

- Run: 2026-08-26T05:44:53.5241938Z.
- Inspected DEV commit: `1da40fc28c0475ac1b279a7a946f45dc732ad78f` (`chore(expo): restore local doctor gate`); base `6c5c5a9`.
- Scope: PASS. The canonical mobile workspace is confirmed. The primary worktree has an unrelated uncommitted Whales/token-logo/MOBILE-to-WEB slice, so QA tested a clean archive of exactly `1da40fc` with the existing dependencies attached as a junction. No product code, tests, or configuration were changed.
- Environment: Windows, bundled Node 24.19.0, Expo 57 local CLI, `%LOCALAPPDATA%\Temp\mobile-qa-162-1da40fc`; no Android target was available.

## Current DEV acceptance results

| MOBILE-QA criterion | Result | Independent evidence |
| --- | --- | --- |
| Exact repository-local `expo-doctor` dependency | PASS | Installed package is `expo-doctor` 1.20.3 with declared local binary. |
| No implicit global/`npx` Doctor resolution | PASS | Focused command/provenance tests pass 14/14. |
| Dynamic config consumes static Expo config | PASS | Focused config/provenance tests pass; public config resolves Android/iOS/web and retains nullable build provenance. |
| Local Doctor command executes | PASS | Direct local executable starts all 21 checks. |
| Doctor 21/21 result | BLOCKED | QA environment lacks `npm`; Doctor returns 17/21 and identifies four dependency-tree/npm-version checks as unavailable. This is not classified as an app/config failure. |
| TypeScript / source ESLint / full regression | PASS | Immutable typecheck and lint pass; Jest passes 82 suites / 408 tests. |
| Local Expo compatibility / platform exports | PASS with condition | Compatibility reports dependencies up to date. Android exports with the carried Noble warning; iOS/web exports pass. |

## MOBILE-QA reconciled finding inventory (20)

| ID | Result | Evidence, regression risk, and exact NEXT_DEV_ACTION |
| --- | --- | --- |
| MOBILE-QA-001 | PASS | MOBILE-162 is diagnostics/config/test infrastructure only; API, wallet, signing, submission, trading, secrets, and WEB contracts unchanged. |
| MOBILE-QA-002 | BLOCKED P1 | No exact-build Android emulator/device evidence. **NEXT_DEV_ACTION:** provide responsive target plus immutable marker. |
| MOBILE-QA-003 | PASS | Clean archive pinned to `1da40fc`; concurrent worktree paths excluded. |
| MOBILE-QA-004 | CONDITIONAL PASS P2 | Android export completes with known Noble strict-exports fallback. **NEXT_DEV_ACTION:** preserve guard and revalidate platform exports before resolver/dependency changes. |
| MOBILE-QA-005 | PASS | Immutable full regression passes 82/408. |
| MOBILE-QA-006 | RESOLVED | No mixed-state evidence; concurrent paths were not changed. |
| MOBILE-QA-007 | PASS | Semantic accessibility ordering remains green in full regression. |
| MOBILE-QA-008 | PARTIALLY VERIFIED P2 | Local Doctor is installed, local-first, and starts 21 checks, but QA gets 17/21 because npm is unavailable for four package-tree checks. **NEXT_DEV_ACTION:** supply repository-local/bundled npm or record a reproducible 21/21 Doctor run from the immutable commit. |
| MOBILE-QA-009 | PASS | Exact archive baseline is 82 suites / 408 tests. |
| MOBILE-QA-010 | BLOCKED P2 | Physical accessibility/resilience matrix remains unexecuted. **NEXT_DEV_ACTION:** run after QA-002. |
| MOBILE-QA-011 | PARTIALLY VERIFIED P2 | Upstream audit remains bounded by guard; raw audit unavailable without npm. **NEXT_DEV_ACTION:** isolated `npm audit --package-lock-only --omit=dev --json`; no forced remediation. |
| MOBILE-QA-012 | PASS | Local Expo compatibility reports dependencies up to date. |
| MOBILE-QA-013 | RESOLVED | Complete suite remains free of the prior SnipeCard settlement warning. |
| MOBILE-QA-014 | PASS | TypeScript passes in exact archive. |
| MOBILE-QA-015 | PASS | Source ESLint passes in exact archive. |
| MOBILE-QA-016 | PASS | Public config preserves ATS/HTTPS, deep links, biometric-only permission and no secret/endpoint leakage. |
| MOBILE-QA-017 | CONDITIONAL PASS | Android export: one Hermes bundle/46 assets, no unresolved module; see QA-004. |
| MOBILE-QA-018 | PASS | iOS export: one Hermes bundle/23 assets. |
| MOBILE-QA-019 | PASS | Web static export: one bundle, successful completion. |
| MOBILE-QA-020 | PASS | Local Doctor command and dynamic-config contract are regression-covered; Expo compatibility remains aligned. |

## Scope change, commands, and release

- `qa_scope_changed` applies only to the primary worktree. Excluded paths: `.gitignore`, `app/(tabs)/whales.tsx`, `expo-env.d.ts`, `src/__tests__/TokenRow.test.tsx`, `src/components/TokenAvatar.tsx`, `src/components/TokenRow.tsx`, `src/components/DexLogo.tsx`, and three untracked MOBILE-to-WEB handoffs.
- Commands/results: focused package/config tests 14/14 PASS; local Doctor execution PARTIAL 17/21 (four npm-dependent checks unavailable); TypeScript PASS; ESLint PASS; full Jest 82/408 PASS; local Expo compatibility PASS; public config PASS; Android export CONDITIONAL PASS; iOS/web PASS. Android device/navigation/error/recovery/accessibility checks BLOCKED. No screenshots, device logs, secret, backend origin, or provider diagnostic evidence collected.
- **MOBILE-QA release recommendation: CONDITIONAL NO-GO.** The repository-local Doctor is a material improvement, but immutable Doctor 21/21 cannot be independently certified in this npm-less environment. Continue `MOBILE-QA-002`, `010`, `008`, `011`, and `004`.

## 20/20 reconciliation

- Findings inspected/reconciled: 20.
- Material DEV outcomes available: 8; independently verified: 7 PASS, 1 BLOCKED (Doctor 21/21).
- Remaining to 20 DEV outcomes: 12. No padding applied; remaining capacity requires npm-enabled Doctor/audit evidence, device ownership, upstream Noble/audit remediation, or the excluded concurrent slice.
- Carry-forward order: `MOBILE-QA-008`, `MOBILE-QA-011`, `MOBILE-QA-002`, `MOBILE-QA-010`, `MOBILE-QA-004`.

---

# MOBILE-QA Android UI-flow supplement

- Run: 2026-08-26T06:50:45.8888108Z.
- Environment: connected API 37 emulator (`emulator-5554`, 1080×2400), installed `app.terminaldex.mobile` version 0.1.0, last updated 2026-08-26 12:59 local.
- Provenance: BLOCKED. The installed app produced no `MOBILE_BUILD` marker in the retained log window, so these observations cannot certify an exact immutable Git commit. At completion, the repository had advanced to `37783c9` with additional uncommitted DEV changes; no source-level mixed-state testing was run.

## MOBILE-QA observed end-to-end flows

| Flow | Result | Evidence |
| --- | --- | --- |
| Whales → Live | PASS (runtime observation) | Rendered historical/unverified whale rows, flow/amount/sort controls, exact-token visual fallbacks, and accessible evidence-rich rows without fatal screen. |
| Discover navigation | PASS | Bottom tab transitions to Discover. |
| Discover loading → settlement | PASS | “Loading live markets…” transitions to populated Trending rows within six seconds; unavailable holder/age evidence is visibly labeled rather than invented. |
| Trenches | PASS | New/Almost bonded/Migrated rails, fallback provenance, launch count, truthful row metrics, and quote-review entry points render. No quote was opened. |
| Portfolio safety boundary | PASS | Wallet verification is separated from public watch-only address input; no wallet, signing, or transaction action was initiated. |
| More catalog | PASS | Settings and read-only intelligence/research destinations are reachable. |
| Market Intelligence → Signals | PASS | Live signature-backed rows and provider/freshness evidence render under an explicit no-actions boundary. |
| Market Intelligence → Heatmap | PASS | Loading transitions to populated heatmap with included/excluded counts, warnings, incomplete metrics, and no execution control. |
| Market Intelligence → Claims | PASS | Healthy RPC evidence and zero-result filtered-empty state render with an explicit observational-only/no-wallet-action boundary. |
| Settings | PASS (non-mutating inspection) | Localization, accessibility, telemetry-default-off, HTTPS/deep-link/security disclosures, and privacy reset boundary render. No setting or data reset was changed. |
| Crash/ANR safety | PASS (limited) | Launch and tested transitions show no visible fatal error or ANR. Log provenance was insufficient for exact-build crash certification. |

## MOBILE-QA findings and recommendation

- MOBILE-QA-002 remains BLOCKED P1: runtime evidence is not bound to an immutable commit. **NEXT_DEV_ACTION:** launch the exact committed development build through the verified launcher and retain `[MOBILE_BUILD] commit=<SHA>` before device certification.
- MOBILE-QA-010 remains BLOCKED P2: TalkBack traversal, enlarged text, reduced-motion state change, offline/reconnect, background/restore, and performance were not run; this supplement does not fabricate them.
- MOBILE-QA-006 is OPEN for the new `37783c9` delta: DEV committed a new slice while an additional dirty slice remains. **NEXT_DEV_ACTION:** publish the matching DEV handoff, then QA will pin and validate it from a clean archive.
- Screenshots (safe local references): `%LOCALAPPDATA%\Temp\mobile-qa-emulator-home.png`, `mobile-qa-discover-settled.png`, `mobile-qa-trenches.png`, `mobile-qa-portfolio.png`, `mobile-qa-more.png`, `mobile-qa-signals.png`, `mobile-qa-heatmap-settled.png`, `mobile-qa-claims.png`, `mobile-qa-settings.png`.
- **MOBILE-QA release recommendation: CONDITIONAL NO-GO.** Broader UI/data/empty-state flows are now observed on an actual emulator, but commit provenance and the remaining accessibility/resilience matrix are required before release sign-off.

## Throughput disposition

- Runtime findings inspected: 11 distinct UI-flow outcomes, all observed PASS within stated limits.
- New DEV outcomes eligible for this run: 0, because `37783c9` has no matching DEV handoff and the worktree changed during observation.
- Remaining to 20 DEV outcomes: 20; no padding or mixed-state testing applied.

---

# MOBILE-QA validation handoff — MOBILE-164

- Run: 2026-08-26T08:20:00+07:00.
- Inspected DEV commit: `4a3541865bd236a659f4e5c9436e2ad4d80733ed` (`fix(mobile): bound inputs and async wallet controls`); base `31b683f`.
- Scope: PASS. At start and before reporting, current directory and Git top-level resolved to `C:\Tuan\devApps\teminal-dex-app`; working tree was clean. No WEB workspace was read or written. QA used a clean archive of the exact commit with the repository dependency tree attached read-only by junction. Product code, tests, and configuration were not changed.
- Environment: Windows, bundled Node 24.19.0, Expo 57 local CLI, API 37 Android emulator `emulator-5554` (1080x2400), temporary archive `%LOCALAPPDATA%\Temp\mobile-qa-164-4a35418`.
- Provenance: PASS. A verified local bundle emitted `[MOBILE_BUILD] commit=4a3541865bd236a659f4e5c9436e2ad4d80733ed` in Android logcat before device evidence was attributed to this result.

## MOBILE-QA acceptance and end-to-end results

| Criterion | Result | Independent evidence |
| --- | --- | --- |
| Immutable type and source quality | PASS | `tsc --noEmit` and `eslint app src` both exit 0 from the clean archive. |
| Focused input/control regression | PASS | AlertComposer, TrackedWalletRow, research store, StrategyComposer, and CopyTrade config: 5 suites / 14 tests. |
| Full regression | PASS | Jest `--ci --runInBand`: 82 suites / 414 tests. |
| Expo configuration and dependency alignment | PASS | Public config resolves secure platform configuration; `expo install --check` reports dependencies up to date. |
| Expo Doctor | BLOCKED | Local Doctor starts 21 checks but returns 17/21 because its four package-tree/npm-version checks cannot spawn `npm` in this QA runtime. |
| Android/iOS/web bundles | CONDITIONAL PASS | All exports complete; Android retains the known Noble `./crypto.js` strict-exports fallback without an unresolved module. |
| Exact Android navigation and safety flow | PASS, bounded | Verified bundle launched API 37, rendered Whales, navigated to Portfolio, More, and Wallet Intelligence → Wallet Tracker. A 50-character invalid unsaved address was truncated to 44 in both Portfolio and Wallet Tracker; Wallet Tracker Save remained disabled. No wallet connection, watch-only load, save, removal, signing, submission, or trading action occurred. |
| Full device resilience/accessibility matrix | BLOCKED | TalkBack/VoiceOver, enlarged text, offline/retry/reconnect, background/restore, persistence-failure retry, and physical-device coverage were not available. |

## MOBILE-QA reconciled finding inventory (20)

| Stable ID | Result | Evidence, affected area, regression risk, and exact NEXT_DEV_ACTION |
| --- | --- | --- |
| MOBILE-DATA-221 | PASS | Portfolio watch-only input has native `maxLength={44}` and state slicing; API 37 entered 50 invalid characters and exposed exactly 44. Affected `app/(tabs)/portfolio.tsx`. Risk: low. **NEXT_DEV_ACTION:** retain the native/state bound. |
| MOBILE-DATA-222 | PASS | Source review confirms locked-session revoke gets `disabled` plus busy accessibility state from `wallet.busy`. Affected Portfolio. Risk: low; no authenticated wallet was used. **NEXT_DEV_ACTION:** add a rendered busy-session interaction test when the wallet test harness supports it. |
| MOBILE-DATA-223 | PASS | Source review confirms connected-session disconnect/revoke is disabled and announced busy during `wallet.busy`. Affected Portfolio. Risk: low; no wallet connection was initiated. **NEXT_DEV_ACTION:** add a rendered busy-session interaction test. |
| MOBILE-DATA-224 | PASS | Source review confirms watch-only Load is disabled while `wallet.busy`; device also showed Load disabled for the invalid non-submitted draft. Affected Portfolio. Risk: low. **NEXT_DEV_ACTION:** cover the busy branch in a component test. |
| MOBILE-DATA-225 | PASS | Wallet Tracker uses native `maxLength={44}`, slices state, and blocks editing while saving; API 37 truncated 50 invalid characters to 44 and Save remained disabled. Affected `app/wallet-intelligence.tsx`. Risk: low. **NEXT_DEV_ACTION:** retain this dual bound. |
| MOBILE-DATA-226 | PASS | Save has a `saving` re-entry guard, disables its control, and publishes busy state; full regression is green. Affected Wallet Tracker. Risk: low. **NEXT_DEV_ACTION:** add a delayed-persistence double-press test. |
| MOBILE-DATA-227 | PASS | Remove has the same `saving` re-entry guard; TrackedWalletRow focused test proves destructive remove is disabled/busy and does not invoke its callback. Affected Wallet Tracker/TrackedWalletRow. Risk: low. **NEXT_DEV_ACTION:** retain focused busy-removal coverage. |
| MOBILE-DATA-228 | PASS | Research Snipe mint input slices and natively caps at 44; research-store exact-address tests pass. Affected `app/research-workspace.tsx`. Risk: low. **NEXT_DEV_ACTION:** add Android paste coverage when physical-device matrix runs. |
| MOBILE-DATA-229 | PASS | Research Multichart mint input slices and natively caps at 44. Affected Research Workspace. Risk: low. **NEXT_DEV_ACTION:** add rendered max-length assertion. |
| MOBILE-DATA-230 | PASS | `boundedResearchNumber` strips non-decimal characters, collapses duplicate separators, and bounds whole/fractional precision before persistence; focused research-store test passes. Affected Research Workspace/store. Risk: low. **NEXT_DEV_ACTION:** retain normalizer as the only threshold path. |
| MOBILE-DATA-231 | PASS | The same normalizer covers Research below threshold and focused test passes. Affected Research Workspace/store. Risk: low. **NEXT_DEV_ACTION:** include malformed paste in physical-device testing. |
| MOBILE-DATA-232 | PASS | Research above/below inputs use the normalizer and native `maxLength={19}`. Affected Research Workspace. Risk: low. **NEXT_DEV_ACTION:** add a rendered native-prop assertion. |
| MOBILE-A11Y-233 | PASS | Multichart timeframe rail now exposes `accessibilityRole="radiogroup"`; existing tab/radio regression remains green. Affected Research Workspace. Risk: low. **NEXT_DEV_ACTION:** confirm TalkBack grouping on physical Android. |
| MOBILE-DATA-234 | PASS | Whale search slices state and natively caps at 80. Affected `app/(tabs)/whales.tsx`. Risk: low. **NEXT_DEV_ACTION:** add a rendered length-bound assertion. |
| MOBILE-DATA-235 | PASS | Alert token input slices state and natively caps at 44. Affected `app/(tabs)/monitor.tsx`. Risk: low. **NEXT_DEV_ACTION:** add Android paste coverage. |
| MOBILE-DATA-236 | PASS | `boundedAlertNumber` normalizes malformed decimal strings before validation/submission; focused AlertComposer test passes. Affected Monitor. Risk: low. **NEXT_DEV_ACTION:** retain normalizer coverage. |
| MOBILE-DATA-237 | PASS | Alert threshold input uses the normalizer and native `maxLength={19}`. Affected Monitor. Risk: low. **NEXT_DEV_ACTION:** add rendered native-prop assertion. |
| MOBILE-A11Y-238 | PASS | Alert signal options are contained by a radiogroup and individual radios carry clear labels/checked state. Affected Monitor. Risk: low. **NEXT_DEV_ACTION:** confirm TalkBack traversal on physical Android. |
| MOBILE-A11Y-239 | PASS | Alert condition options are contained by a radiogroup with labeled radios/checked state. Affected Monitor. Risk: low. **NEXT_DEV_ACTION:** confirm TalkBack traversal on physical Android. |
| MOBILE-DATA-240 | PASS | CopyTrade decimal Input retains the sanitizer and now natively caps at 19; focused config tests pass and full regression maintains execution-disabled boundaries. Affected `app/copytrade.tsx`. Risk: low. **NEXT_DEV_ACTION:** add rendered max-length coverage for each CopyTrade numeric field. |

## MOBILE-QA command and runtime evidence

- PASS: `tsc --noEmit`; `eslint app src`; focused Jest 5/14; full Jest 82/414; public Expo config; `expo install --check`; Android, iOS, and web exports.
- CONDITIONAL PASS: Android export produced 1 Hermes bundle / 46 assets and only the carried `@solana/wallet-standard-util` → Noble `./crypto.js` strict-exports fallback. iOS produced 1 Hermes bundle / 23 assets; web produced 1 static bundle.
- BLOCKED: direct local `expo-doctor` was 17/21; four checks could not spawn `npm`. This is a QA-runtime tooling limitation, not evidence of a product incompatibility.
- PASS: verified API 37 launch through `exp+terminal-dex://expo-development-client/?url=http://localhost:8092` after `adb reverse`; exact commit marker recorded, no fatal exception, ANR, or unresolved-script error in the successful launch window. Safe local evidence references: `%LOCALAPPDATA%\Temp\mobile-qa-164-portfolio-bound.xml` and `mobile-qa-164-wallet-tracker-bound.xml`.
- Attempted but not counted as product evidence: the `127.0.0.1` development-client URL showed a launcher transport error; retrying the registered localhost scheme loaded the verified bundle successfully. No product source/configuration change is indicated.

## MOBILE-QA blockers and release recommendation

- MOBILE-QA-004 remains CONDITIONAL PASS P2: Noble fallback warning. **NEXT_DEV_ACTION:** retain the compatibility guard and revalidate all exports before dependency/resolver change.
- MOBILE-QA-008 remains PARTIALLY VERIFIED P2: immutable Doctor is 17/21 in this runtime. **NEXT_DEV_ACTION:** provide a repository-local/bundled npm lane or a reproducible exact-commit 21/21 Doctor run.
- MOBILE-QA-010 remains BLOCKED P2: device accessibility/resilience matrix is incomplete. **NEXT_DEV_ACTION:** execute TalkBack, large text, offline/error/retry, background/restore, persistence-failure retry, and physical-device checks.
- No MOBILE-to-WEB contract blocker; WEB APIs remained outside scope and untouched.
- **MOBILE-QA release recommendation: CONDITIONAL NO-GO.** All 20 MOBILE-164 outcomes pass independent static/automated validation and two address-bound outcomes pass on an exact Android build, but release sign-off awaits the stated Doctor, Noble, and physical accessibility/resilience evidence.

## MOBILE-QA 20/20 reconciliation

- Findings inspected/reconciled: 20 distinct stable IDs.
- Material DEV outcomes available: 20; independently verified: 20/20 PASS.
- Remaining to 20: 0. No duplicated or cosmetic findings counted.
- Carry-forward order: `MOBILE-QA-010`, `MOBILE-QA-008`, `MOBILE-QA-004`.
