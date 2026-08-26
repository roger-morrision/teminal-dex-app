# MOBILE DEV → QA handoff

## MOBILE-171 — 20/20 auxiliary motor-accessibility and regression stability

- Base: `bc21809`; result: containing commit.
- BA/PO and DEV: 20 current findings reconciled and 20 material outcomes completed (`MOBILE-QA-281`, `MOBILE-TOUCH-361..379`); exact shortfall 0.
- Changed behavior: Monitor grouped-test interaction/cleanup is act-safe; AI, CopyTrade, Research, Wallet Intelligence, Operations, Market Intelligence, Trade, Track, Settings, and Token Detail expose 19 measured interactive control families at a 44px minimum.
- Changed files: ten production routes, two focused regressions, and MOBILE evidence documents only.
- Evidence: TypeScript/full source ESLint PASS; focused Jest PASS (2 suites/16 tests); full Jest PASS (83 suites/433 tests); public Expo config PASS.
- Runtime scenario: edge-tap every named control at 1.0× and 1.3× font scale; verify focus, labels, wrapping, selection state, and retry behavior; repeat grouped Monitor suites to check order stability.
- Known risks: physical-device motor/accessibility evidence, exact API 37 traversal, restricted-shell Doctor, and Noble fallback remain QA-owned.
- NEXT_QA_ACTION: pin the result, independently classify all 20 IDs, repeat grouped Monitor and release gates, then perform device edge-tap traversal.
- NEXT_WEB_ACTION: none.

## MOBILE-170 — 20/20 live-feed evidence integrity

- Base: `c28a7f6`; result: containing commit.
- BA/PO and DEV: 20 current findings reconciled and 20 material outcomes completed (`MOBILE-DATA-341..360`); exact shortfall 0.
- Changed behavior: CopyTrade, Market Intelligence, Monitor, Trenches, Whales, and Track normalize 20 audited quality/source/provider/RPC/channel/status outputs; provider arrays trim, deduplicate, and fall back truthfully.
- Changed files: six production areas, shared formatter/regression, and MOBILE evidence documents only.
- Evidence: TypeScript/full source ESLint PASS; focused Jest 7 suites/24 tests PASS; full Jest 83 suites/423 tests PASS; public Expo config PASS.
- Runtime scenario: inject blank, whitespace, and duplicate provider evidence for each ID; verify localized fallback labels, stable provider ordering, no empty separators, and unchanged navigation/retry behavior.
- Known risks: immutable API 37 traversal, physical accessibility/resilience/performance, npm-enabled Doctor, and Noble fallback remain separately QA-owned.
- NEXT_QA_ACTION: pin the result, independently classify all 20 IDs, run malformed live-feed traversal and standard release gates.
- NEXT_WEB_ACTION: none.

## MOBILE-169 — 20/20 evidence-label integrity

- Base: `6d53b9e`; result: containing commit.
- BA/PO and DEV: 20 current findings reconciled and 20 material outcomes completed (`MOBILE-DATA-321..325`, `MOBILE-A11Y-326`, `MOBILE-DATA-327..340`); exact shortfall 0.
- Changed behavior: twenty distinct quality/source/provider/method/DEX/token outputs across Operations, Whales, Wallet Intelligence, Track, Token Detail, Discover, Monitor, and Trenches trim valid values and localize blank/missing evidence.
- Changed files: eight production areas plus shared formatter/test and MOBILE evidence documents.
- Evidence: TypeScript/full source ESLint PASS; focused Jest 7 suites/15 tests PASS; full Jest 83 suites/422 tests PASS; public Expo config PASS.
- Runtime scenario: inject whitespace-only values for each stable ID, verify localized fallback labels in visual and accessibility output, and confirm navigation/retry behavior remains unchanged.
- Known risks: exact API 37 provenance traversal, physical accessibility/resilience/performance, npm-enabled Doctor, Noble fallback, and provider-controlled Monitor scenarios remain separately QA-owned.
- NEXT_QA_ACTION: pin the result, independently classify all 20 IDs, run malformed-evidence UI traversal and standard release gates.
- NEXT_WEB_ACTION: none.

## MOBILE-168 — cross-surface provenance normalization

