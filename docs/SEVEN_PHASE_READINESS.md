# Terminal DEX Mobile — Seven-Phase Readiness Program

This document is the current execution ledger for the seven-phase enhancement request. A phase is complete only when its evidence exists; checklists never substitute for device, provider, or production evidence. Live execution remains disabled until every mandatory gate passes and the required authority is explicitly supplied.

## Phase 0 — Audit reconciliation

Status: complete for Slice 54.

- The requirements checklist, final audit, and worklog distinguish implemented behavior from device and execution blockers.
- The Final Audit verification baseline is 41 Jest suites and 183 tests before this program's new tests.
- Completion evidence: clean repository state, exact commit, TypeScript, ESLint, tests, Expo Doctor, and platform exports.

## Phase 1 — Automated safety hardening

Status: implemented; regression verification required after each change.

- Central runtime policy denies live swap submission, signing, broadcasting, intent consumption, CopyTrade activation/execution, and position-closing routes before network access.
- Only reviewed unsigned build, inspection, simulation, and explicit non-executing confirmation mutations are allowlisted.
- Existing response schemas enforce bounded collections, exact identities, freshness/provenance, cursor continuity, and `executionEnabled: false` authority.
- Required recurring checks: abort/race behavior, filter and wallet state changes, offline recovery, bounded retained pages, hostile payloads, and static route semantics.

## Phase 2 — Android wallet device verification

Status: blocked on a physical Android device, a supported Mobile Wallet Adapter wallet, and a development build.

Record device model, Android version, wallet/version, build hash, and redacted timestamps. Test connection, challenge/session expiry, cancellation, biometric failure, account switching, lock/unlock, background/restore, process death, revocation, hostile deep links, offline transitions, and quote/simulation interruption. No test may submit a transaction.

Exit evidence: reproducible test log, screenshots without wallet secrets, defects linked to regression tests, and an explicit pass/fail matrix.

## Phase 3 — Accessibility and performance

Status: automated coverage complete; physical evidence blocked on representative Android and iOS devices.

Test TalkBack and VoiceOver order/state, maximum dynamic type, reduced motion, touch targets, safe areas, keyboard focus, offline/reconnect, cold start, long lists, charts, navigation latency, and memory pressure. Critical financial values and safety disclosures must never clip or become inaccessible.

Exit evidence: device matrix, measured budgets, traces/screenshots, and zero inaccessible primary tasks.

## Phase 4 — Managed-submission architecture

Status: design gate only; execution authority absent.

Mandatory contract: exact signed-message hash and owner verification; quote, mint, amount, route, slippage, fee-payer, program, blockhash, and expiry binding; fresh pre-broadcast simulation; one-time atomic intent consumption; idempotent submission; replay rejection; bounded fees; confirmation/finality/reorg tracking; kill switch; audit lineage; redacted diagnostics; and fail-closed recovery.

Required decisions: custody/signing owner, authorized wallets, RPC/provider and plan, fee ceilings, allowed programs/routes, mainnet value limits, legal/security approval, incident owner, retention, and rollback authority. No implementation may infer these decisions.

## Phase 5 — Controlled submission rollout

Status: blocked by Phase 4 decisions and an authoritative backend contract.

Stages: deterministic local harness, Solana devnet, internal allowlisted wallets, minimal-value mainnet canary, then limited rollout. Each stage requires expiry, duplicate, outage, partial failure, confirmation, reorg, reconciliation, kill-switch, and rollback evidence. Promotion is manual and signed off; failure returns the system to simulation-only.

## Phase 6 — CopyTrade activation

Status: blocked by proven Phase 5 submission safety.

Required enforcement: verified-owner activation, strategy-version binding, per-trade/position/daily caps, duplicate-copy prevention, liquidity/impact/holder/age/Anti-MEV gates, ordered exits, partial-fill reconciliation, outage pause, kill switch, and decision-to-transaction lineage. Shadow decisions and paper outcomes precede any financial action.

## Phase 7 — Production readiness

Status: preparation defined; launch blocked by Phases 2–6.

Required evidence: signed release artifact and dependency inventory, privacy-safe crash monitoring, provider/data SLOs, backup/restore drill, key rotation/revocation drill, RPC outage and incident runbooks, store privacy/permission review, canary plan, rollback test, and post-release monitoring ownership.

## Current authority boundary

- Mobile live execution: disabled.
- Mobile transaction signing/submission: absent.
- CopyTrade activation/execution: absent.
- Production mutations: unauthorized.
- Safe work permitted: read-only evidence, unsigned build/inspection, configured simulation, explicit non-executing confirmation, automated tests, documentation, and local builds.
