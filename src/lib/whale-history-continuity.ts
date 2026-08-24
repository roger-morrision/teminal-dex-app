import type { WhaleHistory } from "@/api/whale-contracts";

const olderThan = (left: WhaleHistory["events"][number], right: WhaleHistory["events"][number]) =>
  left.observedAt < right.observedAt || (left.observedAt === right.observedAt && left.id < right.id);

export function validateWhaleHistoryContinuation(previousPages: WhaleHistory[], nextPage: WhaleHistory, requestedCursor: WhaleHistory["nextCursor"]) {
  const retained = previousPages.flatMap((page) => page.events);
  const retainedIds = new Set(retained.map((event) => event.id));
  const reasons = [
    ...(!requestedCursor ? ["missing_requested_cursor"] : []),
    ...(requestedCursor && previousPages.at(-1)?.nextCursor && (requestedCursor.beforeObservedAt !== previousPages.at(-1)!.nextCursor!.beforeObservedAt || requestedCursor.beforeId !== previousPages.at(-1)!.nextCursor!.beforeId) ? ["requested_cursor_mismatch"] : []),
    ...(nextPage.events.some((event) => retainedIds.has(event.id)) ? ["cross_page_duplicate"] : []),
    ...(retained.at(-1) && nextPage.events[0] && !olderThan(nextPage.events[0], retained.at(-1)!) ? ["page_not_strictly_older"] : []),
    ...(nextPage.nextCursor && requestedCursor && nextPage.nextCursor.beforeObservedAt === requestedCursor.beforeObservedAt && nextPage.nextCursor.beforeId === requestedCursor.beforeId ? ["non_advancing_cursor"] : []),
    ...(previousPages.length >= 4 ? ["session_page_limit_reached"] : []),
  ];
  return { schemaVersion: "whale-history-continuity-v1", valid: reasons.length === 0, reasons, mergedEvents: reasons.length ? retained : [...retained, ...nextPage.events], executionEnabled: false as const };
}
