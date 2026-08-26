import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchTrackFeed, fetchTrenches } from "@/api/client";
import type { MarketToken } from "@/api/schema";
import { compactUsd, evidenceLabel, evidenceList, localizedRelativeObservedAge, signedPercent, tokenPrice } from "@/lib/format";
import { WhaleFlowBadge } from "@/components/WhaleFlowBadge";
import { whaleFlowByToken } from "@/lib/whale-activity";
import {
  applyTrenchFilters,
  boundedKeyword,
  boundedNumber,
  emptyTrenchFilters,
  normalizeTrenchDex,
  trenchLaunchpads,
  trenchFilterCount,
  type TrenchFilters,
} from "@/lib/trenches";
import { useSettings } from "@/settings/SettingsProvider";
import { colors, spacing } from "@/theme";

type Lane = "newTokens" | "almostBonded" | "migrated";
const lanes: {
  id: Lane;
  key: "new" | "almostBonded" | "migrated";
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: "newTokens", key: "new", icon: "sparkles" },
  { id: "almostBonded", key: "almostBonded", icon: "trending-up" },
  { id: "migrated", key: "migrated", icon: "checkmark-circle" },
];

export default function TrenchesScreen() {
  const router = useRouter();
  const { t } = useSettings();
  const [lane, setLane] = useState<Lane>("newTokens");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<TrenchFilters>(emptyTrenchFilters);
  const query = useQuery({
    queryKey: ["trenches"],
    queryFn: ({ signal }) => fetchTrenches(signal),
    refetchInterval: 30_000,
  });
  const whaleActivity = useQuery({
    queryKey: ["whale-activity"],
    queryFn: ({ signal }) => fetchTrackFeed(signal),
    staleTime: 30_000,
  });
  const whaleFlows = useMemo(
    () => whaleFlowByToken(whaleActivity.data?.notifications ?? []),
    [whaleActivity.data],
  );
  const laneRows = useMemo(() => query.data?.[lane] ?? [], [lane, query.data]);
  const launchpads = useMemo(
    () =>
      trenchLaunchpads(
        Object.values(query.data ?? {}).flatMap((value) =>
          Array.isArray(value) ? value : [],
        ),
    ),
    [query.data],
  );
  const effectiveFilters = useMemo(() => {
    if (filters.launchpad === "All") return filters;
    const launchpad = launchpads.find(
      (value) =>
        value.toLocaleLowerCase() === filters.launchpad.toLocaleLowerCase(),
    );
    return launchpad === filters.launchpad
      ? filters
      : { ...filters, launchpad: launchpad ?? "All" };
  }, [filters, launchpads]);
  const rows = useMemo(
    () => applyTrenchFilters(laneRows, effectiveFilters),
    [effectiveFilters, laneRows],
  );
  const activeFilterCount = trenchFilterCount(effectiveFilters);
  function openDetail(token: MarketToken) {
    router.push({
      pathname: "/token/[address]",
      params: { address: token.address, snapshot: JSON.stringify(token) },
    });
  }
  function openTrade(token: MarketToken) {
    router.push({
      pathname: "/trade/[address]",
      params: { address: token.address, snapshot: JSON.stringify(token) },
    });
  }
  const laneLabel = t(lanes.find((item) => item.id === lane)?.key ?? "new");
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        contentContainerStyle={rows.length ? styles.list : styles.grow}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching}
            onRefresh={() => query.refetch()}
            tintColor={colors.accent}
          />
        }
        renderItem={({ item }) => <View><TrenchCard token={item} lane={lane} onDetail={() => openDetail(item)} onTrade={() => openTrade(item)} /><WhaleFlowBadge flow={whaleFlows.get(item.address)} /></View>}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.eyebrow}>{t("liveLaunches")}</Text>
                <Text accessibilityRole="header" style={styles.title}>
                  {t("trenches")}
                </Text>
              </View>
              <View accessibilityRole="summary" style={styles.status}>
                <View
                  style={[
                    styles.dot,
                    query.data?.freshness.isStale && styles.stale,
                  ]}
                />
                <Text style={styles.statusText}>
                  {evidenceLabel(query.data?.dataQuality?.toUpperCase(), t("realData"))}
                </Text>
              </View>
            </View>
            <View accessibilityRole="tablist" style={styles.lanes}>
              {lanes.map((item) => (
                <Pressable
                  accessibilityRole="tab"
                  accessibilityLabel={t(item.key)}
                  accessibilityState={{ selected: lane === item.id }}
                  key={item.id}
                  onPress={() => setLane(item.id)}
                  style={[styles.lane, lane === item.id && styles.activeLane]}
                >
                  <Ionicons
                    name={item.icon}
                    size={14}
                    color={lane === item.id ? colors.background : colors.muted}
                  />
                  <Text
                    style={[
                      styles.laneText,
                      lane === item.id && styles.activeLaneText,
                    ]}
                  >
                    {t(item.key)}
                  </Text>
                  <Text
                    style={[
                      styles.count,
                      lane === item.id && styles.activeLaneText,
                    ]}
                  >
                    {query.data?.[item.id].length ?? 0}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.provenance}>
              <Text style={styles.provenanceText}>
                {t("source")}: {evidenceLabel(query.data?.source, t("loading"))} ·{" "}
                {evidenceList(query.data?.providers, ", ", t("launchFeed"))}
              </Text>
            </View>
            <View style={styles.filterHeader}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("openTrenchFilters")}
                accessibilityState={{ expanded: filtersOpen }}
                onPress={() => setFiltersOpen((value) => !value)}
                style={[
                  styles.filterButton,
                  activeFilterCount > 0 && styles.filterButtonActive,
                ]}
              >
                <Ionicons
                  name="options"
                  size={14}
                  color={activeFilterCount ? colors.background : colors.muted}
                />
                <Text
                  style={[
                    styles.filterButtonText,
                    activeFilterCount > 0 && styles.filterButtonTextActive,
                  ]}
                >
                  {t("filter")}
                  {activeFilterCount ? ` · ${activeFilterCount}` : ""}
                </Text>
              </Pressable>
              <Text style={styles.matchCount}>
                {t("trenchMatches", {
                  shown: String(rows.length),
                  total: String(laneRows.length),
                })}
              </Text>
            </View>
            {filtersOpen ? (
              <TrenchFilterPanel
                value={effectiveFilters}
                launchpads={launchpads}
                onChange={setFilters}
                onReset={() => setFilters(emptyTrenchFilters)}
              />
            ) : null}
          </>
        }
        ListEmptyComponent={
          query.isLoading ? (
            <State loading text={t("loadingLaunches")} />
          ) : query.isError ? (
            <State
              error
              text={t("evidenceLoadFailed")}
              action={t("retry")}
              actionBusy={query.isFetching}
              onAction={() => query.refetch()}
            />
          ) : (
            <State
              text={
                activeFilterCount
                  ? t("noTrenchMatches")
                  : t("noLaunches", { lane: laneLabel.toLowerCase() })
              }
            />
          )
        }
      />
    </SafeAreaView>
  );
}