- Base: `df8b438`; result: containing commit.
- BA/PO: 20 current findings reconciled; 8 material outcomes completed (`MOBILE-DATA-301..308`); exact shortfall 12 (`MOBILE-QA-269..280`) with unchanged external owners.
- Changed behavior: Token Detail, Quote Review, Operations, Discover, Monitor, Trenches, Market Intelligence, and Wallet Intelligence trim valid provider labels and localize blank/missing DEX or source evidence.
- Changed files: eight production surfaces, shared formatter/test, and MOBILE evidence documents only.
- Evidence: TypeScript/full source ESLint PASS; focused Jest 4 suites/9 tests PASS; full Jest 83 suites/422 tests PASS; public Expo config PASS.
- Runtime scenario: provide whitespace-only DEX/source values to each named surface and verify a localized unavailable/unknown label appears, valid labels remain trimmed, and row/detail navigation is unchanged.
- Known risks: immutable API 37 coverage, physical accessibility/resilience/performance, npm-enabled Doctor, Noble fallback, and provider-controlled Monitor scenarios remain externally owned.
- NEXT_QA_ACTION: pin the result and independently classify `MOBILE-DATA-301..308` using malformed-evidence fixtures and the standard release gates.
- NEXT_WEB_ACTION: none.

## MOBILE-167 — Monitor provider DEX normalization

- Base: `6646131`; result: containing commit.
- BA/PO: 20 current findings reconciled. Completed 8 material ready outcomes (`MOBILE-DATA-281..288`); exact shortfall 12 (`MOBILE-QA-269..280`) with unchanged device/toolchain/upstream/provider-fixture owners recorded in `WORKLOG.md`.
- Changed behavior: malformed/blank/reserved DEX values cannot crash or create blank controls; case variants deduplicate; limiting follows normalization; selected filters compare null-safely; stale selections fail soft to All; rows localize unavailable provenance.
- Changed files: Monitor table/store, focused regression, and MOBILE evidence documents only.
- Evidence: TypeScript/full source ESLint PASS; focused Jest PASS (1 suite/6 tests); full Jest PASS (83 suites/421 tests); public Expo config PASS. Restricted-shell Doctor is blocked because its child `node` is unavailable.
- Runtime scenario: inject undefined/blank/`All`/case-duplicate DEX values into Monitor pages, open DEX filters, select a surviving option, refresh without it, and verify no crash, blank/duplicate choice, stranded empty table, or undefined provenance.
- Known risks: immutable API 37 rerun and physical accessibility/performance checks remain QA-owned; provider reset/cursor-failure fixtures remain unavailable.
- NEXT_QA_ACTION: pin the result and independently classify `MOBILE-DATA-281..288`, then run the Monitor runtime scenario and standard release gates.
- NEXT_WEB_ACTION: none.

## MOBILE-166 — Trenches provider DEX normalization

- Base: `51fd2e8`; result: containing commit.
- BA/PO: 20 current findings reconciled. Completed 8 material ready outcomes (`MOBILE-DATA-261..268`); exact shortfall 12 (`MOBILE-QA-269..280`) with device/toolchain/upstream/provider-fixture owners recorded in `WORKLOG.md`.
- Changed behavior: invalid/blank/reserved DEX values are excluded; case variants deduplicate with stable first casing; limiting occurs after normalization; filter comparison is null-safe; stale selection fails soft to All; card provenance uses localized unavailable evidence.
- Changed files: Trenches screen/filter library, focused regression, and MOBILE evidence documents only.
- Evidence: TypeScript/full source ESLint PASS; focused Jest PASS (3 suites/9 tests); full Jest PASS (83 suites/419 tests); public Expo config PASS. Restricted-shell Doctor remains 17/21 because child npm cannot spawn.
- Runtime scenario: inject undefined/blank/`All`/case-duplicate DEX values, open filter panel, select surviving DEX, refresh with selection removed, confirm no React key warning or undefined option and truthful card provenance.
- Known risks: immutable API 37 rerun is pending; Doctor/Noble/physical accessibility/provider-fixture blockers remain `MOBILE-QA-269..280`.
- NEXT_QA_ACTION: rerun the QA-021 reproduction on the immutable result and independently classify outcomes 261..268.
- NEXT_WEB_ACTION: none.

## MOBILE-165 — 20/20 touch-target and motor accessibility

