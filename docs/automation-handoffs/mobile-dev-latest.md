# MOBILE DEV → QA handoff

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
