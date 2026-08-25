# MOBILE DEV → QA handoff

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
