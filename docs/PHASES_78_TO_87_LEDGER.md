# Terminal DEX Mobile — Phases 78–87 Ledger

Date: 2026-08-24

The continuation for phases 88–97 is maintained in `PHASES_88_TO_97_LEDGER.md`.

This ledger records implemented client-side contracts separately from backend, device, approval, and funded-network proof. No local flag, fixture, or document grants transaction authority. Mobile signing, submission, intent consumption, mainnet execution, and CopyTrade execution remain disabled.

| Phase | Delivered foundation | Required operational closure |
| --- | --- | --- |
| 78 — Authoritative evidence API | Phase 78–87 dependency graph and existing strict durable-evidence envelope | Owner-scoped backend endpoint, stable pagination, retention/expiry jobs, artifact verification, access audit, backup/restore proof |
| 79 — Provider operations | Strict ordered provider-window contract and historical SLO rules | Durable production samples, verified alert routes, failover drills, incident acknowledgement and recovery evidence |
| 80 — GMGN workflow | Bounded cursor/filter query contract with confidence, unique quality filters, verified-only default, and maximum page size | Backend cursor/filter/saved-search APIs, change history, comparison evidence, production UX integration |
| 81 — CopyTrade shadow analytics | Deterministic cohort coverage, win rate, average return, output drift, duplicate-evidence rejection, execution-disabled result | Durable outcome cohort, strategy-version segmentation, approved observation window, product surface and export |
| 82 — Signed manifests | Strict Ed25519 issuer envelope, hash identity, chronology, owner identity, devnet-only environment and disabled execution authority | Managed issuer, key lifecycle/rotation, server issuance, client cryptographic verification, revocation and adversarial integration |
| 83 — Device certification | Strict platform/build/tester/check/artifact evidence contract with unique checks and disabled authority | Real Android/iOS hardware, supported Android wallet, accessibility/resilience runs, signed tester artifacts |
| 84 — Devnet managed submission | Deterministic consume-before-submit lifecycle, invalid transition rejection, no blind retries, unknown-outcome reconciliation | Approved custody/signer/provider and physical-wallet devnet submission, replay/expiry/outage/finality/kill-switch proof |
| 85 — Reconciliation and recovery | Explicit unknown/reconciling states and terminal resolution transitions | Durable signature tracking, provider-independent confirmation, reorg/finality handling, balance reconciliation, operator drill evidence |
| 86 — Mainnet canary | Fail-closed wallet/mint/trade/daily/fee/loss/expiry/kill-switch evaluator that never grants client authority | Named approvers, funded allowlisted wallet, approved limits, monitoring, reconciliation and rollback evidence |
| 87 — Controlled CopyTrade | Dependency gate requires proven shadow analytics and mainnet canary before activation evidence can qualify | Sufficient cohort, verified-owner activation, per-strategy limits, position reconciliation, global pause, drills and production approval |

## Dependency result

`evaluateOperationalExpansion` reports exact blockers, labels phases that require external evidence, and computes the highest contiguous completed phase. Even when supplied a fully complete evidence object, it returns literal `executionEnabled: false` and `copyTradeExecutionEnabled: false`.

Phases 78–82 may advance in parallel at the contract level. Phase 83 depends on Phase 82. Phases 84–86 are sequential. Phase 87 requires both Phase 81 and Phase 86.
