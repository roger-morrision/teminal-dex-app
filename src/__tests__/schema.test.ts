import {
  aiPaperReportSchema,
  aiPlatformSchema,
  aiRecommendationsSchema,
  alertDeliveriesSchema,
  bubbleGraphSchema,
  claimMonitorSchema,
  copyTradeConfigSchema,
  copyTradeHealthSchema,
  feedConnectionsSchema,
  feedDiagnosticsSchema,
  feedHistorySchema,
  heatmapSchema,
  indexerHealthSchema,
  manipulationSchema,
  monitorAlertsSchema,
  ohlcvSchema,
  portfolioAnalyticsSchema,
  securityHistorySchema,
  socialRadarSchema,
  signalsSchema,
  snipersSchema,
  swapQuoteSchema,
  swapV2ReadinessSchema,
  topTradersSchema,
  tokenSchema,
  trackFeedSchema,
  transactionsSchema,
  trenchesSchema,
  trendingSchema,
  userAlertsSchema,
  walletHoldingsSchema,
  walletPnlSchema,
} from "@/api/schema";

describe("discovery token social evidence", () => {
  const token = { id: "pair", symbol: "DEX", name: "Terminal", address: "mint", pairAddress: "pair", dex: "Pump.fun", quoteSymbol: "SOL", price: 1, marketCap: 10, liquidity: 5, volume24h: 4, volume1h: 2, change24h: 3, change1h: 1, txns5m: { buys: 1, sells: 0 }, ageLabel: "1h", ageMinutes: 60 };

  it("retains validated social URLs and drops malformed provider links", () => {
    const parsed = tokenSchema.parse({ ...token, social: { twitter: "https://x.com/terminal", telegram: "not-a-url", website: "https://terminal.example" } });
    expect(parsed.social).toEqual({ twitter: "https://x.com/terminal", telegram: undefined, website: "https://terminal.example" });
  });

  it("retains direct HTTPS artwork and drops insecure or hotlink-only media", () => {
    expect(tokenSchema.parse({ ...token, imageUrl: "https://cdn.dexscreener.com/cms/images/token" }).imageUrl).toBe("https://cdn.dexscreener.com/cms/images/token");
    expect(tokenSchema.parse({ ...token, imageUrl: "http://cdn.example/token.png" }).imageUrl).toBeUndefined();
    expect(tokenSchema.parse({ ...token, imageUrl: "https://gmgn.ai/external-res/token.webp" }).imageUrl).toBeUndefined();
  });
});

describe("WEB indexer health handoff", () => {
  it("accepts bounded healthy and unavailable schema-v1 evidence", () => {
    expect(indexerHealthSchema.parse({
      schemaVersion: 1,
      source: "solana-indexer",
      available: true,
      upstreamStatus: 200,
      status: "healthy",
      healthy: true,
      reason: null,
      tip: 100,
      ageMs: 50,
      staleAfterMs: 5_000,
      updatedAt: "2026-08-25T10:00:00.000Z",
      ingestion: { source: "rpc", commitment: "confirmed", sourceTip: 100, exportLagSlots: 0 },
      quality: { events: { canonical: true, reason: null } },
      automationSafe: false,
    }).healthy).toBe(true);
    expect(indexerHealthSchema.parse({
      schemaVersion: 1,
      source: "solana-indexer",
      available: false,
      healthy: false,
      reason: "not_configured",
      automationSafe: false,
    }).available).toBe(false);
  });

  it("rejects execution claims and contradictory status evidence", () => {
    const available = {
      schemaVersion: 1,
      source: "solana-indexer",
      available: true,
      upstreamStatus: 503,
      status: "degraded",
      healthy: true,
      reason: null,
      tip: null,
      ageMs: null,
      staleAfterMs: null,
      updatedAt: null,
      ingestion: { source: null, commitment: null, sourceTip: null, exportLagSlots: null },
      quality: {},
      automationSafe: false,
    };
    expect(indexerHealthSchema.safeParse(available).success).toBe(false);
    expect(indexerHealthSchema.safeParse({ ...available, healthy: false, automationSafe: true }).success).toBe(false);
  });
});

describe("swap provider readiness", () => {
  const payload = { success: true, data: { schema: "jupiter-swap-v2-readiness-v1", status: "blocked", executionEnabled: false, assessedAt: "2026-08-19", checks: [{ id: "walletTaker", ready: false, evidence: "Connected taker required." }], completed: 0, total: 1, provider: { name: "Jupiter Meta-Aggregator" } } };
  it("accepts consistent blocked evidence and rejects forged authority", () => {
    expect(swapV2ReadinessSchema.safeParse(payload).success).toBe(true);
    expect(swapV2ReadinessSchema.safeParse({ ...payload, data: { ...payload.data, executionEnabled: true } }).success).toBe(false);
    expect(swapV2ReadinessSchema.safeParse({ ...payload, data: { ...payload.data, completed: 1 } }).success).toBe(false);
  });
});

