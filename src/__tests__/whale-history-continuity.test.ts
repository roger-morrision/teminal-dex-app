import type { WhaleHistory } from "@/api/whale-contracts";
import { validateWhaleHistoryContinuation } from "@/lib/whale-history-continuity";

const token = "11111111111111111111111111111111";
const row = (id: string, observedAt: number) => ({ id, tokenAddress: token, wallet: null, direction: "buy" as const, amountUsd: 1, observedAt, source: "indexer", sourceIdentity: id, dataQuality: "observed" as const });
const page = (events: ReturnType<typeof row>[], hasMore: boolean): WhaleHistory => ({ schema: "whale-history-v1", ownerScoped: false, events, hasMore, nextCursor: hasMore ? { beforeObservedAt: events.at(-1)!.observedAt, beforeId: events.at(-1)!.id } : null, retentionDays: 30, generatedAt: 10, executionEnabled: false });

describe("whale history cross-page continuity", () => {
  it("merges a strictly older unique page", () => {
    const first = page([row("event_0004", 4), row("event_0003", 3)], true);
    const next = page([row("event_0002", 2), row("event_0001", 1)], false);
    expect(validateWhaleHistoryContinuation([first], next, first.nextCursor)).toMatchObject({ valid: true, reasons: [], executionEnabled: false });
  });

  it("rejects duplicates, replayed cursors, and the page cap", () => {
    const first = page([row("event_0004", 4), row("event_0003", 3)], true);
    expect(validateWhaleHistoryContinuation([first], page([row("event_0003", 3)], false), first.nextCursor).reasons).toContain("cross_page_duplicate");
    const repeated = page([row("event_0002", 2)], true); repeated.nextCursor = first.nextCursor;
    expect(validateWhaleHistoryContinuation([first], repeated, first.nextCursor).reasons).toContain("non_advancing_cursor");
    expect(validateWhaleHistoryContinuation([first, first, first, first], page([row("event_0001", 1)], false), first.nextCursor).reasons).toContain("session_page_limit_reached");
  });
});
