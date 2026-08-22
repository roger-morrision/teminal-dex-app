import type { FeedConnectionsResponse } from "@/api/schema";

export type FeedCounterSnapshot = {
  received: number;
  decoded: number;
  persisted: number;
  dropped: number;
  ignored: number;
};

export function feedCounterSnapshot(
  response: FeedConnectionsResponse | undefined,
): FeedCounterSnapshot | null {
  const counters = response?.runtime.onchainTicks;
  if (!counters) return null;
  return {
    received: counters.received,
    decoded: counters.decoded,
    persisted: counters.persisted,
    dropped: counters.dropped,
    ignored: counters.ignored,
  };
}

export function feedCounterDelta(
  previous: FeedCounterSnapshot | null,
  current: FeedCounterSnapshot | null,
): FeedCounterSnapshot | null {
  if (!previous || !current) return null;
  const keys = Object.keys(current) as (keyof FeedCounterSnapshot)[];
  // A durable runtime can restart between samples. A lower counter is a new
  // baseline, not negative traffic or recovery evidence.
  if (keys.some((key) => current[key] < previous[key])) return null;
  return keys.reduce(
    (result, key) => ({ ...result, [key]: current[key] - previous[key] }),
    {} as FeedCounterSnapshot,
  );
}

let previousSample: FeedCounterSnapshot | null = null;

/** Records only successful validated responses for the next refresh delta. */
export function recordFeedCounterSample(response: FeedConnectionsResponse) {
  const current = feedCounterSnapshot(response);
  const delta = feedCounterDelta(previousSample, current);
  previousSample = current;
  return delta;
}

export function resetFeedCounterSampleForTests() {
  previousSample = null;
}
