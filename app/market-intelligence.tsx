import { Ionicons } from "@expo/vector-icons";
import {
  useInfiniteQuery,
  useQuery,
  type InfiniteData,
  type UseInfiniteQueryResult,
} from "@tanstack/react-query";
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
  fetchClaimMonitor,
  fetchHeatmap,
  fetchSignals,
  type SignalFilter,
} from "@/api/client";
import type {
  ClaimMonitorResponse,
  MarketSignal,
  SignalsResponse,
} from "@/api/schema";
import { compactUsd, signedPercent } from "@/lib/format";
import { isSolanaAddress } from "@/security/input";
import { colors, spacing } from "@/theme";
import { useSettings } from "@/settings/SettingsProvider";

type Tab = "signals" | "heatmap" | "claims";
const tabs = [
  { id: "signals", key: "signals" },
  { id: "heatmap", key: "heatmap" },
  { id: "claims", key: "claims" },
] as const;
const filters: SignalFilter[] = [
  "All",
  "On-chain Buy",
  "On-chain Sell",
  "Smart Buy",
  "Smart Sell",
  "Dev Sell",
  "Whale Move",
];

export default function MarketIntelligenceScreen() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const router = useRouter();
  const { t } = useSettings();
  const initial = tabs.some((item) => item.id === params.tab)
    ? (params.tab as Tab)
    : "signals";
  const [tab, setTab] = useState<Tab>(initial);
  const [type, setType] = useState<SignalFilter>("All");
  const [hours, setHours] = useState<24 | 168>(24);
  const signals = useInfiniteQuery({
    queryKey: ["market-signals", hours, type],
    queryFn: ({ pageParam, signal }) =>
      fetchSignals({ hours, type, cursor: pageParam }, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) =>
      page.hasMore ? (page.nextCursor ?? undefined) : undefined,
    enabled: tab === "signals",
  });
  const heatmap = useQuery({
    queryKey: ["market-heatmap"],
    queryFn: ({ signal }) => fetchHeatmap(signal),
    enabled: tab === "heatmap",
    refetchInterval: 30_000,
  });
  const claims = useQuery({
    queryKey: ["claim-monitor"],
    queryFn: ({ signal }) => fetchClaimMonitor(signal),
    enabled: tab === "claims",
    refetchInterval: 20_000,
    retry: 1,
  });
  const refreshing =
    signals.isRefetching || heatmap.isRefetching || claims.isRefetching;
  const refresh = () =>
    tab === "signals"
      ? signals.refetch()
      : tab === "heatmap"
        ? heatmap.refetch()
        : claims.refetch();
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
            accessibilityLabel={t("backMarketIntel")}
            onPress={() => router.back()}
            style={styles.back}
          >
            <Ionicons name="arrow-back" size={18} color={colors.text} />
          </Pressable>
          <View style={styles.flex}>
            <Text style={styles.eyebrow}>{t("readOnlyMarketEvidence")}</Text>
            <Text accessibilityRole="header" style={styles.title}>
              {t("marketIntelligence")}
            </Text>
          </View>
          <Text accessibilityRole="summary" style={styles.readOnly}>
            {t("noActions")}
          </Text>
        </View>
        <View accessibilityRole="summary" style={styles.notice}>
          <Ionicons name="shield-checkmark" size={15} color={colors.warning} />
          <Text style={styles.noticeText}>{t("marketIntelSafety")}</Text>
        </View>
        <View accessibilityRole="tablist" style={styles.tabs}>
          {tabs.map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="tab"
              accessibilityLabel={t("selectMarketIntelTab", {
                tab: t(item.key),
              })}
              accessibilityState={{ selected: tab === item.id }}
              onPress={() => setTab(item.id)}
              style={[styles.tab, tab === item.id && styles.tabActive]}
            >
              <Text
                style={[
                  styles.tabText,
                  tab === item.id && styles.tabTextActive,
                ]}
              >
                {t(item.key)}
              </Text>
            </Pressable>
          ))}
        </View>
        {tab === "signals" ? (
          <SignalsPanel
            query={signals}
            type={type}
            setType={setType}
            hours={hours}
            setHours={setHours}
            onToken={(address) =>
              router.push({ pathname: "/token/[address]", params: { address } })
            }
          />
        ) : tab === "heatmap" ? (
          <HeatmapPanel
            query={heatmap}
            onToken={(address) =>
              router.push({ pathname: "/token/[address]", params: { address } })
            }
          />
        ) : (
          <ClaimsPanel query={claims} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SignalsPanel({
  query,
  type,
  setType,
  hours,
  setHours,
  onToken,
}: {
  query: UseInfiniteQueryResult<InfiniteData<SignalsResponse, unknown>, Error>;
  type: SignalFilter;
  setType: (value: SignalFilter) => void;
  hours: 24 | 168;
  setHours: (value: 24 | 168) => void;
  onToken: (address: string) => void;
}) {
  const { t } = useSettings();
  const items = useMemo(
    () => [
      ...new Map(
        (query.data?.pages ?? [])
          .flatMap((page) => page.signals)
          .map((item) => [item.id, item]),
      ).values(),
    ],
    [query.data],
  );
  const page = query.data?.pages[0];
  return (
    <View>
      <View style={styles.controls}>
        <View accessibilityRole="radiogroup" style={styles.periods}>
          {([24, 168] as const).map((value) => {
            const label = value === 24 ? "24H" : "7D";
            return (
              <Pressable
                key={value}
                accessibilityRole="radio"
                accessibilityLabel={t("selectSignalWindow", { window: label })}
                accessibilityState={{ checked: hours === value }}
                onPress={() => setHours(value)}
                style={[styles.period, hours === value && styles.controlActive]}
              >
                <Text
                  style={[
                    styles.controlText,
                    hours === value && styles.controlTextActive,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.provenance}>
          {page?.dataQuality ?? t("checking")} · {page?.recordCount ?? 0}/
          {page?.totalCount ?? 0}
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {filters.map((value) => (
          <Pressable
            key={value}
            accessibilityRole="radio"
            accessibilityLabel={t("selectSignalType", { type: value })}
            accessibilityState={{ checked: type === value }}
            onPress={() => setType(value)}
            style={[styles.chip, type === value && styles.controlActive]}
          >
            <Text
              style={[
                styles.chipText,
                type === value && styles.controlTextActive,
              ]}
            >
              {value}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      {page ? (
        <EvidenceBar
          stale={page.freshness.isStale}
          text={`${page.source} · ${page.providers?.join(" + ") || t("providerUnavailable")} · ${t("ingestion", { status: page.ingestion?.status ?? t("untracked") })}`}
        />
      ) : null}
      {query.isLoading ? (
        <State loading text={t("loadingSignals")} />
      ) : query.error ? (
        <State error text={query.error.message} />
      ) : items.length ? (
        items.map((item) => (
          <SignalCard key={item.id} item={item} onToken={onToken} />
        ))
      ) : (
        <State text={page?.reason ?? t("noSignalEvents")} />
      )}
      {query.hasNextPage ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("loadOlderSignals")}
          accessibilityState={{
            disabled: query.isFetchingNextPage,
            busy: query.isFetchingNextPage,
          }}
          disabled={query.isFetchingNextPage}
          onPress={() => query.fetchNextPage()}
          style={styles.load}
        >
          <Text style={styles.loadText}>
            {query.isFetchingNextPage ? t("loading") : t("loadOlderEvidence")}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function SignalCard({
  item,
  onToken,
}: {
  item: MarketSignal;
  onToken: (address: string) => void;
}) {
  const { t } = useSettings();
  const address = isSolanaAddress(item.tokenAddress) ? item.tokenAddress : null;
  const positive = item.type.includes("Buy");
  const negative = item.type.includes("Sell");
  return (
    <Pressable
      accessibilityRole={address ? "button" : undefined}
      accessibilityLabel={
        address ? t("openSignalToken", { token: item.token }) : undefined
      }
      accessibilityState={{ disabled: !address }}
      disabled={!address}
      onPress={() => address && onToken(address)}
      style={styles.card}
    >
      <View style={styles.cardTop}>
        <View
          style={[
            styles.signalIcon,
            positive ? styles.goodBg : negative ? styles.badBg : styles.infoBg,
          ]}
        >
          <Ionicons
            name={positive ? "arrow-down" : negative ? "arrow-up" : "pulse"}
            size={15}
            color={
              positive
                ? colors.positive
                : negative
                  ? colors.negative
                  : "#72c8ff"
            }
          />
        </View>
        <View style={styles.flex}>
          <Text style={styles.cardTitle}>
            {item.token} · {item.type}
          </Text>
          <Text style={styles.meta}>{item.description}</Text>
        </View>
        <Text style={styles.amount}>
          {item.amountUsd == null ? "—" : compactUsd(item.amountUsd)}
        </Text>
      </View>
      <View style={styles.cardFoot}>
        <Text style={styles.meta}>
          {item.source ?? t("sourceUnavailable")} · {item.time}
        </Text>
        <Text style={styles.signature}>
          {item.txHash
            ? `${item.txHash.slice(0, 7)}…${item.txHash.slice(-5)}`
            : t("signatureUnavailable")}
        </Text>
      </View>
      {item.evidence?.slice(0, 2).map((value) => (
        <Text key={value} style={styles.evidence}>
          • {value}
        </Text>
      ))}
    </Pressable>
  );
}

function HeatmapPanel({
  query,
  onToken,
}: {
  query: ReturnType<
    typeof useQuery<Awaited<ReturnType<typeof fetchHeatmap>>, Error>
  >;
  onToken: (address: string) => void;
}) {
  const { t } = useSettings();
  const data = query.data;
  const items = useMemo(
    () =>
      [...(data?.heatmap ?? [])]
        .sort((a, b) => b.volume24h - a.volume24h)
        .slice(0, 50),
    [data],
  );
  if (query.isLoading) return <State loading text={t("loadingHeatmap")} />;
  if (query.error) return <State error text={query.error.message} />;
  return (
    <View>
      {data ? (
        <>
          <EvidenceBar
            stale={data.freshness.isStale}
            text={t("heatmapInclusion", {
              source: data.providers.join(" + ") || data.source,
              included: data.recordCount,
              excluded: data.trustSummary.excludedRecordCount,
            })}
          />
          <View style={styles.kpis}>
            <Kpi
              label={t("warnings")}
              value={String(data.trustSummary.warningRecordCount)}
            />
            <Kpi
              label={t("lowLiquidity")}
              value={String(data.trustSummary.lowLiquidityCount)}
            />
            <Kpi
              label={t("incomplete")}
              value={String(data.trustSummary.incompleteMetricCount)}
            />
          </View>
        </>
      ) : null}
      <View style={styles.grid}>
        {items.map((item, index) => {
          const change = signedPercent(item.change24h);
          return (
            <Pressable
              key={item.address}
              accessibilityRole="button"
              accessibilityLabel={t("openHeatmapToken", {
                symbol: item.symbol,
                change,
              })}
              onPress={() => onToken(item.address)}
              style={[
                styles.tile,
                index < 4 && styles.tileLarge,
                {
                  backgroundColor: item.change24h >= 0 ? "#12392d" : "#3b1820",
                  borderColor: item.change24h >= 0 ? "#28634f" : "#6b2a37",
                },
              ]}
            >
              <Text style={styles.tileSymbol}>{item.symbol}</Text>
              <Text
                style={[
                  styles.tileChange,
                  {
                    color:
                      item.change24h >= 0 ? colors.positive : colors.negative,
                  },
                ]}
              >
                {change}
              </Text>
              <Text style={styles.meta}>VOL {compactUsd(item.volume24h)}</Text>
              <Text style={styles.meta}>LIQ {compactUsd(item.liquidity)}</Text>
              {item.trustFlags
                .filter((flag) => flag !== "PROVIDER")
                .slice(0, 1)
                .map((flag) => (
                  <Text key={flag} style={styles.flag}>
                    {flag}
                  </Text>
                ))}
            </Pressable>
          );
        })}
      </View>
      {!items.length ? (
        <State text={data?.reason ?? t("noHeatmapRecords")} />
      ) : null}
    </View>
  );
}

type ClaimFilter = "all" | "first" | "fake";
function ClaimsPanel({
  query,
}: {
  query: ReturnType<
    typeof useQuery<Awaited<ReturnType<typeof fetchClaimMonitor>>, Error>
  >;
}) {
  const { t } = useSettings();
  const [filter, setFilter] = useState<ClaimFilter>("all");
  const data = query.data;
  const events = (data?.events ?? []).filter((item) =>
    filter === "all" || filter === "first"
      ? filter === "all" || item.isFirstClaim
      : item.isFakeClaim,
  );
  if (query.isLoading) return <State loading text={t("scanningClaims")} />;
  return (
    <View>
      {data ? (
        <>
          <EvidenceBar
            stale={data.health !== "healthy"}
            text={`${data.source} · ${data.rpcEndpoint} · ${data.health}`}
          />
          <View style={styles.kpis}>
            <Kpi label={t("detected")} value={String(data.claimsDetected)} />
            <Kpi label={t("firstClaims")} value={String(data.firstClaims)} />
            <Kpi label={t("unpaidFake")} value={String(data.fakeClaims)} />
            <Kpi label={t("scanned")} value={String(data.signaturesScanned)} />
          </View>
        </>
      ) : null}
      {query.error ? (
        <State error text={query.error.message} />
      ) : data?.error ? (
        <View accessibilityRole="alert" style={styles.warningBox}>
          <Text style={styles.warningText}>{data.error}</Text>
        </View>
      ) : null}
      <View accessibilityRole="radiogroup" style={styles.filters}>
        {(["all", "first", "fake"] as const).map((value) => {
          const label =
            value === "all"
              ? t("allClaims")
              : value === "first"
                ? t("firstClaims")
                : t("unpaidClaims");
          return (
            <Pressable
              key={value}
              accessibilityRole="radio"
              accessibilityLabel={t("selectClaimFilter", { filter: label })}
              accessibilityState={{ checked: filter === value }}
              onPress={() => setFilter(value)}
              style={[styles.chip, filter === value && styles.controlActive]}
            >
              <Text
                style={[
                  styles.chipText,
                  filter === value && styles.controlTextActive,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {events.map((item) => (
        <ClaimCard key={item.signature} item={item} />
      ))}
      {!events.length && !query.error ? (
        <State text={t("noClaimEvents")} />
      ) : null}
      <Text accessibilityRole="summary" style={styles.boundary}>
        {t("claimBoundary")}
      </Text>
    </View>
  );
}
function ClaimCard({ item }: { item: ClaimMonitorResponse["events"][number] }) {
  const { t } = useSettings();
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Ionicons
          name={
            item.status === "confirmed"
              ? "checkmark-circle"
              : item.isFakeClaim
                ? "warning"
                : "time"
          }
          size={18}
          color={item.status === "confirmed" ? colors.positive : colors.warning}
        />
        <View style={styles.flex}>
          <Text style={styles.cardTitle}>
            {item.platform === "github"
              ? t("githubSocialFee")
              : t("socialFeeClaim")}
          </Text>
          <Text style={styles.meta}>
            {item.instruction} ·{" "}
            {t("slot", { slot: item.slot.toLocaleString() })}
          </Text>
        </View>
        <Text
          style={[
            styles.status,
            item.status === "confirmed" ? styles.good : styles.warn,
          ]}
        >
          {item.status.replaceAll("_", " ")}
        </Text>
      </View>
      <View style={styles.cardFoot}>
        <Text style={styles.signature}>
          {item.signature.slice(0, 8)}…{item.signature.slice(-6)}
        </Text>
        <Text style={styles.amount}>
          {item.amountSol == null
            ? t("amountUnparsed")
            : `${item.amountSol.toFixed(6)} SOL`}
        </Text>
      </View>
      {item.isFirstClaim ? (
        <Text style={styles.first}>{t("firstObservedClaim")}</Text>
      ) : null}
    </View>
  );
}

function EvidenceBar({ stale, text }: { stale: boolean; text: string }) {
  const { t } = useSettings();
  return (
    <View accessibilityRole="summary" style={styles.bar}>
      <Ionicons
        name={stale ? "warning" : "checkmark-circle"}
        size={13}
        color={stale ? colors.warning : colors.positive}
      />
      <Text style={styles.barText}>{text}</Text>
      <Text style={[styles.fresh, stale && styles.warn]}>
        {stale ? t("staleDegraded") : t("current")}
      </Text>
    </View>
  );
}
function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.kpi}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
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
  controls: {
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  periods: {
    flexDirection: "row",
    padding: 3,
    borderRadius: 9,
    backgroundColor: colors.surface,
  },
  period: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 7 },
  controlActive: { backgroundColor: colors.accent },
  controlText: { color: colors.muted, fontSize: 8, fontWeight: "900" },
  controlTextActive: { color: colors.background },
  provenance: { color: colors.muted, fontSize: 8 },
  filters: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: 6,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipText: { color: colors.muted, fontSize: 8, fontWeight: "800" },
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
  fresh: { color: colors.positive, fontSize: 7, fontWeight: "900" },
  warn: { color: colors.warning },
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  signalIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  goodBg: { backgroundColor: colors.accentDim },
  badBg: { backgroundColor: "#3b1820" },
  infoBg: { backgroundColor: "#152b3b" },
  cardTitle: { color: colors.text, fontSize: 10, fontWeight: "900" },
  meta: { color: colors.muted, fontSize: 8, lineHeight: 12, marginTop: 2 },
  amount: { color: colors.text, fontSize: 9, fontWeight: "900" },
  cardFoot: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  signature: { color: "#72c8ff", fontSize: 8, fontFamily: "monospace" },
  evidence: { color: colors.muted, fontSize: 7, marginTop: 4 },
  load: {
    margin: spacing.lg,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 10,
  },
  loadText: { color: colors.accent, fontSize: 9, fontWeight: "900" },
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
  grid: {
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  tile: {
    width: "48.7%",
    minHeight: 112,
    marginBottom: spacing.sm,
    padding: spacing.md,
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 12,
  },
  tileLarge: { minHeight: 145 },
  tileSymbol: { color: colors.text, fontSize: 15, fontWeight: "900" },
  tileChange: { fontSize: 12, fontWeight: "900", marginVertical: 4 },
  flag: { color: colors.warning, fontSize: 6, fontWeight: "900", marginTop: 4 },
  warningBox: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#5a4720",
    borderRadius: 10,
    backgroundColor: "#241d10",
  },
  warningText: { color: colors.warning, fontSize: 9 },
  status: { fontSize: 7, fontWeight: "900", textTransform: "uppercase" },
  good: { color: colors.positive },
  first: {
    color: colors.negative,
    fontSize: 7,
    fontWeight: "900",
    marginTop: spacing.sm,
  },
  boundary: {
    color: colors.muted,
    fontSize: 8,
    lineHeight: 13,
    textAlign: "center",
    margin: spacing.xl,
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
