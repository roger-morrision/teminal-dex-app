import { Ionicons } from "@expo/vector-icons";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  fetchDiscovery,
  getDiscoveryModeCapabilities,
  getDiscoveryNextPageParam,
  fetchAlertDeliveries,
  fetchTrackFeed,
  fetchUserAlerts,
  searchTokens,
  type DiscoveryFilters,
  type DiscoveryMode,
  type TrendingPeriod,
} from "@/api/client";
import type {
  AlertDeliveriesResponse,
  MarketToken,
  UserAlert,
} from "@/api/schema";
import { TokenRow } from "@/components/TokenRow";
import { evidenceLabel } from "@/lib/format";
import { BusyIndicator } from "@/components/BusyIndicator";
import { WhaleFlowBadge } from "@/components/WhaleFlowBadge";
import { whaleFlowByToken } from "@/lib/whale-activity";
import {
  defaultFilters,
  loadFilters,
  loadWatchlist,
  loadWatchlistSnapshots,
  loadWatchlistWindow,
  saveFilters,
  saveWatchlist,
  saveWatchlistSnapshots,
  saveWatchlistWindow,
} from "@/store/discovery";
import { watchlistAlertStatus } from "@/lib/watchlist-status";
import { useWalletSession } from "@/security/WalletSessionProvider";
import { useSettings } from "@/settings/SettingsProvider";
import { colors, spacing } from "@/theme";

const periods: TrendingPeriod[] = ["1h", "6h", "24h"];
const modes: {
  id: DiscoveryMode;
  key:
    | "trending"
    | "gainers"
    | "losers"
    | "volume"
    | "newPairs"
    | "hotSearches"
    | "surge"
    | "nextBc"
    | "pumpLive"
    | "watchlist";
}[] = [
  { id: "trending", key: "trending" },
  { id: "gainers", key: "gainers" },
  { id: "losers", key: "losers" },
  { id: "volume", key: "volume" },
  { id: "new-pairs", key: "newPairs" },
  { id: "hot-searches", key: "hotSearches" },
  { id: "surge", key: "surge" },
  { id: "nextbc", key: "nextBc" },
  { id: "pump-live", key: "pumpLive" },
  { id: "watchlist", key: "watchlist" },
];

function useDebouncedValue(value: string, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [delay, value]);
  return debounced;
}