const socialTrendRow = {
  token: { address: "11111111111111111111111111111111", symbol: "SOL", name: "Solana" },
  trend: {
    tokenAddress: "11111111111111111111111111111111",
    providers: ["x-api", "telegram"],
    postCount: 3,
    uniqueAuthors: 2,
    mentions5m: 1,
    mentions15m: 2,
    mentions1h: 3,
    mentionVelocity: 1.5,
    engagementVelocity: 1,
    sourceDiversity: 2,
    authorConcentration: 50,
    duplicateRatio: 0,
    socialTrendScore: 70,
    trendState: "accelerating",
    organicConfidence: 80,
    marketConfirmation: "unconfirmed",
    identityConfidence: 90,
    dataAgeMs: 1_000,
    freshness: "fresh",
    evidenceWindow: "last_60m",
    observedAt: 1_787_369_431_000,
    warnings: [],
    xPotentialScore: null,
    xRiskScore: null,
    xPotentialSignals: [],
    xRiskSignals: [],
  },
  evidence: [{ provider: "x-api", externalId: "post-1", text: "Provider observation", observedAt: 1_787_369_430_000 }],
};

describe("provider-backed social radar", () => {
  const response = { success: true, data: { generatedAt: 1_787_369_431_000, source: "provider-backed-social-events", trends: [socialTrendRow] } };
  it("accepts bounded identity-matched social evidence", () => {
    expect(socialRadarSchema.safeParse(response).success).toBe(true);
  });
  it("rejects identity mismatch, duplicate tokens, excess evidence, and hostile fields", () => {
    expect(socialRadarSchema.safeParse({ ...response, data: { ...response.data, trends: [{ ...socialTrendRow, trend: { ...socialTrendRow.trend, tokenAddress: "So11111111111111111111111111111111111111112" } }] } }).success).toBe(false);
    expect(socialRadarSchema.safeParse({ ...response, data: { ...response.data, trends: [socialTrendRow, socialTrendRow] } }).success).toBe(false);
    expect(socialRadarSchema.safeParse({ ...response, data: { ...response.data, trends: [{ ...socialTrendRow, evidence: Array.from({ length: 4 }, () => socialTrendRow.evidence[0]) }] } }).success).toBe(false);
    expect(socialRadarSchema.safeParse({ ...response, data: { ...response.data, trends: [{ ...socialTrendRow, secret: "unexpected" }] } }).success).toBe(false);
  });
});

describe("durable feed history", () => {
  const event = {
    id: "solana-rpc:trade:signature",
    replaySequence: "42",
    source: "solana-rpc",
    channel: "rpc",
    kind: "trade",
    topic: "market",
    mint: "11111111111111111111111111111111",
    signature: "signature",
    slot: 42,
    observedAt: "2026-08-22T00:00:00.000Z",
    dataQuality: "observed",
    payload: {},
  } as const;
  it("accepts a bounded paired older-history cursor", () => {
    expect(feedHistorySchema.safeParse({ schema: "feed-history-v1", mode: "read-only", generatedAt: 1, events: [event], hasMore: true, nextCursor: { beforeSequence: "42", beforeId: event.id } }).success).toBe(true);
  });
  it("rejects duplicate IDs, incomplete cursors, and oversized payloads", () => {
    const base = { schema: "feed-history-v1", mode: "read-only", generatedAt: 1, events: [event], hasMore: false, nextCursor: null };
    expect(feedHistorySchema.safeParse({ ...base, events: [event, event] }).success).toBe(false);
    expect(feedHistorySchema.safeParse({ ...base, hasMore: true }).success).toBe(false);
    expect(feedHistorySchema.safeParse({ ...base, events: [{ ...event, payload: { value: "x".repeat(20_001) } }] }).success).toBe(false);
  });
  it("rejects unordered pages and forged boundary cursors", () => {
    const older = { ...event, id: "solana-rpc:trade:older", replaySequence: "41" };
    const base = { schema: "feed-history-v1", mode: "read-only", generatedAt: 1, events: [event, older], hasMore: true, nextCursor: { beforeSequence: "41", beforeId: older.id } };
    expect(feedHistorySchema.safeParse(base).success).toBe(true);
    expect(feedHistorySchema.safeParse({ ...base, events: [older, event] }).success).toBe(false);
    expect(feedHistorySchema.safeParse({ ...base, nextCursor: { beforeSequence: "42", beforeId: event.id } }).success).toBe(false);
    expect(feedHistorySchema.safeParse({ ...base, events: [] }).success).toBe(false);
  });
});