- Base: `fe31e0c`; result: containing commit.
- Findings/outcomes: `MOBILE-TOUCH-241..260`; 20 measured production control families corrected, remaining to 20: 0. Acceptance evidence and ranking are in `WORKLOG.md`.
- Changed behavior: Discover mode/period/filter/retry/DEX/reset/apply; Monitor refresh/window/preset/direction/DEX/sort/density/reset/pagination; and Trenches lane/filter/launchpad/reset controls now meet a 44px target floor.
- Changed files: three production surfaces, focused touch-target regression, and MOBILE evidence documents only.
- Evidence: TypeScript and full source ESLint PASS; focused Jest PASS (5 suites/81 tests); full Jest PASS (83 suites/417 tests); public Expo config PASS. Restricted-shell Doctor is 17/21 because child `npm` is unavailable; normal-environment 21/21 remains in MOBILE-162.
- Runtime scenarios: edge-tap every named control at normal and 1.3× font scale; traverse horizontal rails with TalkBack/Switch Access; verify no overlap, clipping, or lost selection state.
- Known risk: physical-device motor-accessibility and small-screen visual confirmation remain external QA evidence.
- NEXT_QA_ACTION: pin the result and independently classify all 20 IDs, then run type/lint/full Jest/public config/device scenarios.
- NEXT_WEB_ACTION: none.

## MOBILE-164 — 20/20 input integrity and async-control safety

- Base: `31b683f`; result: containing commit.
- Findings/outcomes: `MOBILE-DATA-221..240`; 20 distinct material production behaviors completed, remaining to 20: 0. Acceptance criteria and source evidence are in `WORKLOG.md`.
- Changed behavior: exact-address/search inputs are natively bounded; Research and alert decimals normalize before state/API validation; radio sets expose group semantics; CopyTrade sizing fields align native and sanitizer bounds; Portfolio and tracked-wallet mutations cannot overlap.
- Changed files: Portfolio, Wallet Intelligence, Research Workspace/store, Whales, Monitor, CopyTrade, focused tests, and MOBILE evidence documents only.
- Evidence: TypeScript PASS; focused/full source ESLint PASS; focused Jest PASS (5 suites/24 tests); full Jest PASS (82 suites/414 tests); public Expo config PASS. Restricted-shell Doctor is 17/21 because child `npm` is unavailable; normal-environment 21/21 remains in MOBILE-162.
- Runtime scenarios: paste overlong address/search/decimal values; enter multiple decimal points; toggle grouped choices with TalkBack; rapidly press wallet disconnect/revoke/load/save/remove; force local persistence failure and retry.
- Known risk: physical-device keyboard, paste, and accessibility traversal remain QA device work.
- NEXT_QA_ACTION: validate all 20 IDs on the immutable result, rerun type/lint/full Jest/Expo diagnostics, and perform API 37 plus physical-device scenarios when available.
- NEXT_WEB_ACTION: none.

## MOBILE-163 — 20/20 filter integrity and accessibility batch

- Base: `2830415`; result: containing commit.
- Findings/outcomes: `MOBILE-A11Y-201..204`, `MOBILE-DATA-205..207`, `MOBILE-UX-208`, `MOBILE-A11Y-209..218`, and `MOBILE-DATA-219..220`. All 20 are material production behaviors with acceptance criteria recorded in `WORKLOG.md`; remaining to 20: 0.
- Changed behavior: Discover exposes tab/radio/modal/filter/pagination state and normalizes bounded thresholds; Monitor exposes separate exclusive groups, checkboxes, a real density switch, named reset, and truthful pagination state; Trenches aligns native/state text limits and caps bonding progress at 100.
- Changed files: `app/(tabs)/discover.tsx`, `app/(tabs)/trenches.tsx`, `src/components/MonitorTokenTable.tsx`, `src/lib/trenches.ts`, focused tests, and MOBILE evidence documents.
- Acceptance evidence: TypeScript PASS; focused ESLint PASS; focused Jest PASS (3 suites/12 tests); full Jest PASS (82 suites/411 tests). Restricted-shell Doctor 17/21 because child `npm` is unavailable; compatibility check blocked on external user-cache `EPERM`; normal-environment 21/21 remains recorded in MOBILE-162. No production mock/API/transaction behavior added.
- Runtime scenarios: Discover mode/period/DEX traversal; malformed threshold paste; modal open/close; pagination retry while busy; Monitor window/preset/direction/DEX/sort/density traversal; reset and load-more; Trenches 50-character keyword and 100% bonding cap.
- Known risk: TalkBack/VoiceOver traversal requires physical-device confirmation. API 37 already rendered Whales/Discover through the current Metro bundle without fatal or module-resolution errors; native rebuild remains host-loopback blocked.
- NEXT_QA_ACTION: pin the result commit and independently classify all 20 IDs pass/fail/blocked, then rerun type/lint/full Jest and API 37 runtime scenarios.
- NEXT_WEB_ACTION: none.

