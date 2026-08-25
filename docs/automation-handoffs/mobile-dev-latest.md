# MOBILE DEV → QA handoff

- Story: `MOBILE-146` — observable indexer health in Feed Data.
- Base commit: `ccf1d77`.
- Result commit: the commit containing this handoff; QA must pin `git rev-parse HEAD` before testing.
- Scope: `app/operations.tsx`, localized settings copy, `IndexerHealthCard` tests, and MOBILE audit records.
- Excluded concurrent scope: Whale/token-row/token-avatar/DEX-logo and MOBILE→WEB handoff files already present in the worktree.

## 20/20 acceptance matrix

| ID | Independently testable outcome |
| --- | --- |
| MOBILE-146-01 | Feed Data exposes indexer health. |
| MOBILE-146-02 | The query is enabled only on the Feed Data tab. |
| MOBILE-146-03 | Pull-to-refresh includes indexer health. |
| MOBILE-146-04 | Initial loading coordinates all three feed evidence queries. |
| MOBILE-146-05 | Indexer failure has independent retry. |
| MOBILE-146-06 | Retry is disabled and announced busy while fetching. |
| MOBILE-146-07 | Not-configured evidence is distinct. |
| MOBILE-146-08 | Invalid-contract evidence is distinct. |
| MOBILE-146-09 | Generic unavailable evidence is distinct. |
| MOBILE-146-10 | Healthy evidence uses positive status semantics. |
| MOBILE-146-11 | Degraded evidence uses warning semantics. |
| MOBILE-146-12 | Missing numeric evidence is never rendered as zero. |
| MOBILE-146-13 | Exact observed tip is rendered when present. |
| MOBILE-146-14 | Update freshness is rendered from the bounded timestamp. |
| MOBILE-146-15 | Export lag is rendered independently. |
| MOBILE-146-16 | Ingestion source and commitment are rendered independently. |
| MOBILE-146-17 | Bounded canonical and non-canonical quality evidence is rendered. |
| MOBILE-146-18 | Empty quality evidence has an explicit unavailable state. |
| MOBILE-146-19 | The card exposes accessible summary status and an explicit non-execution boundary. |
| MOBILE-146-20 | All new public copy is available in English and Vietnamese. |

## Verification and QA scenarios

- TypeScript: local `tsc --noEmit`.
- Lint: local ESLint over `app` and `src`.
- Focused: `IndexerHealthCard`, schema, and client suites.
- Full: all Jest suites after the focused gate.
- Verify healthy `200`, degraded `503`, unavailable `503`, quality-empty, and retry-busy states.
- Confirm `git show --name-only HEAD` excludes every concurrent file listed above.

## Risks and next action

- Android runtime certification remains blocked by `MOBILE-QA-002`.
- Full clean-baseline release certification remains blocked until the concurrent token-row/logo slice is committed or isolated (`MOBILE-QA-003`).
- `NEXT_QA_ACTION`: validate all 20 outcomes against the immutable result commit and record the exact pass/fail/blocked count.