const token = {
  id: "pair",
  symbol: "DEX",
  name: "Terminal",
  address: "mint",
  pairAddress: "pair",
  dex: "raydium",
  quoteSymbol: "SOL",
  price: 1,
  marketCap: 10,
  liquidity: 5,
  volume24h: 4,
  volume1h: 2,
  change24h: 3,
  change1h: 1,
  txns5m: { buys: 1, sells: 0 },
  ageLabel: "1h",
  ageMinutes: 60,
};
const paperOperationalEvidence = {
  operations: {
    schemaVersion: "paper-operational-health-v1",
    status: "healthy",
    cycleStatus: "completed",
    failedOrAbandoned24h: 0,
    openPositions: 0,
    qualifiedOpenPositions: 0,
    markCoverageApplicable: false,
    freshMarks: 0,
    freshMarkCoverage: null,
    leaseValid: false,
    reasons: [],
    simulationOnly: true,
    executionEnabled: false,
  },
  mutationHealth: {
    schemaVersion: "paper-mutation-health-v2",
    auditedMutations: 1,
    qualifiedMutations: 1,
    excludedMutations: 0,
    duplicateKeys: 0,
    staleProcessing: 0,
    manualReview: 0,
    recoveryPolicy: "fail_closed_no_automatic_replay",
    healthy: true,
    reasons: [],
    simulationOnly: true,
    executionEnabled: false,
  },
  jobLeaseHealth: {
    schemaVersion: "paper-job-lease-health-v1",
    status: "healthy_idle",
    observedLeases: 0,
    qualifiedLeases: 0,
    excludedLeases: 0,
    activeLeases: 0,
    expiredLeases: 0,
    contentionFree: true,
    reasonCounts: {},
    simulationOnly: true,
    executionEnabled: false,
  },
  cycleHistoryHealth: {
    schemaVersion: "paper-cycle-history-health-v2",
    status: "collecting_or_invalid",
    observedCycles: 1,
    qualifiedCycles: 1,
    excludedCycles: 0,
    qualifiedTerminalCycles: 1,
    runningCycles: 0,
    contentionFree: true,
    fencingEvidenceRequired: true,
    minimumHistory: 20,
    historyReady: false,
    reasonCounts: {},
    simulationOnly: true,
    executionEnabled: false,
  },
};
describe("trendingSchema", () => {
  it("accepts the backend contract and preserves evidence", () => {
    expect(
      trendingSchema.parse({
        tokens: [token],
        source: "database",
        dataQuality: "stored_provider_observations",
        freshness: { isStale: false },
      }).tokens[0]?.symbol,
    ).toBe("DEX");
  });
  it("rejects unsafe malformed values", () => {
    expect(
      trendingSchema.safeParse({ tokens: [{ ...token, price: "1" }] }).success,
    ).toBe(false);
  });
  it("fails closed on oversized market pages", () => {
    expect(
      trendingSchema.safeParse({
        tokens: Array.from({ length: 101 }, (_, index) => ({
          ...token,
          id: `pair-${index}`,
        })),
      }).success,
    ).toBe(false);
  });
  it("rejects duplicate discovery rows and inconsistent page metadata", () => {
    expect(
      trendingSchema.safeParse({
        tokens: [token, { ...token, id: "other-pair" }],
        recordCount: 1,
        totalCount: 1,
        pagination: { hasMore: true, nextCursor: null },
      }).success,
    ).toBe(false);
  });
});

