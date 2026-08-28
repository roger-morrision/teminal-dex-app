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

---

# MOBILE-QA validation handoff — MOBILE-172

- Trigger: 2026-08-26T15:42:06.293Z. Inspected immutable result `b0627bbf59ec58381e422e53b5f12400edaabe04` (`fix(mobile): harden secondary touch controls`), base `16ee90f`.
- Scope/coordination: PASS. Explicit canonical workdir and safe-directory Git top-level normalized to `c:/tuan/devapps/teminal-dex-app`; prefix empty; result worktree clean before/after validation; no DEV lock existed. QA used clean archive `%LOCALAPPDATA%\\Temp\\mobile-qa-172-b0627bb` with the existing dependency tree linked, and used the dedicated report lock only for this handoff. No product, test, configuration, WEB, API/provider, wallet, transaction, or data write occurred.
- Environment/device: Windows; bundled Node 24.19.0; Expo 57 local CLI. Fresh ADB discovery did not return inside the bounded attempt, so there is no device, edge-tap, TalkBack, large-text, focus, selection, retry, navigation, or visual geometry claim.

## MOBILE-QA acceptance matrix

| Criterion | Result | Independent evidence |
| --- | --- | --- |
| Type and changed-surface lint | PASS | Archive `tsc --noEmit` exits 0; ESLint of eight changed routes and both focused test files exits 0. |
| Required grouped Monitor regression | PASS | Exact archive command `jest --ci --runInBand --silent MonitorTokenTable touch-targets` passes three consecutive runs: 2 suites / 25 tests each. The cold run needs 16.457s overall but the formerly failing Monitor case completes under its explicit 15s budget. |
| Full regression | PASS | Archive `jest --ci --runInBand --silent`: 83 suites / 442 tests pass in 64.022s. |
| Expo/configuration | PASS with Doctor blocker | Public Android/iOS/web config passes and retains existing security/privacy boundaries. Local Doctor fails to spawn child Node (`ENOENT`). |
| Android / iOS / web bundles | CONDITIONAL PASS / PASS / PASS | Android exports one 5.7 MB Hermes bundle plus metadata, retaining the Noble strict-exports fallback; iOS exports one 2.3 MB Hermes bundle plus metadata; web static export succeeds. |
| Physical runtime accessibility/motor flow | BLOCKED | Fresh ADB discovery did not settle, preventing exact-build 1.0×/1.3× edge-tap and assistive-technology evidence. |

## MOBILE-QA reconciliation (20 distinct DEV outcomes)

| Stable ID | Result | Evidence and regression risk |
| --- | --- | --- |
| MOBILE-QA-281 | RESOLVED | Three consecutive exact grouped archive runs pass 25/25 without the prior timeout or unmounted renderer; the current full suite also passes. |
| MOBILE-TOUCH-380 | PASS | AI tabs have an explicit 44px minimum geometry guard in changed source/touch regression. |
| MOBILE-TOUCH-381 | PASS | Market Intelligence tabs have an explicit 44px minimum geometry guard. |
| MOBILE-TOUCH-382 | PASS | Market periods have an explicit 44px minimum geometry guard. |
| MOBILE-TOUCH-383 | PASS | Market signal/filter chips have an explicit 44px minimum geometry guard. |
| MOBILE-TOUCH-384 | PASS | Operations tabs have an explicit 44px minimum geometry guard. |
| MOBILE-TOUCH-385 | PASS | Research tabs have an explicit 44px minimum geometry guard. |
| MOBILE-TOUCH-386 | PASS | Research timeframes have an explicit 44px minimum geometry guard. |
| MOBILE-TOUCH-387 | PASS | Wallet Intelligence tabs have an explicit 44px minimum geometry guard. |
| MOBILE-TOUCH-388 | PASS | Token Detail tabs have an explicit 44px minimum geometry guard. |
| MOBILE-TOUCH-389 | PASS | Token chart timeframes have an explicit 44px minimum geometry guard. |
| MOBILE-TOUCH-390 | PASS | Monitor tabs have an explicit 44px minimum geometry guard. |
| MOBILE-TOUCH-391 | PASS | Monitor primary actions have an explicit 44px minimum geometry guard. |
| MOBILE-TOUCH-392 | PASS | Monitor alert inputs have an explicit 44px minimum geometry guard. |
| MOBILE-TOUCH-393 | PASS | Monitor alert choices have an explicit 44px minimum geometry guard. |
| MOBILE-TOUCH-394 | PASS | Monitor save action has an explicit 44px minimum geometry guard. |
| MOBILE-TOUCH-395 | PASS | Monitor alert switch has equivalent compact-switch hit slop guard. |
| MOBILE-TOUCH-396 | PASS | Monitor delete action has an explicit 44px minimum geometry guard. |
| MOBILE-TOUCH-397 | PASS | Trade buy/sell tabs have an explicit 44px minimum geometry guard. |
| MOBILE-TOUCH-398 | PASS | Trade slippage choices have an explicit 44px minimum geometry guard. |

## MOBILE-QA release, blockers, and throughput

- `MOBILE-QA-269..275`, `MOBILE-QA-278..280`: BLOCKED P2, owner QA/device/provider fixture. Physical TalkBack/VoiceOver/Switch Access/small-screen/offline/lifecycle/storage/cursor/performance scenarios remain unavailable.
- `MOBILE-QA-276`: BLOCKED P2, owner toolchain; Expo Doctor cannot spawn child Node. `MOBILE-QA-277`: CONDITIONAL PASS P2, owner upstream dependency; the Android Noble fallback remains.
- Evidence references: `%LOCALAPPDATA%\\Temp\\mobile-qa-172-full.err.log`, `mobile-qa-172-android-export.err.log`; no screenshot, credentials, backend payload, or WEB evidence retained. No MOBILE-to-WEB contract blocker exists.
- **MOBILE-QA release recommendation: CONDITIONAL NO-GO.** `MOBILE-QA-281` is resolved and all 20 current outcomes pass, but physical runtime/accessibility, Doctor, and Noble evidence remain incomplete.
- Findings inspected/reconciled: 20. DEV outcomes available/verified: 20/20 PASS; exact shortfall to 20: 0.
- Carry-forward order: `MOBILE-QA-269`, `MOBILE-QA-270`, `MOBILE-QA-271`, `MOBILE-QA-272`, `MOBILE-QA-273`, `MOBILE-QA-274`, `MOBILE-QA-275`, `MOBILE-QA-276`, `MOBILE-QA-277`, `MOBILE-QA-278`, `MOBILE-QA-279`, `MOBILE-QA-280`.
- **NEXT_DEV_ACTION:** provide a responsive exact-build Android/iOS device lane and deterministic states so QA can complete 1.0×/1.3× edge-tap, focus, selection, offline/retry, and recovery verification for all resolved control families.

---

# MOBILE-QA validation handoff — MOBILE-173

- Trigger: 2026-08-26T16:40:37.131Z. Inspected immutable result `e54ea6a5be78a99bd391d46c763f083ffbbf17c9` (`fix(mobile): bound compact controls and quote input`), base `2440b95`.
- Scope/coordination: PASS. Canonical explicit workspace and safe-directory Git top-level normalize to `c:/tuan/devapps/teminal-dex-app`; prefix empty; result remained clean; no DEV lock existed. QA used clean archive `%LOCALAPPDATA%\\Temp\\mobile-qa-173-e54ea6a` with installed dependencies linked, and used the dedicated report lock only while writing. No product, configuration, WEB, provider/API, wallet, signing, submission, trading, or data write occurred.
- Environment/device: Windows; bundled Node 24.19.0; Expo 57 local CLI. Fresh bounded `adb devices` did not return, so no edge-tap, quote-entry visual, TalkBack/VoiceOver/Switch Access, 320dp/enlarged-text, offline/retry, or navigation result is inferred.

## MOBILE-QA acceptance matrix

| Criterion | Result | Independent evidence |
| --- | --- | --- |
| Type and changed-surface lint | PASS | Archive `tsc --noEmit` and ESLint of all nine changed production surfaces plus both changed tests exit 0. |
| Required focused touch/async regression | FAIL P1 | Exact two-suite command `jest --ci --runInBand --silent AsyncSurface touch-targets` fails: `AsyncSurface` local-reset recovery times out at 5s, then attempts renderer access after Jest teardown. The same `AsyncSurface` suite alone passes 6/6; touch-targets passes 34/34. |
| Full regression | PASS | Archive `jest --ci --runInBand --silent`: 83 suites / 450 tests pass in 67.353s. This does not negate the exact focused ordering failure. |
| Expo/configuration | PASS with Doctor blocker | Public Android/iOS/web configuration resolves with retained deep-link, ATS, biometric, and no-secret boundaries. Doctor cannot spawn child Node (`ENOENT`). |
| Android / iOS / web bundles | CONDITIONAL PASS / PASS / PASS | Android exports one 5.7 MB Hermes bundle plus metadata with carried Noble fallback; iOS one 2.3 MB Hermes bundle plus metadata; web static export succeeds. |
| Runtime/device scenario | BLOCKED | Fresh ADB discovery did not settle, and no deterministic quote/provider or network fixture is available. |

## MOBILE-QA reconciliation (20 available/blocked outcomes)

| Stable ID | Result | Evidence and risk |
| --- | --- | --- |
| MOBILE-TOUCH-401 | PASS | AI governance action has explicit 44px-equivalent geometry in changed source/touch regression. |
| MOBILE-TOUCH-402 | PASS | Market Intelligence load-more has explicit 44px-equivalent geometry. |
| MOBILE-TOUCH-403 | PASS | Portfolio periods have explicit 44px-equivalent geometry. |
| MOBILE-TOUCH-404 | PASS | Settings language segments have explicit 44px-equivalent geometry. |
| MOBILE-TOUCH-405 | PASS | Settings destructive reset has explicit 44px-equivalent geometry. |
| MOBILE-TOUCH-406 | PASS | Token recovery has explicit 44px-equivalent geometry. |
| MOBILE-TOUCH-407 | PASS | Trenches filter input has explicit 44px-equivalent geometry. |
| MOBILE-TOUCH-408 | PASS | Discover clear-search action has explicit 44px-equivalent geometry. |
| MOBILE-TOUCH-409 | PASS | Whale search input has explicit 44px-equivalent geometry. |
| MOBILE-TOUCH-410 | PASS | Whale clear-search action has explicit 44px-equivalent geometry. |
| MOBILE-TOUCH-411 | PASS | Whale mode tabs have explicit 44px-equivalent geometry. |
| MOBILE-TOUCH-412 | PASS | Whale direction/amount/sort controls have explicit 44px-equivalent geometry. |
| MOBILE-TOUCH-413 | PASS | Whale filtered-empty reset has explicit 44px-equivalent geometry. |
| MOBILE-TOUCH-414 | PASS | Whale retry has explicit 44px-equivalent geometry. |
| MOBILE-DATA-415 | PASS | Quote amount pre-request boundary strips non-decimal syntax, collapses duplicate decimals, caps 12/6 whole/fraction precision, and adds native `maxLength=19`; static/regression/full suite pass. |
| MOBILE-QA-269 | BLOCKED P2 | Physical Android TalkBack unavailable; owner QA/device. |
| MOBILE-QA-270 | BLOCKED P2 | Physical iOS VoiceOver unavailable; owner QA/device. |
| MOBILE-QA-271 | BLOCKED P2 | Switch Access unavailable; owner QA/device. |
| MOBILE-QA-272 | BLOCKED P2 | 320dp/enlarged-text matrix unavailable; owner QA/device. |
| MOBILE-QA-273 | BLOCKED P2 | Controlled offline/reconnect fixture unavailable; owner QA/network fixture. |

## MOBILE-QA finding and release

| ID | Severity / owner | Result | Reproduction and risk |
| --- | --- | --- | --- |
| MOBILE-QA-282 | P1 / DEV test-maintenance | FAIL | In clean archive, run the exact DEV focused pair. `AsyncSurface › recovers visibly when local reset fails` exceeds 5s and then throws `You are trying to import a file after the Jest environment has been torn down` at the post-timeout accessibility lookup. Isolated `AsyncSurface` 6/6 and full 83/450 pass, establishing order/load sensitivity rather than proof of repair. |

