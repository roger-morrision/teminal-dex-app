# MOBILE → WEB handoff: token age and holder evidence

Status: blocking numeric demographics in MOBILE Discover

Observed contract: `GET /api/trending?period=24h&sort=trending&limit=50&view=mobile` returns `ageLabel: "new"`, `ageMinutes: 0`, and `holderCount: null` for the displayed provider-backed rows. `GET /api/token/:address` also returns `pairCreatedAt: null`; its age evidence reports that pair and canonical token creation are unavailable.

Requested WEB enhancement:

- Populate `pairCreatedAt` from a provider-observed liquidity-pool creation timestamp and derive positive `ageMinutes` plus `ageLabel`.
- Populate `holderCount` only from a sourced, fresh Solana token-account aggregation; include `holderCountExact`, `holderCountFreshness`, and `holderCountSafeForAutomation` semantics.
- Do not encode missing creation evidence as `ageMinutes: 0` or `ageLabel: "new"`; return an explicit nullable/unavailable representation so a genuinely new token is distinguishable from missing data.
- Preserve the current token identity, source, source observation timestamp, and evidence-safety fields in both discovery and token-detail responses.

Acceptance:

- A trending response contains non-null holder counts and positive, source-derived ages for rows where providers supply evidence.
- Missing values remain explicitly unavailable and are never inferred as zero/new.
- Contract tests cover exact, lower-bound, stale, and unavailable holder evidence plus known and unavailable pair age.
