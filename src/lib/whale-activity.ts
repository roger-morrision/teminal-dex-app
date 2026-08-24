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

export type WhaleMarketPulse = {
  eventCount: number;
  activeTokens: number;
  uniqueWallets: number;
  knownAmountCount: number;
  missingAmountCount: number;
  amountContextMismatchCount: number;
  buyUsd: number;
  sellUsd: number;
  netUsd: number;
  buyShare: number | null;
  largestEvent: TrackNotification | null;
};

export const isWhaleActivity = (event: TrackNotification) =>
  event.type === "whale_buy" ||
  event.type === "whale_sell" ||
  event.type === "smart_buy" ||
  event.type === "smart_take_profit";

export const whaleAmountContext = (event: TrackNotification) => {
  if (event.amountUsd == null) return "amount_missing" as const;
  const marketCap = event.market.marketCap;
  if (marketCap == null || marketCap <= 0) return "market_cap_missing" as const;
  return event.amountUsd > marketCap
    ? ("amount_exceeds_market_cap" as const)
    : ("within_market_cap" as const);
};

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

export function filterWhaleFlows(flows: WhaleFlow[], query?: string) {
  const normalized = query?.trim().toLowerCase() ?? "";
  if (!normalized) return flows;
  return flows.filter((flow) =>
    [flow.tokenSymbol, flow.tokenAddress, ...flow.events.map((event) => event.wallet)]
      .some((value) => value?.toLowerCase().includes(normalized)),
  );
}

export const whaleActivityForToken = (
  events: TrackNotification[],
  tokenAddress: string,
) =>
  events
    .filter(isWhaleActivity)
    .filter((event) => event.tokenAddress === tokenAddress)
    .sort(
      (left, right) =>
        right.observedAt - left.observedAt || left.id.localeCompare(right.id),
    );

export function buildWhaleMarketPulse(
  events: TrackNotification[],
): WhaleMarketPulse {
  const evidence = events.filter(isWhaleActivity);
  const tokens = new Set<string>();
  const wallets = new Set<string>();
  let knownAmountCount = 0;
  let amountContextMismatchCount = 0;
  let buyUsd = 0;
  let sellUsd = 0;
  let largestEvent: TrackNotification | null = null;
  for (const event of evidence) {
    tokens.add(event.tokenAddress);
    if (event.wallet) wallets.add(event.wallet);
    if (event.amountUsd == null) continue;
    knownAmountCount += 1;
    if (whaleAmountContext(event) === "amount_exceeds_market_cap") {
      amountContextMismatchCount += 1;
    }
    const sell = event.type === "whale_sell" || event.type === "smart_take_profit";
    if (sell) sellUsd += event.amountUsd;
    else buyUsd += event.amountUsd;
    if (largestEvent == null || event.amountUsd > (largestEvent.amountUsd ?? -1)) {
      largestEvent = event;
    }
  }
  const observedUsd = buyUsd + sellUsd;
  return {
    eventCount: evidence.length,
    activeTokens: tokens.size,
    uniqueWallets: wallets.size,
    knownAmountCount,
    missingAmountCount: evidence.length - knownAmountCount,
    amountContextMismatchCount,
    buyUsd,
    sellUsd,
    netUsd: buyUsd - sellUsd,
    buyShare: observedUsd > 0 ? buyUsd / observedUsd : null,
    largestEvent,
  };
}

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