- `MOBILE-QA-276`: BLOCKED P2 (toolchain, Doctor child Node ENOENT). `MOBILE-QA-277`: CONDITIONAL PASS P2 (upstream, Android Noble strict-exports fallback). `MOBILE-QA-278..280`: BLOCKED P2 (provider/device fixtures).
- Evidence references: `%LOCALAPPDATA%\\Temp\\mobile-qa-173-full.err.log`, `mobile-qa-173-android-export.err.log`; no screenshot, credential, backend payload, or WEB evidence retained. No MOBILE-to-WEB contract blocker exists.
- **MOBILE-QA release recommendation: NO-GO.** Fifteen safe outcomes pass and the planned five-item shortfall is correctly blocked, but `MOBILE-QA-282` is a current P1 required-focused-regression failure.
- Findings inspected/reconciled: 21 (15 ready outcomes, five declared external blockers, and `MOBILE-QA-282`). DEV outcomes available: 15; independently PASS: 15/15. Exact outcome shortfall to 20: 5 (`MOBILE-QA-269..273`); no padding applied.
- Carry-forward order: `MOBILE-QA-282`, `MOBILE-QA-269`, `MOBILE-QA-270`, `MOBILE-QA-271`, `MOBILE-QA-272`, `MOBILE-QA-273`, `MOBILE-QA-276`, `MOBILE-QA-277`, `MOBILE-QA-278`, `MOBILE-QA-279`, `MOBILE-QA-280`.
- **NEXT_DEV_ACTION:** make the exact `AsyncSurface` + `touch-targets` focused command deterministic without timeout or post-teardown renderer access, then supply a responsive exact-build device/network fixture for the five blocked physical/recovery scenarios.

---

# MOBILE-QA validation handoff — MOBILE-174

- Trigger: 2026-08-26T17:42:08.148Z. Inspected immutable result `d68c56d0f7ea71ae59c291bcb0659f6e832c358f` (`fix(mobile): stabilize recovery and whale threshold`), base `056f997`.
- Scope/coordination: PASS. Canonical safe-directory top-level normalized to `c:/tuan/devapps/teminal-dex-app`, prefix empty, clean result worktree, no DEV lock. QA source/automated evidence comes from clean archive `%LOCALAPPDATA%\\Temp\\mobile-qa-174-d68c56d` with existing dependencies linked. The canonical verified launcher reached `Waiting on http://localhost:8098`, but the bounded emulator deep-link did not settle or emit the expected build marker; no runtime conclusion is inferred. QA report lock used only during this handoff.
- Environment: Windows, bundled Node 24.19.0, Expo 57 local CLI, API 37 emulator listed by ADB. No product, WEB, API/provider, wallet, signing, submission, trading, configuration, or application-data write occurred.

## MOBILE-QA acceptance matrix

| Criterion | Result | Independent evidence |
| --- | --- | --- |
| Type and changed-surface lint | PASS | Archive `tsc --noEmit` and ESLint of `whale-activity` and both changed test files exit 0. |
| Required loaded recovery regression | PASS | Exact `AsyncSurface` + `touch-targets` pair passes three consecutive clean-archive runs, 2 suites / 35 tests each; first loaded pass completes in 11.394s with no timeout or post-teardown renderer error. |
| Whale boundary regression | PASS | `whale-activity` passes 1 suite / 11 tests, including $10,000 rejection and $10,001 qualification. |
| Full regression | PASS | Archive `jest --ci --runInBand --silent`: 83 suites / 450 tests pass in 71.648s. |
| Expo/config/bundles | PASS with carried conditions | Public config passes; Android/iOS/web exports pass. Android retains the known Noble strict-exports fallback; Doctor child Node remains unavailable. |
| Exact runtime / provider threshold | BLOCKED | Emulator was available, but the exact deep-link did not settle and no controlled $10,000/$10,001 provider-holding fixture exists. |

## MOBILE-QA reconciliation (20 current findings)

| Stable ID | Result | Evidence / owner |
| --- | --- | --- |
| MOBILE-QA-282 | RESOLVED | Three exact loaded pair passes plus full suite pass; explicit cleanup removes the previously reproduced timeout/teardown leak. |
| MOBILE-DATA-416 | PASS | Whale identity now requires eligible famous-token holding strictly `> 10,000`; unit boundary tests pass. |
| MOBILE-QA-269 | BLOCKED P2 | Android TalkBack; owner QA/device. |
| MOBILE-QA-270 | BLOCKED P2 | iOS VoiceOver; owner QA/device. |
| MOBILE-QA-271 | BLOCKED P2 | Switch Access; owner QA/device. |
| MOBILE-QA-272 | BLOCKED P2 | 320dp/enlarged-text matrix; owner QA/device. |
| MOBILE-QA-273 | BLOCKED P2 | Offline/reconnect recovery; owner QA/network fixture. |
| MOBILE-QA-274 | BLOCKED P2 | Lifecycle interruption; owner QA/device. |
| MOBILE-QA-275 | BLOCKED P2 | Storage-fault recovery; owner QA/device. |
| MOBILE-QA-276 | BLOCKED P2 | Expo Doctor child-process Node; owner toolchain. |
| MOBILE-QA-277 | CONDITIONAL PASS P2 | Android bundle completes but Noble strict-exports fallback persists; owner upstream. |
| MOBILE-QA-278 | BLOCKED P2 | Monitor active-reset state; owner provider fixture. |
| MOBILE-QA-279 | BLOCKED P2 | Monitor partial-page/cursor failure; owner provider fixture. |
| MOBILE-QA-280 | BLOCKED P2 | Physical performance measurement; owner QA/device. |
| MOBILE-QA-283 | BLOCKED P2 | Android edge-tap traversal; owner QA/device. |
| MOBILE-QA-284 | BLOCKED P2 | iOS edge-tap traversal; owner QA/device. |
| MOBILE-QA-285 | BLOCKED P2 | Android large-text whale-row truncation; owner QA/device. |
| MOBILE-QA-286 | BLOCKED P2 | iOS dynamic-type whale-row truncation; owner QA/device. |
| MOBILE-QA-287 | BLOCKED P2 | Stale-to-fresh whale recovery; owner network fixture. |
| MOBILE-QA-288 | BLOCKED P2 | Missing whale-holding identity evidence; owner provider fixture. |

## MOBILE-QA release and throughput

- Evidence references: `%LOCALAPPDATA%\\Temp\\mobile-qa-174-full.err.log`, `mobile-qa-174-android-export.err.log`, `mobile-qa-174-runtime.out.log`. No screenshot, secret, credential, provider payload, or WEB evidence was retained; no MOBILE-to-WEB contract blocker exists.
- **MOBILE-QA release recommendation: CONDITIONAL NO-GO.** Both available MOBILE-174 outcomes independently pass; 18 physical/network/provider/toolchain/upstream findings remain blocked or conditional.
- Findings inspected/reconciled: 20. DEV material outcomes available/verified: 2/2 PASS. Exact shortfall to 20: 18, stable IDs `MOBILE-QA-269..280`, `MOBILE-QA-283..288`; no padding applied.
- Carry-forward order: `MOBILE-QA-269`, `MOBILE-QA-270`, `MOBILE-QA-271`, `MOBILE-QA-272`, `MOBILE-QA-273`, `MOBILE-QA-274`, `MOBILE-QA-275`, `MOBILE-QA-276`, `MOBILE-QA-277`, `MOBILE-QA-278`, `MOBILE-QA-279`, `MOBILE-QA-280`, `MOBILE-QA-283`, `MOBILE-QA-284`, `MOBILE-QA-285`, `MOBILE-QA-286`, `MOBILE-QA-287`, `MOBILE-QA-288`.
- **NEXT_DEV_ACTION:** provide deterministic provider and device routes that settle on the immutable build, including threshold holdings, Monitor reset/cursor states, stale recovery, and accessibility/large-text modes for the blocked matrix.

---

# MOBILE-QA validation handoff — MOBILE-175

- Trigger: 2026-08-26T18:41:39.180Z. Inspected immutable result `ca70061a33c32eed24d29758a58e7a86e3e2bc1b` (`fix(mobile): localize discover token evidence`), base `25c939b`.
- Scope/coordination: PASS. Canonical safe-directory top-level normalizes to `c:/tuan/devapps/teminal-dex-app`, prefix empty, worktree clean, no DEV lock. QA validated source/automated gates from clean archive `%LOCALAPPDATA%\\Temp\\mobile-qa-175-ca70061`; only the QA handoff is written under the report lock. No product, configuration, WEB, provider/API, wallet, signing, submission, trading, or data write occurred.
- Runtime: API 37 emulator was connected; port reverse and a non-blocking exact dev-client deep link were attempted against verified server port 8099. The client did not request/bundle the project or emit the immutable build marker before the bounded window, and UI hierarchy capture did not settle. No visual EN/VI, screen-reader, navigation, or persisted-watch intent claim is inferred.

## MOBILE-QA acceptance matrix

| Criterion | Result | Independent evidence |
| --- | --- | --- |
| Type and changed-surface lint | PASS | Archive `tsc --noEmit` and ESLint of TokenRow, SettingsProvider, and focused regression exit 0. |
| EN/VI TokenRow regression | PASS | Archive `TokenRow.test.tsx`: 1 suite / 11 tests pass, including rendered Vietnamese catalog behavior. |
| Full regression | PASS | Archive `jest --ci --runInBand --silent`: 83 suites / 451 tests pass in 85.802s. |
| Expo/config/platform bundles | PASS with carried conditions | Public config and Android/iOS/web exports pass. Android retains Noble strict-exports fallback; Doctor cannot spawn child Node. |
| Exact visual/accessibility language flow | BLOCKED | Exact dev-client route did not settle despite connected emulator; no visual/assistive result fabricated. |

## MOBILE-QA reconciliation (20 current findings)

| Stable ID | Result | Evidence / owner |
| --- | --- | --- |
| MOBILE-I18N-417 | PASS | Token-detail accessibility action is obtained from persistent localization settings; EN/VI rendered regression passes. |
| MOBILE-I18N-418 | PASS | Add-watchlist accessibility action is localized; rendered regression passes. |
| MOBILE-I18N-419 | PASS | Remove-watchlist accessibility action is localized; rendered regression passes. |
| MOBILE-I18N-420 | PASS | Unavailable token-age evidence is localized; rendered regression passes. |
| MOBILE-I18N-421 | PASS | Unavailable holder evidence is localized; rendered regression passes. |
| MOBILE-I18N-422 | PASS | Verified holder-count suffix is localized; rendered regression passes. |
| MOBILE-I18N-423 | PASS | Volume abbreviation is localized; rendered regression passes. |
| MOBILE-I18N-424 | PASS | Social-evidence accessibility summary is localized; rendered regression passes. |
| MOBILE-QA-269 | BLOCKED P2 | Android TalkBack; owner QA/device. |
| MOBILE-QA-270 | BLOCKED P2 | iOS VoiceOver; owner QA/device. |
| MOBILE-QA-271 | BLOCKED P2 | Switch Access; owner QA/device. |
| MOBILE-QA-272 | BLOCKED P2 | 320dp/enlarged-text layout; owner QA/device. |
| MOBILE-QA-273 | BLOCKED P2 | Offline/reconnect; owner QA/network fixture. |
| MOBILE-QA-274 | BLOCKED P2 | Lifecycle interruption; owner QA/device. |
| MOBILE-QA-275 | BLOCKED P2 | Storage-fault recovery; owner QA/device. |
| MOBILE-QA-276 | BLOCKED P2 | Doctor child Node; owner toolchain. |
| MOBILE-QA-277 | CONDITIONAL PASS P2 | Noble strict-exports fallback; owner upstream. |
| MOBILE-QA-278 | BLOCKED P2 | Monitor active-reset fixture; owner provider. |
| MOBILE-QA-279 | BLOCKED P2 | Monitor partial-page/cursor fixture; owner provider. |
| MOBILE-QA-280 | BLOCKED P2 | Physical performance; owner QA/device. |

## MOBILE-QA release and throughput

- Evidence references: `%LOCALAPPDATA%\\Temp\\mobile-qa-175-full.err.log`, `mobile-qa-175-android-export.err.log`, `mobile-qa-175-runtime.out.log`. No screenshot, secret, credential, provider payload, or WEB evidence retained; no MOBILE-to-WEB contract blocker exists.
- **MOBILE-QA release recommendation: CONDITIONAL NO-GO.** Eight available localization outcomes pass source/automated evidence; visual EN/VI accessibility confirmation and the external device/toolchain/upstream matrix remain incomplete.
- Findings inspected/reconciled: 20. DEV outcomes available/verified: 8/8 PASS. Exact shortfall to 20: 12 (`MOBILE-QA-269..280`); no padding applied.
- Carry-forward order: `MOBILE-QA-269`, `MOBILE-QA-270`, `MOBILE-QA-271`, `MOBILE-QA-272`, `MOBILE-QA-273`, `MOBILE-QA-274`, `MOBILE-QA-275`, `MOBILE-QA-276`, `MOBILE-QA-277`, `MOBILE-QA-278`, `MOBILE-QA-279`, `MOBILE-QA-280`.
- **NEXT_DEV_ACTION:** provide a dev-client route that reliably loads the immutable bundle plus controllable Discover token states, so QA can switch EN/VI and verify all eight visual/accessibility strings without changing navigation or stored watch intent.

---

# MOBILE-QA validation handoff — MOBILE-176