describe("token intelligence schemas", () => {
  it("rejects malformed candles instead of drawing invented values", () => {
    expect(
      ohlcvSchema.safeParse({
        candles: [{ time: 1, close: "1" }],
        tf: "1h",
        source: "x",
        dataQuality: "live",
      }).success,
    ).toBe(false);
  });
  it("rejects candle payloads beyond the validated render budget", () => {
    const candle = { time: 1, open: 1, high: 2, low: 0, close: 1, volume: 1 };
    expect(
      ohlcvSchema.safeParse({
        candles: Array.from({ length: 1001 }, (_, index) => ({
          ...candle,
          time: index,
        })),
        tf: "1m",
        source: "x",
        dataQuality: "live",
      }).success,
    ).toBe(false);
  });
  it("preserves partial bubble evidence and enforces node and provider budgets", () => {
    const address = "11111111111111111111111111111111";
    const base = {
      nodes: [],
      edges: [],
      source: "holders",
      edgeSemantics: "none",
      provenance: {
        graphSource: "unavailable",
        labelSource: "unavailable",
        balanceSource: "holders",
      },
      freshness: {
        status: "unavailable",
        observedAt: null,
        staleAfterMs: 300000,
      },
      completeness: { transactionHistory: "partial", acceptedTransfers: null },
      providers: {},
      providerEvidence: {},
      ts: 1,
    };
    expect(bubbleGraphSchema.parse(base).completeness.transactionHistory).toBe(
      "partial",
    );
    expect(
      bubbleGraphSchema.safeParse({
        ...base,
        nodes: Array.from({ length: 76 }, () => ({
          address,
          pct: 1,
          source: "holders",
        })),
      }).success,
    ).toBe(false);
    expect(
      bubbleGraphSchema.safeParse({
        ...base,
        providers: Object.fromEntries(
          Array.from({ length: 11 }, (_, index) => [`p${index}`, "success"]),
        ),
      }).success,
    ).toBe(false);
  });
  it("preserves heuristic manipulation limitations and rejects invalid scores", () => {
    const address = "11111111111111111111111111111111";
    const base = {
      address,
      symbol: "SOL",
      score: 0,
      level: "low_observed",
      flags: [],
      metrics: {
        indexedSwaps: 0,
        indexedWallets: 0,
        totalIndexedVolumeUsd: 0,
        rapidRoundTripWallets: 0,
        roundTripWalletSharePct: 0,
        topTraderVolumeSharePct: 0,
        repeatedSizeVolumeSharePct: 0,
        sampledHolders: 0,
        top10HolderPct: 0,
      },
      evidence: {
        roundTrips: [],
        concentratedTraders: [],
        repeatedSizes: [],
        holders: [],
      },
      provenance: {
        method: "indexed_signature_backed_heuristics",
        observedAt: 1,
        limitations: ["partial history"],
      },
      unavailable: ["common_funder_clusters"],
    };
    expect(manipulationSchema.parse(base).provenance.limitations).toEqual([
      "partial history",
    ]);
    expect(manipulationSchema.safeParse({ ...base, score: 101 }).success).toBe(
      false,
    );
  });
  it("bounds early-buyer observations and requires exact wallet identities", () => {
    const address = "11111111111111111111111111111111";
    const row = { address, boughtAt: 1, delaySec: 4.5 };
    expect(snipersSchema.safeParse({ snipers: [row], ts: 1 }).success).toBe(
      true,
    );
    expect(
      snipersSchema.safeParse({ snipers: [{ ...row, address: `${address}1` }] })
        .success,
    ).toBe(false);
    expect(
      snipersSchema.safeParse({
        snipers: Array.from({ length: 11 }, () => row),
      }).success,
    ).toBe(false);
  });
  it("preserves provider security history and rejects synthetic or mismatched counts", () => {
    const evidence = {
      mintAuthority: null,
      freezeAuthority: null,
      isMintRenounced: true,
      isFreezeRenounced: true,
      holderCount: null,
      buyTax: null,
      sellTax: null,
      isHoneypot: null,
      isLpLocked: null,
      devHoldingsPct: null,
      topHolderPct: null,
      liquidityLockPct: null,
      securityRiskFlags: [],
    };
    const base = {
      snapshots: [{ id: "s1", source: "provider", observedAt: 1, evidence }],
      count: 1,
      dataQuality: "provider_backed",
      synthetic: false,
    };
    expect(
      securityHistorySchema.parse(base).snapshots[0]?.evidence.isMintRenounced,
    ).toBe(true);
    expect(
      securityHistorySchema.safeParse({ ...base, synthetic: true }).success,
    ).toBe(false);
    expect(securityHistorySchema.safeParse({ ...base, count: 0 }).success).toBe(
      false,
    );
  });
  it("preserves transaction finality and partial-quality evidence", () => {
    const result = transactionsSchema.parse({
      txns: [
        {
          signature: "s",
          timestamp: 1,
          type: "buy",
          amount: 2,
          amountUsd: 3,
          price: null,
          feePayer: null,
          source: "gmgn",
          finality: "provider_reported",
        },
      ],
      dataQuality: "observed_partial",
      quality: { completeHistory: false },
    });
    expect(result.quality?.completeHistory).toBe(false);
  });
});

describe("portfolio evidence schemas", () => {
  it("requires the backend to declare unavailable analytics", () => {
    const result = portfolioAnalyticsSchema.parse({
      success: true,
      timestamp: 1,
      data: {
        address: "wallet",
        timeframe: "30d",
        holdings: [],
        allocation: {},
        totalValueUsd: 0,
        tokenCount: 0,
        riskScore: null,
        performance: null,
      },
      provenance: {
        source: "provider",
        observedAt: null,
        dataQuality: "unavailable",
        derived: [],
        unavailable: ["cost_basis", "realized_pnl"],
      },
    });
    expect(result.provenance.unavailable).toContain("cost_basis");
  });
  it("does not coerce missing unrealized PnL to zero", () => {
    const result = walletPnlSchema.parse({
      pnl: {
        status: "unavailable",
        realizedPnl: null,
        unrealizedPnl: null,
        totalPnl: null,
        pnl7d: null,
        pnl30d: null,
        winRate: null,
        tradeCount: 0,
        equityCurve: [],
        provenance: { method: "fifo", sources: [], indexedSwapCount: 0 },
        warnings: [],
      },
    });
    expect(result.pnl?.unrealizedPnl).toBeNull();
  });
});

describe("Trenches and quote safety schemas", () => {
  it("requires all three launch lanes and freshness evidence", () => {
    expect(
      trenchesSchema.safeParse({
        newTokens: [],
        almostBonded: [],
        migrated: [],
        fetchedAt: 1,
        recordCount: 0,
        providers: [],
        source: "none",
        dataQuality: "unavailable",
        freshness: { ageMs: null, staleAfterMs: 60_000, isStale: true },
      }).success,
    ).toBe(true);
  });
  it("rejects a nominal quote without exact raw amounts and context", () => {
    expect(
      swapQuoteSchema.safeParse({
        quote: { side: "buy", real: true },
        jupQuote: {},
        quotedAt: 1,
        ts: 1,
      }).success,
    ).toBe(false);
  });
});