## MOBILE-162 — repository-local Expo Doctor

- Base: `6c5c5a9`; result: containing commit.
- Changed files/behavior: exact dev dependency `expo-doctor` 1.20.3; `diagnostics:doctor = expo-doctor`; command contract forbids implicit global/`npx`; dynamic config consumes Expo's supplied static config and preserves nullable public commit provenance.
- Acceptance: local Doctor 21/21; local Expo compatibility, TypeScript, and full primary-worktree Jest pass. Focused command/config Jest passes 14/14; the initial lint found one stale test-only suppression, removed before the final zero-warning lint gate.
- Security/release: development diagnostics only; no API, wallet, signing, submission, trading, credential, or WEB behavior changed. Existing 11 moderate build-tool advisories remain separately bounded by MOBILE-161.
- NEXT_QA_ACTION: pin the result; run `npm run diagnostics:doctor`, command/config focused tests, TypeScript, ESLint, full Jest, public config, and platform exports. Close `MOBILE-QA-008` only on 21/21 from the immutable checkout.
- 20/20 reconciliation: 20 findings reviewed; eight material diagnostic/config outcomes completed; shortfall 12 carried forward without padding.

---

## MOBILE-161 — dependency-audit runtime boundary

- Base: `b73b47a`; result: containing commit.
- Evidence: `npm audit --package-lock-only --omit=dev --json` reports 11 moderate, 0 high, 0 critical. Root advisory `uuid` 7.0.3 (`GHSA-w5hq-g745-h8pq`) is reached through `@expo/config-plugins → xcode` in Expo configuration/build tooling. npm's suggested Expo 46 downgrade and forced remediation were not applied.
- Changed files/behavior: `dependency-audit-boundary.test.ts` adds six fail-visible checks for direct-dependency exclusion, exact transitive path/versions, and absence of `uuid`/`xcode` runtime imports. Product, API, wallet, and transaction behavior are unchanged.
- Acceptance: focused Jest 6/6, TypeScript, warning-free source ESLint, and full primary-worktree Jest pass.
- Known risk: the upstream moderate advisory remains open and must be reevaluated with compatible Expo/xcode updates; the guard bounds exposure but is not a vulnerability fix.
- NEXT_QA_ACTION: pin the result; rerun the production audit and focused/full gates; fail if high/critical findings appear, if the exact path changes without review, or if either package enters runtime source.
- 20/20 reconciliation: 20 findings reviewed; six material security-boundary outcomes completed; shortfall 14 carried forward without padding.

---

## MOBILE-160 — rendered SnipeCard query settlement

- Base: `55326ce`; result: containing commit.
- Changed files/behavior: `SnipeCard.test.tsx` awaits visible success settlement in both initial-query cases and disappearance of Retry after recovered refetch. Product code is unchanged.
- Acceptance: focused CI 3/3; TypeScript; zero-warning focused ESLint; primary full CI Jest 81/403 with no `act` warning. Immutable QA expects 81/401 after excluding two concurrent TokenRow tests.
- NEXT_QA_ACTION: pin the result, run focused then full `--ci --runInBand`, scan stdout/stderr for `act`/overlapping-act warnings, and close MOBILE-QA-013 only when the immutable 81/401 run is warning-free.
- 20/20 reconciliation: 20 findings reviewed; three material rendered-settlement outcomes completed; shortfall 17 carried forward without padding.

---

## MOBILE-159 — SDK 57 patch compatibility

