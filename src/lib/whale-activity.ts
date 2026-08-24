import type { TrackNotification } from "@/api/schema";

export type WhaleFlow = {
  tokenAddress: string;
  tokenSymbol: string;
  buys: number;
  sells: number;
  buyUsd: number;
  sellUsd: number;
  netUsd: number;
  knownAmountCount: number;
  missingAmountCount: number;
  amountCoverage: number;
  uniqueWallets: number;
  latestObservedAt: number;
  events: TrackNotification[];
};

export const isWhaleActivity = (event: TrackNotification) =>
  event.type === "whale_buy" ||
  event.type === "whale_sell" ||
  event.type === "smart_buy" ||
  event.type === "smart_take_profit";

export function aggregateWhaleActivity(events: TrackNotification[]): WhaleFlow[] {
  const flows = new Map<string, WhaleFlow & { wallets: Set<string> }>();
  for (const event of events.filter(isWhaleActivity)) {
    const current = flows.get(event.tokenAddress) ?? {
      tokenAddress: event.tokenAddress,
      tokenSymbol: event.tokenSymbol,
      buys: 0,
      sells: 0,
      buyUsd: 0,
      sellUsd: 0,
      netUsd: 0,
      knownAmountCount: 0,
      missingAmountCount: 0,
      amountCoverage: 0,
      uniqueWallets: 0,
      latestObservedAt: 0,
      events: [],
      wallets: new Set<string>(),
    };
    const amountKnown = event.amountUsd != null;
    const amount = event.amountUsd ?? 0;
    if (amountKnown) current.knownAmountCount += 1;
    else current.missingAmountCount += 1;
    const sell = event.type === "whale_sell" || event.type === "smart_take_profit";
    if (sell) {
      current.sells += 1;
      current.sellUsd += amount;
    } else {
      current.buys += 1;
      current.buyUsd += amount;
    }
    if (event.wallet) current.wallets.add(event.wallet);
    current.latestObservedAt = Math.max(current.latestObservedAt, event.observedAt);
    current.events.push(event);
    flows.set(event.tokenAddress, current);
  }
  return [...flows.values()]
    .map(({ wallets, ...flow }) => ({
      ...flow,
      netUsd: flow.buyUsd - flow.sellUsd,
      amountCoverage: flow.events.length ? flow.knownAmountCount / flow.events.length : 0,
      uniqueWallets: wallets.size,
      events: flow.events.sort((a, b) => b.observedAt - a.observedAt),
    }))
    .sort((a, b) => Math.abs(b.netUsd) - Math.abs(a.netUsd) || b.latestObservedAt - a.latestObservedAt);
}

export const whaleFlowByToken = (events: TrackNotification[]) =>
  new Map(aggregateWhaleActivity(events).map((flow) => [flow.tokenAddress, flow]));

export type WhaleEventDirection = "all" | "buy" | "sell";
export type WhaleEventSort = "latest" | "largest";

export function filterWhaleEvents(
  events: TrackNotification[],
  input: { direction: WhaleEventDirection; minimumUsd: number; sort: WhaleEventSort; query?: string },
) {
  const query = input.query?.trim().toLowerCase() ?? "";
  return events
    .filter(isWhaleActivity)
    .filter((event) =>
      !query || [event.tokenSymbol, event.tokenAddress, event.wallet]
        .some((value) => value?.toLowerCase().includes(query)),
    )
    .filter((event) => (event.amountUsd ?? 0) >= input.minimumUsd)
    .filter((event) => {
      if (input.direction === "all") return true;
      const sell = event.type === "whale_sell" || event.type === "smart_take_profit";
      return input.direction === "sell" ? sell : !sell;
    })
    .sort((left, right) =>
      input.sort === "largest"
        ? (right.amountUsd ?? 0) - (left.amountUsd ?? 0) || right.observedAt - left.observedAt
        : right.observedAt - left.observedAt,
    );
}