describe("Monitor and alert evidence schemas", () => {
  const address = "11111111111111111111111111111111";
  it("requires signed observation provenance and durable alert ownership", () => {
    expect(
      monitorAlertsSchema.safeParse({
        alerts: [
          {
            id: "sig",
            type: "onchain_buy",
            tokenAddress: address,
            tokenSymbol: "SOL",
            message: "confirmed",
            timestamp: 1,
            txHash: "sig",
            source: "rpc",
            read: false,
          },
        ],
        ts: 1,
        fetchedAt: 1,
        source: "database",
        providers: ["solana_token_transactions"],
        recordCount: 1,
        dataQuality: "onchain_signatures_only",
        freshness: { isStale: false, staleAfterMs: 300000 },
      }).success,
    ).toBe(true);
    expect(
      userAlertsSchema.safeParse({
        success: true,
        count: 1,
        persistence: "database",
        data: [
          {
            id: "a",
            userId: address,
            chainId: "solana",
            address,
            type: "price",
            name: "Breakout",
            description: "",
            conditions: { condition: "above", targetPrice: 10 },
            channels: ["inApp"],
            cooldownMinutes: 60,
            active: true,
            lastTriggered: null,
            triggerCount: 0,
            createdAt: 1,
            updatedAt: 1,
            persistence: "database",
          },
        ],
      }).success,
    ).toBe(true);
  });
  it("rejects fabricated delivery success without timestamps", () => {
    expect(
      alertDeliveriesSchema.safeParse({
        success: true,
        count: 1,
        persistence: "database",
        data: [
          {
            id: "d",
            alertId: "a",
            eventKey: "e",
            channel: "inApp",
            status: "delivered",
            reason: null,
            deliveredAt: null,
          },
        ],
      }).success,
    ).toBe(false);
  });
});

describe("CopyTrade evidence schemas", () => {
  const address = "11111111111111111111111111111111";
  it("preserves ranking provenance and execution readiness limitations", () => {
    expect(
      topTradersSchema.safeParse({
        traders: [
          {
            rank: 1,
            address,
            pnlUsd: 5,
            pnlPct: 2,
            winRate: 50,
            trades: 2,
            bestToken: "SOL",
            bestTokenPct: 2,
            badge: "Degen",
            sparkline: [1, 5],
          },
        ],
        fetchedAt: 1,
        recordCount: 1,
        source: "indexed Solana swaps",
        dataQuality: "indexed_observed",
        freshness: {
          latestSourceFetchedAt: 1,
          ageMs: 0,
          staleAfterMs: 120000,
          isStale: false,
        },
      }).success,
    ).toBe(true);
    const health = copyTradeHealthSchema.parse({
      service: "copytrade",
      chain: "solana",
      mode: "simulation",
      readiness: {
        traderData: true,
        walletMonitor: false,
        quote: false,
        walletSignature: false,
        broadcast: false,
        confirmation: false,
        durableStorage: true,
        automationWorker: false,
      },
      providers: { helius: false, gmgn: false },
      recordCount: 1,
      checkedAt: 1,
    });
    expect(health.readiness.walletSignature).toBe(false);
  });
  it("rejects configs with out-of-bounds financial risk fields", () => {
    const config = {
      id: "c",
      userId: address,
      sourceWallet: address,
      isActive: false,
      createdAt: 1,
      updatedAt: 1,
      sizingMode: "fixed_sol",
      fixedAmountSol: 1,
      maxPositionSizeSol: 1,
      maxDailyVolumeSol: 1,
      maxDailyLossSol: 0,
      maxSlippageBps: 100,
      maxPriceImpactPct: 5,
      priorityFeeLamports: 1_000_000,
      antiMev: true,
      minHolderCount: 100,
      trailingStopPct: 10,
      exitLadder: [
        { triggerPct: 25, sellPct: 50 },
        { triggerPct: 50, sellPct: 50 },
      ],
      minLiquidityUsd: 0,
      maxMarketCapUsd: 0,
      excludedTokens: [],
      onlyNewLaunches: false,
      maxTokenAgeMinutes: 60,
      copySells: true,
      copyBuys: true,
      delayMs: 0,
      maxConcurrentPositions: 1,
    };
    expect(copyTradeConfigSchema.safeParse(config).success).toBe(true);
    expect(
      copyTradeConfigSchema.safeParse({
        ...config,
        maxSlippageBps: 5001,
      }).success,
    ).toBe(false);
    expect(
      copyTradeConfigSchema.safeParse({
        ...config,
        exitLadder: [
          { triggerPct: 50, sellPct: 60 },
          { triggerPct: 25, sellPct: 60 },
        ],
      }).success,
    ).toBe(false);
  });
});

