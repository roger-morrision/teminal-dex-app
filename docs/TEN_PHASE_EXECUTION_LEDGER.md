# Terminal DEX Mobile — Ten-Phase Execution Ledger

The code can prepare and enforce every phase, but it cannot manufacture physical-device observations, legal/security approval, custody decisions, provider contracts, or financial rollout evidence. Later phases remain blocked until the exact preceding evidence is recorded. Mobile execution authority remains absent even when this ledger is complete; enabling it requires a separately reviewed product and backend release.

| Phase | Deliverable | Current state | Required closure evidence |
| --- | --- | --- | --- |
| 1 | Provider readiness | Implemented | Fresh assessment, categorized blockers, runtime forbidden-route policy, regression gate |
| 2 | Android wallet | Prepared / blocked | Physical Android + supported wallet matrix, lifecycle and revocation evidence |
| 3 | Accessibility/performance | Prepared / blocked | Android/iOS screen-reader, dynamic-type, resilience, latency, and memory evidence |
| 4 | Managed-submission contract | Designed / blocked | Custody, provider, risk, legal/security, incident, retention, and allowlist approvals |
| 5 | Devnet execution | Blocked | End-to-end signed devnet intent, idempotency, expiry, outage, recovery, finality evidence |
| 6 | Mainnet canary | Blocked | Explicit value/loss approval, allowlisted wallet, monitored minimal-value canary, rollback evidence |
| 7 | CopyTrade shadow | Prepared / blocked | Sufficient point-in-time shadow decisions, rejections, fees, impact, latency, and outcomes |
| 8 | CopyTrade activation | Blocked | Proven phases 6–7, owner activation, strategy binding, risk enforcement, kill-switch evidence |
| 9 | Production operations | Prepared / blocked | Release, backup/restore, rotation/revocation, outage, incident, canary, rollback drills |
| 10 | Continuous quality | Prepared / blocked | Operational provider/data SLOs, alerting, ownership, review cadence, regression evidence |

## Phase 1 implementation

- Fetch readiness only for a valid exact token route.
- Show readiness in the normal quote-review flow.
- Report assessment date and flag evidence older than 48 hours.
- Categorize blockers as wallet, provider, execution, policy, or environment while preserving authoritative evidence text.
- Reject inconsistent totals, duplicate IDs, forged execution authority, and forbidden mobile routes.

## Phases 2–3 evidence harness

Use `DEVICE_VALIDATION_MATRIX.md`. Record build/commit, device and OS, wallet version, route/control, expected and observed behavior, timestamp, result, and redacted evidence. Exports, simulators, and automated semantics cannot close physical wallet, biometric, screen-reader, background, thermal, or memory requirements.

## Phases 4–6 transaction gates

Use `MANAGED_SUBMISSION_ARCHITECTURE.md`. Promotion is strictly ordered: architecture approvals → deterministic local harness → devnet → internal allowlist → explicit minimal-value mainnet canary. Unknown submission outcomes enter reconciliation/manual review and are never automatically replayed.

## Phases 7–8 CopyTrade gates

Shadow mode must record immutable decision identity, strategy version, point-in-time input evidence, quote/fee/impact, every passed or failed safety gate, intended action, observed outcome, and missing evidence. Activation requires separately approved owner confirmation, enforced limits, duplicate protection, partial-fill reconciliation, outage pause, and global/owner kill switches.

## Phases 9–10 operational gates

Use `INCIDENT_AND_RELEASE_RUNBOOK.md`. Provider SLOs must separately measure availability, successful useful traffic, decoded/persisted coverage, freshness, rate-limit pressure, dropped/ignored records, and consumer delivery. Nominal configuration is never health. Every SLO has an owner, threshold, window, alert route, runbook, and review cadence.

## Machine gate

`evaluateProductionPhases` in `src/security/phase-governance.ts` evaluates dependency order and missing evidence. It deliberately returns `executionEnabled: false` and `copyTradeExecutionEnabled: false` for every input because evidence readiness does not itself grant mobile financial authority.
