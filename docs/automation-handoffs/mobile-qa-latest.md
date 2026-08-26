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

---

# MOBILE-QA validation handoff — MOBILE-165

- Run: 2026-08-26T09:15:00+07:00.
- Inspected DEV commit: `54b6cdff112cdc09e8937a3a586f07a8feb25321` (`fix(mobile): raise primary market touch targets`); base `fe31e0c`.
- Scope: PASS. Current directory and Git top-level resolved to `C:\Tuan\devApps\teminal-dex-app`; start/end working tree was clean. QA tested a clean temporary archive of the exact commit. No product code, tests, configuration, WEB workspace, wallet, transaction, or external API state was modified.
- Environment/device: Windows, bundled Node 24.19.0, Expo 57 local CLI; API 37 emulator `emulator-5554` at 1080x2400. A verified bundle emitted `[MOBILE_BUILD] commit=54b6cdff112cdc09e8937a3a586f07a8feb25321`. Font scale was changed from 1.0 to 1.3 only for QA and restored to 1.0 before completion.

## MOBILE-QA acceptance results

| Criterion | Result | Independent evidence |
| --- | --- | --- |
| Immutable compilation | PASS | Clean-archive `tsc --noEmit` exits 0. |
| Lint | PASS | Focused ESLint of all three changed production surfaces and the new touch-target test exits 0; full-source lint was also invoked with no emitted diagnostics. |
| Focused touch/accessibility regression | PASS | `touch-targets`, Monitor table/state, and Trenches filter suites pass 5/19; the focused primary-a11y plus touch-target pair passes 2/71. |
| Full regression | PASS | Immutable Jest `--ci --runInBand`: 83 suites / 417 tests. |
| Expo checks/configuration | PASS with tooling constraint | Public config resolves expected Android/iOS/web security configuration; `expo install --check` reports dependencies up to date. Doctor starts 21 checks but is 17/21 because four checks cannot spawn `npm` in this QA runtime. |
| Platform exports | CONDITIONAL PASS | Android (1 Hermes bundle/46 assets), iOS (1 Hermes bundle/23 assets), and web (1 static bundle) complete. Android retains known Noble `./crypto.js` strict-exports fallback. |
| API 37 1.0x/1.3x touch-target flow | PASS with defect below | Exact build rendered Discover, Monitor, and Trenches. Named reachable controls were 115–124 physical pixels high (about 46–50 logical dp on this 2.5-density emulator), including horizontal rails, filters, retry, DEX choices, reset/apply, monitor radios/checkboxes/switch, and Trenches filters/launchpads/reset. At 1.3x, Discover tabs, periods, and filter remained 115–116 pixels high with no observed overlap/clipping. |

## MOBILE-QA reconciled MOBILE-165 outcomes (20)

| Stable ID | Result | Evidence and exact NEXT_DEV_ACTION |
| --- | --- | --- |
| MOBILE-TOUCH-241 | PASS | Discover mode tabs: source `minHeight:44`; API 37 bounds 115px. **NEXT_DEV_ACTION:** retain. |
| MOBILE-TOUCH-242 | PASS | Discover periods: source wrapper 44x44; API 37 radio bounds 115x116px at 1.0x and 1.3x. **NEXT_DEV_ACTION:** retain. |
| MOBILE-TOUCH-243 | PASS | Discover filter trigger: source 44px; API 37 bounds 158x116px / 177x116px at 1.3x. **NEXT_DEV_ACTION:** retain. |
| MOBILE-TOUCH-244 | PASS | Discover retry: source 44px; live error state exposed an API 37 Retry button 186x116px. **NEXT_DEV_ACTION:** retain. |
| MOBILE-TOUCH-245 | PASS | Discover DEX radios: source 44px; API 37 bounds 99–208x116px. Raydium selection changed checked state through touch. **NEXT_DEV_ACTION:** retain. |
| MOBILE-TOUCH-246 | PASS | Discover Reset: source 44px; API 37 bounds 346x124px and reversible reset touch closed the panel. **NEXT_DEV_ACTION:** retain. |
| MOBILE-TOUCH-247 | PASS | Discover Apply: source 44px; API 37 bounds 613x124px. **NEXT_DEV_ACTION:** retain. |
| MOBILE-TOUCH-248 | PASS | Monitor refresh: source 44x44; API 37 bounds 116x115px. **NEXT_DEV_ACTION:** retain. |
| MOBILE-TOUCH-249 | PASS | Monitor window radios: source control 44px; API 37 bounds 85–100x115px. **NEXT_DEV_ACTION:** retain. |
| MOBILE-TOUCH-250 | PASS | Monitor preset radios: source control 44px; API 37 bounds 108–152x115px. **NEXT_DEV_ACTION:** retain. |
| MOBILE-TOUCH-251 | PASS | Monitor direction radios: source control 44px; API 37 bounds 88–141x116px. **NEXT_DEV_ACTION:** retain. |
| MOBILE-TOUCH-252 | PASS | Monitor DEX radios: source control 44px; API 37 All DEX control is 150x115px. **NEXT_DEV_ACTION:** retain. |
| MOBILE-TOUCH-253 | PASS | Monitor sort checkboxes: source control 44px; API 37 bounds 152–210x115px. **NEXT_DEV_ACTION:** retain. |
| MOBILE-TOUCH-254 | PASS | Monitor density switch: source control 44px; API 37 Compact rows is 213x116px. **NEXT_DEV_ACTION:** retain. |
| MOBILE-TOUCH-255 | PASS | Monitor reset receives explicit 44px style and is protected by new regression test; inactive-state runtime did not render Reset. **NEXT_DEV_ACTION:** add an active-filter device assertion in the physical matrix. |
| MOBILE-TOUCH-256 | PASS | Monitor Load/retry pagination receives explicit 44px style and is protected by regression test; data set did not expose a pagination branch during this run. **NEXT_DEV_ACTION:** add a controlled partial-page/retry device fixture. |
| MOBILE-TOUCH-257 | PASS | Trenches lane tabs: source 44px; API 37 New/Almost bonded/Migrated bounds are 318x117px. **NEXT_DEV_ACTION:** retain. |
| MOBILE-TOUCH-258 | PASS | Trenches filter trigger: source 44px; API 37 Open launch filters is 190x116px. **NEXT_DEV_ACTION:** retain. |
| MOBILE-TOUCH-259 | PASS | Trenches launchpad radios: source 44px; API 37 bounds 63–199x115–116px. **NEXT_DEV_ACTION:** retain after QA-021 fix. |
| MOBILE-TOUCH-260 | PASS | Trenches Reset: source 44px; API 37 bounds 145x116px. **NEXT_DEV_ACTION:** retain after QA-021 fix. |