function TrenchFilterPanel({
  value,
  launchpads,
  onChange,
  onReset,
}: {
  value: TrenchFilters;
  launchpads: string[];
  onChange: (value: TrenchFilters) => void;
  onReset: () => void;
}) {
  const { t } = useSettings();
  const fields: {
    key: keyof Pick<
      TrenchFilters,
      "minMarketCap" | "minVolume24h" | "maxAgeMinutes" | "minBondingProgress"
    >;
    label: string;
    placeholder: string;
  }[] = [
    { key: "minMarketCap", label: t("minMarketCap"), placeholder: "100000" },
    { key: "minVolume24h", label: t("minVolume24h"), placeholder: "25000" },
    { key: "maxAgeMinutes", label: t("maxAgeMinutes"), placeholder: "60" },
    {
      key: "minBondingProgress",
      label: t("minBondingProgress"),
      placeholder: "70",
    },
  ];
  return (
    <View style={styles.filterPanel}>
      <TextInput
        accessibilityLabel={t("trenchKeyword")}
        value={value.keyword}
        maxLength={50}
        onChangeText={(keyword) =>
          onChange({ ...value, keyword: boundedKeyword(keyword) })
        }
        placeholder={t("trenchKeyword")}
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        style={styles.filterInput}
      />
      <View accessibilityRole="radiogroup" style={styles.launchpads}>
        {launchpads.map((launchpad) => (
          <Pressable
            key={launchpad}
            accessibilityRole="radio"
            accessibilityState={{ checked: value.launchpad === launchpad }}
            accessibilityLabel={t("selectLaunchpad", {
              launchpad: launchpad === "All" ? t("all") : launchpad,
            })}
            onPress={() => onChange({ ...value, launchpad })}
            style={[
              styles.launchpad,
              value.launchpad === launchpad && styles.launchpadActive,
            ]}
          >
            <Text
              style={[
                styles.launchpadText,
                value.launchpad === launchpad && styles.launchpadTextActive,
              ]}
            >
              {launchpad === "All" ? t("all") : launchpad}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.filterGrid}>
        {fields.map((field) => (
          <View key={field.key} style={styles.filterField}>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            <TextInput
              accessibilityLabel={field.label}
              keyboardType="decimal-pad"
              value={value[field.key]}
              maxLength={15}
              onChangeText={(text) =>
                onChange({
                  ...value,
                  [field.key]: boundedNumber(
                    text,
                    field.key === "minBondingProgress" ? 100 : undefined,
                  ),
                })
              }
              placeholder={field.placeholder}
              placeholderTextColor={colors.muted}
              style={styles.filterInput}
            />
          </View>
        ))}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("reset")}
        onPress={onReset}
        style={styles.resetFilters}
      >
        <Text style={styles.resetFiltersText}>{t("reset")}</Text>
      </Pressable>
    </View>
  );
}

export function TrenchCard({
  token,
  lane,
  onDetail,
  onTrade,
}: {
  token: MarketToken;
  lane: Lane;
  onDetail: () => void;
  onTrade: () => void;
}) {
  const { t } = useSettings();
  const progress =
    token.bondingProgress ??
    token.progress ??
    (lane === "migrated" ? 100 : null);
  const change = token.change1h;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("openLaunch", { symbol: token.symbol })}
      onPress={onDetail}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.cardTop}>
        <View style={styles.tokenIcon}>
          <Text style={styles.tokenIconText}>{token.symbol.slice(0, 2)}</Text>
        </View>
        <View style={styles.identity}>
          <View style={styles.nameRow}>
            <Text style={styles.symbol}>{token.symbol}</Text>
            <Text style={styles.age}>{token.ageLabel}</Text>
          </View>
          <Text style={styles.meta}>
            {normalizeTrenchDex(token.dex) ?? t("unknown")} · {short(token.address)}
          </Text>
        </View>
        <View>
          <Text style={styles.price}>{tokenPrice(token.price)}</Text>
          <Text
            style={[
              styles.change,
              { color: change >= 0 ? colors.positive : colors.negative },
            ]}
          >
            {signedPercent(change)} 1h
          </Text>
        </View>
      </View>
      {progress != null ? (
        <View style={styles.progressWrap}>
          <View style={styles.progressLabels}>
            <Text style={styles.metricLabel}>{t("bondingProgress")}</Text>
            <Text style={styles.progressValue}>
              {Math.min(100, progress).toFixed(0)}%
            </Text>
          </View>
          <View
            accessibilityRole="progressbar"
            accessibilityValue={{
              min: 0,
              max: 100,
              now: Math.min(100, progress),
            }}
            style={styles.track}
          >
            <View
              style={[
                styles.fill,
                { width: `${Math.min(100, Math.max(0, progress))}%` },
              ]}
            />
          </View>
        </View>
      ) : null}
      <View style={styles.metrics}>
        <Metric label={t("marketCap")} value={compactUsd(token.marketCap)} />
        <Metric label={t("liquidity")} value={compactUsd(token.liquidity)} />
        <Metric label={t("hourVolume")} value={compactUsd(token.volume1h)} />
        <Metric
          label={t("buysSells")}
          value={`${token.txns5m.buys}/${token.txns5m.sells}`}
        />
      </View>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("reviewQuoteLabel", { symbol: token.symbol })}
          onPress={(event) => {
            event.stopPropagation();
            onTrade();
          }}
          style={styles.trade}
        >
          <Ionicons
            name="swap-horizontal"
            size={14}
            color={colors.background}
          />
          <Text style={styles.tradeText}>{t("reviewQuote")}</Text>
        </Pressable>
        <Text style={styles.quality}>
          {evidenceLabel(token.source, t("unknown"))} ·{" "}
          {evidenceLabel(token.dataQuality, t("unavailable"))} ·{" "}
          {token.sourceFetchedAt
            ? ageLabel(token.sourceFetchedAt, t)
            : t("timeUnavailable")}
        </Text>
      </View>
    </Pressable>
  );
}
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}
export function State({
  loading,
  error,
  text,
  action,
  actionBusy = false,
  onAction,
}: {
  loading?: boolean;
  error?: boolean;
  text: string;
  action?: string;
  actionBusy?: boolean;
  onAction?: () => void;
}) {
  return (
    <View
      accessible
      accessibilityRole={error ? "alert" : "summary"}
      accessibilityLiveRegion="polite"
      accessibilityState={loading ? { busy: true } : undefined}
      style={styles.state}
    >
      {loading ? <ActivityIndicator color={colors.accent} /> : null}
      <Text style={styles.stateText}>{text}</Text>
      {action && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={action}
          accessibilityState={{ busy: actionBusy, disabled: actionBusy }}
          disabled={actionBusy}
          style={[styles.retry, actionBusy && styles.retryDisabled]}
          onPress={onAction}
        >
          <Text style={styles.retryText}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
function short(value: string) {
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
}

function ageLabel(timestamp: number, t: ReturnType<typeof useSettings>["t"]) {
  return localizedRelativeObservedAge(timestamp, t, t("timeUnavailable"));
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  grow: { flexGrow: 1 },
  list: { paddingBottom: 80 },
  header: {
    padding: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
  },
  title: { color: colors.text, fontSize: 28, fontWeight: "900" },
  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 7,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
  stale: { backgroundColor: colors.warning },
  statusText: { color: colors.muted, fontSize: 8, fontWeight: "900" },
  lanes: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  lane: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    borderRadius: 11,
    backgroundColor: colors.surface,
  },
  activeLane: { backgroundColor: colors.accent },
  laneText: { color: colors.muted, fontSize: 9, fontWeight: "800" },
  activeLaneText: { color: colors.background },
  count: { color: colors.muted, fontSize: 8, fontWeight: "900" },
  provenance: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  provenanceText: { color: colors.muted, fontSize: 9, textAlign: "right" },
  filterHeader: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterButton: {
    minHeight: 44,
    paddingHorizontal: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterButtonText: { color: colors.muted, fontSize: 10, fontWeight: "900" },
  filterButtonTextActive: { color: colors.background },
  matchCount: { color: colors.muted, fontSize: 9 },
  filterPanel: {
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  filterInput: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    backgroundColor: colors.background,
  },
  launchpads: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  launchpad: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 11,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.border,
  },
  launchpadActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  launchpadText: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  launchpadTextActive: { color: colors.background },
  filterGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  filterField: { width: "48%", flexGrow: 1 },
  fieldLabel: {
    color: colors.muted,
    fontSize: 8,
    fontWeight: "800",
    marginBottom: 5,
  },
  resetFilters: {
    alignSelf: "flex-end",
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  resetFiltersText: { color: colors.accent, fontSize: 10, fontWeight: "900" },
  card: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pressed: { backgroundColor: colors.surfaceRaised },
  cardTop: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  tokenIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accentDim,
  },
  tokenIconText: { color: colors.accent, fontSize: 11, fontWeight: "900" },
  identity: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  symbol: { color: colors.text, fontSize: 16, fontWeight: "900" },
  age: { color: colors.warning, fontSize: 9, fontWeight: "800" },
  meta: {
    color: colors.muted,
    fontSize: 9,
    marginTop: 3,
    textTransform: "uppercase",
  },
  price: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "right",
  },
  change: { fontSize: 10, fontWeight: "800", textAlign: "right", marginTop: 3 },
  progressWrap: { marginTop: spacing.lg },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressValue: { color: colors.accent, fontSize: 10, fontWeight: "900" },
  track: {
    height: 5,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  fill: { height: 5, backgroundColor: colors.accent, borderRadius: 3 },
  metrics: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  metricLabel: { color: colors.muted, fontSize: 8 },
  metricValue: {
    color: colors.text,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 3,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.lg,
  },
  trade: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 9,
    backgroundColor: colors.accent,
  },
  tradeText: { color: colors.background, fontSize: 10, fontWeight: "900" },
  quality: { color: colors.muted, fontSize: 8, textTransform: "capitalize" },
  state: {
    minHeight: 300,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  stateText: { color: colors.muted, textAlign: "center" },
  retry: {
    backgroundColor: colors.accent,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryDisabled: { opacity: 0.55 },
  retryText: { color: colors.background, fontWeight: "900" },
});