describe("AI advisory and simulation schemas", () => {
  const address = "11111111111111111111111111111111";
  it("requires recommendation evidence to declare execution disabled", () => {
    const recommendation = {
      tokenAddress: address,
      tokenSymbol: "SOL",
      chain: "solana",
      score: 80,
      confidence: 70,
      category: "monitor",
      modelVersion: "v1",
      createdAt: "2026-08-22T00:00:00.000Z",
      recommendationEvidence: {
        status: "advisory_current",
        safeForAdvisoryUse: true,
        executionEnabled: false,
        providerFamilies: ["rpc", "dex"],
        missingFeatures: [],
        expired: false,
        costsIncluded: true,
        pointInTime: true,
      },
      outcomes: { total: 1, resolved: 1, wins: 1, losses: 0, avgReturnPct: 2 },
    };
    const base = {
      success: true,
      data: { readOnly: true, recommendations: [recommendation] },
    };
    expect(aiRecommendationsSchema.safeParse(base).success).toBe(true);
    expect(
      aiRecommendationsSchema.safeParse({
        ...base,
        data: {
          ...base.data,
          recommendations: [
            {
              ...recommendation,
              recommendationEvidence: {
                ...recommendation.recommendationEvidence,
                executionEnabled: true,
              },
            },
          ],
        },
      }).success,
    ).toBe(false);
  });
  it("requires paper mode, kill switch, read-only delivery, and fail-closed operational health", () => {
    const base = {
      success: true,
      data: {
        mode: "simulation",
        executionEnabled: false,
        readOnly: true,
        generatedAt: 1,
        config: {
          enabled: true,
          startingCashUsd: 1000,
          positionSizeUsd: 10,
          maxOpenPositions: 2,
          minScore: 70,
          minConfidence: 70,
          takeProfitPct: 20,
          stopLossPct: 10,
          feeBps: 10,
          slippageBps: 20,
        },
        summary: {
          equityUsd: 1000,
          totalPnlUsd: 0,
          realizedPnlUsd: 0,
          unrealizedPnlUsd: 0,
          openPositions: 0,
          closedTrades: 0,
          winRate: null,
          maxDrawdownPct: 0,
          markCoverage: 1,
          unavailableMarks: 0,
        },
        analytics: {
          profitFactor: null,
          expectancyUsd: null,
          totalFeesUsd: 0,
          totalSlippageCostUsd: 0,
        },
        risk: {
          entriesAllowed: true,
          dailyLossLimitHit: false,
          cooldownActive: false,
        },
        readiness: {
          status: "collecting",
          executionEnabled: false,
          killSwitch: true,
          note: "advisory",
          checks: { simulationOnly: true },
        },
        ...paperOperationalEvidence,
        positions: [],
        closedTrades: [],
        dailyPerformance: [],
        potentialPool: [],
      },
    };
    expect(aiPaperReportSchema.safeParse(base).success).toBe(true);
    expect(
      aiPaperReportSchema.safeParse({
        ...base,
        data: {
          ...base.data,
          mutationHealth: {
            ...base.data.mutationHealth,
            executionEnabled: true,
          },
        },
      }).success,
    ).toBe(false);
  });
  it("rejects governance that enables execution", () => {
    expect(
      aiPlatformSchema.safeParse({
        success: true,
        executionEnabled: true,
        data: {
          schema: "ai-platform-readiness-v1",
          phases: [],
          metrics: {},
          phase31: {
            status: "blocked",
            blockers: [],
            checks: {},
            executionEnabled: false,
          },
        },
      }).success,
    ).toBe(false);
  });
});