- Trigger: 2026-08-26T19:40:40.144Z. Inspected immutable result `e9521409308d807e769221e7740b04ab61ffd3ef` (`fix(mobile): localize token artwork semantics`), base `5a1c4f3`.
- Scope/coordination: PASS. Canonical safe-directory top-level normalized to `c:/tuan/devapps/teminal-dex-app`, Git prefix empty, result worktree clean, no DEV lock. Source/automated evidence used archive `%LOCALAPPDATA%\\Temp\\mobile-qa-176-e952140`; QA used the dedicated report lock only while writing. No product, config, WEB, API/provider, wallet, signing, submission, trading, or data write occurred.
- Environment/runtime: Windows, bundled Node 24.19.0, Expo 57, API 37 `emulator-5554`. Exact verified launcher / port `8100` bundled Android 1,887 modules after deep link. UI dumps captured English Discover, Vietnamese Discover, and Vietnamese Token Detail. No screenshot, secret, provider payload, or WEB evidence was retained.

## MOBILE-QA acceptance matrix

| Criterion | Result | Independent evidence |
| --- | --- | --- |
| Type and changed-surface lint | PASS | Archive `tsc --noEmit` and ESLint of TokenAvatar, DexLogo, TokenRow, SettingsProvider, Token Detail, and TokenRow test exit 0. |
| Focused artwork/localization regressions | PASS | `TokenRow` and `PrimaryDetailState`: 2 suites / 19 tests pass. |
| Full regression | PASS | Archive `jest --ci --runInBand --silent`: 83 suites / 451 tests pass in 39.019s. |
| Expo/config/platform bundles | PASS with carried conditions | Public config and Android/iOS/web exports pass. Android retains Noble strict-exports fallback; Doctor child Node remains blocked. |
| Exact EN/VI runtime traversal | PASS with fixture limitation | EN Discover renders `FZqd…jKa2 token logo`, `age unavailable`, `Pump.fun DEX logo`, and social semantics. After Settings → Tiếng Việt, Discover renders localized search/actions, `Không có logo token …; đang hiển thị ký tự viết tắt`, `Logo DEX Pump.fun`, and localized age/holder/social evidence. Vietnamese Token Detail renders localized missing-artwork semantics. No unknown-DEX provider row was available at runtime. |

## MOBILE-QA reconciliation (20 current findings)

| Stable ID | Result | Evidence / owner |
| --- | --- | --- |
| MOBILE-I18N-425 | PASS | Token artwork semantics are localized; EN/VI Discover runtime shows token-logo/fallback descriptions and focused regression passes. |
| MOBILE-I18N-426 | PASS | Missing token artwork renders localized initials fallback in Vietnamese Discover and Token Detail; focused regression passes. |
| MOBILE-I18N-427 | PASS | Recognized DEX label is localized (`Pump.fun DEX logo` / `Logo DEX Pump.fun`) in exact runtime. |
| MOBILE-I18N-428 | PASS (automated); runtime fixture BLOCKED | Unknown-DEX localized semantic is covered by focused regression/source; no unknown provider DEX row appeared during bounded runtime. Owner for visual fixture: provider. |
| MOBILE-I18N-429 | PASS | Vietnamese Token Detail header shows localized missing-artwork semantics; focused detail regression passes. |
| MOBILE-QA-269 | BLOCKED P2 | Android TalkBack; owner QA/device. |
| MOBILE-QA-270 | BLOCKED P2 | iOS VoiceOver; owner QA/device. |
| MOBILE-QA-271 | BLOCKED P2 | Switch Access; owner QA/device. |
| MOBILE-QA-272 | BLOCKED P2 | 320dp/enlarged-text layout; owner QA/device. |
| MOBILE-QA-273 | BLOCKED P2 | Offline/reconnect; owner QA/network fixture. |
| MOBILE-QA-274 | BLOCKED P2 | Lifecycle interruption; owner QA/device. |
| MOBILE-QA-275 | BLOCKED P2 | Storage-fault recovery; owner QA/device. |
| MOBILE-QA-276 | BLOCKED P2 | Expo Doctor child Node; owner toolchain. |
| MOBILE-QA-277 | CONDITIONAL PASS P2 | Android Noble strict-exports fallback; owner upstream. |
| MOBILE-QA-278 | BLOCKED P2 | Monitor active-reset fixture; owner provider. |
| MOBILE-QA-279 | BLOCKED P2 | Monitor partial-page/cursor fixture; owner provider. |
| MOBILE-QA-280 | BLOCKED P2 | Physical performance; owner QA/device. |
| MOBILE-QA-283 | BLOCKED P2 | Android physical edge-tap matrix; owner QA/device. |
| MOBILE-QA-284 | BLOCKED P2 | iOS edge-tap matrix; owner QA/device. |
| MOBILE-QA-285 | BLOCKED P2 | Android large-text whale-row truncation; owner QA/device. |

## MOBILE-QA release and throughput

- Runtime references: `%LOCALAPPDATA%\\Temp\\mobile-qa-176-discover.xml`, `mobile-qa-176-discover-vi2.xml`, `mobile-qa-176-detail-vi.xml`, `mobile-qa-176-runtime.out.log`, `mobile-qa-176-full.err.log`, and `mobile-qa-176-android-export.err.log`.
- **MOBILE-QA release recommendation: CONDITIONAL NO-GO.** All five M176 outcomes pass (four with exact EN/VI runtime proof, unknown DEX automated only); physical accessibility/layout/recovery, Doctor, Noble, and provider scenarios remain incomplete.
- Findings inspected/reconciled: 20. DEV outcomes available/verified: 5/5 PASS. Exact shortfall to 20: 15 (`MOBILE-QA-269..280`, `MOBILE-QA-283..285`); no padding applied.
- Carry-forward order: `MOBILE-QA-269`, `MOBILE-QA-270`, `MOBILE-QA-271`, `MOBILE-QA-272`, `MOBILE-QA-273`, `MOBILE-QA-274`, `MOBILE-QA-275`, `MOBILE-QA-276`, `MOBILE-QA-277`, `MOBILE-QA-278`, `MOBILE-QA-279`, `MOBILE-QA-280`, `MOBILE-QA-283`, `MOBILE-QA-284`, `MOBILE-QA-285`.
- **NEXT_DEV_ACTION:** provide a controlled unknown-DEX artwork row and a physical accessibility/small-screen fixture so QA can finish the remaining visual semantic and motor/layout matrix without changing provider contracts.

---

# MOBILE-QA validation handoff — MOBILE-177

- Trigger: 2026-08-26T20:41:41.140Z. Inspected immutable result `b1112f57bda13a0a94b659cf4dca35dfa325caa6` (`fix(mobile): clarify discover market metrics`), base `03b342a`.
- Scope/coordination: PASS. Canonical explicit workspace and safe-directory Git top-level normalized to `c:/tuan/devapps/teminal-dex-app`, prefix empty, result clean, and no DEV or QA lock existed before validation. Source and automated evidence used clean archive `%LOCALAPPDATA%\\Temp\\mobile-qa-177-b1112f5` with existing dependencies linked. This report is the only repository write and is guarded by the dedicated QA lock.
- Environment/device: Windows; bundled Node 24.19.0; Expo 57 local CLI. The API 37 Android discovery attempt did not settle before the bounded window. Verified launcher on port 8101 reached Metro `Waiting on http://localhost:8101`, but the exact dev client did not request the bundle or expose a stable hierarchy/immutable marker. No visual, assistive, navigation, provider, wallet, signing, submission, trading, API, WEB, configuration, or application-data conclusion is fabricated.

## MOBILE-QA acceptance matrix

| Criterion | Result | Independent evidence |
| --- | --- | --- |
| Type and changed-surface lint | PASS | Archive `tsc --noEmit` and ESLint of `TokenRow.tsx`, `SettingsProvider.tsx`, and `TokenRow.test.tsx` exit 0. |
| Focused localized metrics regression | PASS | Archive `TokenRow.test.tsx`: 1 suite / 12 tests pass, including Vietnamese market-cap text and unavailable 6h semantic fallback. |
| Full regression | PASS | Archive `jest --ci --runInBand --silent`: 83 suites / 452 tests pass in 56.082s. |
| Expo/configuration | PASS with Doctor blocker | Public Expo configuration resolves; Expo Doctor emits `Error: spawn node ENOENT`, so Doctor is BLOCKED despite its wrapper exit code. |
| Android / iOS / web bundles | CONDITIONAL PASS / PASS / PASS | Fresh archive exports produce Android 5.7 MB Hermes bundle plus metadata, iOS 2.3 MB Hermes bundle plus metadata, and a web 1.1 MB static bundle. Android retains the known Noble strict-exports fallback. |
| Exact Discover runtime flow | BLOCKED | Metro reached port 8101, but no exact client bundle request, period selection, EN/VI row, or accessibility hierarchy settled. The bounded ADB discovery attempt also did not settle. |

## MOBILE-QA reconciliation (20 current findings)

| Stable ID | Result | Evidence / owner |
| --- | --- | --- |
| MOBILE-I18N-430 | PASS | Market-cap shorthand is catalog-backed: `tokenMarketCapShort` renders `$10 MC` in English and `Vốn hóa $10` in Vietnamese; rendered regression passes. |
| MOBILE-A11Y-431 | PASS | Token metrics container now announces explicit price and market-cap semantics; focused accessible-label assertion passes. |
| MOBILE-A11Y-432 | PASS | Token metric summary includes the selected 1h/6h/24h period and signed change; focused regression verifies period-aware label output. |
| MOBILE-A11Y-433 | PASS | Missing selected-period change renders the visible dash while the accessible label truthfully says `unavailable`; focused 6h regression passes without inventing a percentage. |
| MOBILE-QA-269 | BLOCKED P2 | Android TalkBack; owner QA/device. |
| MOBILE-QA-270 | BLOCKED P2 | iOS VoiceOver; owner QA/device. |
| MOBILE-QA-271 | BLOCKED P2 | Switch Access; owner QA/device. |
| MOBILE-QA-272 | BLOCKED P2 | 320dp/enlarged-text layout; owner QA/device. |
| MOBILE-QA-273 | BLOCKED P2 | Offline/reconnect recovery; owner QA/network fixture. |
| MOBILE-QA-274 | BLOCKED P2 | Lifecycle interruption; owner QA/device. |
| MOBILE-QA-275 | BLOCKED P2 | Storage-fault recovery; owner QA/device. |
| MOBILE-QA-276 | BLOCKED P2 | Expo Doctor child Node ENOENT; owner toolchain. |
| MOBILE-QA-277 | CONDITIONAL PASS P2 | Android bundle completes with Noble strict-exports fallback; owner upstream dependency. |
| MOBILE-QA-278 | BLOCKED P2 | Monitor active-reset fixture; owner provider. |
| MOBILE-QA-279 | BLOCKED P2 | Monitor partial-page/cursor fixture; owner provider. |
| MOBILE-QA-280 | BLOCKED P2 | Physical performance measurement; owner QA/device. |
| MOBILE-QA-283 | BLOCKED P2 | Android physical edge-tap traversal; owner QA/device. |
| MOBILE-QA-284 | BLOCKED P2 | iOS physical edge-tap traversal; owner QA/device. |
| MOBILE-QA-285 | BLOCKED P2 | Android large-text whale-row truncation; owner QA/device. |
| MOBILE-QA-286 | BLOCKED P2 | iOS dynamic-type whale-row truncation; owner QA/device. |

## MOBILE-QA release and throughput

- Evidence references: `%LOCALAPPDATA%\\Temp\\mobile-qa-177-full.out.log`, `mobile-qa-177-full.err.log`, `mobile-qa-177-android-export.out.log`, `mobile-qa-177-ios-export.out.log`, `mobile-qa-177-web-export.out.log`, and `mobile-qa-177-runtime.out.log`. No screenshot, credential, secret, backend payload, or WEB evidence was retained. No MOBILE-to-WEB contract blocker exists.
- **MOBILE-QA release recommendation: CONDITIONAL NO-GO.** All four available localized-market-metric outcomes pass independent source/automated/bundle evidence, but exact runtime period-language traversal and the physical accessibility/layout/recovery, Doctor, Noble, provider, and performance matrix remain incomplete.
- Findings inspected/reconciled: 20. DEV material outcomes available/verified: 4/4 PASS. Exact shortfall to 20: 16 (`MOBILE-QA-269..280`, `MOBILE-QA-283..286`); no padding applied.
- Carry-forward order: `MOBILE-QA-269`, `MOBILE-QA-270`, `MOBILE-QA-271`, `MOBILE-QA-272`, `MOBILE-QA-273`, `MOBILE-QA-274`, `MOBILE-QA-275`, `MOBILE-QA-276`, `MOBILE-QA-277`, `MOBILE-QA-278`, `MOBILE-QA-279`, `MOBILE-QA-280`, `MOBILE-QA-283`, `MOBILE-QA-284`, `MOBILE-QA-285`, `MOBILE-QA-286`.
- **NEXT_DEV_ACTION:** provide an immutable dev-client route with controllable Discover 1h/6h/24h positive, negative, and unavailable token states so QA can complete EN/VI visual and assistive period-metric verification without changing provider contracts.

