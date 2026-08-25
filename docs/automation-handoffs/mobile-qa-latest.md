# MOBILE-QA — Scope-change validation

- Run (UTC): `2026-08-25T19:42:04Z`.
- Scope: canonical `C:\Tuan\devApps\teminal-dex-app` only. CWD and Git top-level both resolved to the canonical MOBILE workspace before acquiring the MOBILE QA/report lock. `AGENTS.md`, the DEV handoff, requirements checklist, worklog, final audit, Git history/status, prior QA handoff, and the pending working-tree diff were inspected. No WEB workspace or backend was accessed or changed.
- Inspected committed baseline: `edfbd83d046d30583ed22cadf29eb590125a3a36` (`docs: record MOBILE-153 QA validation`), whose implemented DEV commit remains `290933fb824b242b892d12d753cb707e05ec3c1f` (`MOBILE-153`).
- Scope stability: **qa_scope_changed**. The primary MOBILE worktree contains uncommitted product/test/config changes and untracked delivery handoffs. There is no committed DEV result or updated DEV handoff identifying an immutable increment. Under the QA contract, no command, emulator, bundle, or runtime check was run against this mixed state.
- Environment/device: Windows 10.0.26100; no runtime device evidence collected this run because the inspected state is unstable.

## MOBILE-QA-006 — P1 / QA scope instability

- Status: OPEN (new this run).
- Evidence: `git status --short` reports modified `.gitignore`, `app/(tabs)/whales.tsx`, `expo-env.d.ts`, `src/__tests__/TokenRow.test.tsx`, `src/components/TokenAvatar.tsx`, and `src/components/TokenRow.tsx`; plus untracked `src/components/DexLogo.tsx` and three `docs/automation-handoffs/mobile-to-web-*.md` files.
- Affected files: the nine paths above. The source diff changes DEX-logo rendering, token image URL normalization, unavailable age/holder copy, generated Expo environment declarations, and corresponding tests; it must be assessed as one immutable DEV slice rather than mixed with the prior QA-certified baseline.
- Reproduction: from the canonical workspace run `git status --short` and `git rev-parse HEAD`; the result is `edfbd83…` with the listed pending paths.
- Regression risk: high. Testing now would combine uncommitted source, test, generated declaration, ignore-rule, and handoff changes with the prior `MOBILE-153` baseline, invalidating evidence attribution.
- Exact NEXT_DEV_ACTION: commit or isolate the complete Whales/token-logo/demographics slice, update `docs/automation-handoffs/mobile-dev-latest.md` with its exact result commit and acceptance criteria, then request a new MOBILE-QA run. Do not amend the previously certified MOBILE-153 evidence.
- WEB contract blocker: none for QA execution. The pending MOBILE-to-WEB drafts identify external evidence needs, but they are not a substitute for an immutable MOBILE client result.

## Preserved prior findings and release gates

| ID | Status | Current disposition |
| --- | --- | --- |
| MOBILE-QA-153-01 through MOBILE-QA-153-06 | PASS | Prior clean immutable source/configuration/launcher verification remains recorded for `290933f`; not re-executed against the unstable current tree. |
| MOBILE-QA-153-07 / MOBILE-QA-002 | BLOCKED / P2 | Exact immutable Android `[MOBILE_BUILD] commit=<HEAD>` log marker remains absent. Rebuild/install a matching development client and cold/warm launch it before device-flow certification. |
| MOBILE-QA-004 | OPEN / P3 | Existing Noble hashes Metro export-map fallback remains an upstream dependency risk; no new export was run. |
| MOBILE-QA-005 | OPEN / P2 | Prior full-Jest release gate failed two indentation-coupled `primary-a11y.test.ts` assertions. Replace only brittle assertions with semantic checks, then re-run the clean full suite. |

## Verification record

| MOBILE-QA check | Result | Evidence |
| --- | --- | --- |
| Canonical project boundary | PASS | CWD and Git top-level both resolve to `C:\Tuan\devApps\teminal-dex-app`. |
| AGENTS and required evidence review | PASS | Required project instructions, DEV handoff, checklist, worklog, final audit, prior QA report, history, and status were read. |
| Immutable DEV commit availability | BLOCKED | `HEAD` is the prior QA-report commit `edfbd83`; the pending slice is uncommitted and has no result commit in the DEV handoff. |
| Pending-slice diff inspection | PASS | Nine pending paths were identified and summarized without modifying product code, tests, or configuration. |
| TypeScript, ESLint, Jest, Expo diagnostics/config/export, Android runtime | SKIP | Deliberately not run: all would test a mixed, non-attributable state. |
| Navigation, pages/tabs, loading/stale/empty/offline/error/retry, paging, accessibility, privacy, and release readiness | SKIP | No immutable candidate exists for valid independent execution evidence. |

## Throughput and release recommendation

- Findings inspected/reconciled: 12 stable MOBILE-QA findings (`MOBILE-QA-006`, the seven MOBILE-153 outcomes, and four standing/release findings). No cosmetic findings were added.
- DEV outcomes available: 0 for the current pending slice; outcomes verified: 0; PASS: 0; FAIL: 0; BLOCKED: 1 scope gate; SKIP: 8 verification lanes; NOT_APPLICABLE: 0.
- Required 20-outcome shortfall: 20. Stable blocked/skipped IDs: `MOBILE-QA-006`, `MOBILE-QA-002`, `MOBILE-QA-004`, and `MOBILE-QA-005`; the eight skipped lanes are listed in the verification record.
- Carry-forward order: (1) commit/isolate the pending MOBILE slice and supply its DEV handoff, (2) repair the clean full-Jest gate (`MOBILE-QA-005`), (3) obtain immutable Android marker/device evidence (`MOBILE-QA-002`), (4) assess the Noble dependency warning (`MOBILE-QA-004`).

**MOBILE-QA NO-GO.** This run has correctly avoided fabricating mixed-state test evidence. No signing, submission, trading, CopyTrade activation, backend mutation, secret exposure, or WEB change was exercised or enabled.