describe("Market Intelligence evidence schemas", () => {
  const address = "11111111111111111111111111111111";
  it("requires signal pagination, freshness, and signature evidence fields", () => {
    const result = signalsSchema.safeParse({
      signals: [
        {
          id: "sig",
          type: "On-chain Buy",
          token: "SOL",
          tokenAddress: address,
          description: "observed buy",
          time: "now",
          ts: 1,
          txHash: "sig",
          source: "rpc",
        },
      ],
      fetchedAt: 1,
      recordCount: 1,
      totalCount: 1,
      hasMore: false,
      nextBefore: null,
      nextCursor: null,
      counts: { "On-chain Buy": 1 },
      source: "database",
      providers: ["rpc"],
      dataQuality: "signature-backed",
      reason: null,
      freshness: { isStale: false, staleAfterMs: 120000 },
      requestId: "request",
    });
    expect(result.success).toBe(true);
    expect(
      signalsSchema.safeParse({ signals: [], dataQuality: "signature-backed" })
        .success,
    ).toBe(false);
  });
  it("rejects inconsistent, duplicate, and unordered signal pages", () => {
    const signal = (id: string, ts: number) => ({
      id,
      type: "On-chain Buy" as const,
      token: "SOL",
      description: "observed buy",
      time: "now",
      ts,
    });
    const page = {
      signals: [signal("a", 1), signal("a", 2)],
      fetchedAt: 2,
      recordCount: 1,
      totalCount: 0,
      hasMore: true,
      nextBefore: null,
      nextCursor: null,
      counts: {},
      source: "database",
      dataQuality: "signature-backed",
      reason: null,
      freshness: { isStale: false, staleAfterMs: 120000 },
      requestId: "request",
    };
    const result = signalsSchema.safeParse(page);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path.join("."))).toEqual(
        expect.arrayContaining([
          "recordCount",
          "totalCount",
          "nextCursor",
          "signals.1.id",
          "signals.1",
        ]),
      );
    }
  });
  it("preserves heatmap exclusions and rejects negative market weights", () => {
    const base = {
      heatmap: [
        {
          symbol: "SOL",
          name: "Solana",
          address,
          price: 1,
          change24h: 2,
          volume24h: 10,
          marketCap: null,
          liquidity: 5,
          dex: "raydium",
          trustFlags: [],
          source: "provider",
        },
      ],
      fetchedAt: 1,
      recordCount: 1,
      providers: ["provider"],
      source: "database",
      trustSummary: {
        warningRecordCount: 0,
        lowLiquidityCount: 0,
        noPriceCount: 0,
        transactionCountUnavailable: 0,
        suspiciousMetadataCount: 0,
        nonCanonicalMintCount: 0,
        incompleteMetricCount: 0,
        inputRecordCount: 2,
        excludedRecordCount: 1,
      },
      freshness: { isStale: false, staleAfterMs: 300000 },
      error: null,
      reason: null,
    };
    expect(heatmapSchema.parse(base).trustSummary.excludedRecordCount).toBe(1);
    expect(
      heatmapSchema.safeParse({
        ...base,
        heatmap: [{ ...base.heatmap[0], volume24h: -1 }],
      }).success,
    ).toBe(false);
  });
  it("requires claim monitor mode and explicit fake/unpaid state", () => {
    const base = {
      generatedAt: 1,
      health: "healthy",
      source: "solana-rpc",
      mode: "rpc-polling",
      programId: address,
      programIds: [address],
      rpcEndpoint: "helius-rpc",
      signaturesScanned: 1,
      claimsDetected: 1,
      firstClaims: 1,
      fakeClaims: 1,
      events: [
        {
          signature: "sig",
          slot: 1,
          blockTime: 1,
          programId: address,
          instruction: "ClaimSocialFeePda",
          platform: "unknown",
          amountLamports: 0,
          amountSol: 0,
          feePayer: address,
          status: "fake_or_unpaid",
          isFirstClaim: true,
          isFakeClaim: true,
          logs: [],
          explorerUrl: "https://solscan.io/tx/sig",
        },
      ],
    };
    expect(claimMonitorSchema.safeParse(base).success).toBe(true);
    expect(
      claimMonitorSchema.safeParse({ ...base, mode: "transaction-execution" })
        .success,
    ).toBe(false);
  });
});

describe("Track evidence schema", () => {
  const address = "11111111111111111111111111111111";
  const market = {
    symbol: "SOL",
    dex: "Raydium",
    imageUrl: null,
    sourceFetchedAt: 1,
    freshnessSeconds: 0,
    priceUsd: 1,
    marketCap: 10,
    holders: 2,
    volume1h: 3,
    change1h: 4,
  };
  const item = {
    id: "event",
    type: "whale_buy",
    title: "Whale buy",
    message: "Observed buy",
    tokenAddress: address,
    tokenSymbol: "SOL",
    wallet: address,
    observedAt: 1,
    source: "database",
    dataQuality: "indexed",
    market,
  };
  it("accepts bounded exact-mint observations and rejects duplicate IDs", () => {
    expect(
      trackFeedSchema.safeParse({ notifications: [item], ts: 1 }).success,
    ).toBe(true);
    expect(
      trackFeedSchema.safeParse({ notifications: [item, item], ts: 1 }).success,
    ).toBe(false);
    expect(trackFeedSchema.safeParse({ notifications: [{ ...item, market: { ...market, dex: "x".repeat(81) } }], ts: 1 }).success).toBe(false);
  });
  it("rejects malformed wallet identities and oversized windows", () => {
    expect(
      trackFeedSchema.safeParse({
        notifications: [{ ...item, wallet: `${address}1` }],
        ts: 1,
      }).success,
    ).toBe(false);
    expect(
      trackFeedSchema.safeParse({
        notifications: Array.from({ length: 101 }, (_, index) => ({
          ...item,
          id: `event-${index}`,
        })),
        ts: 1,
      }).success,
    ).toBe(false);
  });
  it("validates optional ownership-based whale evidence", () => {
    const whaleHolding = { tokenAddress: address, tokenSymbol: "ANSEM", imageUrl: "https://cdn.example/ansem.png", valueUsd: 10_000, observedAt: 1, source: "provider.wallet_holdings", eligibleToken: true };
    expect(trackFeedSchema.safeParse({ notifications: [{ ...item, whaleHolding }], ts: 1 }).success).toBe(true);
    expect(trackFeedSchema.parse({ notifications: [{ ...item, whaleHolding: { ...whaleHolding, imageUrl: "http://insecure.example/ansem.png" } }], ts: 1 }).notifications[0]?.whaleHolding?.imageUrl).toBeUndefined();
    expect(trackFeedSchema.safeParse({ notifications: [{ ...item, whaleHolding: { ...whaleHolding, valueUsd: -1 } }], ts: 1 }).success).toBe(false);
    expect(trackFeedSchema.safeParse({ notifications: [{ ...item, whaleHolding: { ...whaleHolding, tokenAddress: `${address}1` } }], ts: 1 }).success).toBe(false);
  });
});