---

# MOBILE-QA validation handoff — MOBILE-178

- Trigger: 2026-08-26T21:40:12.157Z. Inspected immutable result `c38255c6d4e58d676bd2045bb04d89499b8259d9` (`fix(mobile): localize whale market chronology`), base `b0663ac`.
- Scope/coordination: PASS. Canonical safe-directory top-level normalized to `c:/tuan/devapps/teminal-dex-app`, Git prefix empty, result clean, and no DEV lock existed. Independent evidence used archive `%LOCALAPPDATA%\\Temp\\mobile-qa-178-c38255c-rerun` with linked dependencies. The first archive extraction was blocked by a temporary-path targeting error and was discarded; its non-result is not used. Only this report is written under the dedicated QA lock.
- Environment/runtime: Windows; bundled Node 24.19.0; Expo 57 local CLI. No responsive exact Android/iOS device or deterministic Whale full/partial/invalid provider fixture settled in this trigger. Therefore no EN/VI visual chronology, assistive traversal, navigation, filter, loading, retry, offline, stale, partial-page, or transaction claim is inferred. No WEB/API/provider, wallet, signing, submission, trading, configuration, or application-data mutation occurred.

## MOBILE-QA acceptance matrix

| Criterion | Result | Independent evidence |
| --- | --- | --- |
| Type and changed-surface lint | PASS | Archive `tsc --noEmit` and ESLint of Whale flow, formatter, and formatter regression exit 0. |
| Focused chronology/format regression | PASS | Archive `format.test.ts`: 1 suite / 5 tests pass, including seconds, milliseconds, Vietnamese locale, and invalid-time fallback. |
| Full regression | PASS | Archive `jest --ci --runInBand --silent`: 83 suites / 453 tests pass in 54.853s. |
| Expo/configuration | PASS with Doctor blocker | Public Expo configuration resolves. Expo Doctor emits `Error: spawn node ENOENT`; its wrapper exit code is not treated as a Doctor pass. |
| Android / iOS / web bundles | CONDITIONAL PASS / PASS / PASS | Fresh archive exports produce Android 5.7 MB Hermes plus metadata, iOS 2.3 MB Hermes plus metadata, and web 1.1 MB static bundle. Android retains the known Noble strict-exports fallback. |
| Exact Whale runtime flow | BLOCKED | No controlled full, partial, absent, seconds, milliseconds, or invalid observation fixture and no responsive exact device lane were available. |

## MOBILE-QA reconciliation (20 current findings)

| Stable ID | Result | Evidence / owner |
| --- | --- | --- |
| MOBILE-I18N-434 | PASS | `observedDateTime` selects EN/VI locale; focused regression verifies both seconds/milliseconds render a real 2023 date. |
| MOBILE-DATA-435 | PASS | Non-finite/invalid observation evidence fails closed to caller-provided localized unavailable text; regression passes. |
| MOBILE-I18N-436 | PASS | Whale market-cap chip uses catalog-backed `tokenMarketCapShort`, replacing hard-coded `MC`. |
| MOBILE-DATA-437 | PASS | Partial market snapshot missing price uses localized `unavailable`, not an ambiguous dash; source/type/lint/full suite pass. |
| MOBILE-DATA-438 | PASS | Partial missing market-cap/change use localized `unavailable`, while fully absent snapshot retains its truthful market-unavailable state. |
| MOBILE-QA-269..275 | BLOCKED P2 | TalkBack, VoiceOver, Switch Access, 320dp/large text, offline/reconnect, lifecycle, and storage matrix; owner QA/device/network fixture. |
| MOBILE-QA-276 | BLOCKED P2 | Expo Doctor child Node ENOENT; owner toolchain. |
| MOBILE-QA-277 | CONDITIONAL PASS P2 | Android bundle completes with Noble strict-exports fallback; owner upstream. |
| MOBILE-QA-278..280 | BLOCKED P2 | Monitor reset/cursor and physical-performance fixtures; owner provider/QA device. |
| MOBILE-QA-283..285 | BLOCKED P2 | Android/iOS edge traversal and Android large-text whale-row matrix; owner QA/device. |

## MOBILE-QA release and throughput

- Evidence references: `%LOCALAPPDATA%\\Temp\\mobile-qa-178-full.out.log`, `mobile-qa-178-full.err.log`, `mobile-qa-178-android-export.out.log`, `mobile-qa-178-ios-export.out.log`, and `mobile-qa-178-web-export.out.log`. No screenshot, secret, credential, backend payload, or WEB evidence was retained. No MOBILE-to-WEB contract blocker exists.
- **MOBILE-QA release recommendation: CONDITIONAL NO-GO.** All five available chronology/market-evidence outcomes pass independent source, focused, full-regression, configuration, and bundle checks; exact EN/VI device/runtime coverage and 15 external findings remain incomplete.
- Findings inspected/reconciled: 20. DEV material outcomes available/verified: 5/5 PASS. Exact shortfall to 20: 15 (`MOBILE-QA-269..280`, `MOBILE-QA-283..285`); no padding applied.
- Carry-forward order: `MOBILE-QA-269`, `MOBILE-QA-270`, `MOBILE-QA-271`, `MOBILE-QA-272`, `MOBILE-QA-273`, `MOBILE-QA-274`, `MOBILE-QA-275`, `MOBILE-QA-276`, `MOBILE-QA-277`, `MOBILE-QA-278`, `MOBILE-QA-279`, `MOBILE-QA-280`, `MOBILE-QA-283`, `MOBILE-QA-284`, `MOBILE-QA-285`.
- **NEXT_DEV_ACTION:** provide a deterministic immutable Whale fixture with seconds, milliseconds, invalid observation time, and full/partial/absent market snapshots so QA can complete EN/VI visual and assistive chronology verification without changing provider contracts.

---

# MOBILE-QA validation handoff — MOBILE-179

- Trigger: 2026-08-26T22:41:43.060Z. Inspected immutable result `828c9855c48540480707d316c76509e41c8a9bcc` (`fix(mobile): localize live whale ages`), base `502424a`. Scope PASS: canonical top-level/prefix verified, clean result, and no DEV lock. Archive `%LOCALAPPDATA%\\Temp\\mobile-qa-179-828c985` supplied independent source evidence; only this report uses the QA lock.
- Environment/runtime: Windows, bundled Node 24.19.0, Expo 57. Exact Android/iOS device and deterministic 30s/2m/3h/2d/malformed/future Whale fixture unavailable; no runtime, assistive, navigation, provider, wallet, transaction, or WEB claim is inferred.

## MOBILE-QA acceptance matrix

| Criterion | Result | Independent evidence |
| --- | --- | --- |
| Type and changed-surface lint | PASS | Archive `tsc --noEmit` and changed Whale/format/test ESLint exit 0. |
| Focused age regression | PASS | `format.test.ts` and `whale-activity.test.ts`: 2 suites / 17 tests pass. |
| Full regression | PASS | Archive Jest: 83 suites / 454 tests pass in 72.941s. |
| Expo/configuration | PASS with Doctor blocker | Public configuration resolves; Doctor emits child-Node ENOENT. |
| Android/iOS/web bundles | CONDITIONAL PASS / PASS / PASS | Fresh archive exports: Android 5.7 MB Hermes + metadata (Noble condition), iOS 2.3 MB + metadata, web 1.1 MB static bundle. |
| Exact live-Whale runtime | BLOCKED | Required time-state and device fixture unavailable. |

## MOBILE-QA reconciliation

| Stable ID | Result | Evidence / owner |
| --- | --- | --- |
| MOBILE-I18N-439..442 | PASS | Shared relative-age classifier selects bounded seconds/minutes/hours/days translation keys; fixed-time regression covers 30s, 2m, 3h, 2d. |
| MOBILE-DATA-443 | PASS | Non-finite/nonpositive and future observations return null, allowing truthful localized unavailable fallback. |
| MOBILE-DATA-444 | PASS | Seconds and milliseconds normalize before age calculation; fixed-time focused coverage passes. |
| MOBILE-QA-269..280 | BLOCKED/CONDITIONAL P2 | Physical accessibility/recovery/performance, Doctor, Noble, and Monitor fixture matrix; owner QA/device/toolchain/upstream/provider. |
| MOBILE-QA-283..284 | BLOCKED P2 | Android/iOS physical edge traversal; owner QA/device. |

## MOBILE-QA release and throughput

- Evidence: `%LOCALAPPDATA%\\Temp\\mobile-qa-179-full.out.log`, `mobile-qa-179-android.out.log`, `mobile-qa-179-ios.out.log`, `mobile-qa-179-web.out.log`. No secret, credential, backend payload, screenshot, or WEB evidence retained; no MOBILE-to-WEB blocker.
- **MOBILE-QA release recommendation: CONDITIONAL NO-GO.** Six available outcomes pass; 14 external findings and exact EN/VI runtime remain incomplete.
- Findings inspected/reconciled: 20. DEV outcomes available/verified: 6/6 PASS. Exact shortfall: 14 (`MOBILE-QA-269..280`, `MOBILE-QA-283..284`).
- Carry-forward order: `MOBILE-QA-269`, `MOBILE-QA-270`, `MOBILE-QA-271`, `MOBILE-QA-272`, `MOBILE-QA-273`, `MOBILE-QA-274`, `MOBILE-QA-275`, `MOBILE-QA-276`, `MOBILE-QA-277`, `MOBILE-QA-278`, `MOBILE-QA-279`, `MOBILE-QA-280`, `MOBILE-QA-283`, `MOBILE-QA-284`.
- **NEXT_DEV_ACTION:** provide an immutable Whale fixture for 30-second, 2-minute, 3-hour, 2-day, malformed, and future observations so QA can verify EN/VI live-age output and accessibility without changing provider contracts.

---

# MOBILE-QA validation handoff — MOBILE-180

- Trigger: 2026-08-26T23:40:13.960Z. Inspected immutable result `d1475946f0487cdc6101d55fee12ac3d298a10de` (`fix(mobile): unify defensive relative ages`), base `cce8d4a`. Scope PASS: canonical top-level/prefix, clean result, and no DEV lock. Archive `%LOCALAPPDATA%\\Temp\\mobile-qa-180-d147594` supplied independent evidence; only this report uses the QA lock.
- Environment/runtime: Windows, bundled Node 24.19.0, Expo 57. No controlled seconds/milliseconds/malformed/future fixture or exact device lane settled for Discover, Trenches, Operations, or Monitor; runtime/accessibility/navigation conclusions are BLOCKED, not inferred.

## MOBILE-QA acceptance matrix

| Criterion | Result | Independent evidence |
| --- | --- | --- |
| Type and changed-surface lint | PASS | Archive `tsc --noEmit` and ESLint of formatter plus all four migrated surfaces exit 0. |
| Focused migrated-surface regression | PASS | Formatter, Trenches, Monitor, and Operations suites: 4 suites / 12 tests pass. |
| Full regression | PASS | Archive Jest: 83 suites / 455 tests pass in 40.198s. |
| Expo/configuration | PASS with Doctor blocker | Public configuration resolves; Doctor emits child-Node ENOENT. |
| Android bundle | CONDITIONAL PASS | Fresh Android Hermes 5.7 MB bundle plus metadata exports; known Noble condition remains. iOS/web M179 compatible export evidence is carried, not reclassified as same-run result. |
| Exact four-surface runtime | BLOCKED | Deterministic timestamp/provider and physical accessibility fixtures unavailable. |

## MOBILE-QA reconciliation and release

- `MOBILE-DATA-445..459`: PASS. Four surfaces delegate relative age to the shared seconds/milliseconds-normalizing formatter; localized days and future fallback are covered by focused regression, with type/lint/full/Android-bundle gates passing.
- `MOBILE-QA-269..273`: BLOCKED P2 (TalkBack, VoiceOver, Switch Access, 320dp/large text, offline/reconnect); owner QA/device/network fixture.
- Findings inspected/reconciled: 20. DEV outcomes available/verified: 15/15 PASS. Exact shortfall: 5 (`MOBILE-QA-269..273`); no padding. Evidence: `%LOCALAPPDATA%\\Temp\\mobile-qa-180-full.out.log`, `mobile-qa-180-android.out.log`. No secret, credential, provider payload, screenshot, or WEB evidence retained; no MOBILE-to-WEB blocker.
- **MOBILE-QA release recommendation: CONDITIONAL NO-GO.** The available migration passes, but physical accessibility/layout/offline runtime remains incomplete.
- Carry-forward order: `MOBILE-QA-269`, `MOBILE-QA-270`, `MOBILE-QA-271`, `MOBILE-QA-272`, `MOBILE-QA-273`.
- **NEXT_DEV_ACTION:** provide immutable timestamp fixtures for Discover, Trenches, Operations, and Monitor across EN/VI and controlled device/network lanes for the five blocked physical scenarios.

---

# MOBILE-QA validation handoff — MOBILE-181