- Base: `c6ea00c`; result: containing commit.
- Changed files/behavior: `package.json` and `package-lock.json` align Expo `~57.0.16`, Constants `~57.0.14`, Dev Client `~57.0.15`, and Router `~57.0.16`. No product/API/transaction behavior changed.
- Acceptance: `diagnostics:expo` PASS; TypeScript; zero-warning source ESLint; primary full Jest 81/403; public config PASS; Android export PASS (1 Hermes bundle / 46 assets). Immutable QA expects 81/401 excluding two concurrent TokenRow tests.
- Known evidence: Noble warning remains under MOBILE-QA-004; stale pre-upgrade Metro cache fell back to a successful full crawl; npm reported 11 moderate audit findings and no automatic/force remediation was run.
- NEXT_QA_ACTION: pin the result; independently run local diagnostics, immutable 81/401 tests, public config, and Android/iOS/web exports. Open exact security findings as stable IDs before any audit remediation. Continue device-owned MOBILE-QA-002 separately.
- 20/20 reconciliation: 20 findings reviewed; four material compatibility outcomes completed; shortfall 16 carried forward without padding.

---

## MOBILE-158 — repository-local Expo diagnostics

- Base: `95541dd`; result: containing commit.
- Changed files/behavior: `package.json` adds `diagnostics:expo = expo install --check`; `package-scripts.test.ts` requires the declared local Expo executable and forbids implicit global/npx resolution.
- Acceptance: command-contract Jest 6/6; TypeScript; zero-warning focused ESLint; primary full Jest 81/403. Immutable QA expects 81/401 after excluding the concurrent two TokenRow tests.
- Current diagnostic result: expected FAIL with Expo `57.0.15→~57.0.16`, Constants `57.0.13→~57.0.14`, Dev Client `57.0.14→~57.0.15`, Router `57.0.15→~57.0.16`.
- NEXT_QA_ACTION: pin the result, verify the local command and exact fail-closed list, then keep release NO-GO until a separate dependency update makes it pass. This provides a local diagnostic substitute but does not claim full Expo Doctor coverage.
- 20/20 reconciliation: 20 findings reviewed; two material diagnostic outcomes completed; shortfall 18 carried forward without padding.

---

## MOBILE-157 — Noble fallback compatibility guard

- Base: `8d8971d`; result: containing commit.
- Changed files/behavior: `src/__tests__/noble-bundle-compatibility.test.ts` formalizes the bounded `MOBILE-QA-004` disposition. It pins nested Curves 1.9.7 / Hashes 1.8.0, records `./crypto` versus `./crypto.js`, requires CommonJS+ESM fallback files, and rejects silent root overrides. Product/runtime code is unchanged.
- Acceptance: focused 5/5; TypeScript; zero-warning focused ESLint; primary full Jest 81/402. Immutable QA expects 81/400 because the concurrent TokenRow slice remains excluded.
- NEXT_QA_ACTION: pin the result commit; run focused/full tests and all three exports. Mark `MOBILE-QA-004` conditionally accepted only if bundles complete with the known warning and all five guards pass.
- 20/20 reconciliation: 20 findings reviewed; five material compatibility outcomes completed; shortfall 15 carried forward without padding.

---

## MOBILE-156 — warning-free SnipeCard settlement

- Base: `a0ae4da`; result: containing commit.
- Changed files/behavior: `src/__tests__/SnipeCard.test.tsx` waits for the initial `fetchTokenDetail` query in the research/removal and threshold cases before test teardown. Product code is unchanged.
- Acceptance: focused SnipeCard 3/3; TypeScript; zero-warning focused ESLint; primary-worktree full Jest 80/397 with no React `act` console warning. The separate dirty TokenRow slice accounts for two tests, so immutable QA expects 80/395.
- NEXT_QA_ACTION: pin the result commit, run focused SnipeCard and full Jest from a clean checkout, require no `act`/overlapping-act warning, and report 80/395. Continue `MOBILE-QA-002`, `004`, and `008` independently.
- 20/20 reconciliation: 20 findings reviewed; two material asynchronous-settlement outcomes completed; shortfall 18 carried forward without padding.

---

## MOBILE-155 — immutable test-count evidence correction

