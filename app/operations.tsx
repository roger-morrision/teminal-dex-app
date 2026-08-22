import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  fetchDiscovery,
  fetchFeedConnections,
  fetchFeedDiagnostics,
  fetchTopTraders,
} from "@/api/client";
import type { FeedConnectionsResponse, MarketToken } from "@/api/schema";
import { compactUsd, signedPercent, tokenPrice } from "@/lib/format";
import {
  feedCounterSnapshot,
  type FeedCounterSnapshot,
} from "@/lib/feed-recovery";
import { isSolanaAddress } from "@/security/input";
import { useSettings } from "@/settings/SettingsProvider";
import { colors, spacing } from "@/theme";

type Tab = "analytics" | "feed";
const emptyFilters = { dex: "All", minLiquidity: "", minMarketCap: "" };

export default function OperationsScreen() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const router = useRouter();
  const { t } = useSettings();
  const [tab, setTab] = useState<Tab>(
    params.tab === "feed" ? "feed" : "analytics",
  );
  const market = useQuery({
    queryKey: ["operations-market"],
    queryFn: ({ signal }) =>
      fetchDiscovery("trending", "24h", emptyFilters, undefined, signal),
    enabled: tab === "analytics",
    refetchInterval: 30_000,
  });
  const gainers = useQuery({
    queryKey: ["operations-gainers"],
    queryFn: ({ signal }) =>
      fetchDiscovery("gainers", "1h", emptyFilters, undefined, signal),
    enabled: tab === "analytics",
    refetchInterval: 30_000,
  });
  const fresh = useQuery({
    queryKey: ["operations-new-pairs"],
    queryFn: ({ signal }) =>
      fetchDiscovery("new-pairs", "24h", emptyFilters, undefined, signal),
    enabled: tab === "analytics",
    refetchInterval: 30_000,
  });
  const traders = useQuery({
    queryKey: ["operations-traders"],
    queryFn: ({ signal }) => fetchTopTraders("30D", signal),
    enabled: tab === "analytics",
    refetchInterval: 60_000,
  });
  const connections = useQuery({
    queryKey: ["feed-connections"],
    queryFn: ({ signal }) => fetchFeedConnections(signal),
    enabled: tab === "feed",
    refetchInterval: 30_000,
    retry: 1,
  });
  const diagnostics = useQuery({
    queryKey: ["feed-diagnostics"],
    queryFn: ({ signal }) => fetchFeedDiagnostics(signal),
    enabled: tab === "feed",
    refetchInterval: 30_000,
    retry: 1,
  });
  const refreshing = [
    market,
    gainers,
    fresh,
    traders,
    connections,
    diagnostics,
  ].some((query) => query.isRefetching);
  const refresh = () =>
    tab === "analytics"
      ? Promise.all([
          market.refetch(),
          gainers.refetch(),
          fresh.refetch(),
          traders.refetch(),
        ])
      : Promise.all([connections.refetch(), diagnostics.refetch()]);
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.accent}
          />
        }
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("backOperations")}
            onPress={() => router.back()}
            style={styles.back}
          >
            <Ionicons name="arrow-back" size={18} color={colors.text} />
          </Pressable>
          <View style={styles.flex}>
            <Text style={styles.eyebrow}>
              {t("readOnlyOperationalEvidence")}
            </Text>
            <Text accessibilityRole="header" style={styles.title}>
              {t("analyticsFeeds")}
            </Text>
          </View>
          <Text style={styles.readOnly}>{t("getOnly")}</Text>
        </View>
        <View accessibilityRole="summary" style={styles.notice}>
          <Ionicons name="shield-checkmark" size={15} color={colors.warning} />
          <Text style={styles.noticeText}>{t("operationsSafety")}</Text>
        </View>
        <View accessibilityRole="tablist" style={styles.tabs}>
          {(["analytics", "feed"] as const).map((item) => (
            <Pressable
              key={item}
              accessibilityRole="tab"
              accessibilityLabel={t("selectOperationsTab", {
                tab: item === "analytics" ? t("analytics") : t("feedData"),
              })}
              accessibilityState={{ selected: tab === item }}
              onPress={() => setTab(item)}
              style={[styles.tab, tab === item && styles.tabActive]}
            >
              <Text
                style={[styles.tabText, tab === item && styles.tabTextActive]}
              >
                {item === "analytics" ? t("analytics") : t("feedData")}
              </Text>
            </Pressable>
          ))}
        </View>
        {tab === "analytics" ? (
          <AnalyticsPanel
            market={market}
            gainers={gainers}
            fresh={fresh}
            traders={traders}
            onToken={(address) =>
              router.push({ pathname: "/token/[address]", params: { address } })
            }
          />
        ) : (
          <FeedPanel connections={connections} diagnostics={diagnostics} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

type MarketQuery = ReturnType<
  typeof useQuery<Awaited<ReturnType<typeof fetchDiscovery>>, Error>
>;
type TraderQuery = ReturnType<
  typeof useQuery<Awaited<ReturnType<typeof fetchTopTraders>>, Error>
>;
function AnalyticsPanel({
  market,
  gainers,
  fresh,
  traders,
  onToken,
}: {
  market: MarketQuery;
  gainers: MarketQuery;
  fresh: MarketQuery;
  traders: TraderQuery;
  onToken: (address: string) => void;
}) {
  const { t } = useSettings();
  const usable = useMemo(
    () =>
      (market.data?.tokens ?? []).filter((token) =>
        isSolanaAddress(token.address),
      ),
    [market.data],
  );
  const excluded = (market.data?.tokens.length ?? 0) - usable.length;
  const summary = useMemo(() => summarize(usable), [usable]);
  const leaders = (gainers.data?.tokens ?? [])
    .filter((token) => isSolanaAddress(token.address))
    .slice(0, 6);
  const newPairs = [
    ...new Map(
      (fresh.data?.tokens ?? [])
        .filter((token) => isSolanaAddress(token.address))
        .map((token) => [token.address, token]),
    ).values(),
  ].slice(0, 5);
  if (market.isLoading) return <State loading text={t("loadingAnalytics")} />;
  if (market.error && !usable.length)
    return <State error text={market.error.message} />;
  return (
    <View>
      <EvidenceBar
        warning={
          market.data?.freshness?.isStale === true ||
          Boolean(market.data?.error)
        }
        text={t("operationsEvidence", {
          source: market.data?.source ?? t("sourceUnavailable"),
          quality: market.data?.dataQuality ?? t("qualityUnavailable"),
          included: usable.length,
          excluded,
        })}
      />
      <View style={styles.kpis}>
        <Kpi label={t("tracked")} value={String(summary.count)} />
        <Kpi
          label={t("gainers")}
          value={`${summary.positivePct.toFixed(1)}%`}
        />
        <Kpi label={t("liquidity")} value={compactUsd(summary.liquidity)} />
        <Kpi label={t("hourVolume")} value={compactUsd(summary.volume)} />
      </View>
      <SectionTitle title={t("momentumLeaders")} detail={t("momentumDetail")} />
      {gainers.error ? (
        <InlineWarning text={gainers.error.message} />
      ) : (
        leaders.map((token) => (
          <MarketRow
            key={token.address}
            token={token}
            onOpen={() => onToken(token.address)}
          />
        ))
      )}
      {!leaders.length && !gainers.error ? (
        <Empty text={t("noMomentum")} />
      ) : null}
      <SectionTitle title={t("freshPairs")} detail={t("canonicalDedup")} />
      {fresh.error ? (
        <InlineWarning text={fresh.error.message} />
      ) : (
        newPairs.map((token) => (
          <MarketRow
            key={token.address}
            token={token}
            onOpen={() => onToken(token.address)}
          />
        ))
      )}
      {!newPairs.length && !fresh.error ? (
        <Empty text={t("noFreshPairs")} />
      ) : null}
      <SectionTitle
        title={t("historicalTraderActivity")}
        detail={t("thirtyDayObservation", {
          source: traders.data?.source ?? t("sourceUnavailable"),
        })}
      />
      {traders.error ? (
        <InlineWarning text={traders.error.message} />
      ) : (
        (traders.data?.traders ?? []).slice(0, 5).map((trader) => (
          <View key={trader.address} style={styles.trader}>
            <Text style={styles.rank}>#{trader.rank}</Text>
            <View style={styles.flex}>
              <Text style={styles.rowTitle}>
                {trader.address.slice(0, 5)}…{trader.address.slice(-4)}
              </Text>
              <Text style={styles.meta}>
                {t("indexedHistoricalWin", {
                  badge: trader.badge,
                  trades: trader.trades,
                  winRate: trader.winRate.toFixed(1),
                })}
              </Text>
            </View>
            <Text style={[styles.metric, trader.pnlUsd < 0 && styles.bad]}>
              {compactUsd(trader.pnlUsd)}
            </Text>
          </View>
        ))
      )}
      <Text accessibilityRole="summary" style={styles.boundary}>
        {t("analyticsBoundary")}
      </Text>
    </View>
  );
}

type ConnectionsQuery = ReturnType<
  typeof useQuery<Awaited<ReturnType<typeof fetchFeedConnections>>, Error>
>;
type DiagnosticsQuery = ReturnType<
  typeof useQuery<Awaited<ReturnType<typeof fetchFeedDiagnostics>>, Error>
>;
function FeedPanel({
  connections,
  diagnostics,
}: {
  connections: ConnectionsQuery;
  diagnostics: DiagnosticsQuery;
}) {
  const { t } = useSettings();
  const inventory = connections.data;
  const health = diagnostics.data;
  const currentCounters = feedCounterSnapshot(inventory);
  if (connections.isLoading && diagnostics.isLoading)
    return <State loading text={t("loadingFeedEvidence")} />;
  return (
    <View>
      {inventory ? (
        <EvidenceBar
          warning={
            inventory.healthSummary.degraded > 0 ||
            inventory.healthSummary.unhealthy > 0
          }
          text={t("feedEvidence", {
            scope: inventory.runtimeScope,
            age: ageLabel(inventory.generatedAt, t),
            receiving: inventory.healthSummary.receiving,
          })}
        />
      ) : null}
      {connections.error ? (
        <InlineWarning text={connections.error.message} />
      ) : null}
      {diagnostics.error ? (
        <InlineWarning text={diagnostics.error.message} />
      ) : null}
      {inventory ? (
        <View style={styles.kpis}>
          <Kpi
            label={t("healthy")}
            value={String(inventory.healthSummary.healthy)}
          />
          <Kpi
            label={t("degraded")}
            value={String(inventory.healthSummary.degraded)}
          />
          <Kpi
            label={t("unhealthy")}
            value={String(inventory.healthSummary.unhealthy)}
          />
          <Kpi
            label={t("receiving")}
            value={String(inventory.healthSummary.receiving)}
          />
        </View>
      ) : null}
      {health ? (
        <>
          <SectionTitle
            title={t("runtimeQuality")}
            detail={`${health.runtimeScope} · ${health.degraded ? t("degradedEvidence") : t("noReportedDegradation")}`}
          />
          <View style={styles.quality}>
            {Object.entries(health.quality as Record<string, string>).map(
              ([label, status]) => (
                <View key={label} style={styles.qualityItem}>
                  <Text style={styles.kpiLabel}>
                    {label.replace(/([A-Z])/g, " $1")}
                  </Text>
                  <Text
                    style={[
                      styles.qualityValue,
                      !["healthy", "receiving"].includes(status) && styles.warn,
                    ]}
                  >
                    {status.replaceAll("_", " ")}
                  </Text>
                </View>
              ),
            )}
          </View>
          <View style={styles.evidenceStates}>
            <Text style={styles.meta}>
              {t("persistenceEvidence", {
                status: health.persistenceEvidence.status,
              })}
            </Text>
            <Text style={styles.meta}>
              {t("observabilityEvidence", {
                status: health.observabilityEvidence.status,
              })}
            </Text>
            <Text style={styles.meta}>
              {t("replayEvidence", { status: health.replayEvidence.status })}
            </Text>
            <Text style={styles.meta}>
              {t("realtimeTimestamp", {
                timestamp: health.realtimeEvidence.timestampValid
                  ? (health.realtimeEvidence.timestamp ?? t("validUnavailable"))
                  : t("invalidUnavailable"),
              })}
            </Text>
          </View>
          {health.actions.slice(0, 5).map((action) => (
            <InlineWarning key={action} text={action} />
          ))}
        </>
      ) : null}
      {inventory ? (
        <FeedRuntimeRecovery
          response={inventory}
          counters={currentCounters}
          delta={inventory.counterDelta}
        />
      ) : null}
      <SectionTitle
        title={t("providerInventory")}
        detail={t("configurationNotDelivery")}
      />
      {inventory?.connections.map((item) => (
        <FeedConnectionCard key={item.id} item={item} />
      ))}
      {!inventory && !connections.error ? (
        <Empty text={t("noFeedInventory")} />
      ) : null}
      <SectionTitle
        title={t("recentIngestionJobs")}
        detail={t("durableNoControls")}
      />
      {inventory?.ingestionJobs.slice(0, 6).map((job) => (
        <View key={job.id} style={styles.job}>
          <View style={styles.flex}>
            <Text style={styles.rowTitle}>{job.jobType}</Text>
            <Text style={styles.meta}>
              {job.providerLabel} · {String(job.startedAt)}
            </Text>
          </View>
          <View>
            <Text
              style={[styles.status, job.status !== "completed" && styles.warn]}
            >
              {job.status}
            </Text>
            <Text style={styles.meta}>
              {t("jobOutcome", {
                processed: job.tokensProcessed,
                failed: job.tokensFailed,
              })}
            </Text>
          </View>
        </View>
      ))}
      {!inventory?.ingestionJobs.length ? (
        <Empty text={t("noIngestionJobs")} />
      ) : null}
      <Text accessibilityRole="summary" style={styles.boundary}>
        {t("feedBoundary")}
      </Text>
    </View>
  );
}

export function FeedRuntimeRecovery({
  response,
  counters,
  delta,
}: {
  response: FeedConnectionsResponse;
  counters: FeedCounterSnapshot | null;
  delta: FeedCounterSnapshot | null;
}) {
  const { t } = useSettings();
  const bus = response.runtime.eventBus;
  return (
    <View>
      <SectionTitle
        title={t("recoveryDrilldown")}
        detail={t("runtimeCountersBoundary")}
      />
      {counters ? (
        <View accessibilityRole="summary" style={styles.recoveryCard}>
          <Text style={styles.rowTitle}>{t("decodePipeline")}</Text>
          <Text
            style={[
              styles.meta,
              response.runtime.onchainTicks.quality !== "healthy" &&
                styles.warn,
            ]}
          >
            {t("decodePipelineState", {
              quality: response.runtime.onchainTicks.quality,
              cooldown: `${Math.ceil(response.runtime.onchainTicks.cooldownRemainingMs / 1000)}s`,
            })}
          </Text>
          <View style={styles.recoveryGrid}>
            {(Object.keys(counters) as (keyof FeedCounterSnapshot)[]).map(
              (key) => (
                <View key={key} style={styles.recoveryMetric}>
                  <Text style={styles.kpiLabel}>{t(`feedCounter_${key}`)}</Text>
                  <Text style={styles.qualityValue}>
                    {counters[key].toLocaleString()}
                    {delta ? ` · +${delta[key]}` : ""}
                  </Text>
                </View>
              ),
            )}
          </View>
          <Text style={styles.freshness}>
            {delta ? t("deltaSinceRefresh") : t("awaitingCounterBaseline")}
          </Text>
        </View>
      ) : (
        <Empty text={t("runtimeCountersUnavailable")} />
      )}
      <View accessibilityRole="summary" style={styles.recoveryCard}>
        <Text style={styles.rowTitle}>{t("eventPersistencePipeline")}</Text>
        <Text style={styles.meta}>
          {t("eventBusCounters", {
            published: bus.published,
            persisted: bus.persisted,
            duplicate: bus.droppedDuplicates,
            invalid: bus.droppedInvalidTimestamps,
          })}
        </Text>
        <Text style={styles.meta}>
          {t("persistencePressure", {
            failed: bus.persistFailures,
            dropped: bus.persistenceDrops,
            pending: bus.pendingPersistence,
          })}
        </Text>
        <Text style={styles.freshness}>
          {bus.lastEventAt
            ? ageLabel(Date.parse(bus.lastEventAt), t)
            : t("noRuntimeEvent")}
        </Text>
      </View>
    </View>
  );
}

export function FeedConnectionCard({
  item,
}: {
  item: FeedConnectionsResponse["connections"][number];
}) {
  const { t } = useSettings();
  const warning =
    item.health === "degraded" ||
    item.health === "unhealthy" ||
    item.records.freshness === "stale";
  return (
    <View
      accessibilityRole="summary"
      accessibilityLabel={t("persistedRecordsLabel", {
        label: item.label,
        health: item.health,
        count: item.records.total,
      })}
      style={styles.card}
    >
      <View style={styles.cardTop}>
        <View
          style={[
            styles.dot,
            { backgroundColor: warning ? colors.warning : colors.positive },
          ]}
        />
        <View style={styles.flex}>
          <Text style={styles.rowTitle}>{item.label}</Text>
          <Text style={styles.meta}>
            {t("connectionMeta", {
              method: item.method.toUpperCase(),
              delivery: item.deliveryStatus.replaceAll("_", " "),
              configuration: item.configured
                ? t("configured")
                : t("notConfigured"),
            })}
          </Text>
        </View>
        <Text style={[styles.status, warning && styles.warn]}>
          {item.health}
        </Text>
      </View>
      <View style={styles.recordLine}>
        <Text style={styles.meta}>
          {t("pairsCount", { count: item.records.pairs.toLocaleString() })}
        </Text>
        <Text style={styles.meta}>
          {t("transactionsCount", {
            count: item.records.transactions.toLocaleString(),
          })}
        </Text>
        <Text style={styles.meta}>
          {t("candlesCount", { count: item.records.candles.toLocaleString() })}
        </Text>
        <Text style={styles.metric}>{item.records.total.toLocaleString()}</Text>
      </View>
      <Text style={styles.freshness}>
        {item.records.freshness ?? t("freshnessUnavailable")} ·{" "}
        {item.records.lastPersistedAt
          ? ageLabel(item.records.lastPersistedAt, t)
          : t("noPersistedObservation")}
      </Text>
      {item.subscription || item.runtime ? (
        <View style={styles.connectionEvidence}>
          <Text style={styles.meta}>
            {t("subscriptionEvidence", {
              connected: item.subscription?.connected ? t("yes") : t("no"),
              count: item.subscription?.count ?? t("notApplicable"),
              receiving: item.subscription?.receiving ? t("yes") : t("no"),
            })}
          </Text>
          <Text style={styles.meta}>
            {t("lastRuntimeSuccess", {
              age: item.runtime?.lastSuccessAt
                ? ageLabel(Date.parse(item.runtime.lastSuccessAt), t)
                : t("unavailable"),
            })}
          </Text>
          {item.runtime?.lastError ? (
            <Text style={styles.warn}>
              {t("lastRuntimeError", { error: item.runtime.lastError })}
            </Text>
          ) : null}
        </View>
      ) : null}
      {item.rateLimit ? (
        <Text style={[styles.meta, item.rateLimit.coolingDown && styles.warn]}>
          {t("rateLimitEvidence", {
            requests: item.rateLimit.requests,
            limited: item.rateLimit.rateLimited,
            queued: item.rateLimit.queuedRequests,
            cooldown: item.rateLimit.coolingDown
              ? `${Math.ceil(item.rateLimit.cooldownRemainingMs / 1000)}s`
              : t("none"),
          })}
        </Text>
      ) : null}
    </View>
  );
}

function summarize(tokens: MarketToken[]) {
  const count = tokens.length;
  return {
    count,
    positivePct:
      (tokens.filter((token) => token.change1h > 0).length /
        Math.max(count, 1)) *
      100,
    liquidity: tokens.reduce(
      (sum, token) => sum + Math.max(0, token.liquidity),
      0,
    ),
    volume: tokens.reduce((sum, token) => sum + Math.max(0, token.volume1h), 0),
  };
}
function ageLabel(timestamp: number, t: ReturnType<typeof useSettings>["t"]) {
  if (!Number.isFinite(timestamp)) return t("timeUnavailable");
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  return seconds < 60
    ? t("secondsAgo", { count: seconds })
    : seconds < 3600
      ? t("minutesAgo", { count: Math.floor(seconds / 60) })
      : t("hoursAgo", { count: Math.floor(seconds / 3600) });
}
function MarketRow({
  token,
  onOpen,
}: {
  token: MarketToken;
  onOpen: () => void;
}) {
  const { t } = useSettings();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("openAnalytics", { symbol: token.symbol })}
      onPress={onOpen}
      style={styles.marketRow}
    >
      <View style={styles.flex}>
        <Text style={styles.rowTitle}>
          {token.symbol} · {token.name}
        </Text>
        <Text style={styles.meta}>
          {t("liquidityVolume", {
            liquidity: compactUsd(token.liquidity),
            volume: compactUsd(token.volume1h),
            dex: token.dex,
          })}
        </Text>
      </View>
      <View>
        <Text style={styles.metric}>{tokenPrice(token.price)}</Text>
        <Text style={[styles.change, token.change1h < 0 && styles.bad]}>
          {signedPercent(token.change1h)}
        </Text>
      </View>
    </Pressable>
  );
}
function EvidenceBar({ warning, text }: { warning: boolean; text: string }) {
  const { t } = useSettings();
  return (
    <View accessibilityRole="summary" style={styles.bar}>
      <Ionicons
        name={warning ? "warning" : "checkmark-circle"}
        size={13}
        color={warning ? colors.warning : colors.positive}
      />
      <Text style={styles.barText}>{text}</Text>
      <Text style={[styles.status, warning && styles.warn]}>
        {warning ? t("check") : t("current")}
      </Text>
    </View>
  );
}
function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.kpi}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.kpiValue}>
        {value}
      </Text>
    </View>
  );
}
function SectionTitle({ title, detail }: { title: string; detail: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.meta}>{detail}</Text>
    </View>
  );
}
function InlineWarning({ text }: { text: string }) {
  return (
    <View accessibilityRole="alert" style={styles.warningBox}>
      <Text style={styles.warningText}>{text}</Text>
    </View>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.meta}>{text}</Text>
    </View>
  );
}
export function State({
  loading,
  error,
  text,
}: {
  loading?: boolean;
  error?: boolean;
  text: string;
}) {
  return (
    <View
      accessible
      accessibilityRole={error ? "alert" : "summary"}
      accessibilityLiveRegion="polite"
      accessibilityState={loading ? { busy: true } : undefined}
      style={styles.state}
    >
      {loading ? (
        <ActivityIndicator color={colors.accent} />
      ) : (
        <Ionicons name="information-circle" size={20} color={colors.muted} />
      )}
      <Text style={styles.stateText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 90 },
  header: {
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  back: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
  },
  flex: { flex: 1 },
  eyebrow: {
    color: "#72c8ff",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  title: { color: colors.text, fontSize: 23, fontWeight: "900" },
  readOnly: {
    color: colors.warning,
    fontSize: 7,
    fontWeight: "900",
    borderWidth: 1,
    borderColor: "#5a4720",
    borderRadius: 7,
    padding: 6,
  },
  notice: {
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    flexDirection: "row",
    gap: spacing.sm,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#5a4720",
    backgroundColor: "#241d10",
  },
  noticeText: { flex: 1, color: colors.warning, fontSize: 9, lineHeight: 14 },
  tabs: {
    margin: spacing.lg,
    flexDirection: "row",
    padding: 4,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 9 },
  tabActive: { backgroundColor: colors.accentDim },
  tabText: { color: colors.muted, fontSize: 10, fontWeight: "800" },
  tabTextActive: { color: colors.accent },
  bar: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    backgroundColor: colors.surface,
  },
  barText: { flex: 1, color: colors.muted, fontSize: 8 },
  kpis: {
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  kpi: {
    flexGrow: 1,
    minWidth: "21%",
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  kpiLabel: { color: colors.muted, fontSize: 7, textTransform: "uppercase" },
  kpiValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
    marginTop: 4,
  },
  section: {
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: { color: colors.text, fontSize: 12, fontWeight: "900" },
  marketRow: {
    minHeight: 62,
    marginHorizontal: spacing.lg,
    marginBottom: 2,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  rowTitle: { color: colors.text, fontSize: 10, fontWeight: "900" },
  meta: { color: colors.muted, fontSize: 8, lineHeight: 12, marginTop: 2 },
  metric: {
    color: colors.text,
    fontSize: 10,
    fontWeight: "900",
    textAlign: "right",
  },
  change: {
    color: colors.positive,
    fontSize: 8,
    textAlign: "right",
    marginTop: 2,
  },
  bad: { color: colors.negative },
  trader: {
    marginHorizontal: spacing.lg,
    marginBottom: 2,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  rank: { width: 24, color: colors.muted, fontSize: 9, fontWeight: "900" },
  boundary: {
    color: colors.muted,
    fontSize: 8,
    lineHeight: 13,
    textAlign: "center",
    margin: spacing.xl,
  },
  warningBox: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: "#5a4720",
    borderRadius: 9,
    backgroundColor: "#241d10",
  },
  warningText: { color: colors.warning, fontSize: 8, lineHeight: 12 },
  empty: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
  },
  quality: {
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  recoveryCard: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  recoveryGrid: {
    marginTop: spacing.md,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  recoveryMetric: { minWidth: "29%", flexGrow: 1 },
  connectionEvidence: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    gap: 4,
  },
  qualityItem: {
    width: "48%",
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  qualityValue: {
    color: colors.positive,
    fontSize: 10,
    fontWeight: "900",
    marginTop: 4,
    textTransform: "uppercase",
  },
  warn: { color: colors.warning },
  evidenceStates: {
    margin: spacing.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    backgroundColor: colors.surface,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  dot: { width: 7, height: 7, borderRadius: 4 },
  status: {
    color: colors.positive,
    fontSize: 7,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  recordLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  freshness: { color: colors.muted, fontSize: 7, marginTop: 5 },
  job: {
    marginHorizontal: spacing.lg,
    marginBottom: 2,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  state: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.xl,
  },
  stateText: { color: colors.muted, textAlign: "center", lineHeight: 18 },
});