- Trigger: 2026-08-27T00:42:14.852Z. Inspected immutable result `4257931dd77d212e9d49709ee50019ea25335ad6` (`fix(mobile): localize AI and Track chronology`), base `f409ec2`. Scope PASS: canonical top-level/prefix, clean result, no DEV lock; clean archive `%LOCALAPPDATA%\\Temp\\mobile-qa-181-4257931` used. Only this report is written under QA lock.
- Environment/runtime: Windows, bundled Node 24.19.0, Expo 57. No deterministic AI/Track seconds/milliseconds/ISO/malformed fixture or exact device settled; visual, assistive, ordering, navigation, and provider results are BLOCKED, not inferred.

## MOBILE-QA acceptance matrix

| Criterion | Result | Independent evidence |
| --- | --- | --- |
| Type and changed-surface lint | PASS | Archive `tsc --noEmit` and ESLint of formatter, AI, Track, and focused test exit 0. |
| Focused chronology regression | PASS | `format.test.ts` plus `TrackEventCard.test.tsx`: 2 suites / 9 tests pass. |
| Full regression | PASS | Archive Jest: 83 suites / 455 tests pass in 38.996s. |
| Expo/configuration | PASS with Doctor blocker | Public config resolves; Doctor emits child-Node ENOENT. |
| Bundles/runtime | SKIP / BLOCKED | No fresh M181 export completed in this trigger; M180 Android and M179 iOS/web evidence is not reclassified. Exact AI/Track runtime fixture unavailable. |

## MOBILE-QA reconciliation and release

- `MOBILE-I18N-460..464`, `MOBILE-DATA-465..466`: PASS. Shared formatter accepts seconds, milliseconds, valid ISO strings, and fails closed for malformed string evidence; focused, type/lint, and full-regression evidence pass.
- `MOBILE-QA-269..280`, `MOBILE-QA-283`: BLOCKED/CONDITIONAL P2 physical accessibility/layout/recovery/performance, Doctor/Noble, and provider fixtures; owner QA/device/toolchain/upstream/provider.
- Findings inspected/reconciled: 20. DEV outcomes available/verified: 7/7 PASS. Exact shortfall: 13 (`MOBILE-QA-269..280`, `MOBILE-QA-283`). Evidence: `%LOCALAPPDATA%\\Temp\\mobile-qa-181-full.out.log` and `.err`. No credential, secret, screenshot, provider payload, or WEB evidence retained; no MOBILE-to-WEB blocker.
- **MOBILE-QA release recommendation: CONDITIONAL NO-GO.** Seven available chronology outcomes pass; runtime, fresh bundle, and external matrix evidence remain incomplete.
- Carry-forward order: `MOBILE-QA-269`, `MOBILE-QA-270`, `MOBILE-QA-271`, `MOBILE-QA-272`, `MOBILE-QA-273`, `MOBILE-QA-274`, `MOBILE-QA-275`, `MOBILE-QA-276`, `MOBILE-QA-277`, `MOBILE-QA-278`, `MOBILE-QA-279`, `MOBILE-QA-280`, `MOBILE-QA-283`.
- **NEXT_DEV_ACTION:** provide an immutable AI/Track fixture covering seconds, milliseconds, valid ISO, and malformed observations in EN/VI, plus a responsive exact device route for chronology accessibility verification.

---

# MOBILE-QA validation handoff — MOBILE-182

- Trigger: 2026-08-27T01:41:45.854Z. Inspected immutable result `7d82045d98b3b2fa68b8f99d764a94a5e4502113` (`fix(mobile): localize token evidence chronology`), base `a2c5f6b`. Canonical scope, clean result, and no DEV lock: PASS. Archive `%LOCALAPPDATA%\\Temp\\mobile-qa-182-7d82045` supplied evidence; only this report is written under QA lock.
- Runtime/device/config/bundles: BLOCKED/SKIP this trigger—no deterministic Token Detail timestamp fixture or exact device lane settled; fresh Expo diagnostics and exports were not completed. No result is inferred from earlier commits.

## MOBILE-QA verification

| Criterion | Result | Evidence |
| --- | --- | --- |
| Type and changed-surface lint | PASS | Archive `tsc --noEmit` and Token Detail/formatter ESLint exit 0. |
| Focused chronology regression | PASS | Primary Detail, formatter, and whale-activity suites: 3 suites / 26 tests pass. |
| Full regression | PASS | Archive Jest: 83 suites / 455 tests pass in 41.494s. |
| MOBILE-I18N-467..469 | PASS | Token Detail early buyers, security snapshots, and Whale events delegate timestamps to shared localized defensive formatter; automated gates pass. |

- `MOBILE-QA-269..280`, `MOBILE-QA-283..287`: BLOCKED/CONDITIONAL P2 physical accessibility/layout/recovery/performance, Doctor/Noble, and provider fixtures; owner QA/device/toolchain/upstream/provider.
- Findings inspected/reconciled: 20. DEV outcomes available/verified: 3/3 PASS. Exact shortfall: 17 (`MOBILE-QA-269..280`, `MOBILE-QA-283..287`). Evidence: `%LOCALAPPDATA%\\Temp\\mobile-qa-182-full.err.log`. No secrets, credentials, provider payload, screenshot, or WEB evidence retained; no MOBILE-to-WEB blocker.
- **MOBILE-QA release recommendation: CONDITIONAL NO-GO.** Available source/automated outcomes pass, but runtime/device and fresh configuration/bundle evidence remain incomplete.
- **NEXT_DEV_ACTION:** provide immutable EN/VI Token Detail fixtures for seconds, milliseconds, ISO, and malformed timestamps across early-buyer, security, and Whale sections plus an exact device route.

---

# MOBILE-QA scope change — MOBILE-186

- Trigger: user-requested in-app-browser filter retest on 2026-08-27.
- Scope result: `qa_scope_changed` / BLOCKED P1. The run began from QA-report commit `644fdaa`; while the app was being exercised, the mobile tree advanced to `8c1b1af` (`feat(mobile): add Privy login and signup`) with product, configuration, dependency, bundle, and DEV-handoff changes. The browser evidence is therefore not assigned to either immutable result.
- Safe, non-certifying observations before the scope change: local Expo web server started on port 8081; the API returned HTTP 200 with `Access-Control-Allow-Origin: http://127.0.0.1:8081`; Discover Trending, Gainers, Losers, Volume, New Pairs, Hot Searches, Surge, NextBC, Pump Live, and 1h/6h/24h all settled with live data; Watchlist was truthfully empty. Trenches status tabs and Whales Wallets also rendered provider data.
- Re-test signal, not a closure: Monitor → Filters → observed DEX → Pump.fun showed 46/50 rows while a letsbonk row remained visible. This contradicts the DEV handoff's claimed `MOBILE-FILTER-515` closure, but because the runtime crossed commits it is **RETEST REQUIRED**, not a certified FAIL.
- No source, test, configuration, WEB, credential, wallet, signing, submission, trade, or CopyTrade action was changed. Only this report is written.

## MOBILE-QA reconciliation and handoff

| Stable ID | Result | Exact NEXT_DEV_ACTION |
| --- | --- | --- |
| MOBILE-QA-006 | BLOCKED P1 | Keep a single immutable mobile result available while QA runs; do not land changes until the test window is completed. |
| MOBILE-FILTER-515 | RETEST REQUIRED P2 | From the exact `8c1b1af` build, prove Pump.fun removes every letsbonk row and Reset restores it; capture DOM/accessibility evidence. |
| MOBILE-A11Y-517 | RETEST REQUIRED P2 | From the exact result, confirm no fresh nested-button/hydration browser error in Discover and Trenches. |
| MOBILE-AUTH-518..520 / MOBILE-SEC-521 / MOBILE-BUNDLE-522 | SKIP | Execute the DEV handoff's authorized Privy web/Android matrix only after the public identifiers and exact build are supplied. |

- Findings inspected/reconciled: 20 (scope stability, live-mode/tab/time controls, filter panels, Monitor DEX signal, browser semantics, and new DEV handoff outcomes).
- DEV outcomes available: 5; independently verified: 0. Exact shortfall to 20: 20. The unverified live observations are deliberately not counted because of `qa_scope_changed`.
- **MOBILE-QA release recommendation: NO-GO.** Re-run against an immutable `8c1b1af` build; first resolve/retest `MOBILE-QA-006`, then `MOBILE-FILTER-515`, `MOBILE-A11Y-517`, and the authorized identity matrix.

---

# MOBILE-QA runtime filter retest — MOBILE-185

- Trigger: user-requested live filter retest after the authorized WEB operator repaired local-browser CORS.
- Inspected mobile commit: `61dfe68` (`docs: specify mobile browser CORS contract`); runtime `http://127.0.0.1:8081`, Windows in-app browser, 2026-08-27. Scope PASS: cwd and Git top-level are `C:\Tuan\devApps\teminal-dex-app`; only this handoff is changed. The WEB API remains an external read-only contract.
- CORS evidence: live provider response `200`, `Access-Control-Allow-Origin: http://127.0.0.1:8081`, `Access-Control-Allow-Credentials: true`. No credentials, wallet, watchlist, alert, signing, submission, trade, or CopyTrade action was used.

## MOBILE-QA acceptance and evidence

| ID | Result | Evidence / affected files / exact NEXT_DEV_ACTION |
| --- | --- | --- |
| MOBILE-WEB-CORS-001 | PASS | Discover live provider request succeeds with the browser origin and credentials CORS headers above. WEB contract blocker is resolved in this runtime. |
| MOBILE-FILTER-499 | PASS | Discover Trending returned 50 live rows. |
| MOBILE-FILTER-500 | PASS | Discover Gainers returned 50 live rows. |
| MOBILE-FILTER-501 | PASS | Discover Losers returned 28 live rows. |
| MOBILE-FILTER-502 | PASS | Discover Volume returned 50 live rows. |
| MOBILE-FILTER-503 | PASS | Discover New Pairs settled from loading to 50 live rows. |
| MOBILE-FILTER-504 | PASS | Discover Hot Searches returned 10 live rows. |
| MOBILE-FILTER-505 | PASS | Discover Surge returned provider-backed rows (20 observed after individual settle). |
| MOBILE-FILTER-506 | PASS | Discover NextBC returned 60 live rows. |
| MOBILE-FILTER-507 | PASS | Discover Pump Live returned 20 live rows. |
| MOBILE-FILTER-508 | PASS | Discover Watchlist settled to its truthful empty personal state; no user watchlist was mutated. |
| MOBILE-FILTER-509 | PASS | Discover 1h, 6h, and 24h controls each returned settled provider rows (50, 50, 50). |
| MOBILE-FILTER-510 | PASS | Discover Pump.fun plus high liquidity/market-cap thresholds yielded a truthful filtered-empty state, not a network error. |
| MOBILE-FILTER-511 | PASS | Trenches New, Almost bonded, and Migrated each returned 40 rendered launch rows; feed settled at 60/60 provider-backed launches. |
| MOBILE-FILTER-512 | PASS | Trenches launchpad and market-cap, volume, age, and bonding fields constrained the result set (Pump.fun 11; $100k cap 10; $25k volume 23; 60m age 41; 70% bonding 38). The no-match search produced zero launch cards without an error. |
| MOBILE-FILTER-513 | PASS | Monitor started at 50/50 CURRENT provider-backed records; 1h/6h/24h and Market/Liquidity/Flow controls remained populated and error-free. |
| MOBILE-FILTER-514 | PASS | Monitor no-match search exposed the intentional empty message, `No provider-backed tokens match these saved filters`, while the independent signed-onchain feed stayed visible. |
| MOBILE-FILTER-515 | FAIL P2 | Selecting Monitor observed DEX `Pump.fun` leaves the table at 50/50 and still renders a `letsbonk` row. Repro: `/monitor` → Filters → Observed DEX → Pump.fun. Affected: `src/components/MonitorTokenTable.tsx` and filter data plumbing. **NEXT_DEV_ACTION:** make the selected DEX predicate constrain the displayed token rows; add a regression containing mixed Pump.fun/letsbonk records and verify the reset path. |
| MOBILE-FILTER-516 | PASS | Whales Wallets settled to ranked Whale/Smart Money cards; searching `BILLY` returned exactly its one matching wallet, with no error. |
| MOBILE-A11Y-517 | FAIL P2 | Browser console reports invalid nested buttons/hydration errors for Discover TokenRow (`Open … details` contains `Add … to watchlist`) and Trenches TrenchCard (`Open … launch details` contains `Review … quote`). Affected: `src/components/TokenRow.tsx`, `app/(tabs)/trenches.tsx`. **NEXT_DEV_ACTION:** refactor each card into sibling, non-nested interactive controls; add web DOM/a11y regression that rejects nested buttons. |

## Runtime notes and release recommendation