## MOBILE-QA finding — runtime defect

| ID | Severity / priority | Result | Reproduction, affected files, risk, and exact NEXT_DEV_ACTION |
| --- | --- | --- | --- |
| MOBILE-QA-021 | P2 | FAIL | On the exact API 37 build, open `Trenches` → `Open launch filters`. React Native logs `Each child in a list should have a unique key prop` from `TrenchFilterPanel`; the accessibility tree also exposes `Select launchpad undefined`. `app/(tabs)/trenches.tsx:68-77` admits undefined `token.dex` values and `:282-284` uses the value as a key. Risk: developer warning overlay and malformed launchpad filter option interrupt a primary market flow. **NEXT_DEV_ACTION:** exclude invalid/non-string DEX values (and de-duplicate normalized labels) before rendering; add a regression test for undefined/duplicate provider DEX values and rerun Trenches device flow. |

## MOBILE-QA command/runtime evidence and release recommendation

- PASS: immutable TypeScript; focused changed-surface lint; focused regressions; full Jest 83/417; public Expo config; dependency compatibility; all three platform exports.
- PARTIAL/BLOCKED: Doctor 17/21 due unavailable child `npm`; physical-device TalkBack/Switch Access and smaller-device motor matrix; Monitor active-reset and partial-page retry scenarios require controllable data state.
- CONDITIONAL PASS: Android bundle warning remains `@solana/wallet-standard-util` → Noble strict-exports fallback; no unresolved bundle module.
- Safe evidence references: `%LOCALAPPDATA%\Temp\mobile-qa-165-discover.xml`, `mobile-qa-165-discover-filter.xml`, `mobile-qa-165-monitor-filter.xml`, `mobile-qa-165-trenches-filter.xml`, and `mobile-qa-165-discover-font130.xml`; verified runtime log includes the exact commit marker and QA-021 warning.
- No MOBILE-to-WEB blocker: WEB APIs were neither read nor changed.
- **MOBILE-QA release recommendation: CONDITIONAL NO-GO.** The 20 target-floor outcomes independently pass, but QA-021 must be corrected and rerun; Doctor, Noble, and physical accessibility/resilience evidence remain release follow-ups.

## MOBILE-QA 20/20 reconciliation

- Findings inspected/reconciled: 21 distinct evidence-backed findings (20 DEV outcomes plus QA-021).
- Material DEV outcomes available: 20; independently verified: 20/20 PASS.
- Remaining to 20: 0. No cosmetic or duplicate outcome counted.
- Carry-forward order: `MOBILE-QA-021`, `MOBILE-QA-010`, `MOBILE-QA-008`, `MOBILE-QA-004`.

---

# MOBILE-QA validation handoff — MOBILE-166

- Trigger: 2026-08-26T09:41:14.703Z. Inspected result commit `77f88c6bb22ff22aee46b9aada9da332020d2d67` (`fix(mobile): normalize trench dex filters`), base `51fd2e8`.
- Scope/coordination: PASS. Explicit canonical workdir and safe-directory Git top-level normalized to `c:/tuan/devapps/teminal-dex-app`; Git prefix was empty; start/end worktree was clean; no DEV or QA lock was held before QA reporting. QA used a clean archive of the immutable result. No product, test, configuration, application-data, WEB, wallet, provider, or transaction write occurred.
- Environment: Windows, bundled Node 24.19.0, Expo 57 local CLI, API 37 `emulator-5554` 1080x2400. Verified runtime marker: `[MOBILE_BUILD] commit=77f88c6bb22ff22aee46b9aada9da332020d2d67`.

## MOBILE-QA acceptance matrix

| Criterion | Result | Independent evidence |
| --- | --- | --- |
| Type and changed-surface lint | PASS | Clean archive `tsc --noEmit` exits 0; ESLint of changed Trenches screen/library/test exits 0. |
| Focused and full regressions | PASS | Focused Trenches/TrenchCard/primary-a11y: 3 suites / 74 tests. Full Jest: 83 suites / 419 tests. |
| Expo/config/bundles | PASS with existing conditions | Public config resolves expected secure platform configuration; compatibility reports dependencies up to date; Android/iOS/web exports complete. Android retains the known Noble fallback warning. Doctor is still 17/21 because four checks cannot spawn child `npm`. |
| Exact API 37 QA-021 retest | PASS | Trenches → Open launch filters renders only `All`, `pumpfun`, `meteora`, `raydium`, `orca`, and `pumpswap`; `Select launchpad undefined` is absent. Cleared log window contains the exact build marker and no duplicate-key/TrenchFilterPanel warning, fatal exception, unresolved script, or ANR. |

## MOBILE-QA reconciliation (20)