- Base: `0b0c12b`; result: containing commit.
- Evidence correction: immutable MOBILE-154-F1 contains 80 suites / 395 tests. The primary dirty worktree's 397 count includes two tests from the separate uncommitted TokenRow/logo slice and is not attributable to MOBILE-154.
- Verification: QA independently passed the clean pinned 80/395 suite; `git show e0a74cf:src/__tests__/TokenRow.test.tsx` has eight tests while the concurrent worktree file has ten.
- NEXT_QA_ACTION: close `MOBILE-QA-009` after confirming the corrected immutable count; continue device-owned `MOBILE-QA-002` and dependency-owned `MOBILE-QA-004`.
- 20/20 reconciliation: 20 findings reviewed; one material release-evidence correction completed; shortfall 19 is carried forward without padding.

---

## MOBILE-154-F1 — complete semantic ordering follow-up

- Base: `7080d95`; result: containing commit.
- Changed behavior/files: the four remaining Monitor/CopyTrade reset-before-mutate assertions use narrowly scoped whitespace-tolerant regex ordering. Product behavior is unchanged and mutual-exclusion requirements remain enforced.
- Acceptance: focused accessibility Jest 68/68; TypeScript; zero-warning focused ESLint; immutable full Jest 80 suites / 395 tests.
- NEXT_QA_ACTION: pin the result commit and rerun `primary-a11y.test.ts` plus full Jest from a clean checkout; close `MOBILE-QA-007` only if both gates pass. Continue `MOBILE-QA-002` separately.
- 20/20 reconciliation: 20 findings reviewed; four independently testable assertion outcomes completed; shortfall 16 remains device/runtime evidence, upstream dependency warning, physical-device scenarios, WEB-QC fixtures, and concurrent Whales/logo acceptance.

---

## MOBILE-154 — semantic accessibility release gate

- Base: `ff9ac32`; result: containing commit.
- Changed behavior/files: `src/__tests__/primary-a11y.test.ts` now validates Monitor and CopyTrade sanitizer calls with whitespace-tolerant semantic patterns instead of exact indentation. Product code is unchanged.
- Acceptance: focused accessibility Jest 68/68; TypeScript; zero-warning focused ESLint; immutable full Jest 80 suites / 395 tests.
- Security/accessibility: both surfaces must still route mutation errors through `publicErrorMessage`; raw provider and adapter messages remain forbidden.
- NEXT_QA_ACTION: pin the result commit, rerun the focused and full suites, then continue `MOBILE-QA-002` immutable Android marker evidence. `MOBILE-QA-004` remains an isolated dependency lane.
- 20/20 reconciliation: 20 findings reviewed; 2 material release-gate outcomes completed; shortfall 18. Carry forward runtime-marker/device evidence, upstream dependency warning, physical-device scenarios, WEB-QC fixtures, and concurrent Whales/logo acceptance.

---

## MOBILE-153 — immutable runtime provenance

- Base: `f73c3a0`; result: containing commit.
- Behavior/files: `npm run dev:verified` resolves Git HEAD, rejects tracked dirty state, starts Expo with a child-only `MOBILE_BUILD_COMMIT`; `app.config.js` embeds nullable public provenance; `app/_layout.tsx` emits a bounded development mount marker. Ordinary sessions identify as `unverified`.
- Acceptance/evidence: focused Jest 7/7; Expo config returned the supplied fixture hash; dirty-worktree launcher exited 1 before Metro; TypeScript and warning-free lint passed.
- Privacy/security: public commit only; no endpoint, environment dump, credential, wallet, provider diagnostic, signing, submission, or transaction information.
- NEXT_QA_ACTION: from a clean immutable result commit, run `npm run dev:verified -- --localhost --port 8092`, launch API 37, and require `[MOBILE_BUILD] commit=<exact HEAD>` before certifying Whales/routing/quote evidence.
- 20/20 reconciliation: 20 findings reviewed; 7 material outcomes completed; shortfall 13. Carry forward physical accessibility/quote scenarios, WEB-QC fixtures, upstream Metro warning ownership, and concurrent Whales/logo acceptance.

---

## MOBILE-152 — Android emulator backend routing