describe("Wallet Intelligence evidence schema", () => {
  const address = "11111111111111111111111111111111";
  it("requires exact addresses and preserves unpriced holdings", () => {
    const base = {
      wallet: {
        address,
        tokens: [
          {
            mint: address,
            symbol: "SOL",
            name: "Solana",
            amount: 1,
            uiAmount: 1,
            decimals: 9,
            priceUsd: null,
            valueUsd: null,
            pctOfPortfolio: 0,
          },
        ],
        totalValueUsd: 0,
        tokenCount: 1,
        solBalance: 1,
        solValueUsd: 0,
      },
      ts: 1,
    };
    expect(
      walletHoldingsSchema.parse(base).wallet.tokens[0]?.priceUsd,
    ).toBeNull();
    expect(
      walletHoldingsSchema.safeParse({
        ...base,
        wallet: {
          ...base.wallet,
          address: "111111111111111111111111111111111",
        },
      }).success,
    ).toBe(false);
  });
  it("rejects oversized holdings collections before they reach a list", () => {
    const holding = {
      mint: address,
      symbol: "SOL",
      name: "Solana",
      amount: 1,
      uiAmount: 1,
      decimals: 9,
      priceUsd: null,
      valueUsd: null,
      pctOfPortfolio: 0,
    };
    expect(
      walletHoldingsSchema.safeParse({
        wallet: {
          address,
          tokens: Array.from({ length: 501 }, () => holding),
          totalValueUsd: 0,
          tokenCount: 501,
          solBalance: 0,
          solValueUsd: 0,
        },
        ts: 1,
      }).success,
    ).toBe(false);
  });
});

describe("Feed Data operational evidence schemas", () => {
  it("separates configured providers from observed delivery and persisted freshness", () => {
    const result = feedConnectionsSchema.parse({
      success: true,
      chain: "solana",
      generatedAt: 1,
      source: "runtime_provider_inventory",
      runtimeScope: "durable-indexer-heartbeat",
      healthSummary: { healthy: 0, degraded: 1, unhealthy: 0, receiving: 0 },
      connections: [
        {
          id: "provider",
          label: "Provider",
          method: "api",
          status: "available",
          health: "degraded",
          receiving: false,
          deliveryStatus: "stale_persisted",
          configured: true,
          rateLimit: null,
          subscription: null,
          records: {
            pairs: 1,
            transactions: 0,
            candles: 0,
            total: 1,
            freshness: "stale",
          },
        },
      ],
      runtime: {
        eventBus: {
          published: 1,
          persisted: 1,
          droppedDuplicates: 0,
          droppedInvalidTimestamps: 0,
          persistFailures: 0,
          persistenceDrops: 0,
          pendingPersistence: 0,
          lastEventAt: null,
        },
        onchainTicks: {
          received: 1,
          decoded: 1,
          persisted: 1,
          dropped: 0,
          ignored: 0,
          failed: 0,
          expired: 0,
          unmatched: 0,
          quality: "healthy",
          cooldownRemainingMs: 0,
        },
      },
      ingestionJobs: [],
    });
    expect(result.connections[0]?.configured).toBe(true);
    expect(result.connections[0]?.receiving).toBe(false);
  });
  it("requires explicit evidence availability and rejects invented quality shapes", () => {
    const base = {
      generatedAt: 1,
      runtimeScope: "local-process",
      realtimeEvidence: { timestamp: null, timestampValid: false },
      quality: {
        rpc: "disconnected",
        websocket: "disconnected",
        eventPersistence: "healthy",
        decoder: "healthy",
      },
      persistenceEvidence: { status: "unavailable", error: "storage" },
      observabilityEvidence: { status: "complete", error: null },
      replayEvidence: { status: "complete", error: null },
      actions: ["inspect storage"],
      degraded: true,
    };
    expect(feedDiagnosticsSchema.safeParse(base).success).toBe(true);
    expect(
      feedDiagnosticsSchema.safeParse({
        ...base,
        persistenceEvidence: { status: "healthy" },
      }).success,
    ).toBe(false);
  });
});