export default function DiscoverScreen() {
  const router = useRouter();
  const { t } = useSettings();
  const wallet = useWalletSession();
  const [period, setPeriod] = useState<TrendingPeriod>("24h");
  const [mode, setMode] = useState<DiscoveryMode>("trending");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<DiscoveryFilters>(defaultFilters);
  const [draftFilters, setDraftFilters] =
    useState<DiscoveryFilters>(defaultFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [watchSnapshots, setWatchSnapshots] = useState<
    Record<string, MarketToken>
  >({});
  const [watchStorageError, setWatchStorageError] = useState<
    "list" | "window" | null
  >(null);
  const debouncedSearch = useDebouncedValue(search.trim());

  useEffect(() => {
    void Promise.all([
      loadWatchlist(),
      loadFilters(),
      loadWatchlistSnapshots(),
      loadWatchlistWindow(),
    ]).then(
      ([storedWatchlist, storedFilters, storedSnapshots, storedWindow]) => {
        setWatchlist(storedWatchlist);
        setFilters(storedFilters);
        setDraftFilters(storedFilters);
        setWatchSnapshots(storedSnapshots);
        setPeriod(storedWindow);
      },
    );
  }, []);

  const feed = useInfiniteQuery({
    queryKey: ["discovery", mode, period, filters],
    queryFn: ({ pageParam, signal }) =>
      fetchDiscovery(mode, period, filters, pageParam, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page, pages, _lastPageParam, pageParams) =>
      getDiscoveryNextPageParam(mode, page, pages, pageParams),
    maxPages: 4,
  });
  const remoteSearch = useQuery({
    queryKey: ["token-search", debouncedSearch],
    queryFn: ({ signal }) => searchTokens(debouncedSearch, signal),
    enabled: debouncedSearch.length >= 2,
  });
  const authorized = Boolean(wallet.session && !wallet.locked);
  const alerts = useQuery({
    queryKey: ["watchlist-alerts"],
    queryFn: ({ signal }) => fetchUserAlerts(signal),
    enabled: mode === "watchlist" && authorized,
  });
  const deliveries = useQuery({
    queryKey: ["watchlist-deliveries"],
    queryFn: ({ signal }) => fetchAlertDeliveries(signal),
    enabled: mode === "watchlist" && authorized,
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

  const feedRows = useMemo(() => {
    const seen = new Set<string>();
    return (feed.data?.pages.flatMap((page) => page.tokens) ?? []).filter(
      (token) => !seen.has(token.address) && Boolean(seen.add(token.address)),
    );
  }, [feed.data]);
  const currentByAddress = useMemo(
    () => new Map(feedRows.map((token) => [token.address, token])),
    [feedRows],
  );
  const watchRows = useMemo(
    () =>
      watchlist
        .map(
          (address) => currentByAddress.get(address) ?? watchSnapshots[address],
        )
        .filter((token): token is MarketToken => Boolean(token)),
    [currentByAddress, watchSnapshots, watchlist],
  );
  const rows =
    debouncedSearch.length >= 2
      ? (remoteSearch.data?.tokens ?? [])
      : mode === "watchlist"
        ? watchRows
        : feedRows;
  const current = debouncedSearch.length >= 2 ? remoteSearch : feed;
  const firstPage = feed.data?.pages[0];
  const activeFilterCount = [
    filters.dex !== "All",
    Boolean(filters.minLiquidity),
    Boolean(filters.minMarketCap),
  ].filter(Boolean).length;
  const modeCapabilities = getDiscoveryModeCapabilities(mode);
  const searching = debouncedSearch.length >= 2;
  const effectiveFilterCount =
    !searching && modeCapabilities.filters ? activeFilterCount : 0;

  function toggleWatch(token: MarketToken) {
    const removing = watchlist.includes(token.address);
    const next = removing
      ? watchlist.filter((item) => item !== token.address)
      : [token.address, ...watchlist].slice(0, 100);
    const nextSnapshots = { ...watchSnapshots };
    if (removing) delete nextSnapshots[token.address];
    else nextSnapshots[token.address] = token;
    setWatchlist(next);
    setWatchSnapshots(nextSnapshots);
    void Promise.all([
      saveWatchlist(next),
      saveWatchlistSnapshots(nextSnapshots),
    ]).then(
      () =>
        setWatchStorageError((current) =>
          current === "list" ? null : current,
        ),
      () => setWatchStorageError("list"),
    );
  }
  function applyFilters() {
    setFilters(draftFilters);
    setFiltersOpen(false);
    void saveFilters(draftFilters);
  }
  function resetFilters() {
    setDraftFilters(defaultFilters);
    setFilters(defaultFilters);
    setFiltersOpen(false);
    void saveFilters(defaultFilters);
  }
  function openToken(token: MarketToken) {
    router.push({
      pathname: "/token/[address]",
      params: { address: token.address, snapshot: JSON.stringify(token) },
    });
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <FlatList
        data={rows}
        keyExtractor={(item) =>
          mode === "watchlist" ? item.address : item.id
        }
        renderItem={({ item }) => (
          <View>
            <TokenRow
              token={item}
              dense
              period={period}
              onPress={() => openToken(item)}
              watched={watchlist.includes(item.address)}
              onToggleWatch={() => toggleWatch(item)}
            />
            <WhaleFlowBadge flow={whaleFlows.get(item.address)} />
            {mode === "watchlist" ? (
              <WatchlistEvidence
                token={item}
                authorized={authorized}
                loading={alerts.isLoading || deliveries.isLoading}
                alerts={alerts.data?.data ?? []}
                deliveries={deliveries.data?.data ?? []}
                error={alerts.error || deliveries.error ? t("evidenceLoadFailed") : undefined}
              />
            ) : null}
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={current.isRefetching}
            onRefresh={() => current.refetch()}
            tintColor={colors.accent}
          />
        }
        onEndReached={() => {
          if (
            debouncedSearch.length < 2 &&
            feed.hasNextPage &&
            !feed.isFetchingNextPage &&
            !feed.isFetchNextPageError
          )
            void feed.fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        contentContainerStyle={rows.length ? undefined : styles.grow}
        ListFooterComponent={
          feed.isFetchingNextPage ? (
            <BusyIndicator
              label={t("loadingMoreMarkets")}
              style={styles.footer}
            />
          ) : feed.isFetchNextPageError && rows.length && debouncedSearch.length < 2 ? (
            <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.footerError}>
              <Text style={styles.stateText}>{t("evidenceLoadFailed")}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("retry")}
                accessibilityState={{
                  busy: feed.isFetchingNextPage,
                  disabled: feed.isFetchingNextPage,
                }}
                disabled={feed.isFetchingNextPage}
                onPress={() => void feed.fetchNextPage()}
                style={[styles.retry, feed.isFetchingNextPage && styles.retryDisabled]}
              >
                <Text style={styles.retryText}>{t("retry")}</Text>
              </Pressable>
            </View>
          ) : null
        }
        ListHeaderComponent={
          <View>
            <View style={styles.searchRow}>
              <View style={styles.searchWrap}>
                <Ionicons name="search" color={colors.muted} size={17} />
                <TextInput
                  accessibilityLabel={t("searchTokens")}
                  value={search}
                  onChangeText={(value) => setSearch(value.slice(0, 80))}
                  maxLength={80}
                  placeholder={t("searchTokens")}
                  placeholderTextColor={colors.muted}
                  style={styles.search}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {search ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t("clearSearch")}
                    hitSlop={10}
                    onPress={() => setSearch("")}
                  >
                    <Ionicons name="close-circle" color={colors.muted} size={18} />
                  </Pressable>
                ) : null}
              </View>
              <View accessible accessibilityLabel="Solana" style={styles.chain}><Text style={styles.chainMark}>≋</Text><Text style={styles.chainText}>SOL</Text></View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.controlRow}
            >
              <View accessibilityRole="tablist" style={styles.modeGroup}>
                {modes.map((item) => {
                  const label = t(item.key);
                  return (
                    <Pressable
                      key={item.id}
                      accessibilityRole="tab"
                      accessibilityLabel={t("selectMode", { mode: label })}
                      accessibilityState={{ selected: mode === item.id }}
                      onPress={() => {
                        setMode(item.id);
                        setSearch("");
                        setFiltersOpen(false);
                        setDraftFilters(filters);
                        if (item.id === "watchlist")
                          void saveWatchlistWindow(period).then(
                            () =>
                              setWatchStorageError((current) =>
                                current === "window" ? null : current,
                              ),
                            () => setWatchStorageError("window"),
                          );
                      }}
                      style={[styles.pill, mode === item.id && styles.activePill]}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          mode === item.id && styles.activePillText,
                        ]}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
            <View
              accessibilityRole={
                modeCapabilities.period ? "radiogroup" : undefined
              }
              style={styles.periodRow}
            >
              {!searching && modeCapabilities.period
                ? periods.map((item) => (
                    <Pressable
                      key={item}
                      accessibilityRole="radio"
                      accessibilityLabel={t("selectPeriod", { period: item })}
                      accessibilityState={{ checked: period === item }}
                      style={styles.periodButton}
                      onPress={() => {
                        setPeriod(item);
                        if (mode === "watchlist")
                          void saveWatchlistWindow(item).then(
                            () =>
                              setWatchStorageError((current) =>
                                current === "window" ? null : current,
                              ),
                            () => setWatchStorageError("window"),
                          );
                      }}
                    >
                      <Text style={[styles.period, period === item && styles.activePeriod]}>
                        {item}
                      </Text>
                    </Pressable>
                  ))
                : null}
              {!searching && modeCapabilities.filters ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t("openFilters")}
                  accessibilityState={{ expanded: filtersOpen }}
                  onPress={() => setFiltersOpen(true)}
                  style={[
                    styles.filterButton,
                    effectiveFilterCount > 0 && styles.filterActive,
                  ]}
                >
                  <Ionicons
                    name="options"
                    size={14}
                    color={effectiveFilterCount ? colors.background : colors.muted}
                  />
                  <Text
                    style={[
                      styles.filterText,
                      effectiveFilterCount > 0 && styles.filterTextActive,
                    ]}
                  >
                    {t("filter")}
                    {effectiveFilterCount ? ` ${effectiveFilterCount}` : ""}
                  </Text>
                </Pressable>
              ) : null}
              <Text numberOfLines={1} style={styles.source}>
                {debouncedSearch.length >= 2
                  ? (remoteSearch.data?.source ?? t("searching"))
                  : (firstPage?.source ?? t("marketFeed"))}
              </Text>
            </View>
            {mode === "watchlist" && watchStorageError ? (
              <Text accessibilityRole="alert" style={styles.watchWarning}>
                {t("watchlistStorageUnavailable")}
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          current.isLoading || search !== debouncedSearch ? (
            <State
              loading
              message={
                debouncedSearch.length >= 2
                  ? t("searchingSources")
                  : t("loadingMarkets")
              }
            />
          ) : current.isError ? (
            <State
              error
              title={t("marketUnavailable")}
              message={t("evidenceLoadFailed")}
              action={t("retry")}
              actionBusy={current.isFetching}
              onAction={() => current.refetch()}
            />
          ) : (
            <State
              title={
                mode === "watchlist"
                  ? t("watchlistEmpty")
                  : debouncedSearch.length >= 2 || effectiveFilterCount > 0
                    ? t("noMatchingTokens")
                    : t("providerFeedEmptyTitle")
              }
              message={
                mode === "watchlist"
                  ? t("watchlistHint")
                  : debouncedSearch.length >= 2
                    ? t("searchEmptyHint")
                    : effectiveFilterCount > 0
                      ? t("filtersHint")
                      : t("providerFeedEmpty", { source: firstPage?.source ?? t("providerUnavailable") })
              }
              action={effectiveFilterCount > 0 ? t("resetFilters") : debouncedSearch.length >= 2 ? t("clearSearch") : t("retry")}
              actionBusy={effectiveFilterCount === 0 && debouncedSearch.length < 2 && current.isFetching}
              onAction={effectiveFilterCount > 0 ? resetFilters : debouncedSearch.length >= 2 ? () => setSearch("") : () => current.refetch()}
            />
          )
        }
      />
      <FilterModal
        visible={filtersOpen && !searching && modeCapabilities.filters}
        value={draftFilters}
        onChange={setDraftFilters}
        onClose={() => {
          setDraftFilters(filters);
          setFiltersOpen(false);
        }}
        onApply={applyFilters}
        onReset={resetFilters}
      />
    </SafeAreaView>
  );
}

export function WatchlistEvidence({
  token,
  authorized,
  loading,
  alerts,
  deliveries,
  error,
}: {
  token: MarketToken;
  authorized: boolean;
  loading: boolean;
  alerts: UserAlert[];
  deliveries: AlertDeliveriesResponse["data"];
  error?: string;
}) {
  const { t } = useSettings();
  const status = watchlistAlertStatus(token.address, alerts, deliveries);
  return (
    <View accessibilityRole="summary" style={styles.watchEvidence}>
      <Text style={styles.watchEvidenceText}>
        {t("watchlistMarketEvidence", {
          source: evidenceLabel(token.source, t("sourceUnavailable")),
          quality: evidenceLabel(token.dataQuality, t("qualityUnavailable")),
          freshness: token.sourceFetchedAt
            ? relativeAge(token.sourceFetchedAt, t)
            : t("freshnessUnavailable"),
        })}
      </Text>
      <Text style={styles.watchEvidenceText}>
        {!authorized
          ? t("watchlistAlertsVerify")
          : loading
            ? t("watchlistAlertsLoading")
            : error
              ? t("watchlistAlertsUnavailable", { error })
              : status.total
                ? t("watchlistAlertStatus", {
                    active: status.active,
                    total: status.total,
                    triggered: status.triggered,
                    delivery: status.latestDelivery ?? t("noDeliveryEvidence"),
                  })
                : t("watchlistNoAlerts")}
      </Text>
      {authorized && status.latestReason ? (
        <Text style={styles.watchWarning}>{status.latestReason}</Text>
      ) : null}
    </View>
  );
}

function relativeAge(
  timestamp: number,
  t: ReturnType<typeof useSettings>["t"],
) {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  return seconds < 60
    ? t("secondsAgo", { count: seconds })
    : seconds < 3600
      ? t("minutesAgo", { count: Math.floor(seconds / 60) })
      : t("hoursAgo", { count: Math.floor(seconds / 3600) });
}

export function State({
  loading,
  error,
  title,
  message,
  action,
  actionBusy = false,
  onAction,
}: {
  loading?: boolean;
  error?: boolean;
  title?: string;
  message: string;
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
      {title ? <Text style={styles.errorTitle}>{title}</Text> : null}
      <Text style={styles.stateText}>{message}</Text>
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

function FilterModal({
  visible,
  value,
  onChange,
  onClose,
  onApply,
  onReset,
}: {
  visible: boolean;
  value: DiscoveryFilters;
  onChange: (value: DiscoveryFilters) => void;
  onClose: () => void;
  onApply: () => void;
  onReset: () => void;
}) {
  const { t } = useSettings();
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("closeFilters")}
        style={styles.scrim}
        onPress={onClose}
      />
      <SafeAreaView
        accessibilityViewIsModal
        accessibilityLabel={t("marketFilters")}
        style={styles.sheet}
        edges={["bottom"]}
      >
        <View style={styles.handle} />
        <Text accessibilityRole="header" style={styles.sheetTitle}>
          {t("marketFilters")}
        </Text>
        <Text style={styles.fieldLabel}>DEX</Text>
        <ScrollView
          accessibilityRole="radiogroup"
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dexRow}
        >
          {["All", "raydium", "pumpswap", "orca", "meteora", "pumpfun"].map(
            (dex) => (
              <Pressable
                key={dex}
                accessibilityRole="radio"
                accessibilityLabel={t("selectDex", {
                  dex: dex === "All" ? t("all") : dex,
                })}
                accessibilityState={{ checked: value.dex === dex }}
                onPress={() => onChange({ ...value, dex })}
                style={[styles.dex, value.dex === dex && styles.activePill]}
              >
                <Text
                  style={[
                    styles.pillText,
                    value.dex === dex && styles.activePillText,
                  ]}
                >
                  {dex === "All" ? t("all") : dex}
                </Text>
              </Pressable>
            ),
          )}
        </ScrollView>
        <Text style={styles.fieldLabel}>{t("minLiquidity")}</Text>
        <TextInput
          accessibilityLabel={t("minLiquidity")}
          keyboardType="numeric"
          value={value.minLiquidity}
          maxLength={15}
          onChangeText={(minLiquidity) =>
            onChange({
              ...value,
              minLiquidity: sanitizeDecimal(minLiquidity),
            })
          }
          placeholder="e.g. 25000"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
        <Text style={styles.fieldLabel}>{t("minMarketCap")}</Text>
        <TextInput
          accessibilityLabel={t("minMarketCap")}
          keyboardType="numeric"
          value={value.minMarketCap}
          maxLength={15}
          onChangeText={(minMarketCap) =>
            onChange({
              ...value,
              minMarketCap: sanitizeDecimal(minMarketCap),
            })
          }
          placeholder="e.g. 100000"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
        <View style={styles.sheetActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("reset")}
            style={styles.reset}
            onPress={onReset}
          >
            <Text style={styles.resetText}>{t("reset")}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("applyFilters")}
            style={styles.apply}
            onPress={onApply}
          >
            <Text style={styles.applyText}>{t("applyFilters")}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

export function sanitizeDecimal(value: string) {
  const normalized = value.replace(/[^0-9.]/g, "");
  const [whole = "", ...fractions] = normalized.split(".");
  const fraction = fractions.join("").slice(0, 2);
  return fractions.length
    ? `${whole.slice(0, 12)}.${fraction}`
    : whole.slice(0, 12);
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  grow: { flexGrow: 1 },
  modeGroup: { flexDirection: "row", gap: spacing.sm },
  footer: { padding: spacing.xl },
  footerError: { alignItems: "center", gap: spacing.sm, padding: spacing.lg },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 10,
    letterSpacing: 2.2,
    fontWeight: "900",
  },
  heading: {
    color: colors.text,
    fontSize: 27,
    fontWeight: "900",
    letterSpacing: -0.8,
    marginTop: 2,
  },
  live: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.accent },
  staleDot: { backgroundColor: colors.warning },
  liveText: { color: colors.muted, fontSize: 9, fontWeight: "900" },
  searchWrap: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  chain: {
    minWidth: 70,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chainMark: { color: colors.violet, fontSize: 17, fontWeight: "900" },
  chainText: { color: colors.text, fontSize: 10, fontWeight: "900" },
  search: { flex: 1, color: colors.text, fontSize: 14 },
  controlRow: {
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  pill: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  activePill: { backgroundColor: colors.accent },
  pillText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  activePillText: { color: colors.background },
  periodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  periodButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  period: { color: colors.muted, fontSize: 11, fontWeight: "800" },
  activePeriod: { color: colors.accent },
  filterButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  filterActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  filterText: { color: colors.muted, fontSize: 10, fontWeight: "800" },
  filterTextActive: { color: colors.background },
  watchEvidence: {
    marginHorizontal: spacing.lg,
    marginTop: -2,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.border,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: colors.surface,
    gap: 3,
  },
  watchEvidenceText: { color: colors.muted, fontSize: 9 },
  watchWarning: { color: colors.warning, fontSize: 9 },
  source: { color: colors.muted, fontSize: 9, flex: 1, textAlign: "right" },
  state: {
    flex: 1,
    minHeight: 300,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  stateText: { color: colors.muted, textAlign: "center", lineHeight: 20 },
  errorTitle: { color: colors.text, fontSize: 17, fontWeight: "800" },
  retry: {
    minHeight: 44,
    justifyContent: "center",
    backgroundColor: colors.accent,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryDisabled: { opacity: 0.55 },
  retryText: { color: colors.background, fontWeight: "900" },
  scrim: { flex: 1, backgroundColor: "#00000099" },
  sheet: {
    backgroundColor: colors.surfaceRaised,
    padding: spacing.lg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
  sheetTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  dexRow: { gap: spacing.sm },
  dex: {
    minHeight: 44,
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: spacing.md,
  },
  sheetActions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  reset: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    padding: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
  },
  resetText: { color: colors.text, fontWeight: "800" },
  apply: {
    flex: 2,
    minHeight: 44,
    alignItems: "center",
    padding: 13,
    backgroundColor: colors.accent,
    borderRadius: 11,
  },
  applyText: { color: colors.background, fontWeight: "900" },
});