- Base: `d9d5622`; result: containing commit.
- Behavior/files: `src/api/client.ts` selects `10.0.2.2:3000` only for unconfigured Android development; `src/__tests__/client.test.ts` verifies Android and non-Android defaults. Explicit environment configuration and production HTTPS policy are unchanged.
- Acceptance/evidence: focused client Jest 35/35; TypeScript; warning-free focused ESLint; host `/api/trending` HTTP 200; emulator host ping; API 37 cold launch; React Native mount; Whales accessibility hierarchy; no configuration/connection error and no fatal/ANR/unresolved-module log.
- Security: no production mock data, secret, credential, WEB write, signing, submission, or transaction capability.
- NEXT_QA_ACTION: pin the result commit; verify explicit configured-origin precedence, Android no-config host routing, non-Android loopback, and production HTTP rejection. Recheck Whales with the host backend running.
- 20/20 reconciliation: 20 findings reviewed; six material platform/runtime outcomes completed; shortfall 14. Carry forward physical TalkBack/large text/quote checks, WEB-QC-gated fixtures, upstream Metro warning ownership, and the overlapping concurrent Whales/logo slice.

---

## MOBILE-151 — Android development startup safety

- Base: `3f3825d`; result: containing follow-up regression commit.
- Behavior: Android debug builds no longer synchronously enable shake-to-open sensing during React Host startup. Keyboard and ADB developer controls remain enabled. Release behavior and transaction controls are unchanged.
- Files: `plugins/withAndroidDevMenuSafety.js`, `src/__tests__/android-dev-menu-safety.test.ts`, and MOBILE evidence documents.
- Acceptance/evidence: focused Jest 6/6; TypeScript; warning-free focused ESLint; Expo prebuild; JDK 17 x86_64 assembly; ADB install; cold launch `TotalTime: 2413`; React Native `main` mount; rendered Whales accessibility hierarchy; no ANR/fatal/unresolved-module log.
- Known risks: the local backend endpoint is not configured, so the rendered recovery surface is expected. Physical-device TalkBack and quote-flow interaction remain QA-owned.
- NEXT_QA_ACTION: pin the result commit, rerun the plugin tests, regenerate Android once, and verify cold/warm startup plus keyboard/ADB developer-menu access.
- 20/20 reconciliation: 20 findings reconciled; 6 outcomes completed; shortfall 14. Carry-forward `MOBILE-151-07` through `MOBILE-151-20` requires physical-device ownership, WEB-QC approval, or the active concurrent Whales/token-logo slice. No padding or WEB edits were used.

---

- Story: `MOBILE-150` — quote expiry TOCTOU and readiness atomicity
- Base: `715d10f`
- Result: containing commit; QA must pin immutable `HEAD`
- Scope: MOBILE only. WEB remained read-only. Concurrent Whale/token-logo work and MOBILE→WEB drafts were preserved and excluded.

## Acceptance and outcomes (22/20)

1. Exact 15,000 ms quote age remains valid.
2. Age 15,001 ms is expired.
3. Future clock skew does not create negative/inferred age.
4. Initial render clock uses real current time.
5. Preparation mutation rechecks expiry at invocation.
6. Confirmation mutation rechecks expiry at invocation.
7. Expired confirmation is native-disabled.
8. Expired confirmation is visually disabled.
9. Expired confirmation is announced disabled.
10–18. Buy, sell, amount, two unit controls, and four slippage controls freeze during readiness refresh.
19. Quote retrieval/refresh is blocked during readiness refresh.
20. Preparation is blocked during readiness refresh.
21. Confirmation is blocked during readiness refresh.
22. Readiness retry is blocked/busy while any other evidence-chain phase is pending.

Findings reconciled: 22. Outcomes completed: 22. Remaining to required 20: 0. Execution remains locked.

## Changed files

- `app/trade/[address].tsx`
- `src/lib/swap-readiness.ts`
- `src/__tests__/swap-readiness.test.ts`
- `src/__tests__/primary-a11y.test.ts`
- MOBILE checklist/worklog/final audit and this handoff

## Verification

- TypeScript, source ESLint, focused swap/readiness/accessibility tests, full Jest, Expo public config, staged diff check.

## NEXT_QA_ACTION

- Pin the containing commit and independently verify all 22 outcomes, especially expiry during preparation/confirmation and readiness retry overlap.
- `MOBILE-QA-002`: repeat on responsive Android with TalkBack and enlarged text.
- `MOBILE-QA-003`: clean immutable full-suite certification still awaits isolation/commit of concurrent whale/logo work.
