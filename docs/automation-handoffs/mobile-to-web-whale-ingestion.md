# MOBILE → WEB handoff: whale and smart-money ingestion

Status: blocking all live whale data in MOBILE Whales

Observed on 2026-08-25 against the connected development backend:

- `GET /api/in-app-notifications` returns market notifications, but whale coverage reports `currentRecordCount: 0` and `recordCount: 0` with `dataQuality: no_recent_qualified_records`.
- Smart-money coverage also reports zero current and historical records with `dataQuality: no_recent_records`.
- Eight pages / 800 records from `GET /api/feed/history` contain only `new_token`, `token_update`, and `onchain_tick`; no whale, smart-money, trade, or transaction events exist.
- `GET /api/top-traders?period=30D` returns 100 ranked wallets, but their classifications are only `Degen` and `Sniper`; none are `Whale` or `Smart Money`.

Requested WEB enhancement:

- Run a durable Solana transaction-ingestion job for supported DEX swap programs and persist signature, slot, block time, wallet, token mint, direction, exact token amount, and sourced USD amount.
- Join transactions to fresh wallet-balance/holder evidence and apply a versioned whale-classification rule with an explicit USD threshold and token eligibility policy.
- Populate `database.token_transactions+token_holders` and `database.smart_money_signals` continuously, including a bounded historical backfill.
- Emit `whale_buy`, `whale_sell`, `smart_buy`, and `smart_take_profit` records through `/api/in-app-notifications` with exact Solana identities and provenance.
- Populate Whale / Smart Money ranking badges only from versioned, reproducible classification evidence; do not relabel Degen or Sniper rankings.
- Expose ingestion health: last successful slot/time, lag, provider/RPC source, accepted/rejected counts, rejection reasons, and job status.

Acceptance:

- The live endpoint returns qualified whale events when matching transactions exist and distinguishes a healthy zero-result window from a stopped or lagging ingestion job.
- Historical fallback returns bounded recent qualified records when the live window is empty.
- Every event has a unique stable ID, exact mint and wallet, observed timestamp, source, data quality, and nullable USD amount with explicit coverage semantics.
- Classification-version and threshold changes are auditable and do not rewrite prior evidence silently.
- Contract tests cover buy/sell direction, duplicate signatures, missing USD values, stale holder evidence, unqualified transactions, backfill pagination, and ingestion outage states.