| Stable ID | Result | Evidence / owner / exact NEXT_DEV_ACTION |
| --- | --- | --- |
| MOBILE-DATA-261 | PASS | Unit normalization rejects non-string DEX; runtime has no undefined launchpad. **NEXT_DEV_ACTION:** retain regression. |
| MOBILE-DATA-262 | PASS | Unit normalization trims/rejects blank DEX. **NEXT_DEV_ACTION:** retain regression. |
| MOBILE-DATA-263 | PASS | Case-insensitive map deduplicates with stable first casing; focused test passes. **NEXT_DEV_ACTION:** retain regression. |
| MOBILE-DATA-264 | PASS | Reserved `All` is excluded from provider values and exactly one local All control rendered. **NEXT_DEV_ACTION:** retain regression. |
| MOBILE-DATA-265 | PASS | Filter comparison normalizes optional DEX null-safely; missing-Dex test passes. **NEXT_DEV_ACTION:** retain regression. |
| MOBILE-REC-266 | PASS | Effective selection falls back to All when a selected provider label disappears. Source and focused regression pass. **NEXT_DEV_ACTION:** add provider-refresh device fixture when available. |
| MOBILE-DATA-267 | PASS | Trench card uses normalized DEX or localized unavailable value rather than raw undefined/blank evidence. **NEXT_DEV_ACTION:** add rendered unavailable-provenance fixture. |
| MOBILE-PERF-268 | PASS | Launchpad cap follows normalize/dedupe and focused cap test passes; runtime panel contains six valid options. **NEXT_DEV_ACTION:** retain cap regression. |
| MOBILE-QA-269 | BLOCKED P2 | Physical Android TalkBack traversal unavailable. Owner: QA/device provider. **NEXT_DEV_ACTION:** run on real Android hardware. |
| MOBILE-QA-270 | BLOCKED P2 | Physical iOS VoiceOver unavailable. Owner: QA/device provider. **NEXT_DEV_ACTION:** run on iOS hardware. |
| MOBILE-QA-271 | BLOCKED P2 | Switch Access motor flow unavailable. Owner: QA/device provider. **NEXT_DEV_ACTION:** run on physical Android. |
| MOBILE-QA-272 | BLOCKED P2 | 320dp/small-screen layout matrix unavailable. Owner: QA/device provider. **NEXT_DEV_ACTION:** supply small-screen target. |
| MOBILE-QA-273 | BLOCKED P2 | Offline → retry → reconnect unavailable without device/network fault control. Owner: QA/device provider. **NEXT_DEV_ACTION:** provide controlled network fixture. |
| MOBILE-QA-274 | BLOCKED P2 | Background/restore recovery unavailable. Owner: QA/device provider. **NEXT_DEV_ACTION:** run device lifecycle matrix. |
| MOBILE-QA-275 | BLOCKED P2 | Persistence failure/retry needs fault injection. Owner: QA/device provider. **NEXT_DEV_ACTION:** provide controllable storage fixture. |
| MOBILE-QA-276 | BLOCKED P2 | Immutable Doctor is 17/21 because child `npm` cannot spawn. Owner: toolchain. **NEXT_DEV_ACTION:** provide bundled/repository-local npm or exact 21/21 run. |
| MOBILE-QA-277 | CONDITIONAL PASS P2 | Android bundle completes but retains Noble strict-exports fallback. Owner: upstream dependency lane. **NEXT_DEV_ACTION:** revalidate guard before resolver/dependency change. |
| MOBILE-QA-278 | BLOCKED P2 | Monitor active-reset branch needs controllable provider data. Owner: QA/provider fixture. **NEXT_DEV_ACTION:** provide active-filter fixture. |
| MOBILE-QA-279 | BLOCKED P2 | Monitor partial-page retry needs controllable cursor failure. Owner: QA/provider fixture. **NEXT_DEV_ACTION:** provide partial-page fixture. |
| MOBILE-QA-280 | BLOCKED P2 | Physical startup/performance measurements unavailable. Owner: QA/device provider. **NEXT_DEV_ACTION:** capture on physical hardware. |

## MOBILE-QA finding status and release

- MOBILE-QA-021: **RESOLVED.** Exact-device reproduction is clean; normalized runtime launchpads contain no undefined option and log has no duplicate-key warning.
- Safe runtime evidence: `%LOCALAPPDATA%\Temp\mobile-qa-166-trenches-filter-final.xml` and cleared API 37 logcat window. No screenshots, secrets, or backend diagnostics retained.
- No MOBILE-to-WEB contract blocker; WEB was not read or written.
- **MOBILE-QA release recommendation: CONDITIONAL NO-GO.** MOBILE-166 fixes QA-021 and all eight ready outcomes pass, but physical accessibility/resilience, Doctor, and upstream Noble evidence remain unresolved.

## MOBILE-QA throughput disposition

- Findings inspected/reconciled: 20.
- DEV material outcomes available: 8; independently verified: 8/8 PASS.
- Exact shortfall to 20 DEV outcomes: 12; `MOBILE-QA-269..280` are blocked by the listed device/toolchain/upstream/provider owners. No padding applied.
- Carry-forward order: `MOBILE-QA-269`, `MOBILE-QA-270`, `MOBILE-QA-271`, `MOBILE-QA-272`, `MOBILE-QA-273`, `MOBILE-QA-274`, `MOBILE-QA-275`, `MOBILE-QA-276`, `MOBILE-QA-277`, `MOBILE-QA-278`, `MOBILE-QA-279`, `MOBILE-QA-280`.

---

# MOBILE-QA validation handoff — MOBILE-167

- Trigger: 2026-08-26T10:40:30.804Z. Inspected exact result `321470605791148c5aa4faab3696c2a55c2f2434` (`fix(mobile): normalize monitor dex filters`), base `6646131`.
- Scope: PASS. Explicit canonical directory and safe-directory Git top-level normalized to `c:/tuan/devapps/teminal-dex-app`; prefix empty; no DEV lock; clean worktree before/after. QA used a clean archive and made no product, WEB, API, wallet, data, or transaction mutation.
- Environment: bundled Node 24.19.0, API 37 emulator. The verified local launch started at the exact SHA, but the dev launcher did not settle on the requested Monitor route before the bounded runtime window; no runtime claim is inferred.

## MOBILE-QA acceptance