- Commands/evidence: live browser navigation and semantic interaction only; direct CORS header check; page DOM state and browser console. No fabricated device, offline, or provider-fixture claim. No screenshots/logs containing provider payloads were retained.
- Regression risk: `MOBILE-FILTER-515` can mislead a user into believing a DEX-scoped Monitor result is scoped; `MOBILE-A11Y-517` can cause web hydration and keyboard/screen-reader interaction failures.
- **MOBILE-QA release recommendation: NO-GO** until both P2 failures are corrected and independently retested. CORS itself is PASS.

## 20/20 reconciliation

- Findings inspected/reconciled: 20 stable IDs (including two failures).
- Material runtime outcomes available: 20; outcomes verified: 18 PASS, 2 FAIL. Remaining count to 20: 0. Carry-forward `MOBILE-QA-269`, `MOBILE-QA-270`, `MOBILE-FILTER-515`, `MOBILE-A11Y-517`.
- `qa_scope_changed`: not observed; HEAD remained `61dfe68` and no concurrent product change was tested.

---

# MOBILE-QA validation handoff — MOBILE-183

- Trigger: 2026-08-27T02:42:16.685Z. Inspected immutable result `cf192bb22596f4b4f1e555693171f7478d514f57` (`fix(mobile): localize cross-surface quantities`), base `7c85998`. Canonical scope, clean result, and no DEV lock: PASS. Archive `%LOCALAPPDATA%\\Temp\\mobile-qa-183-cf192bb` used; only this report is written under QA lock.
- Type and changed-surface lint: PASS. Archive TypeScript and ESLint exit 0. Focused available suites pass 3/17; the named fourth suite does not exist in this archive, so the DEV-claimed 4-suite focus is not independently reproduced. Full regression, fresh diagnostics/bundles, and runtime are SKIP/BLOCKED this trigger.
- `MOBILE-I18N-470..482`: CONDITIONAL PASS (source/type/lint plus available focused evidence). Five-surface EN/VI visual/accessibility and invalid-number runtime fixture remains blocked; do not treat this as full end-to-end acceptance.
- `MOBILE-QA-269..274`, `MOBILE-WEB-CORS-001`: BLOCKED P2; owner QA/device/network and authorized WEB operator respectively. WEB remains read-only and was not touched.
- Findings inspected/reconciled: 20. DEV outcomes available: 13; independently verified PASS: 13 conditional source/automated outcomes; exact shortfall: 7 (`MOBILE-QA-269..274`, `MOBILE-WEB-CORS-001`). Evidence: no secrets, credentials, payloads, screenshots, or WEB changes.
- **MOBILE-QA release recommendation: CONDITIONAL NO-GO.** Focus discrepancy plus missing full/runtime/device evidence prevents release approval.
- **NEXT_DEV_ACTION:** correct or provide the exact fourth focused suite and immutable EN/VI quantity fixtures across Portfolio, Wallet, Market Intelligence, Token Detail, and Operations for independent full/regression/runtime validation.

---

# MOBILE-QA validation handoff — MOBILE-184

- Trigger: 2026-08-27T03:41:18.684Z. Inspected immutable result `cdfc5cd1bed0b7325293614b831216777de8a95b` (`fix(mobile): localize Token and Wallet percentages`), base `e0a6dc9`. Canonical scope/clean result/no DEV lock: PASS. Archive `%LOCALAPPDATA%\\Temp\\mobile-qa-184-cdfc5cd` used; report is the only repository write.
- Type/lint PASS; focused formatter, Token Detail, and wallet classification: 3 suites / 19 tests PASS. Full regression, fresh diagnostics/bundles, and runtime remain SKIP/BLOCKED this trigger.
- `MOBILE-I18N-483..498`: CONDITIONAL PASS from shared bounded localized fixed/percent formatter source plus type/lint/focused evidence. EN/VI rendered Wallet and Token Detail flow remains unverified.
- `MOBILE-QA-269..271`, `MOBILE-WEB-CORS-001`: BLOCKED P2 physical assistive tech and authorized WEB port-3000 rebuild; WEB not touched.
- Findings inspected/reconciled: 20. DEV outcomes available/verified: 16/16 conditional source/automated PASS. Exact shortfall: 4 (`MOBILE-QA-269..271`, `MOBILE-WEB-CORS-001`). No secrets, credentials, payloads, screenshots, or WEB changes.
- **MOBILE-QA release recommendation: CONDITIONAL NO-GO.** Missing full/runtime/device evidence prevents release approval.
- **NEXT_DEV_ACTION:** provide immutable EN/VI Token Detail and Wallet percentage fixtures plus a rendered wallet regression and exact device route for end-to-end validation.

---

# MOBILE-QA validation handoff — blocker-cleanup retest

- Trigger: 2026-08-27T08:41:07.053Z. Inspected immutable `5276f7a952a2df3333dfa3f3dfd043594999b35f` after base `4d1b8f2`. Canonical scope/prefix and clean result: PASS; no DEV lock.
- PASS: TypeScript; changed-surface ESLint; Monitor DEX, touch-target, and Noble focused suites (3 suites / 38 tests). `MOBILE-FILTER-515` source/regression evidence supports canonical observed-DEX filtering; sibling-control fixes remain source-audited pending exact runtime.
- FAIL P1 — `MOBILE-QA-276` is **not resolved** in this QA environment. Exact bundled-node Doctor command still outputs `Error: spawn node ENOENT` (despite wrapper exit 0). DEV claim of Doctor 21/21 is not independently reproducible.
- BLOCKED: full regression, Android export, device/visual navigation, TalkBack/VoiceOver/Switch Access, large-text, lifecycle/storage/offline/provider fixtures. `MOBILE-QA-277` Noble remains conditional upstream.
- Findings inspected/reconciled: 20. Available outcomes independently PASS: 2 (`MOBILE-FILTER-515`, `MOBILE-A11Y-517` source/focused); FAIL: 1 (`MOBILE-QA-276`); remaining 17 blocked/conditional. No WEB, product, provider, wallet, or transaction mutation.
- **MOBILE-QA release recommendation: NO-GO.** Doctor failure is a current reproducible release-gate defect.
- **NEXT_DEV_ACTION:** make Expo Doctor spawn the bundled Node successfully in the canonical QA shell, then provide a new immutable commit and matching handoff for full/device revalidation.

---

# MOBILE-QA validation handoff — Privy integration retest

- Trigger: 2026-08-27T09:42:08.119Z. Inspected immutable Privy result `8c1b1af` (current report wrapper `d7f3a97`). Scope and clean result: PASS; no DEV lock.
- PASS: TypeScript; changed auth-surface ESLint; actual focused suites `privy-auth.test.ts` and `privy-bundle-boundary.test.ts` (2 suites / 4 tests). The initially named `PrivyAuthProvider`/`AuthScreen` test paths do not exist; they are not counted.
- FAIL P1 — `MOBILE-QA-276` remains reproducible: exact bundled-node Expo Doctor emits `Error: spawn node ENOENT`, contrary to DEV's 21/21 claim. Its wrapper exit code is not a pass.
- BLOCKED: full regression, fresh web/Android exports, and all eight live Privy scenarios. Authorized public App ID, mobile Client ID, enabled email/Google providers, registered `terminaldex` scheme, and exact dev build are absent; no credentials were invented or exposed. Safety boundary remains source-only: no wallet verification, signing, submit, trade, or CopyTrade activation was exercised.
- Findings inspected/reconciled: 20. `MOBILE-AUTH-518..520`, `MOBILE-SEC-521`, `MOBILE-BUNDLE-522` conditional PASS source/automated; `MOBILE-QA-276` FAIL; 14 external runtime/device/provider findings blocked. No WEB or provider mutation.
- **MOBILE-QA release recommendation: NO-GO.** Reproducible Doctor failure and unauthorised live identity setup block release.
- **NEXT_DEV_ACTION:** fix Doctor's child-Node PATH in canonical QA shell, then provide authorized exact-build Privy configuration/fixture for all eight web/Android identity scenarios.

---

# MOBILE-QA validation handoff — MOBILE-192 Metro recovery

- Trigger: 2026-08-27T11:40:12.168Z. Inspected immutable result `654602b2601027b8189da33c3d2592fcc62d328c`, base `d1a633c`. Canonical scope/prefix: PASS; no DEV lock.
- PASS: exact `build-provenance.test.ts` 1 suite / 10 tests verifies default two-worker bound and valid override contract.
- BLOCKED: QA could not start an exact port-8081/8082 runtime because both declared ports are held by unverified existing processes and their termination is not authorized. Therefore no fresh EMFILE, browser console, More→Privy, EN/VI, or navigation outcome is inferred. Full regression and changed-surface type/lint did not settle within this bounded trigger.
- Findings inspected/reconciled: `MOBILE-DEV-EMFILE-528` PASS automated / runtime BLOCKED. Existing 19 physical/provider/toolchain findings carry unchanged; no padding.
- **MOBILE-QA release recommendation: CONDITIONAL NO-GO.** The bounded launcher contract passes, but exact runtime replacement and broader release gates remain incomplete.
- **NEXT_DEV_ACTION:** provide an operator-owned free port or explicit authorization to terminate the verified Metro sessions, then run the exact port-8081 browser/runtime acceptance flow.

---

# MOBILE-QA validation handoff — MOBILE-193 Privy recovery

- Trigger: 2026-08-27T15:40:45.593Z. Inspected immutable result `fa62b7065a98cdfac74b70fe095e52744383a2b2`, base `9890872`. Canonical scope/prefix and clean result: PASS; no DEV lock.
- PASS: archive-equivalent canonical TypeScript; changed auth/settings ESLint; AuthScreen, SettingsProvider, and Privy focused suites (3 suites / 5 tests). The rendered regression establishes spinner-before-deadline, localized alert after 12 seconds, and router-back return action.
- BLOCKED: full regression, Doctor, fresh Android/iOS/web exports, and exact runtime/device navigation were not completed in this bounded trigger. Live Privy identity flows require authorized public identifiers and provider setup; none were inspected or invented. Physical accessibility/network/lifecycle/provider matrix remains external.
- Findings inspected/reconciled: `MOBILE-AUTH-529`, `MOBILE-RECOVERY-530`, `MOBILE-A11Y-531`, `MOBILE-I18N-532`: PASS automated. Sixteen other release findings BLOCKED/CONDITIONAL; no padding.
- **MOBILE-QA release recommendation: CONDITIONAL NO-GO.** Bounded recovery works under independent focused evidence, but full, bundle, Doctor, and live/device gates remain incomplete.
- **NEXT_DEV_ACTION:** provide authorized exact-build Privy configuration plus an available runtime port so QA can verify 12-second recovery, EN/VI alert, return action, and the full authenticated flow on web/Android.

---

# MOBILE-QA validation handoff — MOBILE-194 Doctor/runtime recovery

- Trigger: 2026-08-27T16:41:46.735Z. Inspected immutable result `571179b9f2a8ab7ee3db0254de443d1e16b0e6a5`, base `c4df51c`. Canonical scope/prefix and clean result: PASS.
- PASS: focused build-provenance and package-scripts suites, 2 suites / 19 tests, validate bounded free-port selection and package wiring.
- FAIL P1 — `MOBILE-QA-276` remains unresolved. Exact `node scripts/run-expo-doctor.mjs` reaches Doctor but exits 1 at 17/21: four checks cannot spawn `npm` (`spawn npm ENOENT`), and npm version is undetectable. This is an improvement from child-node failure but not a release-gate pass.
- BLOCKED: exact launched runtime on selected free port, full regression, platform exports, device/accessibility, and authorized Privy flows were not completed in this bounded trigger.
- **MOBILE-QA release recommendation: NO-GO.** Doctor still fails in canonical QA shell.
- **NEXT_DEV_ACTION:** prepend the current Node runtime directory containing both `node` and `npm`/`npm.cmd` correctly for Doctor child processes, then provide immutable revalidation evidence and a safe runtime port.

---

# MOBILE-QA validation handoff — MOBILE-195 Doctor npm isolation

- Trigger: 2026-08-27T17:40:47.459Z. Inspected immutable result `99663122500228cf96a47905b7e0b8bfec016faf`, base `46b8667`. Canonical scope/prefix and clean result: PASS; no DEV lock.
- PASS / RESOLVED — `MOBILE-QA-276`: exact non-escalated bundled-node `scripts/run-expo-doctor.mjs` exits 0 with **21/21 checks passed**. This independently closes the prior child `node` and child `npm` ENOENT failures.
- PASS: `doctor-npm-inspector` and package-script focused suites: 2 suites / 14 tests. The inspection boundary is source/test verified; no package installation, provider, WEB, wallet, signing, submission, trade, or data mutation occurred.
- BLOCKED: full regression, fresh Android/iOS/web exports, runtime/device, and remaining physical/provider fixture matrix were not completed in this bounded trigger. Noble package export condition remains upstream.
- Findings inspected/reconciled: 20. `MOBILE-QA-276` RESOLVED; one toolchain outcome independently PASS; nineteen physical/provider/upstream outcomes carry blocked/conditional without padding.
- **MOBILE-QA release recommendation: CONDITIONAL NO-GO.** Doctor is now green, but broader regression, platform/runtime, and physical accessibility/recovery evidence remain incomplete.
- **NEXT_DEV_ACTION:** supply an exact free runtime port plus authorized Privy configuration and deterministic provider fixtures so QA can complete the remaining platform, accessibility, recovery, and authenticated-flow validation.

