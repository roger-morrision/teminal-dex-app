import { Ionicons } from "@expo/vector-icons";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchOhlcv, fetchTokenDetail, fetchTokenPanel, fetchTrackFeed } from "@/api/client";
import {
  tokenSchema,
  type MarketToken,
  type NarrativeResponse,
  type SecurityHistoryResponse,
  type SmartMoneyResponse,
  type SnipersResponse,
  type TrackFeedResponse,
  type TokenDetailResponse,
} from "@/api/schema";
import { PriceChart } from "@/components/PriceChart";
import { TokenAvatar } from "@/components/TokenAvatar";
import { compactUsd, evidenceLabel, observedDateTime, signedPercent, tokenPrice } from "@/lib/format";
import { aggregateWhaleActivity, whaleActivityForToken } from "@/lib/whale-activity";
import { colors, spacing } from "@/theme";
import { isSolanaAddress, parseBoundedJson } from "@/security/input";
import { useSettings } from "@/settings/SettingsProvider";

type Tab =
  "overview" | "whales" | "chart" | "holders" | "trades" | "risk" | "intel" | "pairs";
const tabs = [
  { id: "overview", key: "overview" },
  { id: "whales", key: "whaleActivity" },
  { id: "risk", key: "risk" },
  { id: "chart", key: "chart" },
  { id: "trades", key: "trades" },
  { id: "holders", key: "holdersTab" },
  { id: "intel", key: "intel" },
  { id: "pairs", key: "pairs" },
] as const;
const timeframes = ["5m", "15m", "1h", "4h", "1d"] as const;

