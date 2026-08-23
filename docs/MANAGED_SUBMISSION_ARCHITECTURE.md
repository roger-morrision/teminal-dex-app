# Managed Submission Architecture — Approval Draft

Status: non-executing design. The mobile client has no signing, submission, intent-consumption, or CopyTrade activation authority.

## State machine

`quoted → built_unsigned → inspected → simulated → owner_confirmed → signed → consumed → submitted → confirmed → finalized`

Every transition is append-only and owner-scoped. `expired`, `rejected`, `failed`, `reorged`, and `manual_review` are terminal or operator-gated states. No ambiguous state is automatically replayed.

## Mandatory invariants

1. The inspected serialized-message hash must equal the wallet-signed message hash.
2. Owner, fee payer, input/output mint, exact input, minimum output, slippage, route programs, account set, quote identity, and intent identity are immutable after inspection.
3. Blockhash, quote, simulation, and confirmation must be fresh at submission time.
4. The backend atomically consumes exactly one confirmed intent before submission; idempotency returns the recorded outcome and never sends twice.
5. Program and lookup-table resolution is allowlisted and revalidated immediately before broadcast.
6. Fee and priority-fee ceilings are server-enforced; mobile values cannot expand them.
7. Submission records provider request identity, signature, timestamps, attempts, result, confirmation/finality, and reorg evidence without storing secrets or unnecessary raw bytes.
8. Timeout or unknown provider outcome enters reconciliation/manual review, never blind retry.
9. A global and owner-scoped kill switch prevents new signing/submission/CopyTrade work.
10. Mobile must continue rejecting live routes until a separately reviewed release changes its compiled execution policy.

## Required external decisions

| Decision | Required owner | Status |
| --- | --- | --- |
| Custody and signer | Security/product | BLOCKED |
| Allowed wallets and programs | Security/trading | BLOCKED |
| RPC/provider, plan, and limits | Operations | BLOCKED |
| Fee/priority-fee/value ceilings | Risk | BLOCKED |
| Mainnet rollout and loss budget | Executive/risk | BLOCKED |
| Legal/compliance approval | Legal | BLOCKED |
| Incident, pause, and rollback authority | Operations | BLOCKED |
| Audit retention and secret manager | Security/compliance | BLOCKED |

## Rollout gates

- Local harness: deterministic duplicate, expiry, outage, and recovery tests.
- Devnet: physical-wallet signature verification and end-to-end reconciliation.
- Internal allowlist: manual promotion and zero ambiguous intents.
- Mainnet canary: separately approved minimal value and immediate rollback threshold.
- Limited production: only after SLO, incident drill, key rotation, backup/restore, and finality/reorg evidence.

CopyTrade may begin shadow evaluation only after the same submission pipeline is proven. Activation remains a separate owner-confirmed operation with strategy/version binding and enforced risk limits.