---

# MOBILE-QA validation handoff — static-export and hydration recovery

- Trigger: 2026-08-28T09:40:43.703Z. Scope PASS: canonical top-level `C:/Tuan/devApps/teminal-dex-app`, empty Git prefix, no DEV writer lock, immutable inspected HEAD `80b429211551560d059e24bcee06cb88acb3e341`. DEV handoff coverage is present in its 2026-08-28 static-export entry for the `8c0096b`/`d4cfd1c` result chain; no WEB path was read or written.
- PASS — `MOBILE-DEV-533`: independent `node --test scripts/serve-web-export.test.mjs` passed 2/2. It proves extensionless static routes, bounded export-root traversal, GET/HEAD semantics, and POST rejection (405). The first sandbox-only execution was BLOCKED by Temp `EPERM`; the same isolated temp-fixture test passed when granted non-repository temporary-file access. Changed-script ESLint and `tsc --noEmit` exited 0; `git diff --check 9966312..HEAD` was clean.
- PASS — `MOBILE-AUTH-534`: focused `build-provenance`, Privy bundle-boundary, hydration-boundary, and primary accessibility suites passed 4 suites / 84 tests. Source and public Expo-config evidence confirm malformed public Privy App IDs are omitted before either SDK receives them; no live identity provider, credential, wallet, signing, submission, trade, or CopyTrade action was attempted.
- PASS — `MOBILE-WEB-535`: the hydration-boundary suite confirms the static first-render dimensions stay deterministic until hydration and that both Whales and PriceChart use the guarded hook. Public Expo config reports static Metro web output, mobile deep link boundaries, HTTPS-only iOS transport policy, and only biometric Android permissions.
- BLOCKED — exact exported-browser traversal and Android/iOS device validation were not independently reproduced in this shell. There is no ADB/device evidence or authorized live Privy configuration, so loading/stale/empty/offline/retry, filters/paging, large text, TalkBack/VoiceOver, and authenticated flow outcomes are not inferred. `MOBILE-QA-269..280` and `MOBILE-QA-283..287` remain carry-forward external/device or controlled-fixture lanes.
- Findings inspected/reconciled: 20. DEV outcomes available: 3. Outcomes independently verified: 3 PASS. Exact shortfall to 20: 17, stable IDs `MOBILE-QA-269..280`, `MOBILE-QA-283..287`; owners are MOBILE QA/device and controlled provider/identity operators. Regression risk is P2 for unexercised device and live-provider flows.
- **MOBILE-QA release recommendation: CONDITIONAL NO-GO.** Automated/source/config acceptance passes, but release approval awaits fresh exact-export browser evidence and physical-device/provider/accessibility scenarios.
- **NEXT_DEV_ACTION:** provide an operator-owned free runtime/device lane and authorized deterministic Privy/provider fixtures for the 17 carry-forward end-to-end cases.

---

# MOBILE-QA validation handoff — Expo patch-alignment regression

- Trigger: 2026-08-28T12:40:16.544Z. Scope PASS: canonical top-level `C:/Tuan/devApps/teminal-dex-app`, empty Git prefix, immutable HEAD `da73f90f4c39d7a6487eb0e7f838377f317d96b0`, clean worktree, and no DEV writer lock. This is a fresh release-toolchain verification attempt; WEB remained unread and unmodified.
- FAIL P1 — `MOBILE-QA-276` is reopened on the exact bundled-node command `node scripts/run-expo-doctor.mjs`: **20/21** checks passed and Expo Doctor rejects SDK patch alignment. Installed/locked values are `expo 57.0.17`, `expo-constants 57.0.15`, and `expo-font 57.0.1`; current Doctor expects `~57.0.18`, `~57.0.16`, and `~57.0.2`. This is a genuine release-gate failure even though the previous child `node`/`npm` ENOENT failures remain resolved.
- PASS (carried, not re-counted as fresh): static export server 2/2 and focused recovery suites 4/84 from the immediately preceding immutable QA evidence. No exact device, provider, or browser result is inferred this trigger.
- Findings inspected/reconciled: 20. Material DEV outcomes available: 3; freshly verified outcomes: 1 FAIL (`MOBILE-QA-276`); prior independent automated outcomes retained: 3 PASS. Exact shortfall to 20: 16 carry-forward device/provider scenarios, `MOBILE-QA-269..275` and `MOBILE-QA-277..287`; their owners remain MOBILE QA/device and controlled provider/identity operators.
- **MOBILE-QA release recommendation: NO-GO.** Expo Doctor fails on the current immutable release candidate.
- **NEXT_DEV_ACTION:** update the Expo SDK patch family and lockfile together to Doctor-compatible versions, supply a new immutable DEV handoff, and rerun the exact Doctor command before any device/runtime certification.

---

# MOBILE-QA validation handoff — static-export availability regression

- Trigger: 2026-08-28T14:40:18.548Z. Scope PASS: canonical root and empty Git prefix, immutable HEAD `4295805da3c2ac35da8c89d308968fa485b3ab39`, clean worktree, and no DEV writer lock. WEB was not accessed or changed.
- FAIL P1 — `MOBILE-WEB-535`: the claimed static-export browser evidence cannot be independently reproduced from the current workspace. `dist/` contains only `metadata.json` plus assets and is ignored by Git; it contains no `index.html`, `whales.html`, or other web route HTML. QA started the committed loopback-only server against that exact directory: both `/` and `/whales` returned 404. The temporary server PID `30264` was stopped immediately after the check.
- PASS (narrow): `serve-web-export.mjs` correctly rejects unavailable files rather than inventing route content; its independent fixture suite remains 2/2. This does not certify an actual current web bundle or page navigation.
- BLOCKED: browser tab/page, navigation, Retry, Auth recovery, filters, offline/error, responsive/large-text, and accessibility acceptance cannot run without an immutable current web export. ADB remains unavailable; live Privy/provider flows are unauthorized and were not attempted.
- Findings inspected/reconciled: 20. Material DEV outcomes available: 3. Freshly verified: 1 FAIL (`MOBILE-WEB-535`), 1 narrow server-safety PASS; exact shortfall to 20: 18, including `MOBILE-QA-269..280`, `MOBILE-QA-283..287`, plus static-bundle provenance. Owners: MOBILE DEV for reproducible export, then MOBILE QA/device and controlled provider/identity operators.
- **MOBILE-QA release recommendation: NO-GO.** Current web static bundle availability and Expo Doctor both fail release gates.
- **NEXT_DEV_ACTION:** produce and preserve a current exact-HEAD static web export containing route HTML, record the export command and artifact provenance in a new immutable DEV handoff, and align the Expo SDK patch family before QA re-runs browser/device acceptance.

---

# MOBILE-QA validation handoff — MOBILE-196 SDK/export verification

- Trigger: 2026-08-28T16:40:20.555Z. Scope PASS: canonical root `C:/Tuan/devApps/teminal-dex-app`, empty Git prefix, clean immutable DEV candidate `fed440358544014bf8164282ef05c95c74d6d54d` (`fix(mobile): align Expo release patches`), and no DEV writer lock. WEB was not accessed or changed.
- PASS — `MOBILE-TOOLCHAIN-536` / resolved `MOBILE-QA-276`: exact bundled-node `scripts/run-expo-doctor.mjs` passed **21/21**. TypeScript and `eslint app src scripts` exited 0; focused package/Doctor/provenance/hydration/Privy suites passed **5 suites / 31 tests**. The aligned Expo package family is independently accepted.
- PASS — `MOBILE-EXPORT-537` (artifact/server scope): the isolated handoff artifact exists with route HTML and the stated SHA-256 prefixes for `index.html` and `whales.html`. QA loopback server returned HTTP 200 for `/`, `/whales`, `/discover`, `/auth`, `/trenches`, `/more`, `/settings`, and `/copytrade`; it was stopped after testing (PID `36228`).
- FAIL P1 — `MOBILE-QA-288` static-web hydration: a real browser loaded `/whales`, `/discover`, and `/auth` from the verified loopback artifact. Each hydration logs **Minified React error #418** from the web entry bundle. The visible DOM renders initial loading/unconfigured recovery surfaces, but a hydration console error is a release failure; HTTP 200 and source hydration-unit coverage do not make this end-to-end UI acceptance. Auth correctly fails closed with the visible setup-required alert; no identifiers, login, wallet, signing, submission, trade, or CopyTrade action was attempted.
- BLOCKED: `MOBILE-QA-269..280` and `MOBILE-QA-283..287` remain the 17 physical-device/accessibility/layout/lifecycle/performance, controlled network/provider/storage, and authorized live-Privy lanes. ADB is unavailable; no device result is inferred. The full suite is not counted because this trigger independently completed only the focused gate.
- Findings inspected/reconciled: 20. DEV outcomes available: 2; independently verified: 2 PASS (toolchain and static-artifact/server criteria). Fresh regression: 1 FAIL (`MOBILE-QA-288`). Exact shortfall to 20: 17 stable blocked IDs above; owners are MOBILE DEV for the hydration defect, then MOBILE QA/device and controlled provider/identity operators.
- **MOBILE-QA release recommendation: NO-GO.** Doctor and static-route artifacts are repaired, but the reproducible browser hydration error blocks web release and end-to-end certification.
- **NEXT_DEV_ACTION:** reproduce React #418 against the exact static export, fix the server/client hydration mismatch, add a regression that fails on browser console hydration errors, and publish a new immutable DEV handoff before QA repeats browser and device matrices.

---

# MOBILE-QA validation handoff — MOBILE-197 hydration-console verification

- Trigger: 2026-08-29. Scope PASS: canonical root `C:/Tuan/devApps/teminal-dex-app`, empty Git prefix, clean immutable DEV candidate `bdb613c2660890d9cceadd51ccf368af66bb433c` (`fix(mobile): eliminate static hydration errors`), no DEV writer lock, and unchanged HEAD after QA evidence collection. WEB was not accessed or changed.
- PASS — `MOBILE-WEB-538` resolves `MOBILE-QA-288`: Doctor passed **21/21**; TypeScript and `eslint app src scripts` exited 0; focused hydration boundary passed **3/3**; standalone static-export server tests passed **3/3**, including opt-in console capture and reset. The isolated 26-route artifact exists and hash prefixes match the DEV handoff for `index.html`, `whales.html`, `discover.html`, and `auth.html`.
- PASS — `MOBILE-QA-539`: QA served that artifact only on loopback with `--capture-console`. `/`, `/whales`, `/discover`, `/auth`, `/trenches`, `/more`, `/settings`, and `/copytrade` returned HTTP 200. Fresh in-app-browser loads of `/whales`, `/discover`, and `/auth`, with capture reset between each, returned empty capture arrays and no browser error logs. This independently closes the prior React #418 hydration error.
- PASS — static interaction/recovery: Whales tab navigation to Discover updated the route and did not add captured errors. More → "Sign up or sign in with Privy" → unconfigured Auth alert → "Close login" returned to More with empty captured/browser error arrays. No public identifier, login, provider mutation, wallet, signing, transaction, trade, or CopyTrade activation was attempted. The observed loading and setup-required states are truthful without backend/provider fixtures.
- BLOCKED: `MOBILE-QA-269..280` and `MOBILE-QA-283..287` remain the 17 physical-device/accessibility/large-text/layout/lifecycle/performance, controlled network/provider/storage, authorized live-Privy, and upstream-Noble lanes. ADB is unavailable; no Android/iOS result is inferred. Full-suite success is DEV evidence only in this trigger and is not recounted as independent QA evidence.
- Findings inspected/reconciled: 20. DEV outcomes available: 2. Outcomes independently verified: 2 PASS (`MOBILE-WEB-538`, `MOBILE-QA-539`), plus the browser navigation/recovery acceptance above. Exact shortfall to 20: 17 stable blocked IDs; owners are MOBILE QA/device, controlled provider/identity operators, and upstream Noble maintainers.
- **MOBILE-QA release recommendation: CONDITIONAL NO-GO.** The web hydration release blocker is resolved with independent real-browser evidence, but the remaining device, accessibility, live-provider, network/storage, and performance certification is absent.
- **NEXT_DEV_ACTION:** provide an authorized exact-build device/runtime lane and deterministic provider/network/storage fixtures for the 17 carry-forward acceptance cases.

---

# MOBILE-QA validation handoff — MOBILE-198 deterministic provider verification

