import {
  createPausedCopyTradeConfig,
  createUserAlert,
  fetchAiPaperReport,
  fetchAiPlatform,
  fetchAiRecommendations,
  fetchAlertDeliveries,
  fetchClaimMonitor,
  fetchCopyExecutions,
  fetchCopyTradeConfigs,
  fetchCopyTradeHealth,
  fetchDiscovery,
  fetchFeedConnections,
  fetchFeedDiagnostics,
  fetchFeedHistory,
  fetchHeatmap,
  fetchMonitorAlerts,
  fetchOhlcv,
  fetchPortfolioAnalytics,
  fetchSignals,
  fetchSocialRadar,
  fetchSwapQuote,
  fetchTokenDetail,
  fetchTokenPanel,
  fetchTopTraders,
  fetchTrackFeed,
  fetchTrenches,
  fetchUserAlerts,
  fetchWalletHoldings,
  fetchWalletPnl,
  getApiOrigin,
  pauseCopyTradeConfig,
  searchTokens,
  setUserAlertActive,
  type CreateCopyTradeInput,
} from "@/api/client";

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
const jsonResponse = (body: unknown, ok = true, status = 200) =>
  ({
    ok,
    status,
    json: jest.fn().mockResolvedValue(body),
  }) as unknown as Response;

describe("backend client routing", () => {
  const originalUrl = process.env.EXPO_PUBLIC_API_URL;
  beforeEach(() => {
    process.env.EXPO_PUBLIC_API_URL = "https://terminal.example/";
    global.fetch = jest.fn();
  });
  afterAll(() => {
    process.env.EXPO_PUBLIC_API_URL = originalUrl;
  });

  it("routes special discovery modes to their real endpoints", async () => {
    jest
      .mocked(fetch)
      .mockResolvedValue(
        jsonResponse({
          tokens: [token],
          source: "gmgn",
          dataQuality: "provider_live",
        }),
      );
    await fetchDiscovery("surge", "1h", {
      dex: "All",
      minLiquidity: "",
      minMarketCap: "",
    });
    expect(fetch).toHaveBeenCalledWith(
      "https://terminal.example/api/trending/surge",
      expect.objectContaining({ headers: { Accept: "application/json" } }),
    );
  });

  it("encodes search terms and validates token detail", async () => {
    const address = "11111111111111111111111111111111";
    jest
      .mocked(fetch)
      .mockResolvedValueOnce(
        jsonResponse({
          tokens: [token],
          source: "search",
          dataQuality: "provider_live",
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({ token: { ...token, address }, receivedAt: 1 }),
      );
    await searchTokens("DEX token");
    await fetchTokenDetail(address);
    expect(jest.mocked(fetch).mock.calls[0]?.[0]).toBe(
      "https://terminal.example/api/search?q=DEX+token",
    );
    expect(jest.mocked(fetch).mock.calls[1]?.[0]).toBe(
      `https://terminal.example/api/token/${address}`,
    );
  });

  it("rejects an invalid configured origin before a request", async () => {
    process.env.EXPO_PUBLIC_API_URL = "javascript:alert(1)";
    await expect(searchTokens("DEX")).rejects.toThrow("must use HTTPS");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("normalizes a trusted origin and rejects URL smuggling", () => {
    process.env.EXPO_PUBLIC_API_URL = "https://terminal.example/";
    expect(getApiOrigin()).toBe("https://terminal.example");
    for (const unsafe of [
      "http://terminal.example",
      "https://user:secret@terminal.example",
      "https://terminal.example/some/path",
      "https://terminal.example?next=https://evil.example",
      "https://terminal.example#evil",
    ]) {
      process.env.EXPO_PUBLIC_API_URL = unsafe;
      expect(() => getApiOrigin()).toThrow(/HTTPS|origin/);
    }
  });

  it("routes token panels and chart timeframes without leaking parameters", async () => {
    const address = "11111111111111111111111111111111";
    jest
      .mocked(fetch)
      .mockResolvedValueOnce(
        jsonResponse({ pairs: [], dataQuality: "unavailable" }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          candles: [],
          tf: "4h",
          source: "none",
          dataQuality: "unavailable",
        }),
      );
    await fetchTokenPanel(address, "pairs");
    await fetchOhlcv(address, "4h");
    expect(jest.mocked(fetch).mock.calls[0]?.[0]).toBe(
      `https://terminal.example/api/token/${address}/pairs`,
    );
    expect(jest.mocked(fetch).mock.calls[1]?.[0]).toBe(
      `https://terminal.example/api/token/${address}/ohlcv?tf=4h`,
    );
  });

  it("routes deeper holder and transaction evidence to authoritative contracts", async () => {
    const address = "11111111111111111111111111111111";
    jest
      .mocked(fetch)
      .mockResolvedValueOnce(
        jsonResponse({
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
          completeness: {
            transactionHistory: "partial",
            acceptedTransfers: null,
          },
          providers: {},
          providerEvidence: {},
          ts: 1,
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
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
            limitations: ["partial"],
          },
          unavailable: ["common_funder_clusters"],
        }),
      );
    await fetchTokenPanel(address, "bubble");
    await fetchTokenPanel(address, "manipulation");
    expect(jest.mocked(fetch).mock.calls.map((call) => call[0])).toEqual([
      `https://terminal.example/api/token/${address}/bubble`,
      `https://terminal.example/api/token/${address}/manipulation`,
    ]);
  });

  it("routes unique early-buyer and historical security evidence contracts", async () => {
    const address = "11111111111111111111111111111111";
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
    };
    jest
      .mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ snipers: [], ts: 1 }))
      .mockResolvedValueOnce(
        jsonResponse({
          snapshots: [
            { id: "s1", source: "provider", observedAt: 1, evidence },
          ],
          count: 1,
          dataQuality: "provider_backed",
          synthetic: false,
        }),
      );
    await fetchTokenPanel(address, "snipers");
    await fetchTokenPanel(address, "security-history");
    expect(jest.mocked(fetch).mock.calls.map((call) => call[0])).toEqual([
      `https://terminal.example/api/token/${address}/snipers`,
      `https://terminal.example/api/token/${address}/security-history`,
    ]);
  });

  it("requests portfolio and PnL evidence with encoded bounded parameters", async () => {
    jest
      .mocked(fetch)
      .mockResolvedValueOnce(
        jsonResponse({
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
            source: "provider_backed_wallet_holdings",
            observedAt: null,
            dataQuality: "unavailable",
            derived: [],
            unavailable: ["cost_basis"],
          },
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ pnl: null, ts: 1 }));
    await fetchPortfolioAnalytics("wallet", "30d");
    await fetchWalletPnl("wallet");
    expect(jest.mocked(fetch).mock.calls[0]?.[0]).toBe(
      "https://terminal.example/api/analytics/portfolio?address=wallet&timeframe=30d",
    );
    expect(jest.mocked(fetch).mock.calls[1]?.[0]).toBe(
      "https://terminal.example/api/wallet/wallet/pnl",
    );
  });

  it("loads Trenches and bounds quote parameters before network access", async () => {
    jest
      .mocked(fetch)
      .mockResolvedValueOnce(
        jsonResponse({
          newTokens: [],
          almostBonded: [],
          migrated: [],
          fetchedAt: 1,
          recordCount: 0,
          providers: [],
          source: "none",
          dataQuality: "unavailable",
          freshness: { ageMs: null, staleAfterMs: 60_000, isStale: true },
        }),
      );
    await fetchTrenches();
    expect(jest.mocked(fetch).mock.calls[0]?.[0]).toBe(
      "https://terminal.example/api/trenches",
    );
    await expect(
      fetchSwapQuote({
        token: "mint",
        side: "buy",
        amount: "1",
        unit: "usd",
        slippageBps: 501,
      }),
    ).rejects.toThrow("slippage");
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("loads older durable feed history with a paired cursor", async () => {
    jest.mocked(fetch).mockResolvedValueOnce(jsonResponse({
      schema: "feed-history-v1",
      mode: "read-only",
      generatedAt: 1,
      events: [],
      hasMore: false,
      nextCursor: null,
    }));
    await fetchFeedHistory({ beforeSequence: "42", beforeId: "solana-rpc:trade:signature" });
    expect(jest.mocked(fetch).mock.calls[0]?.[0]).toBe(
      "https://terminal.example/api/feed/history?limit=50&beforeSequence=42&beforeId=solana-rpc%3Atrade%3Asignature",
    );
    expect("method" in (jest.mocked(fetch).mock.calls[0]?.[1] ?? {})).toBe(false);
  });

  it("loads public social radar with GET only and rejects incompatible evidence", async () => {
    jest.mocked(fetch).mockResolvedValueOnce(jsonResponse({ success: true, data: { trends: [] } }));
    await expect(fetchSocialRadar()).rejects.toThrow("incompatible social tracking evidence");
    expect(jest.mocked(fetch).mock.calls[0]?.[0]).toBe("https://terminal.example/api/ai/social/radar");
    expect("method" in (jest.mocked(fetch).mock.calls[0]?.[1] ?? {})).toBe(false);
  });

  it("uses credentialed owner-scoped alert routes and never invokes evaluation", async () => {
    const address = "11111111111111111111111111111111";
    const alert = {
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
    };
    jest
      .mocked(fetch)
      .mockResolvedValueOnce(
        jsonResponse({
          alerts: [],
          ts: 1,
          fetchedAt: 1,
          source: "database",
          providers: [],
          recordCount: 0,
          dataQuality: "onchain_signatures_only",
          freshness: { isStale: false, staleAfterMs: 300000 },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          success: true,
          count: 1,
          data: [alert],
          persistence: "database",
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ success: true, data: alert }))
      .mockResolvedValueOnce(
        jsonResponse({ success: true, data: { ...alert, active: false } }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          success: true,
          count: 0,
          data: [],
          persistence: "database",
        }),
      );
    await fetchMonitorAlerts();
    await fetchUserAlerts();
    await createUserAlert({
      address,
      type: "price",
      name: "Breakout",
      conditions: { condition: "above", targetPrice: 10 },
      cooldownMinutes: 60,
      channels: ["inApp"],
    });
    await setUserAlertActive("a", false);
    await fetchAlertDeliveries();
    expect(jest.mocked(fetch).mock.calls.map((call) => call[0])).toEqual([
      "https://terminal.example/api/monitor/alerts",
      "https://terminal.example/api/alerts?limit=100",
      "https://terminal.example/api/alerts",
      "https://terminal.example/api/alerts",
      "https://terminal.example/api/alerts/deliveries?limit=100",
    ]);
    expect(
      jest
        .mocked(fetch)
        .mock.calls.some((call) => String(call[0]).includes("/evaluate")),
    ).toBe(false);
    expect(jest.mocked(fetch).mock.calls[2]?.[1]).toEqual(
      expect.objectContaining({ credentials: "include", method: "POST" }),
    );
  });

  it("loads Track observations with GET only and no subscription mutation", async () => {
    jest
      .mocked(fetch)
      .mockResolvedValue(
        jsonResponse(
          { notifications: [], ts: 1, error: "notification_feed_unavailable" },
          false,
          503,
        ),
      );
    expect((await fetchTrackFeed()).error).toBe(
      "notification_feed_unavailable",
    );
    expect(fetch).toHaveBeenCalledWith(
      "https://terminal.example/api/in-app-notifications",
      expect.objectContaining({ credentials: "include" }),
    );
    expect(jest.mocked(fetch).mock.calls[0]?.[1]?.method).toBeUndefined();
  });

  it("keeps CopyTrade configuration paused and execution APIs read-only", async () => {
    const address = "11111111111111111111111111111111";
    const health = {
      service: "copytrade",
      chain: "solana",
      mode: "unavailable",
      readiness: {
        traderData: false,
        walletMonitor: false,
        quote: false,
        walletSignature: false,
        broadcast: false,
        confirmation: false,
        durableStorage: true,
        automationWorker: false,
      },
      providers: { helius: false, gmgn: false },
      recordCount: 0,
      checkedAt: 1,
    };
    const config = {
      id: "c",
      userId: address,
      sourceWallet: address,
      isActive: false,
      createdAt: 1,
      updatedAt: 1,
      sizingMode: "fixed_sol",
      fixedAmountSol: 0.05,
      maxPositionSizeSol: 0.1,
      maxDailyVolumeSol: 0.5,
      maxDailyLossSol: 0.1,
      maxSlippageBps: 100,
      maxPriceImpactPct: 3,
      priorityFeeLamports: 1_000_000,
      antiMev: true,
      minHolderCount: 100,
      trailingStopPct: 10,
      exitLadder: [
        { triggerPct: 25, sellPct: 50 },
        { triggerPct: 50, sellPct: 50 },
      ],
      minLiquidityUsd: 10000,
      maxMarketCapUsd: 1000000,
      excludedTokens: [],
      onlyNewLaunches: false,
      maxTokenAgeMinutes: 60,
      copySells: true,
      copyBuys: true,
      delayMs: 1000,
      maxConcurrentPositions: 2,
    };
    const input = {
      ...config,
      id: undefined,
      userId: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    } as unknown as CreateCopyTradeInput;
    jest
      .mocked(fetch)
      .mockResolvedValueOnce(
        jsonResponse({
          traders: [],
          fetchedAt: 1,
          recordCount: 0,
          source: "none",
          dataQuality: "unavailable",
          freshness: {
            latestSourceFetchedAt: null,
            ageMs: null,
            staleAfterMs: 120000,
            isStale: true,
          },
        }),
      )
      .mockResolvedValueOnce(jsonResponse(health))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: [config] }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: config }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: config }))
      .mockResolvedValueOnce(
        jsonResponse({
          success: true,
          data: [],
          recordCount: 0,
          source: "database",
        }),
      );
    await fetchTopTraders("30D");
    await fetchCopyTradeHealth();
    await fetchCopyTradeConfigs();
    await createPausedCopyTradeConfig(input);
    await pauseCopyTradeConfig("c");
    await fetchCopyExecutions();
    const urls = jest.mocked(fetch).mock.calls.map((call) => String(call[0]));
    expect(
      urls.some((url) =>
        /copytrade\/(copy|confirm|submit)|positions\/.*close/.test(url),
      ),
    ).toBe(false);
    expect(jest.mocked(fetch).mock.calls[3]?.[1]).toEqual(
      expect.objectContaining({ credentials: "include", method: "POST" }),
    );
  });

  it("rejects active mobile strategies before network access", async () => {
    await expect(
      createPausedCopyTradeConfig({ isActive: true } as CreateCopyTradeInput),
    ).rejects.toThrow("must be created paused");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("uses only read-only AI evidence endpoints", async () => {
    jest
      .mocked(fetch)
      .mockResolvedValueOnce(
        jsonResponse({
          success: true,
          data: { recommendations: [], readOnly: true },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          success: true,
          data: {
            mode: "simulation",
            executionEnabled: false,
            readOnly: true,
            generatedAt: 1,
            config: {
              enabled: false,
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
              entriesAllowed: false,
              dailyLossLimitHit: false,
              cooldownActive: false,
            },
            readiness: {
              status: "collecting",
              executionEnabled: false,
              killSwitch: true,
              note: "advisory",
              checks: {},
            },
            ...paperOperationalEvidence,
            positions: [],
            closedTrades: [],
            dailyPerformance: [],
            potentialPool: [],
          },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          success: true,
          executionEnabled: false,
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
        }),
      );
    await fetchAiRecommendations();
    await fetchAiPaperReport();
    await fetchAiPlatform();
    expect(jest.mocked(fetch).mock.calls.map((call) => call[0])).toEqual([
      "https://terminal.example/api/ai/recommendations?view=public&limit=50",
      "https://terminal.example/api/ai/paper-trading?view=public",
      "https://terminal.example/api/ai/platform",
    ]);
    expect(
      jest
        .mocked(fetch)
        .mock.calls.every(
          (call) => !call[1]?.method || call[1]?.method === "GET",
        ),
    ).toBe(true);
  });

  it("routes read-only market intelligence with bounded filters and accepts explicit degraded evidence", async () => {
    const address = "11111111111111111111111111111111";
    jest
      .mocked(fetch)
      .mockResolvedValueOnce(
        jsonResponse(
          {
            signals: [],
            fetchedAt: 1,
            recordCount: 0,
            totalCount: 0,
            hasMore: false,
            nextBefore: null,
            nextCursor: null,
            counts: {},
            source: "database",
            providers: [],
            dataQuality: "unavailable",
            reason: "No evidence",
            freshness: { isStale: true, staleAfterMs: 120000 },
            requestId: "r",
          },
          false,
          503,
        ),
      )
      .mockResolvedValueOnce(
        jsonResponse(
          {
            heatmap: [],
            fetchedAt: 1,
            recordCount: 0,
            providers: [],
            source: "database",
            trustSummary: {
              warningRecordCount: 0,
              lowLiquidityCount: 0,
              noPriceCount: 0,
              transactionCountUnavailable: 0,
              suspiciousMetadataCount: 0,
              nonCanonicalMintCount: 0,
              incompleteMetricCount: 0,
              inputRecordCount: 0,
              excludedRecordCount: 0,
            },
            freshness: { isStale: true, staleAfterMs: 300000 },
            error: "database_read_unavailable",
            reason: "Retry",
          },
          false,
          503,
        ),
      )
      .mockResolvedValueOnce(
        jsonResponse(
          {
            generatedAt: 1,
            health: "unhealthy",
            source: "solana-rpc",
            mode: "rpc-polling",
            programId: address,
            programIds: [address],
            rpcEndpoint: "unavailable",
            signaturesScanned: 0,
            claimsDetected: 0,
            firstClaims: 0,
            fakeClaims: 0,
            events: [],
            error: "RPC unavailable",
          },
          false,
          503,
        ),
      );
    await fetchSignals({
      hours: 24,
      type: "Whale Move",
      cursor: "opaque_cursor",
    });
    await fetchHeatmap();
    const claim = await fetchClaimMonitor();
    expect(jest.mocked(fetch).mock.calls.map((call) => call[0])).toEqual([
      "https://terminal.example/api/signals?limit=40&hours=24&type=Whale+Move&cursor=opaque_cursor",
      "https://terminal.example/api/heatmap",
      "https://terminal.example/api/claim-monitor?limit=30",
    ]);
    expect(claim.health).toBe("unhealthy");
    expect(
      jest
        .mocked(fetch)
        .mock.calls.every(
          (call) => !call[1]?.method || call[1]?.method === "GET",
        ),
    ).toBe(true);
  });

  it("rejects a non-advancing signal continuation cursor", async () => {
    jest.mocked(fetch).mockResolvedValue(
      jsonResponse({
        signals: [],
        fetchedAt: 1,
        recordCount: 0,
        totalCount: 1,
        hasMore: true,
        nextBefore: 1,
        nextCursor: "same-cursor",
        counts: {},
        source: "database",
        dataQuality: "signature-backed",
        reason: null,
        freshness: { isStale: false, staleAfterMs: 120000 },
        requestId: "request",
      }),
    );
    await expect(
      fetchSignals({ hours: 24, type: "All", cursor: "same-cursor" }),
    ).rejects.toThrow("non-advancing cursor");
  });

  it("loads only an exact public wallet and verifies response identity", async () => {
    const address = "11111111111111111111111111111111";
    jest
      .mocked(fetch)
      .mockResolvedValue(
        jsonResponse({
          wallet: {
            address,
            tokens: [],
            totalValueUsd: 0,
            tokenCount: 0,
            solBalance: 0,
            solValueUsd: 0,
          },
          ts: 1,
        }),
      );
    await fetchWalletHoldings(address);
    expect(jest.mocked(fetch).mock.calls[0]?.[0]).toBe(
      `https://terminal.example/api/wallet/${address}`,
    );
    await expect(
      fetchWalletHoldings("111111111111111111111111111111111"),
    ).rejects.toThrow("exactly 32 bytes");
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("observes feed inventory and diagnostics with GET only", async () => {
    jest
      .mocked(fetch)
      .mockResolvedValueOnce(
        jsonResponse({
          success: true,
          chain: "solana",
          generatedAt: 1,
          source: "runtime_provider_inventory",
          runtimeScope: "local-process",
          healthSummary: {
            healthy: 0,
            degraded: 0,
            unhealthy: 0,
            receiving: 0,
          },
          connections: [],
          runtime: {
            eventBus: {
              published: 0,
              persisted: 0,
              droppedDuplicates: 0,
              droppedInvalidTimestamps: 0,
              persistFailures: 0,
              persistenceDrops: 0,
              pendingPersistence: 0,
              lastEventAt: null,
            },
            onchainTicks: {
              received: 0,
              decoded: 0,
              persisted: 0,
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
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          generatedAt: 1,
          runtimeScope: "local-process",
          realtimeEvidence: { timestamp: null, timestampValid: false },
          quality: {
            rpc: "disconnected",
            websocket: "disconnected",
            eventPersistence: "healthy",
            decoder: "healthy",
          },
          persistenceEvidence: { status: "complete", error: null },
          observabilityEvidence: { status: "complete", error: null },
          replayEvidence: { status: "complete", error: null },
          actions: [],
          degraded: true,
        }),
      );
    await fetchFeedConnections();
    await fetchFeedDiagnostics();
    expect(jest.mocked(fetch).mock.calls.map((call) => call[0])).toEqual([
      "https://terminal.example/api/feed/connections",
      "https://terminal.example/api/feed/diagnostics?limit=20",
    ]);
    expect(
      jest
        .mocked(fetch)
        .mock.calls.every(
          (call) => !call[1]?.method || call[1]?.method === "GET",
        ),
    ).toBe(true);
  });
});