| Criterion | Result | Evidence |
| --- | --- | --- |
| Type / changed-surface lint | PASS | Immutable `tsc --noEmit` and ESLint of Monitor table/store/focused test exit 0. |
| Focused regression | PASS | `monitor-table.test.ts`: 1 suite / 6 tests, including invalid/blank/reserved/case-duplicate DEX, null-safe filter, and cap behavior. |
| Full regression | PASS | Immutable Jest: 83 suites / 421 tests. |
| Runtime Monitor route | BLOCKED | API 37 verified-launch attempt did not settle on Monitor controls in the bounded window; no malformed-control/crash conclusion fabricated. |
| Expo Doctor / bundles | BLOCKED / SKIP | Doctor remains an inherited npm-child tooling blocker; no config/package change, and MOBILE-166 export evidence is unchanged. **NEXT_DEV_ACTION:** provide stable dev-client route plus npm-enabled Doctor lane. |

## MOBILE-QA reconciliation (20)

| IDs | Result | Evidence / owner / exact NEXT_DEV_ACTION |
| --- | --- | --- |
| MOBILE-DATA-281..285 | PASS | Focused regression proves normalize/reject invalid/blank/reserved DEX, case-safe option behavior, and null-safe selected filtering. **NEXT_DEV_ACTION:** retain tests. |
| MOBILE-REC-286 | PASS | Derived effective selection fails soft to All without persistence mutation; source/test review passes. **NEXT_DEV_ACTION:** add controllable refresh device fixture. |
| MOBILE-DATA-287 | PASS | Monitor source localizes unavailable DEX provenance instead of raw malformed evidence. **NEXT_DEV_ACTION:** add rendered fixture. |
| MOBILE-PERF-288 | PASS | Normalization/dedupe precede limiting; focused bounded-helper test passes. **NEXT_DEV_ACTION:** retain cap regression. |
| MOBILE-QA-269..275 | BLOCKED P2 | Physical TalkBack, VoiceOver, Switch Access, 320dp, offline/reconnect, background/restore, persistence-fault matrix unavailable; owner QA/device provider. **NEXT_DEV_ACTION:** run physical matrix. |
| MOBILE-QA-276 | BLOCKED P2 | Doctor child executable unavailable; owner toolchain. **NEXT_DEV_ACTION:** provide npm-enabled exact run. |
| MOBILE-QA-277 | CONDITIONAL PASS P2 | Carried Noble fallback warning; owner upstream. **NEXT_DEV_ACTION:** revalidate compatibility guard on dependency change. |
| MOBILE-QA-278..279 | BLOCKED P2 | Active-reset and cursor-failure branches require controllable provider fixtures; owner QA/provider fixture. **NEXT_DEV_ACTION:** provide fixtures. |
| MOBILE-QA-280 | BLOCKED P2 | Physical performance measurement unavailable; owner QA/device provider. **NEXT_DEV_ACTION:** capture hardware measurements. |

## MOBILE-QA release and throughput

- **Release: CONDITIONAL NO-GO.** The eight MOBILE-167 production outcomes pass static/automated verification; exact runtime route verification and existing external evidence remain unresolved.
- Findings reconciled: 20. DEV outcomes available/verified: 8/8 PASS. Exact shortfall: 12 (`MOBILE-QA-269..280`); no padding.
- No MOBILE-to-WEB blocker. QA lock released after this report.
- **NEXT_DEV_ACTION:** provide a stable verified Monitor dev-client route and controlled/physical evidence for `MOBILE-QA-269..280`.

---

# MOBILE-QA validation handoff — MOBILE-168

- Trigger: 2026-08-26T11:40:32.054Z. Scope PASS: canonical safe-directory Git top-level `c:/tuan/devapps/teminal-dex-app`, empty prefix, clean worktree, no DEV lock. Inspected immutable result `649fbd88750f0e0cd9b9628da458e0fe09db6bcf`, base `df8b438`, from a clean archive.
- Evidence: TypeScript PASS; changed-surface ESLint PASS; focused provenance regression PASS (4 suites/9 tests). No product, WEB, API, data, wallet, transaction, or configuration mutation occurred.

## MOBILE-QA reconciliation and release

| IDs | Result | Evidence / exact NEXT_DEV_ACTION |
| --- | --- | --- |
| MOBILE-DATA-301..308 | PASS | Shared formatter and focused render tests cover trimmed valid provider labels plus localized fallbacks across Token Detail, Quote Review, Operations, Discover, Monitor, Trenches, Market Intelligence, and Wallet Intelligence. **NEXT_DEV_ACTION:** retain shared formatter regression. |
| MOBILE-QA-269..275 | BLOCKED P2 | Physical accessibility, small-screen, offline/reconnect, lifecycle, and storage-fault evidence unavailable; owner QA/device provider. **NEXT_DEV_ACTION:** run physical matrix. |
| MOBILE-QA-276 | BLOCKED P2 | npm-enabled Doctor unavailable; owner toolchain. **NEXT_DEV_ACTION:** provide exact 21/21 lane. |
| MOBILE-QA-277 | CONDITIONAL PASS P2 | Known Noble Android fallback; owner upstream. **NEXT_DEV_ACTION:** revalidate on dependency change. |
| MOBILE-QA-278..280 | BLOCKED P2 | Provider fixtures and physical performance unavailable; owner QA/provider/device. **NEXT_DEV_ACTION:** provide controlled fixtures and hardware measurements. |

- Full Jest/config/bundle/runtime were not re-run in this bounded trigger; the DEV handoff claims 83/422 and public config PASS, but QA does not treat that as independent evidence. **NEXT_DEV_ACTION:** rerun full regression, exports, and exact API 37 malformed-provenance flow.
- **MOBILE-QA release: CONDITIONAL NO-GO.** 8/8 available outcomes pass proportional independent verification; 12 external blocker IDs remain. QA lock released after reporting.
- Throughput: 20 reconciled; 8 available/verified PASS; exact shortfall 12 (`MOBILE-QA-269..280`), no padding.

---

# MOBILE-QA validation handoff — MOBILE-169