- Trigger: 2026-08-29. Scope PASS: canonical root `C:/Tuan/devApps/teminal-dex-app`, empty Git prefix, clean immutable DEV candidate `e7080663f5a21e32e824100a2e1aff5d1b3a7e84` (`test(mobile): add deterministic provider recovery fixture`), no DEV writer lock, and unchanged HEAD after evidence collection. WEB and production providers were not accessed or changed.
- PASS — `MOBILE-FIXTURE-540`: standalone fixture tests passed **3/3**. QA started the explicit MOBILE-owned loopback fixture on `127.0.0.1:3099`, confirmed current trending data is schema-compatible and labelled `mobile_qa_fixture` / `deterministic_test_fixture`, and then stopped it (PID `28344`). No real payload, secret, database, provider, wallet, signing, transaction, trade, or CopyTrade action was used.
- PASS — `MOBILE-FIXTURE-541`: authenticated QA-local controls produced current, empty, stale, and offline states. Current supplies a paged PUMP record; empty returns a truthful zero-record page; stale sets `freshness.isStale=true` with explicit stale age; offline returns controlled HTTP 503. The fixture was reset to current before shutdown.
- PASS — `MOBILE-FIXTURE-542`: `page-failure-once` returned HTTP 503 for the first exact `cursor=1` request and HTTP 200/BONK on the next identical request, with `hasMore=false`. This provides a deterministic partial-page retry prerequisite.
- PASS — `MOBILE-SEC-543`: state changes without `x-mobile-fixture-control: qa-local` were rejected with 403; an undeclared scenario was rejected with 400. Fixture scope is bounded to the five declared scenarios and is separate from production API configuration/schema.
- PASS: TypeScript and `eslint app src scripts` exited 0 in this QA run. BLOCKED — the exact `dev:verified --web` attempt starts Metro but this host stops it before port `8101` ever listens, so fixture-driven rendered UI, filters, retained-page recovery, locale, and browser-console acceptance are not inferred. No process outside QA-owned loopback ports was terminated.
- Findings inspected/reconciled: 20. DEV outcomes available and independently verified: **4/4 PASS** (`MOBILE-FIXTURE-540..542`, `MOBILE-SEC-543`). Exact shortfall to 20: 16; stable carry-forward includes `MOBILE-QA-269..272`, `MOBILE-QA-274..277`, `MOBILE-QA-280`, `MOBILE-QA-283..287`, plus fixture-driven UI rendering/retry evidence. Owners are MOBILE QA/runtime/device, authorized provider/identity operators, and upstream Noble maintainers.
- **MOBILE-QA release recommendation: CONDITIONAL NO-GO.** The controlled provider contract is verified, but its actual rendered recovery matrix and physical/device/provider certification are still absent.
- **NEXT_DEV_ACTION:** provide an operator-owned persistent verified web/device runtime that remains reachable after Metro starts, with the fixture URL injected, so QA can execute the current/empty/stale/offline/filter/paging/retry UI matrix.

---

# MOBILE-QA validation handoff — MOBILE-199 persistent runtime verification

- Trigger: 2026-08-29. Scope PASS: canonical top-level `C:/Tuan/devApps/teminal-dex-app`, empty Git prefix, clean immutable candidate `cb992d9510efebc111966f2524f00e43629313cc` (`docs: record persistent mobile runtime proof`), runtime implementation `01ed18e`, and no MOBILE DEV writer lock. WEB was not accessed or changed.
- Environment: Windows; bundled Node; in-app browser; QA-owned loopback ports `8103` (Metro) and `3101` (fixture). No physical Android/iOS target, live provider, credential, wallet, signing, submission, trade, or CopyTrade activation was used.

## Acceptance results

| ID / criterion | Result | Independent evidence |
| --- | --- | --- |
| `MOBILE-RUNTIME-544` persistent detached runtime | PASS | Exact `node scripts/verified-qa-runtime.mjs start --metro-port 8103 --fixture-port 3101` produced state rooted at this repository and commit, with Metro PID `18728` and fixture PID `20408`. After the launcher returned, `status` reported both alive; fixture routes rendered and `/monitor` returned HTTP 200 (52,287 bytes). |
| `MOBILE-RUNTIME-545` cold-start readiness | PASS | The exact committed launcher reached a usable Metro web route within its declared 120-second bound; the first QA request to `/monitor` returned 200. No unrelated port or process was used. |
| `MOBILE-SEC-546` owned-process boundary | PASS | State was bound to the canonical repository and exact commit. The launcher used temporary state/log paths and did not require a production provider, app-data, or repository configuration mutation. |
| `MOBILE-OPS-547` explicit cleanup | PASS | `stop` reported only the recorded PIDs, then `status` returned `{"running":false}` and loopback listeners `8103`/`3101` were both absent. |
| Current provider UI | PASS | `/discover` rendered the `mobile_qa_fixture` provenance label and interactive PUMP row with zero browser error logs. |
| Empty provider UI | PASS | The controlled empty scenario rendered the truthful “No validated provider rows” recovery state and Retry control with zero browser error logs. |
| Offline provider UI and retry | PASS | The controlled offline scenario rendered the `Market data unavailable` alert and Retry control; after restoring `current`, Retry recovered PUMP and removed the alert with zero browser error logs. |
| Stale provider state | CONDITIONAL PASS | The stale fixture response was accepted without browser errors; the primary Discover row did not expose a distinct stale visual marker in this web viewport, so visual stale affordance remains a device/detail-page carry-forward rather than a claimed PASS. |
| Page-failure/retry UI | BLOCKED | The fixture’s one-shot second-page failure/retry contract remains independently verified from MOBILE-198, but Discover uses scroll-driven `onEndReached`; this desktop viewport contained only one row and offered no accessible next-page trigger. No page-retry UI result is inferred. |
| Provenance and Discover accessibility regressions | PASS | Focused `jest --runInBand build-provenance primary-a11y` passed 2 suites / 81 tests, including the source regression for explicit retained-row recovery after a next-page failure. |

## Commands and evidence

```text
node scripts/verified-qa-runtime.mjs start --metro-port 8103 --fixture-port 3101  PASS
node scripts/verified-qa-runtime.mjs status                                   PASS: exact root/commit, both PIDs alive
GET http://127.0.0.1:8103/monitor                                             PASS: HTTP 200, 52,287 bytes
Browser /discover current, empty, stale, offline, Retry                       PASS as classified above; no error logs
node node_modules/jest/bin/jest.js --runInBand build-provenance primary-a11y  PASS: 2 suites / 81 tests
node scripts/verified-qa-runtime.mjs stop                                     PASS: owned PIDs stopped
node scripts/verified-qa-runtime.mjs status                                   PASS: {"running":false}
Get-NetTCPConnection 8103,3101                                                PASS: both listeners absent
```

- The initial `GET /health` returned the fixture's expected route-unavailable JSON; it is not a health endpoint and was not treated as a fixture failure. The actual `/discover` fixture flow and Metro route were usable before cleanup.
- Regression risk: P2. Desktop web recovery is now real-browser verified, but gesture/scroll pagination, large text, screen readers, lifecycle/storage, physical platform rendering, live Privy/provider authorization, and the upstream Noble condition remain unverified.

## 20/20 reconciliation and release recommendation

- Findings reconciled: 20. Material DEV outcomes available and independently verified: **4/4 PASS** (`MOBILE-RUNTIME-544..545`, `MOBILE-SEC-546`, `MOBILE-OPS-547`). Exact outcome shortfall to 20: **16**, with no padding.
- Carry-forward in order: `MOBILE-QA-269..272`, `MOBILE-QA-274..277`, `MOBILE-QA-280`, `MOBILE-QA-283..287`, plus rendered scroll-pagination/retry. Owners: MOBILE QA/device, authorized provider/identity operators, and upstream Noble maintainers.
- **MOBILE-QA release recommendation: CONDITIONAL NO-GO.** The persistent local runtime and current/empty/offline recovery are independently accepted, but release certification still lacks physical-device, assistive-tech/large-text, scroll-pagination, lifecycle/performance, and authorized live identity/provider evidence.
- **NEXT_DEV_ACTION:** provide an operator-owned Android/iOS device lane with a controllable scrollable Discover fixture and authorized identity test configuration so QA can complete the remaining 16 acceptance cases.

---

# MOBILE-QA validation handoff — MOBILE-200 stale and scroll-retry regression

- Trigger: 2026-08-29. Scope PASS: canonical root `C:/Tuan/devApps/teminal-dex-app`, empty Git prefix, clean immutable candidate `4950131f6a1f7e02d6e39dbe01f3b709e075910f` (`fix(mobile): expose stale discovery recovery`), no DEV writer lock, and unchanged HEAD throughout evidence collection. WEB was not accessed or changed.
- Environment: Windows; bundled Node; in-app browser; QA-owned loopback ports `8105` and `3103`. The runtime state recorded only commit `4950131`, Metro PID `27920`, and fixture PID `25664`; explicit stop later removed state and both listeners. An existing non-QA Metro session on port `8101` was observed read-only and left untouched.

## Acceptance results

| ID / criterion | Result | Independent evidence |
| --- | --- | --- |
| `MOBILE-DATA-548` stale Discover alert | CONDITIONAL PASS | `primary-a11y.test.ts` passes and asserts `firstPage?.freshness?.isStale`, localized `staleDegraded`, and polite live-region semantics in Discover. Rendered stale-alert acceptance is BLOCKED by the Metro failure below. |
| `MOBILE-FIXTURE-549` scrollable mixed-DEX fixture | PASS (fixture contract) | `node --test scripts/qa-provider-fixture.test.mjs` passes 3/3. Current first page has exactly 24 unique addresses and `hasMore=true` / cursor `1`; it is bounded to the QA-only fixture. Rendered scrolling is BLOCKED below. |
| `MOBILE-QA-550` one-shot second-page retry | PASS (fixture contract) | The same fixture suite proves cursor `1` returns 503 once, then exact retry returns HTTP 200/BONK with no next cursor. Discover source regression also requires retained rows and Retry after page failure. Rendered retry is BLOCKED below. |
| `MOBILE-DEV-EMFILE-528` Metro runtime regression | FAIL P1 | QA-owned persistent runtime reported both PIDs alive and HTTP 200 for `/discover`, but the actual in-app-browser route rendered Expo Server Error: `EMFILE: too many open files, open ...\\metro-cache\\...mp`. A single Reload application retry reproduced the same error against a different cache file. This prevents stale/scroll/retry UI evidence. |
| Toolchain/source regression | PASS | TypeScript and `eslint app src scripts` exited 0. Focused `primary-a11y` plus `build-provenance` passed 2 suites / 81 tests; Doctor passed 21/21. |
| QA cleanup ownership | PASS | `verified-qa-runtime.mjs stop` stopped only recorded PIDs; subsequent status reported `{\"running\":false}` and ports `8105`/`3103` were absent. |

## Commands and evidence

```text
node scripts/verified-qa-runtime.mjs start --metro-port 8105 --fixture-port 3103  PASS
node scripts/verified-qa-runtime.mjs status                                   PASS: exact root/commit, both PIDs alive
GET http://127.0.0.1:8105/discover                                            PASS: HTTP 200 before browser bundle request
Browser /discover; Reload application                                           FAIL: reproducible Metro EMFILE server error
node --test scripts/qa-provider-fixture.test.mjs                               PASS: 3/3
jest --runInBand primary-a11y build-provenance                                 PASS: 2 suites / 81 tests
tsc --noEmit; eslint app src scripts; scripts/run-expo-doctor.mjs              PASS; Doctor 21/21
node scripts/verified-qa-runtime.mjs stop/status                               PASS: stopped / {"running":false}
Get-NetTCPConnection 8105,3103                                                 PASS: both absent after bounded shutdown
```

- No stale scenario, footer scroll, pagination request, Retry press, BONK DOM, credential, provider production payload, wallet, signing, submission, trade, or CopyTrade action is claimed from the failed browser session.
- Regression risk: P1. An HTTP-ready Metro process is insufficient when its first actual browser bundle read fails with EMFILE. The existing 8101 session may be environmental contention, but QA has not attributed causality and did not terminate it.

## 20/20 reconciliation and release recommendation

- Findings reconciled: 20. Material DEV outcomes available: 3. Source/fixture contracts independently accepted: **3/3**; rendered outcomes independently accepted: **0/3** because `MOBILE-DEV-EMFILE-528` regressed. Exact shortfall to 20: **17** with no padding.
- Carry-forward in order: first `MOBILE-DEV-EMFILE-528`, then rendered `MOBILE-DATA-548`, `MOBILE-FIXTURE-549`, `MOBILE-QA-550`, followed by `MOBILE-QA-269..272`, `MOBILE-QA-274..277`, `MOBILE-QA-280`, and `MOBILE-QA-283..287`.
- **MOBILE-QA release recommendation: NO-GO.** The exact candidate cannot render Discover reliably in the independent browser runtime, so the new stale/recovery UI cannot be accepted despite passing contracts.
- **NEXT_DEV_ACTION:** reproduce and eliminate the Metro cache-file `EMFILE` failure in the canonical QA shell without terminating unowned sessions, then provide a new immutable handoff for the stale-alert and 24-row scroll/retry browser matrix.
