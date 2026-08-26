# MOBILE-QA — MOBILE-158 repository-local Expo diagnostics

- Run (UTC): `2026-08-26T01:49:21Z`.
- Scope/provenance: CWD and Git top-level both resolved to canonical `C:\Tuan\devApps\teminal-dex-app`; `AGENTS.md`, DEV handoff, requirements checklist, worklog, final audit, prior QA report, current status/history, package scripts, public Expo config, and runtime/build lanes were inspected. No WEB workspace, product code, test, configuration, secret, production state, signing, submission, trade, or CopyTrade activation was touched.
- Inspected immutable DEV result: `eb7e96a6b7adaa9ea22117ddadb030670c3ad0d1` (`chore(expo): add local compatibility diagnostics`), MOBILE-158; base `95541dd`. It adds `diagnostics:expo: expo install --check` and one package-script contract case, plus documentation.
- Scope stability: primary worktree has the separate uncommitted Whales/token-logo/MOBILE-to-WEB slice. It was preserved and excluded. A detached clean worktree pinned exactly `eb7e96a`; it linked the already-installed dependencies only. Its generated exports remained in that temporary worktree.
- Environment/device: Windows `10.0.26100`, bundled Node `24.19.0`, Android Platform Tools `37.0.1-15733141`. `adb devices -l` completed but returned no target. No runtime UI, screenshot, device log, navigation, screen-reader, large-text, offline, retry, error, or partial-page evidence is claimed.

## Acceptance result

| MOBILE-158 acceptance criterion | Result | Independent evidence |
| --- | --- | --- |
| Diagnostic uses declared local Expo executable | PASS | `package-scripts.test.ts` passes 6/6. It requires first command `expo`, declared `expo` dependency, and forbids `npx`; the new script is `expo install --check`. |
| Diagnostic fails closed on incompatible dependencies | PASS (release blocker exposed) | Local `expo.cmd install --check` exited 1 and listed exactly: `expo 57.0.15→~57.0.16`, `expo-constants 57.0.13→~57.0.14`, `expo-dev-client 57.0.14→~57.0.15`, `expo-router 57.0.15→~57.0.16`. No dependency was changed. |
| TypeScript/source lint/full regression | PASS | `tsc --noEmit`, `eslint app src`, and immutable Jest all exit 0; full Jest is 81 suites / 401 tests. |
| Public configuration and platform bundles | PASS with known warning | Public Expo config resolves expected app IDs/scheme. Android export: 1 bundle/46 assets; iOS: 1/23; web: 1 JS bundle. Android completes with the carried Noble `./crypto.js` exports-map warning. |
| Exact-build Android navigation/accessibility/recovery | BLOCKED | ADB lists no device. |

## Findings and reconciliation