- Trigger: 2026-08-26T12:42:03.038Z. Inspected exact result `82a287a14102aabd6b60750854f4cec3670bad0e` (`fix(mobile): harden evidence labels across surfaces`), base `6d53b9e`.
- Scope/coordination: PASS. Explicit canonical workdir and safe-directory Git top-level normalized to `c:/tuan/devapps/teminal-dex-app`; Git prefix was empty; result stayed clean and immutable before reporting; no DEV/report lock was held before QA acquired its dedicated report lock. Source and automated gates ran from a clean archive of the exact result. The runtime build was served from the clean canonical result only after the archive launcher correctly failed without `.git`; it emitted `[MOBILE_BUILD] commit=82a287a14102aabd6b60750854f4cec3670bad0e`. No product, test, configuration, WEB, API, provider, wallet, transaction, or application-data write occurred.
- Environment/device: Windows; bundled Node 24.19.0; Expo 57 local CLI; API 37 `emulator-5554` (1080x2400); clean archive `%LOCALAPPDATA%\\Temp\\mobile-qa-169-82a287a`. The emulator accepted the exact development-client deep link, but its accessibility hierarchy remained on the development-client `Tools` view, so no rendered label or navigation claim is inferred.

## MOBILE-QA acceptance matrix

| Criterion | Result | Independent evidence |
| --- | --- | --- |
| Immutable type and changed-surface lint | PASS | Archive `tsc --noEmit` exits 0; ESLint exits 0 for all eight changed production surfaces, shared formatter, and formatter regression. |
| Focused malformed-evidence regressions | PASS | `format`, Token Evidence, MonitorTokenTable, TrenchCard, TrackEventCard, PrimaryDetailState, and whale-activity: 7 suites / 30 tests pass. |
| Full regression | PASS | Archive `jest --ci --runInBand --silent`: 83 suites / 422 tests pass in 39.164s. |
| Expo public configuration | PASS | Android/iOS/web resolve; `terminaldex` scheme, iOS HTTPS-only ATS, Android biometric permissions, and no public secret/endpoint are present. |
| Android / iOS / web bundle | CONDITIONAL PASS / PASS / PASS | Android emits one 5.7 MB Hermes bundle and `metadata.json`, but retains the known Noble strict-exports fallback. iOS emits one 2.3 MB Hermes bundle and metadata. Web static export completes with one bundle and route output. |
| Expo Doctor | BLOCKED | Local CLI explicitly returns `expo doctor is not supported in the local CLI`; no standalone npm-enabled Doctor lane is available. |
| Exact Android runtime build | PASS with blocked scenario | API 37 device connected; port reverse and deep-link launch returned `Status: ok`, warm activity `app.terminaldex.mobile/.MainActivity`; Metro bundled 1,887 modules and logged exact commit marker. The client did not settle beyond its `Tools` accessibility view, and no deterministic whitespace-provider fixture exists; malformed-label, retry, navigation, large-text, offline/error, and partial-page visual traversal remains blocked. |

## MOBILE-QA reconciliation (20 distinct DEV outcomes)

| Stable ID | Result | Evidence, affected surface, and risk |
| --- | --- | --- |
| MOBILE-DATA-321 | PASS | Operations market source fallback is covered by the shared bounded formatter and focused evidence regression; blank evidence can no longer render as a deceptive present value. |
| MOBILE-DATA-322 | PASS | Operations market quality fallback uses the same trim/localize path; focused formatter/render evidence passes. |
| MOBILE-DATA-323 | PASS | Operations trader source fallback is bounded before user-visible output; no raw whitespace path remains in reviewed surface. |
| MOBILE-DATA-324 | PASS | Operations ingestion source fallback is localized through the shared helper; TypeScript/lint/regressions pass. |
| MOBILE-DATA-325 | PASS | Operations ingestion commitment fallback is localized rather than blank; regression risk is contained by full suite. |
| MOBILE-A11Y-326 | PASS | Whale relationship accessibility DEX fallback is normalized in accessible output; focused whale-activity evidence passes. |
| MOBILE-DATA-327 | PASS | Wallet ranking quality fallback trims valid values and localizes missing evidence; reviewed wallet-intelligence surface passes static and full gates. |
| MOBILE-DATA-328 | PASS | Wallet PnL provenance method fallback uses bounded evidence output; no API contract mutation is present. |
| MOBILE-DATA-329 | PASS | Track smart-money quality fallback is covered by `TrackEventCard` focused regression. |
| MOBILE-DATA-330 | PASS | Track evidence-provider fallback is covered by `TrackEventCard` focused regression. |
| MOBILE-DATA-331 | PASS | Token bubble source fallback is covered by Token Evidence / PrimaryDetailState focused render regressions. |
| MOBILE-DATA-332 | PASS | Token quality freshness fallback is bounded by the shared formatter; valid labels still trim. |
| MOBILE-DATA-333 | PASS | Token pair source fallback is localized under blank/missing values in focused detail evidence. |
| MOBILE-DATA-334 | PASS | Token provenance source fallback is localized, with no schema/API contract change. |
| MOBILE-DATA-335 | PASS | Token provenance quality fallback is localized and retained by full regression. |
| MOBILE-DATA-336 | PASS | Discover quality fallback is bounded on the reviewed Discover surface; compile, lint, and full suite pass. |
| MOBILE-DATA-337 | PASS | Monitor header source fallback is covered by `MonitorTokenTable` focused regression. |
| MOBILE-DATA-338 | PASS | Monitor header quality fallback is covered by `MonitorTokenTable` focused regression. |
| MOBILE-DATA-339 | PASS | Trenches quality fallback is covered by `TrenchCard` focused regression; prior DEX normalization remains protected. |
| MOBILE-DATA-340 | PASS | Whale best-token whitespace fallback is covered by focused whale-activity/formatter evidence; blank valid-looking token evidence no longer survives. |

## MOBILE-QA carry-forward blockers and release