export default function TokenDetail() {
  const router = useRouter();
  const { t } = useSettings();
  const { address, snapshot } = useLocalSearchParams<{
    address: string;
    snapshot?: string;
  }>();
  const validAddress = isSolanaAddress(address);
  const snapshotResult = tokenSchema.safeParse(parseBoundedJson(snapshot));
  const snapshotMatches =
    snapshotResult.success && snapshotResult.data.address === address;
  const [tab, setTab] = React.useState<Tab>("overview");
  const [timeframe, setTimeframe] =
    React.useState<(typeof timeframes)[number]>("1h");
  const detail = useQuery({
    queryKey: ["token-detail", address],
    queryFn: ({ signal }) => fetchTokenDetail(address, signal),
    enabled: validAddress,
    retry: 2,
  });
  const chart = useQuery({
    queryKey: ["ohlcv", address, timeframe],
    queryFn: ({ signal }) => fetchOhlcv(address, timeframe, signal),
    enabled: validAddress && tab === "chart",
  });
  const whaleActivity = useQuery({
    queryKey: ["whale-activity", "token", address],
    queryFn: ({ signal }) => fetchTrackFeed(signal),
    enabled: validAddress && tab === "whales",
  });
  const holders = useQuery({
    queryKey: ["token-panel", address, "holders"],
    queryFn: ({ signal }) => fetchTokenPanel(address, "holders", signal),
    enabled: validAddress && tab === "holders",
  });
  const bubble = useQuery({
    queryKey: ["token-panel", address, "bubble"],
    queryFn: ({ signal }) => fetchTokenPanel(address, "bubble", signal),
    enabled: validAddress && tab === "holders",
  });
  const trades = useQuery({
    queryKey: ["token-panel", address, "txns"],
    queryFn: ({ signal }) => fetchTokenPanel(address, "txns", signal),
    enabled: validAddress && tab === "trades",
  });
  const manipulation = useQuery({
    queryKey: ["token-panel", address, "manipulation"],
    queryFn: ({ signal }) => fetchTokenPanel(address, "manipulation", signal),
    enabled: validAddress && tab === "trades",
  });
  const snipers = useQuery({
    queryKey: ["token-panel", address, "snipers"],
    queryFn: ({ signal }) => fetchTokenPanel(address, "snipers", signal),
    enabled: validAddress && tab === "trades",
  });
  const risk = useQuery({
    queryKey: ["token-panel", address, "risk"],
    queryFn: ({ signal }) => fetchTokenPanel(address, "risk", signal),
    enabled: validAddress && tab === "risk",
  });
  const securityHistory = useQuery({
    queryKey: ["token-panel", address, "security-history"],
    queryFn: ({ signal }) =>
      fetchTokenPanel(address, "security-history", signal),
    enabled: validAddress && tab === "risk",
  });
  const narrative = useQuery({
    queryKey: ["token-panel", address, "narrative"],
    queryFn: ({ signal }) => fetchTokenPanel(address, "narrative", signal),
    enabled: validAddress && tab === "intel",
  });
  const smartMoney = useQuery({
    queryKey: ["token-panel", address, "smart-money"],
    queryFn: ({ signal }) => fetchTokenPanel(address, "smart-money", signal),
    enabled: validAddress && tab === "intel",
  });
  const pairs = useQuery({
    queryKey: ["token-panel", address, "pairs"],
    queryFn: ({ signal }) => fetchTokenPanel(address, "pairs", signal),
    enabled: validAddress && tab === "pairs",
  });
  const token = validAddress
    ? (detail.data?.token ?? (snapshotMatches ? snapshotResult.data : null))
    : null;

  if (!validAddress)
    return (
      <SafeAreaView style={styles.safe}>
        <PanelState
          error
          title={t("invalidLink")}
          message={t("invalidTokenLink")}
        />
      </SafeAreaView>
    );
  if (!token && detail.isLoading)
    return (
      <SafeAreaView style={styles.safe}>
        <PanelState loading message={t("loadingToken")} />
      </SafeAreaView>
    );
  if (!token)
    return (
      <SafeAreaView style={styles.safe}>
        <PanelState
          error
          title={t("tokenUnavailable")}
          message={detail.error ? t("evidenceLoadFailed") : t("noTokenRecord")}
          retrying={detail.isFetching}
          onRetry={() => detail.refetch()}
        />
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        stickyHeaderIndices={[2]}
        contentContainerStyle={styles.content}
      >
        <View style={styles.top}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("goBack")}
            onPress={() => router.back()}
            style={styles.back}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.address} numberOfLines={1}>
            {address}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("refreshToken")}
            accessibilityState={{ busy: detail.isFetching, disabled: detail.isFetching }}
            disabled={detail.isFetching}
            onPress={() => detail.refetch()}
            style={[styles.back, detail.isFetching && styles.disabled]}
          >
            <Ionicons name="refresh" size={18} color={colors.text} />
          </Pressable>
        </View>
        <View style={styles.hero}>
          <View style={styles.heroIdentity}>
            <TokenAvatar symbol={token.symbol} identity={token.address} imageUrl={token.imageUrl} size={46} accessibilityLabel={t("tokenLogo", { symbol: token.symbol })} fallbackAccessibilityLabel={t("tokenLogoFallback", { symbol: token.symbol })} />
            <View style={styles.heroCopy}>
            <Text style={styles.symbol}>{token.symbol}</Text>
            <Text style={styles.name}>
              {token.name} · {evidenceLabel(token.dex, t("unknownDex"))}
            </Text>
            <Text style={styles.price}>{tokenPrice(token.price)}</Text>
            <Text
              style={[
                styles.change,
                {
                  color:
                    token.change24h >= 0 ? colors.positive : colors.negative,
                },
              ]}
            >
              {signedPercent(token.change24h)} · {t("dayChange")}
            </Text>
            </View>
          </View>
          <EvidenceBadge degraded={Boolean(detail.data?.degraded)} />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsSurface}
          contentContainerStyle={styles.tabs}
        >
          {tabs.map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="tab"
              accessibilityLabel={t("selectTokenTab", { tab: t(item.key) })}
              accessibilityState={{ selected: tab === item.id }}
              onPress={() => setTab(item.id)}
              style={[styles.tab, tab === item.id && styles.activeTab]}
            >
              <Text
                style={[
                  styles.tabText,
                  tab === item.id && styles.activeTabText,
                ]}
              >
                {t(item.key)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        {tab === "overview" ? (
          <Overview
            token={token}
            detail={detail.data}
            refreshError={detail.isError ? t("evidenceLoadFailed") : null}
            refreshBusy={detail.isFetching}
            onRetry={() => detail.refetch()}
          />
        ) : null}
        {tab === "whales" ? (
          <WhaleEvidencePanel address={address} query={whaleActivity} />
        ) : null}
        {tab === "chart" ? (
          <ChartPanel
            query={chart}
            timeframe={timeframe}
            onTimeframe={setTimeframe}
          />
        ) : null}
        {tab === "holders" ? (
          <>
            <AsyncPanel query={holders}>
              {(data) => (
                <>
                  <EvidenceLine
                    label={t("holderSource")}
                    value={evidenceLabel(data.source, t("unavailable"))}
                  />
                  <Text style={styles.sectionTitle}>{t("largestHolders")}</Text>
                  {data.holders.slice(0, 30).map((holder) => (
                    <DataRow
                      key={holder.address}
                      title={`#${holder.rank} ${short(holder.address)}`}
                      value={`${holder.pct.toFixed(2)}%`}
                      detail={`${holder.uiAmount.toLocaleString()} ${t("tokens").toLowerCase()}`}
                    />
                  ))}
                  <Limitation text={t("holderLimitation")} />
                </>
              )}
            </AsyncPanel>
            <AsyncPanel query={bubble}>
              {(data) => (
                <>
                  <Text style={styles.sectionTitle}>{t("holderClusters")}</Text>
                  <EvidenceLine
                    label={t("graphSource")}
                    value={data.provenance.graphSource}
                  />
                  <EvidenceLine
                    label={t("edgeSemantics")}
                    value={data.edgeSemantics}
                  />
                  <EvidenceLine
                    label={t("observedEdges")}
                    value={String(data.edges.length)}
                  />
                  <EvidenceLine
                    label={t("observedNodes")}
                    value={String(data.nodes.length)}
                  />
                  {data.nodes
                    .filter((node) => node.label)
                    .slice(0, 10)
                    .map((node) => (
                      <DataRow
                        key={node.address}
                        title={node.label ?? t("unknown")}
                        value={`${node.pct.toFixed(2)}%`}
                        detail={`${short(node.address)} · ${node.source}`}
                      />
                    ))}
                  {Object.entries(data.providerEvidence)
                    .slice(0, 10)
                    .map(([provider, evidence]) => (
                      <DataRow
                        key={provider}
                        title={provider}
                        value={evidence.status}
                        detail={evidence.limitation ?? evidence.role}
                      />
                    ))}
                  <Limitation
                    text={t("clusterLimitation", {
                      history: data.completeness.transactionHistory,
                    })}
                  />
                </>
              )}
            </AsyncPanel>
          </>
        ) : null}
        {tab === "trades" ? (
          <>
            <AsyncPanel query={trades}>
              {(data) => (
                <>
                  <EvidenceLine
                    label={t("dataQuality")}
                    value={data.dataQuality}
                  />
                  <EvidenceLine
                    label={t("freshness")}
                    value={evidenceLabel(data.quality?.freshness, t("unavailable"))}
                  />
                  <Text style={styles.sectionTitle}>
                    {t("observedTransactions")}
                  </Text>
                  {data.txns.slice(0, 50).map((trade) => (
                    <DataRow
                      key={trade.signature}
                      title={`${trade.type.toUpperCase()} · ${compactUsd(trade.amountUsd)}`}
                      value={trade.finality}
                      detail={`${short(trade.feePayer)} · ${trade.source}`}
                      tone={trade.type === "buy" ? "positive" : "negative"}
                    />
                  ))}
                  <Limitation text={t("tradeHistoryLimitation")} />
                </>
              )}
            </AsyncPanel>
            <AsyncPanel query={manipulation}>
              {(data) => (
                <>
                  <Text style={styles.sectionTitle}>
                    {t("behaviorEvidence")}
                  </Text>
                  <View style={styles.score} accessibilityRole="summary">
                    <Text style={styles.scoreValue}>{data.score}</Text>
                    <View>
                      <Text style={styles.scoreLabel}>
                        {t("observedBehaviorScore")}
                      </Text>
                      <Text style={styles.riskLevel}>{data.level}</Text>
                    </View>
                  </View>
                  <EvidenceLine
                    label={t("indexedSwaps")}
                    value={data.metrics.indexedSwaps.toLocaleString()}
                  />
                  <EvidenceLine
                    label={t("indexedWallets")}
                    value={data.metrics.indexedWallets.toLocaleString()}
                  />
                  <EvidenceLine
                    label={t("roundTripWalletShare")}
                    value={`${data.metrics.roundTripWalletSharePct.toFixed(1)}%`}
                  />
                  <EvidenceLine
                    label={t("topTraderVolumeShare")}
                    value={`${data.metrics.topTraderVolumeSharePct.toFixed(1)}%`}
                  />
                  {data.flags.map((flag) => (
                    <DataRow
                      key={flag}
                      title={flag}
                      value={t("observedFlag")}
                      detail={data.provenance.method}
                    />
                  ))}
                  {data.evidence.concentratedTraders.slice(0, 5).map((item) => (
                    <DataRow
                      key={item.wallet}
                      title={short(item.wallet)}
                      value={`${item.sharePct.toFixed(1)}%`}
                      detail={compactUsd(item.volumeUsd)}
                    />
                  ))}
                  {data.provenance.limitations.map((limitation) => (
                    <Limitation key={limitation} text={limitation} />
                  ))}
                  <Limitation
                    text={t("behaviorLimitation", {
                      unavailable: data.unavailable.join(", ") || t("none"),
                    })}
                  />
                </>
              )}
            </AsyncPanel>
            <AsyncPanel query={snipers}>
              {(data) => <EarlyBuyerEvidence data={data} />}
            </AsyncPanel>
          </>
        ) : null}
        {tab === "risk" ? (
          <>
            <AsyncPanel query={risk}>
              {(data) => (
                <>
                  <View style={styles.score}>
                    <Text style={styles.scoreValue}>
                      {data.riskScore.score}
                    </Text>
                    <View>
                      <Text style={styles.scoreLabel}>{t("safetyScore")}</Text>
                      <Text style={styles.riskLevel}>
                        {data.riskScore.riskLevel}
                      </Text>
                    </View>
                  </View>
                  {data.riskScore.factors.map((factor) => (
                    <DataRow
                      key={`${factor.name}-${factor.scoreImpact}`}
                      title={factor.name}
                      value={factor.impact}
                      detail={factor.description}
                      tone={
                        factor.impact === "CRITICAL" || factor.impact === "HIGH"
                          ? "negative"
                          : undefined
                      }
                    />
                  ))}
                  <Limitation text={t("riskLimitation")} />
                </>
              )}
            </AsyncPanel>
            <AsyncPanel query={securityHistory}>
              {(data) => <SecurityHistoryEvidence data={data} />}
            </AsyncPanel>
          </>
        ) : null}
        {tab === "intel" ? (
          <IntelPanel narrative={narrative} smartMoney={smartMoney} />
        ) : null}
        {tab === "pairs" ? (
          <AsyncPanel query={pairs}>
            {(data) => (
              <>
                <EvidenceLine
                  label={t("dataQuality")}
                  value={data.dataQuality}
                />
                {data.pairs.map((pair) => (
                  <DataRow
                    key={pair.pairAddress}
                    title={`${evidenceLabel(pair.source, t("unavailable"))} · ${evidenceLabel(pair.quoteSymbol, t("unknown"))}`}
                    value={compactUsd(pair.liquidityUsd)}
                    detail={`${compactUsd(pair.volume24hUsd)} ${t("volume").toLowerCase()} · ${pair.freshness}`}
                  />
                ))}
                <Limitation
                  text={
                    data.quality?.limitation ?? t("reportedDepthLimitation")
                  }
                />
              </>
            )}
          </AsyncPanel>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

export function EarlyBuyerEvidence({ data }: { data: SnipersResponse }) {
  const { t, language } = useSettings();
  return (
    <>
      <Text style={styles.sectionTitle}>{t("earlyBuyers")}</Text>
      <EvidenceLine
        label={t("observedEarlyBuyers")}
        value={String(data.snipers.length)}
      />
      {data.snipers.map((item) => (
        <DataRow
          key={`${item.address}-${item.boughtAt}`}
          title={short(item.address)}
          value={t("secondsAfterPair", { seconds: item.delaySec.toFixed(1) })}
          detail={observedDateTime(item.boughtAt, language, t("timeUnavailable"))}
        />
      ))}
      <Limitation text={t("earlyBuyerLimitation")} />
    </>
  );
}

export function SecurityHistoryEvidence({
  data,
}: {
  data: SecurityHistoryResponse;
}) {
  const { t, language } = useSettings();
  return (
    <>
      <Text style={styles.sectionTitle}>{t("securityHistory")}</Text>
      <EvidenceLine label={t("dataQuality")} value={data.dataQuality} />
      <EvidenceLine label={t("observedSnapshots")} value={String(data.count)} />
      {data.snapshots.slice(0, 10).map((snapshot) => {
        const flags = snapshot.evidence.securityRiskFlags ?? [];
        const authority = snapshot.evidence.isMintRenounced
          ? t("mintRenounced")
          : t("mintAuthorityPresent");
        return (
          <DataRow
            key={snapshot.id}
            title={`${snapshot.source} · ${observedDateTime(snapshot.observedAt, language, t("timeUnavailable"))}`}
            value={
              snapshot.evidence.isHoneypot === true
                ? t("honeypotObserved")
                : flags.join(", ") || t("noProviderFlags")
            }
            detail={`${authority} · ${snapshot.evidence.isFreezeRenounced ? t("freezeRenounced") : t("freezeAuthorityPresent")}`}
            tone={
              snapshot.evidence.isHoneypot === true || flags.length
                ? "negative"
                : undefined
            }
          />
        );
      })}
      <Limitation text={t("securityHistoryLimitation")} />
    </>
  );
}

function WhaleEvidencePanel({
  address,
  query,
}: {
  address: string;
  query: UseQueryResult<TrackFeedResponse, Error>;
}) {
  const { t, language } = useSettings();
  if (query.isLoading) return <PanelState loading message={t("loadingWhaleActivity")} />;
  if (query.isError) return <PanelState error message={t("evidenceLoadFailed")} retrying={query.isFetching} onRetry={() => query.refetch()} />;
  const events = whaleActivityForToken(query.data?.notifications ?? [], address);
  const flow = aggregateWhaleActivity(events)[0];
  const historical = Boolean(
    query.data?.evidenceWindow?.smartMoneyHistorical ||
      query.data?.evidenceWindow?.whaleTransactionsHistorical,
  );
  return (
    <View style={styles.panel}>
      <Text style={styles.sectionTitle}>{t("tokenWhaleChronology")}</Text>
      <Text style={styles.body}>
        {t("tokenWhaleChronologyBoundary", {
          scope: historical ? t("historicalEvidence") : t("whaleMode_live"),
        })}
      </Text>
      {flow ? (
        <View style={styles.grid}>
          <Metric label={t("whaleNetFlow")} value={`${flow.netUsd >= 0 ? "+" : ""}${compactUsd(flow.netUsd)}`} />
          <Metric label={t("uniqueWallets")} value={String(flow.uniqueWallets)} />
          <Metric label={t("whaleBuys")} value={`${flow.buys} · ${compactUsd(flow.buyUsd)}`} />
          <Metric label={t("whaleSells")} value={`${flow.sells} · ${compactUsd(flow.sellUsd)}`} />
        </View>
      ) : null}
      {!events.length ? (
        <PanelState message={t("noTokenWhaleEvidence")} />
      ) : (
        events.map((event) => {
          const buy = event.type === "whale_buy" || event.type === "smart_buy";
          return (
            <DataRow
              key={event.id}
              title={`${t(buy ? "whaleBuy" : "whaleSell")} · ${event.amountUsd == null ? "—" : compactUsd(event.amountUsd)}`}
              value={observedDateTime(event.observedAt, language, t("timeUnavailable"))}
              detail={`${event.wallet ? short(event.wallet) : t("classifiedWallet")} · ${event.source} · ${event.dataQuality}`}
              tone={buy ? "positive" : "negative"}
            />
          );
        })
      )}
      <Limitation text={t("tokenWhaleEvidenceLimitation")} />
    </View>
  );
}

function Overview({
  token,
  detail,
  refreshError,
  refreshBusy,
  onRetry,
}: {
  token: MarketToken;
  detail?: TokenDetailResponse;
  refreshError: string | null;
  refreshBusy: boolean;
  onRetry: () => void;
}) {
  const { t } = useSettings();
  return (
    <View style={styles.panel}>
      <View style={styles.grid}>
        <Metric label={t("marketCap")} value={compactUsd(token.marketCap)} />
        <Metric label={t("liquidity")} value={compactUsd(token.liquidity)} />
        <Metric
          label={`24h ${t("volume").toLowerCase()}`}
          value={compactUsd(token.volume24h)}
        />
        <Metric
          label={t("holdersTab")}
          value={token.holderCount?.toLocaleString() ?? "—"}
        />
        <Metric
          label={t("largestHolders")}
          value={
            token.topHolderPct == null
              ? "—"
              : `${token.topHolderPct.toFixed(1)}%`
          }
        />
        <Metric
          label={t("snipers")}
          value={
            token.sniperPct == null ? "—" : `${token.sniperPct.toFixed(1)}%`
          }
        />
      </View>
      <View style={styles.evidence}>
        <Text style={styles.sectionTitle}>{t("dataEvidence")}</Text>
        <EvidenceLine
          label={t("source")}
          value={evidenceLabel(token.source, t("unavailable"))}
        />
        <EvidenceLine
          label={t("quality")}
          value={evidenceLabel(token.dataQuality, t("unavailable"))}
        />
        <EvidenceLine
          label={t("priceAutomation")}
          value={
            detail?.priceEvidence?.safeForAutomation === true
              ? t("verifiedReady")
              : t("notVerified")
          }
          warning={detail?.priceEvidence?.safeForAutomation !== true}
        />
        <EvidenceLine
          label={t("securityAutomation")}
          value={
            detail?.securityEvidence?.safeForAutomation === true
              ? t("verifiedReady")
              : t("notVerified")
          }
          warning={detail?.securityEvidence?.safeForAutomation !== true}
        />
      </View>
      {refreshError ? (
        <Limitation
          text={t("liveRefreshFailed", { error: refreshError })}
          action={t("retry")}
          actionBusy={refreshBusy}
          onAction={onRetry}
        />
      ) : null}
      <Limitation text={t("tradingLocked")} />
    </View>
  );
}

function ChartPanel({
  query,
  timeframe,
  onTimeframe,
}: {
  query: UseQueryResult<Awaited<ReturnType<typeof fetchOhlcv>>, Error>;
  timeframe: (typeof timeframes)[number];
  onTimeframe: (value: (typeof timeframes)[number]) => void;
}) {
  const { t } = useSettings();
  return (
    <View style={styles.panel}>
      <View accessibilityRole="radiogroup" style={styles.timeframes}>
        {timeframes.map((item) => (
          <Pressable
            accessibilityRole="radio"
            accessibilityLabel={t("selectTimeframe", { timeframe: item })}
            accessibilityState={{ checked: timeframe === item }}
            key={item}
            onPress={() => onTimeframe(item)}
            style={[styles.timeframe, timeframe === item && styles.activeTab]}
          >
            <Text
              style={[
                styles.tabText,
                timeframe === item && styles.activeTabText,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>
      {query.data ? (
        <PriceChart data={query.data} />
      ) : (
        <PanelState
          loading={query.isLoading}
          error={query.isError}
          title={query.isError ? t("chartUnavailable") : undefined}
          message={query.error ? t("chartUnavailable") : t("loadingCandles")}
          retrying={query.isFetching}
          onRetry={() => query.refetch()}
        />
      )}
    </View>
  );
}

function IntelPanel({
  narrative,
  smartMoney,
}: {
  narrative: UseQueryResult<NarrativeResponse, Error>;
  smartMoney: UseQueryResult<SmartMoneyResponse, Error>;
}) {
  const { t } = useSettings();
  if (narrative.isLoading || smartMoney.isLoading)
    return <PanelState loading message={t("loadingIntelligence")} />;
  return (
    <View style={styles.panel}>
      {narrative.data ? (
        <>
          <Text style={styles.sectionTitle}>
            {narrative.data.narrative.primary}
          </Text>
          <Text style={styles.body}>
            {narrative.data.narrative.description}
          </Text>
          <EvidenceLine
            label={t("confidence")}
            value={`${narrative.data.narrative.confidence.toFixed(0)}%`}
          />
          <EvidenceLine
            label={t("methodSources")}
            value={
              narrative.data.narrative.sources.join(", ") || t("unavailable")
            }
          />
        </>
      ) : (
        <Limitation
          text={t("narrativeUnavailable")}
        />
      )}
      <Text style={styles.sectionTitle}>{t("smartMoneySignals")}</Text>
      {smartMoney.data?.signals.length ? (
        smartMoney.data.signals.map((signal, index) => (
          <DataRow
            key={`${signal.wallet}-${index}`}
            title={`${signal.action} · ${short(signal.wallet)}`}
            value={`${signal.confidence}%`}
            detail={
              signal.evidence[0]?.description ?? t("noEvidenceDescription")
            }
            tone={signal.action === "accumulate" ? "positive" : "negative"}
          />
        ))
      ) : (
        <Limitation
          text={t("noSmartMoneySignals")}
        />
      )}
      <Limitation text={t("intelligenceLimitation")} />
    </View>
  );
}

function AsyncPanel<T>({
  query,
  children,
}: {
  query: UseQueryResult<T, Error>;
  children: (data: T) => React.ReactNode;
}) {
  const { t } = useSettings();
  if (query.isLoading)
    return <PanelState loading message={t("loadingBackendData")} />;
  if (query.isError || !query.data)
    return (
      <PanelState
        error
        title={t("dataUnavailable")}
        message={query.error ? t("evidenceLoadFailed") : t("noValidatedResponse")}
        retrying={query.isFetching}
        onRetry={() => query.refetch()}
      />
    );
  return <View style={styles.panel}>{children(query.data)}</View>;
}
export function PanelState({
  loading,
  error,
  title,
  message,
  retrying = false,
  onRetry,
}: {
  loading?: boolean;
  error?: boolean;
  title?: string;
  message: string;
  retrying?: boolean;
  onRetry?: () => void;
}) {
  const { t } = useSettings();
  return (
    <View
      accessible
      accessibilityRole={error ? "alert" : "summary"}
      accessibilityLiveRegion="polite"
      accessibilityState={loading ? { busy: true } : undefined}
      style={styles.state}
    >
      {loading ? <ActivityIndicator color={colors.accent} /> : null}
      {title ? <Text style={styles.emptyTitle}>{title}</Text> : null}
      <Text style={styles.name}>{message}</Text>
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("retry")}
          accessibilityState={{ busy: retrying, disabled: retrying }}
          disabled={retrying}
          style={[styles.retry, retrying && styles.disabled]}
          onPress={onRetry}
        >
          <Text style={styles.retryTextDark}>{t("retry")}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}
function EvidenceBadge({ degraded }: { degraded: boolean }) {
  const { t } = useSettings();
  return (
    <View
      accessibilityRole="summary"
      style={[styles.badge, degraded && styles.badgeWarning]}
    >
      <View style={[styles.badgeDot, degraded && styles.badgeDotWarning]} />
      <Text style={styles.badgeText}>
        {degraded ? t("degraded") : t("liveDetail")}
      </Text>
    </View>
  );
}
function EvidenceLine({
  label,
  value,
  warning,
}: {
  label: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <View style={styles.evidenceRow}>
      <Text style={styles.evidenceLabel}>{label}</Text>
      <Text
        style={[styles.evidenceValue, warning && styles.warning]}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}
function DataRow({
  title,
  value,
  detail,
  tone,
}: {
  title: string;
  value: string;
  detail: string;
  tone?: "positive" | "negative";
}) {
  return (
    <View style={styles.dataRow}>
      <View style={styles.dataMain}>
        <Text style={styles.dataTitle}>{title}</Text>
        <Text style={styles.dataDetail} numberOfLines={2}>
          {detail}
        </Text>
      </View>
      <Text
        style={[
          styles.dataValue,
          tone === "positive" && styles.positive,
          tone === "negative" && styles.negative,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}
export function Limitation({
  text,
  action,
  actionBusy = false,
  onAction,
}: {
  text: string;
  action?: string;
  actionBusy?: boolean;
  onAction?: () => void;
}) {
  return (
    <View accessibilityRole="summary" style={styles.notice}>
      <Ionicons name="information-circle" color={colors.warning} size={18} />
      <Text style={styles.noticeText}>{text}</Text>
      {action && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={action}
          accessibilityState={{ busy: actionBusy, disabled: actionBusy }}
          disabled={actionBusy}
          onPress={onAction}
          style={actionBusy && styles.disabled}
        >
          <Text style={styles.retryText}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
function short(value: string | null | undefined) {
  return value ? `${value.slice(0, 5)}…${value.slice(-4)}` : "unknown";
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 60 },
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  address: { flex: 1, color: colors.muted, fontSize: 11 },
  hero: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  heroIdentity: { flex: 1, minWidth: 220, flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  heroCopy: { flex: 1 },
  symbol: { color: colors.text, fontSize: 36, fontWeight: "900" },
  name: { color: colors.muted, marginTop: 3 },
  price: {
    color: colors.text,
    fontSize: 25,
    fontWeight: "800",
    marginTop: spacing.lg,
  },
  change: { fontWeight: "800", marginTop: spacing.xs },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
  },
  badgeWarning: { borderColor: "#5a4824" },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  badgeDotWarning: { backgroundColor: colors.warning },
  badgeText: { color: colors.muted, fontSize: 8, fontWeight: "900" },
  tabsSurface: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabs: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  tab: { minHeight: 44, justifyContent: "center", paddingHorizontal: 11, paddingVertical: 8, borderRadius: 9 },
  activeTab: { backgroundColor: colors.accent },
  tabText: { color: colors.muted, fontSize: 10, fontWeight: "800" },
  activeTabText: { color: colors.background },
  panel: { padding: spacing.lg },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  metric: {
    minWidth: 140,
    flexBasis: "46%",
    flexGrow: 1,
    padding: spacing.lg,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricLabel: { color: colors.muted, fontSize: 11 },
  metricValue: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
    marginTop: 8,
  },
  evidence: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  body: { color: colors.muted, lineHeight: 20, marginBottom: spacing.md },
  evidenceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  evidenceLabel: { color: colors.muted, fontSize: 11 },
  evidenceValue: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 120,
    textAlign: "right",
    color: colors.text,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  warning: { color: colors.warning },
  state: {
    minHeight: 280,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: "800" },
  retry: {
    minHeight: 44,
    justifyContent: "center",
    backgroundColor: colors.accent,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  disabled: { opacity: 0.55 },
  retryTextDark: { color: colors.background, fontWeight: "900" },
  retryText: { color: colors.accent, fontWeight: "900" },
  timeframes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  timeframe: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9,
    backgroundColor: colors.surface,
  },
  dataRow: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  dataMain: { flex: 1 },
  dataTitle: { color: colors.text, fontSize: 12, fontWeight: "800" },
  dataDetail: {
    color: colors.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },
  dataValue: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "capitalize",
    maxWidth: 95,
    textAlign: "right",
  },
  positive: { color: colors.positive },
  negative: { color: colors.negative },
  notice: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: 14,
    backgroundColor: "#2d2715",
    marginTop: spacing.xl,
  },
  noticeText: {
    flex: 1,
    minWidth: 180,
    color: colors.warning,
    fontSize: 11,
    lineHeight: 17,
  },
  score: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  scoreValue: { color: colors.text, fontSize: 48, fontWeight: "900" },
  scoreLabel: {
    color: colors.muted,
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: "900",
  },
  riskLevel: {
    color: colors.warning,
    fontSize: 17,
    fontWeight: "900",
    marginTop: 3,
  },
});
