import {
  feedCounterDelta,
  recordFeedCounterSample,
  resetFeedCounterSampleForTests,
  type FeedCounterSnapshot,
} from "@/lib/feed-recovery";
import type { FeedConnectionsResponse } from "@/api/schema";

const counters = (value: number): FeedCounterSnapshot => ({
  received: value,
  decoded: value,
  persisted: value,
  dropped: value,
  ignored: value,
});

describe("feed recovery counters", () => {
  beforeEach(resetFeedCounterSampleForTests);
  it("calculates refresh-to-refresh deltas without inventing a baseline", () => {
    expect(feedCounterDelta(null, counters(5))).toBeNull();
    expect(
      feedCounterDelta(counters(5), {
        received: 9,
        decoded: 8,
        persisted: 7,
        dropped: 6,
        ignored: 5,
      }),
    ).toEqual({
      received: 4,
      decoded: 3,
      persisted: 2,
      dropped: 1,
      ignored: 0,
    });
  });
  it("treats a runtime restart as a new baseline instead of negative traffic", () => {
    expect(feedCounterDelta(counters(10), counters(1))).toBeNull();
  });
  it("samples validated responses for the next request delta", () => {
    const response = (value: number) =>
      ({
        runtime: {
          onchainTicks: {
            ...counters(value),
            failed: 0,
            expired: 0,
            unmatched: 0,
            quality: "healthy",
            cooldownRemainingMs: 0,
          },
        },
      }) as FeedConnectionsResponse;
    expect(recordFeedCounterSample(response(2))).toBeNull();
    expect(recordFeedCounterSample(response(5))).toEqual(counters(3));
  });
});