- `MOBILE-QA-269..275`, `MOBILE-QA-278..280`: BLOCKED P2, owner QA/device/provider fixture. Physical TalkBack/VoiceOver/Switch Access/small-screen, offline-retry-reconnect, lifecycle, persistence-fault, active-reset, cursor-failure, and performance scenarios have no controllable fixture or physical matrix evidence.
- `MOBILE-QA-276`: BLOCKED P2, owner toolchain. Doctor cannot complete because the local Expo CLI rejects the command and child npm is unavailable.
- `MOBILE-QA-277`: CONDITIONAL PASS P2, owner upstream dependency lane. Android export is successful but logs `@solana/wallet-standard-util` to Noble `./crypto.js` strict-exports fallback; no unresolved bundle module occurs.
- Runtime artifacts/log references: `%LOCALAPPDATA%\\Temp\\mobile-qa-169-full.err.log`, `mobile-qa-169-android-export.err.log`, `mobile-qa-169-runtime-canonical.out.log`, and `mobile-qa-169-window.xml`. The UI dump proves only the development-client surface; it is not evidence of a product label result. No screenshot, secret, backend payload, or provider diagnostic was retained.
- No MOBILE-to-WEB contract blocker: WEB was neither read nor written.
- **MOBILE-QA release recommendation: CONDITIONAL NO-GO.** All 20 MOBILE-169 source/automated outcomes independently pass, but production release evidence is incomplete for rendered malformed-provider labels and the carried physical/toolchain/upstream lanes.

## MOBILE-QA 20/20 throughput disposition

- Findings inspected/reconciled: 20 distinct MOBILE-169 outcomes plus carried stable blockers.
- Material DEV outcomes available: 20; independently verified: 20/20 PASS; exact shortfall to 20: 0.
- Scenario status not counted as an additional DEV outcome: malformed-evidence UI traversal is BLOCKED by no deterministic provider fixture and the development-client route not settling.
- Carry-forward order: `MOBILE-QA-269`, `MOBILE-QA-270`, `MOBILE-QA-271`, `MOBILE-QA-272`, `MOBILE-QA-273`, `MOBILE-QA-274`, `MOBILE-QA-275`, `MOBILE-QA-276`, `MOBILE-QA-277`, `MOBILE-QA-278`, `MOBILE-QA-279`, `MOBILE-QA-280`.
- **NEXT_DEV_ACTION:** provide a deterministic whitespace/missing-evidence fixture and a verified dev-client route that opens each affected screen so QA can execute the rendered labels, retry, offline/error, navigation, and accessibility matrix on the immutable result.

---

# MOBILE-QA validation handoff — MOBILE-170

- Trigger: 2026-08-26T13:41:33.980Z. Inspected exact result `b9a5b2e1c6a9c78a42ff17328e21fb740c65bc86` (`fix(mobile): normalize live feed evidence`), base `c28a7f6`.
- Scope/coordination: PASS. The explicit canonical directory and safe-directory Git top-level normalize to `c:/tuan/devapps/teminal-dex-app`; Git prefix is empty. Start/end primary worktree was clean; no DEV writer lock was present; the result was pinned in a clean archive with the existing dependency tree attached. QA acquired the dedicated report lock only for this report. No product, test, config, provider/API, WEB, wallet, transaction, or data write occurred.
- Environment/device: Windows; bundled Node 24.19.0; Expo 57 local CLI; API 37 `emulator-5554` (1080x2400); archive `%LOCALAPPDATA%\\Temp\\mobile-qa-170-b9a5b2e`. The exact canonical development bundle emitted `[MOBILE_BUILD] commit=b9a5b2e1c6a9c78a42ff17328e21fb740c65bc86`; the deep-linked development client remained on its `Tools` accessibility view, so no visual content, navigation, retry, or malformed-provider result is inferred.

## MOBILE-QA acceptance matrix

| Criterion | Result | Independent evidence |
| --- | --- | --- |
| Type and changed-surface lint | PASS | Archive `tsc --noEmit` and ESLint for all six changed product surfaces, shared formatter, and formatter test exit 0. |
| Focused live-feed regression | PASS with flake finding | `MonitorTokenTable.test.tsx` rerun alone passes 1/3; format and all changed-surface component coverage is included in the final full suite. The initial seven-suite mixed invocation exposed `MOBILE-QA-281`, documented below. |
| Full regression | PASS | Archive `jest --ci --runInBand --silent`: 83 suites / 423 tests pass in 47.177s. |
| Expo public configuration | PASS | Android/iOS/web resolve with `terminaldex` deep-link scheme, iOS HTTPS-only ATS, biometric-only Android permissions, and no public secret/endpoint. |
| Android / iOS / web bundles | CONDITIONAL PASS / PASS / PASS | Android exports one 5.7 MB Hermes bundle plus metadata and retains Noble strict-exports fallback. iOS exports one 2.3 MB Hermes bundle plus metadata. Web static export completes with one bundle and routes output. |
| Expo Doctor | BLOCKED | Direct local `expo-doctor` attempts `spawn node ENOENT`; complete Doctor lane cannot run in this toolchain. |
| Exact Android runtime | PASS with blocked scenario | ADB reverse/deep-link and bundling complete; exact MOBILE_BUILD marker is present. UI dump contains only development-client `Tools`; no deterministic blank/duplicate provider fixture is available, so live-feed evidence, list ordering, loading/stale/empty/filtered-empty/offline/error/retry/partial-page, large-text, and accessibility traversal is BLOCKED rather than fabricated. |

## MOBILE-QA reconciliation (20 distinct DEV outcomes)