| MOBILE-QA finding | Status / priority | Evidence, affected area, risk, exact NEXT_DEV_ACTION |
| --- | --- | --- |
| MOBILE-QA-158-01 local diagnostic resolution | PASS / P3 | `package.json`, `src/__tests__/package-scripts.test.ts`; focused 6/6. Risk: script may regress to global/npx resolution. NEXT_DEV_ACTION: retain the local-first contract. |
| MOBILE-QA-158-02 Expo dependency compatibility | FAIL / P1 | `expo install --check` reports four exact SDK patch mismatches above. Affected: Expo dependency readiness/release gate. NEXT_DEV_ACTION: make a separately reviewed dependency-update increment, then rerun diagnostics, TypeScript, Jest, all exports, and device validation. |
| MOBILE-QA-158-R01 schema validation regression | PASS / P3 | Immutable `schema.test.ts` passes. Risk: contract parsing. NEXT_DEV_ACTION: retain as regression coverage. |
| MOBILE-QA-158-R02 API client regression | PASS / P3 | Immutable `client.test.ts` passes. Risk: configured/development-origin policy. NEXT_DEV_ACTION: retain coverage. |
| MOBILE-QA-158-R03 accessibility/privacy semantics | PASS / P2 | Immutable `primary-a11y.test.ts` passes. Risk: control/error semantics. NEXT_DEV_ACTION: pair with device TalkBack evidence when available. |
| MOBILE-QA-158-R04 swap client safety | PASS / P2 | Immutable `swap-safety-client.test.ts` passes. Risk: transaction safety boundary. NEXT_DEV_ACTION: retain execution lock. |
| MOBILE-QA-158-R05 quote readiness atomicity | PASS / P2 | Immutable `swap-readiness.test.ts` passes. Risk: quote expiry/busy overlap. NEXT_DEV_ACTION: retain tests. |
| MOBILE-QA-158-R06 public error boundary | PASS / P2 | Immutable `public-error.test.ts` passes. Risk: provider diagnostic disclosure. NEXT_DEV_ACTION: retain sanitization. |
| MOBILE-QA-158-R07 connectivity/recovery | PASS / P3 | Immutable `connectivity.test.tsx` and `feed-recovery.test.ts` pass. Risk: offline/refetch behavior. NEXT_DEV_ACTION: device exercise remains queued. |
| MOBILE-QA-158-R08 Monitor controls | PASS / P3 | Immutable `MonitorTokenTable.test.tsx` and `monitor-table.test.ts` pass. Risk: alert-state recovery. NEXT_DEV_ACTION: retain coverage. |
| MOBILE-QA-158-R09 CopyTrade safety boundary | PASS / P2 | Immutable CopyTrade suites pass. Risk: accidental activation. NEXT_DEV_ACTION: preserve disabled execution policy. |
| MOBILE-QA-158-R10 token evidence display | PASS / P3 | Immutable `TokenEvidence.test.tsx` and `TokenRow.test.tsx` pass. Risk: identity/image evidence. NEXT_DEV_ACTION: validate concurrent TokenRow slice separately after commit. |
| MOBILE-QA-158-R11 whale contracts/activity | PASS / P3 | Immutable whale-contract/activity suites pass. Risk: provider projection. NEXT_DEV_ACTION: validate dirty Whales slice separately. |
| MOBILE-QA-158-R12 operational evidence | PASS / P3 | Immutable operations/contract suites pass. Risk: observational contract degradation. NEXT_DEV_ACTION: retain bounded recovery. |
| MOBILE-QA-158-R13 transaction manifest | PASS / P2 | Immutable `transaction-manifest.test.ts` passes. Risk: unsigned intent evidence. NEXT_DEV_ACTION: keep signing/submission disabled. |
| MOBILE-QA-158-R14 execution policy | PASS / P1 | Immutable `execution-policy.test.ts` passes. Risk: unsafe execution enablement. NEXT_DEV_ACTION: preserve explicit lock. |
| MOBILE-QA-158-R15 Android dev startup safety | PASS / P3 | Immutable `android-dev-menu-safety.test.ts` passes. Risk: debug startup regression. NEXT_DEV_ACTION: recheck on attached exact-build device. |
| MOBILE-QA-158-R16 build provenance | PASS / P3 | Immutable `build-provenance.test.ts` passes. Risk: untraceable runtime evidence. NEXT_DEV_ACTION: use `dev:verified` when a device exists. |
| MOBILE-QA-158-R17 Noble compatibility guard | PASS / P3 | Immutable Noble guard passes; exports complete. Risk: strict-export fallback drift. NEXT_DEV_ACTION: retain `MOBILE-QA-004` review. |
| MOBILE-QA-158-R18 package quality-script suite | PASS / P3 | Immutable suite passes 6/6. Risk: local tooling contract drift. NEXT_DEV_ACTION: preserve test with future scripts. |
| MOBILE-QA-002 exact-build device/accessibility | BLOCKED / P2 | `adb devices -l` shows only its header. NEXT_DEV_ACTION: attach/start API 37 or physical dev device, run exact `dev:verified` SHA, then exercise every tab/subtab and loading, stale, empty, filtered-empty, offline, error, retry, partial recovery, large text, and TalkBack. |
| MOBILE-QA-004 Noble exports-map fallback | CONDITIONALLY ACCEPTED / P3 | Android warning remains visible; all exports pass. NEXT_DEV_ACTION: re-evaluate after Expo/Metro/wallet/Noble updates; do not suppress through a resolver override. |
| MOBILE-QA-008 Doctor availability | REPLACED / P3 | Repo-local `diagnostics:expo` provides scoped compatibility evidence, but it is not a claim of full Doctor parity. NEXT_DEV_ACTION: retain the command and document any desired full-doctor scope separately. |
| MOBILE-QA-010 verified-launcher runtime evidence | BLOCKED / P3 | Clean worktree is available, but no device target exists. NEXT_DEV_ACTION: start `dev:verified` from clean SHA and capture bounded marker on an attached device. |

## Commands and safe evidence

- Focused package-script Jest — PASS, 1 suite / 6 tests.
- `tsc --noEmit` — PASS; `eslint app src` — PASS, no findings.
- Full immutable Jest — PASS, 81 suites / 401 tests, zero failures.
- Local `expo install --check` — expected nonzero compatibility result; four mismatches, no changes made.
- Public Expo config — PASS: `terminaldex`, Android/iOS `app.terminaldex.mobile`, scheme `terminaldex`.
- Android/iOS/web temporary exports — PASS; Android 1 bundle/46 assets, iOS 1/23, web 1 bundle. Android retains carried Noble warning.
- `adb devices -l` — command PASS / device verification BLOCKED (no listed target).

## Throughput and release recommendation

- Distinct evidence-backed findings inspected/reconciled: **24** (2 new DEV acceptance outcomes, 18 independent immutable regression-lane dispositions, and 4 carried release statuses). The 18 regression entries are not counted as new DEV outcomes or cosmetic splits.
- Current DEV outcomes available: **2**. Independently verified: **2** (1 PASS, 1 FAIL that correctly exposes the compatibility gate); BLOCKED/SKIP/NOT_APPLICABLE within the DEV acceptance: 0. Required-20 DEV-outcome shortfall: **18**. This command/test-only delta has two material outcomes; all relevant static, configuration, bundle, and available device-discovery lanes were exhausted without padding.
- Carry-forward order: (1) MOBILE-QA-158-02 dependency update/revalidation, (2) MOBILE-QA-002 exact-build Android/physical-device certification, (3) immutable QA of the separate Whales/token-logo slice after its own DEV commit/handoff, (4) MOBILE-QA-004 upstream Noble resolution, (5) MOBILE-QA-010 verified-launcher runtime evidence.

**MOBILE-QA NO-GO for release:** diagnostics demonstrate four unresolved Expo SDK compatibility mismatches and no device is available for exact-build runtime/accessibility certification. The new local diagnostic contract itself is correctly implemented. No product code, test, configuration, WEB file, external state, transaction path, or secret was modified.