| Stable ID | Result | Evidence, affected surface, and regression risk |
| --- | --- | --- |
| MOBILE-DATA-341 | PASS | CopyTrade ranking quality uses bounded evidence fallback; reviewed display-only change preserves trading/submission safety boundary. |
| MOBILE-DATA-342 | PASS | Market Intelligence quality now trims valid text/localizes blank evidence; static and full suite pass. |
| MOBILE-DATA-343 | PASS | Market Intelligence source now uses localized unavailable evidence instead of raw blank text. |
| MOBILE-DATA-344 | PASS | Market Intelligence provider list uses `evidenceList`: blanks are removed, trimmed exact duplicates collapse, and empty lists fall back truthfully. |
| MOBILE-DATA-345 | PASS | Claims source uses bounded source fallback in the evidence bar. |
| MOBILE-DATA-346 | PASS | Claims RPC endpoint uses bounded unavailable fallback and does not alter the read-only contract. |
| MOBILE-DATA-347 | PASS | Claims health uses bounded unavailable fallback; no health-state mutation is introduced. |
| MOBILE-DATA-348 | PASS | Monitor delivery source is bounded before user-visible live-feed output. |
| MOBILE-DATA-349 | PASS | Monitor transaction source is bounded in the live-event metadata row. |
| MOBILE-DATA-350 | PASS | Monitor event channel is bounded in delivery metadata. |
| MOBILE-DATA-351 | PASS | Monitor event status is bounded in delivery metadata. |
| MOBILE-DATA-352 | PASS | Monitor evaluation source is bounded in evaluation-history metadata. |
| MOBILE-DATA-353 | PASS | Trenches page quality uses `evidenceLabel` rather than whitespace-preserving uppercased text. |
| MOBILE-DATA-354 | PASS | Trenches page source is bounded in provenance output. |
| MOBILE-DATA-355 | PASS | Trenches provider list uses `evidenceList`, preventing blank separators and exact duplicate entries. |
| MOBILE-DATA-356 | PASS | Whales event source is bounded in compact live-event evidence. |
| MOBILE-DATA-357 | PASS | Whales event quality is bounded in compact live-event evidence. |
| MOBILE-DATA-358 | PASS | Track delivery channel is bounded in delivery title output. |
| MOBILE-DATA-359 | PASS | Track delivery status is bounded in delivery title output. |
| MOBILE-DATA-360 | PASS | Track social provider list uses `evidenceList`, preventing blank separators and exact duplicate entries. |

## MOBILE-QA finding and carry-forward blockers

| ID | Severity / owner | Result | Reproduction, risk, and disposition |
| --- | --- | --- | --- |
| MOBILE-QA-281 | P2 / DEV test-maintenance | FAIL (intermittent) | Running the seven related suites together under `--ci --runInBand --silent` produced one `MonitorTokenTable` 5s timeout (`keeps provider market rows explicitly monitor-only across presets`) and the following test used an unmounted renderer. The same file rerun alone passes 3/3 and the complete 83/423 suite passes. Risk: order/resource-sensitive focused regression evidence can be non-deterministic. |

- `MOBILE-QA-269..275`, `MOBILE-QA-278..280`: BLOCKED P2, owner QA/device/provider fixture. Physical assistive-tech/small-screen/offline/lifecycle/storage/provider-cursor/performance evidence remains unavailable.
- `MOBILE-QA-276`: BLOCKED P2, owner toolchain. Doctor cannot spawn `node` in its child process.
- `MOBILE-QA-277`: CONDITIONAL PASS P2, owner upstream dependency lane. Android export completes with no unresolved module but retains `@solana/wallet-standard-util` → Noble `./crypto.js` strict-exports fallback.
- Runtime/log references: `%LOCALAPPDATA%\\Temp\\mobile-qa-170-full.err.log`, `mobile-qa-170-android-export.err.log`, `mobile-qa-170-runtime.out.log`, and `mobile-qa-170-window.xml`. No screenshot, secret, backend response, or provider diagnostic was retained. No MOBILE-to-WEB contract blocker; WEB was neither read nor written.
- **MOBILE-QA release recommendation: CONDITIONAL NO-GO.** The 20 DEV outcomes pass independent source/automated gates, but `MOBILE-QA-281`, rendered live-feed fixture traversal, physical/toolchain lanes, and Noble condition prevent release certification.

## MOBILE-QA 20/20 throughput disposition

- Findings inspected/reconciled: 21 distinct evidence-backed MOBILE-QA items (20 DEV outcomes plus `MOBILE-QA-281`).
- Material DEV outcomes available/verified: 20/20 PASS. Exact shortfall to 20: 0.
- Stable blocked/skipped IDs: `MOBILE-QA-269..276`, `MOBILE-QA-278..280`; conditional `MOBILE-QA-277`; intermittent fail `MOBILE-QA-281`.
- Carry-forward order: `MOBILE-QA-281`, `MOBILE-QA-269`, `MOBILE-QA-270`, `MOBILE-QA-271`, `MOBILE-QA-272`, `MOBILE-QA-273`, `MOBILE-QA-274`, `MOBILE-QA-275`, `MOBILE-QA-276`, `MOBILE-QA-277`, `MOBILE-QA-278`, `MOBILE-QA-279`, `MOBILE-QA-280`.
- **NEXT_DEV_ACTION:** isolate and eliminate the `MonitorTokenTable` cross-suite timeout/unmounted-renderer flake, then provide deterministic blank/duplicate live-feed fixtures with a development-client route that opens all six affected surfaces for exact runtime/a11y verification.

---

# MOBILE-QA validation handoff — MOBILE-171

- Trigger: 2026-08-26T14:40:35.110Z. Inspected immutable result `4671198f6a18c9dc60ddef566d68ee0f32d6f4f6` (`fix(mobile): expand auxiliary touch targets`), base `bc21809`.
- Scope/coordination: PASS. Explicit canonical workspace and safe-directory Git top-level normalize to `c:/tuan/devapps/teminal-dex-app`; Git prefix was empty; start/end result worktree was clean; no DEV lock was present. Independent source/tests used clean archive `%LOCALAPPDATA%\\Temp\\mobile-qa-171-4671198` with existing dependencies linked. QA acquired the report lock only while writing this handoff. No product, WEB, API/provider, wallet, signing, trading, data, or configuration write occurred.
- Environment/device: Windows; bundled Node 24.19.0; Expo 57 local CLI; API 37 emulator available. The verifier started but the emulator’s deep-link/automation calls did not settle within the bounded window and no exact build marker reached the runtime log. No edge-tap, focus, selection, wrapping, large-text, retry, or navigation result is claimed.

## MOBILE-QA acceptance matrix

| Criterion | Result | Independent evidence |
| --- | --- | --- |
| Type and changed-surface lint | PASS | Archive `tsc --noEmit` and ESLint of ten changed routes plus both regression files exit 0. |
| Required grouped Monitor focused regression | FAIL P1 | `jest --ci --runInBand --silent MonitorTokenTable touch-targets` fails: `keeps provider market rows explicitly monitor-only across presets` exceeds the 5s timeout; the same `MonitorTokenTable` file alone passes 3/3. This reproduces `MOBILE-QA-281`, so the DEV claimed grouped stability is not independently accepted. |
| Touch-target regression | PASS | `touch-targets.test.ts` passes 15/15 in the failed grouped invocation; source establishes 44px minimum styles for all named changed families. |
| Full regression | PASS | Archive `jest --ci --runInBand --silent`: 83 suites / 433 tests pass in 68.571s. Full-pass evidence does not erase the specific grouped-regression failure. |
| Expo public config | PASS | Android/iOS/web configuration resolves, retaining deep-link, ATS, biometric, and no-secret boundaries. |
| Platform bundles | CONDITIONAL PASS / PASS / PASS | Android (one 5.7 MB Hermes bundle plus metadata) succeeds with carried Noble strict-exports warning; iOS (one 2.3 MB Hermes bundle plus metadata) and web static export succeed. |
| Expo Doctor and device traversal | BLOCKED | Local Doctor reports `spawn node ENOENT`. Bounded device deep-link/UI automation did not settle. |

## MOBILE-QA reconciliation (20 distinct DEV outcomes)

| Stable ID | Result | Evidence and risk |
| --- | --- | --- |
| MOBILE-QA-281 | FAIL P1 | Grouped Monitor + touch-target invocation deterministically times out in Monitor then unmounts the renderer; isolated/full tests pass but do not prove grouped stability. |
| MOBILE-TOUCH-361 | PASS | AI back control has explicit 44px touch minimum; touch-target regression passes. |
| MOBILE-TOUCH-362 | PASS | CopyTrade back control has explicit 44px minimum. |
| MOBILE-TOUCH-363 | PASS | CopyTrade period selectors have explicit 44px minimum. |
| MOBILE-TOUCH-364 | PASS | CopyTrade mode pills have explicit 44px minimum. |
| MOBILE-TOUCH-365 | PASS | CopyTrade toggles have explicit 44px minimum. |
| MOBILE-TOUCH-366 | PASS | CopyTrade pause controls have explicit 44px minimum. |
| MOBILE-TOUCH-367 | PASS | Research back control has explicit 44px minimum. |
| MOBILE-TOUCH-368 | PASS | Research remove control has explicit 44px minimum. |
| MOBILE-TOUCH-369 | PASS | Research numeric input has explicit 44px minimum. |
| MOBILE-TOUCH-370 | PASS | Research icon action has explicit 44px minimum. |
| MOBILE-TOUCH-371 | PASS | Wallet Intelligence back control has explicit 44px minimum. |
| MOBILE-TOUCH-372 | PASS | Wallet Intelligence remove control has explicit 44px minimum. |
| MOBILE-TOUCH-373 | PASS | Operations back control has explicit 44px minimum. |
| MOBILE-TOUCH-374 | PASS | Market Intelligence back control has explicit 44px minimum. |
| MOBILE-TOUCH-375 | PASS | Trade back control has explicit 44px minimum. |
| MOBILE-TOUCH-376 | PASS | Track filters have explicit 44px minimum. |
| MOBILE-TOUCH-377 | PASS | Track retry has explicit 44px minimum. |
| MOBILE-TOUCH-378 | PASS | Settings back control has explicit 44px minimum. |
| MOBILE-TOUCH-379 | PASS | Token Detail back control has explicit 44px minimum. |

## MOBILE-QA release, blockers, and throughput

- `MOBILE-QA-269..275`, `MOBILE-QA-278..280`: BLOCKED P2, owner QA/device/provider fixture. Physical assistive-tech/small-screen/offline/lifecycle/storage/provider-cursor/performance scenarios remain unverified.
- `MOBILE-QA-276`: BLOCKED P2, owner toolchain; Doctor cannot spawn its child Node executable. `MOBILE-QA-277`: CONDITIONAL PASS P2, owner upstream dependency; Android bundle retains the Noble fallback.
- Runtime/log references: `%LOCALAPPDATA%\\Temp\\mobile-qa-171-full.err.log`, `mobile-qa-171-android-export.err.log`, and `mobile-qa-171-runtime.out.log`. No screenshot, credential, provider payload, or WEB evidence was retained; no MOBILE-to-WEB blocker exists.
- **MOBILE-QA release recommendation: NO-GO.** `MOBILE-QA-281` is a current P1 required-regression failure; runtime motor/accessibility evidence and carried toolchain/device blockers also remain.
- Findings inspected/reconciled: 20 material outcomes plus carried stable blockers. Material DEV outcomes available: 20; independently PASS: 19; FAIL: 1 (`MOBILE-QA-281`); exact shortfall to 20: 0.
- Carry-forward order: `MOBILE-QA-281`, `MOBILE-QA-269`, `MOBILE-QA-270`, `MOBILE-QA-271`, `MOBILE-QA-272`, `MOBILE-QA-273`, `MOBILE-QA-274`, `MOBILE-QA-275`, `MOBILE-QA-276`, `MOBILE-QA-277`, `MOBILE-QA-278`, `MOBILE-QA-279`, `MOBILE-QA-280`.
- **NEXT_DEV_ACTION:** make the grouped `MonitorTokenTable` and `touch-targets` command deterministically pass without timeout/unmounted-renderer, then supply an exact-build device route so QA can edge-tap all 19 controls at 1.0× and 1.3× font scale.
