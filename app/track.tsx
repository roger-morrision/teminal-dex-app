import { Ionicons } from "@expo/vector-icons";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchAlertDeliveries, fetchFeedHistory, fetchTrackFeed } from "@/api/client";
import type { FeedHistoryCursor, FeedHistoryEvent, TrackNotification } from "@/api/schema";
import { compactUsd } from "@/lib/format";
import { useWalletSession } from "@/security/WalletSessionProvider";
import { useSettings } from "@/settings/SettingsProvider";
import {
  loadTrackFilter,
  saveTrackFilter,
  TRACK_FILTERS,
  type TrackFilter,
} from "@/store/track";
import { colors, spacing } from "@/theme";

const typeTone = (type: TrackNotification["type"]) =>
  type.includes("sell") || type.includes("take_profit")
    ? colors.negative
    : type === "surge"
      ? colors.warning
      : colors.positive;

export default function TrackScreen() {
  const router = useRouter();
  const wallet = useWalletSession();
  const { t } = useSettings();
  const [filter, setFilter] = React.useState<TrackFilter>("all");
  React.useEffect(() => {
    void loadTrackFilter().then(setFilter);
  }, []);
  const feed = useQuery({
    queryKey: ["track-feed"],
    queryFn: ({ signal }) => fetchTrackFeed(signal),
  });
  const history = useInfiniteQuery({
    queryKey: ["track-feed-history"],
    queryFn: ({ pageParam, signal }) => fetchFeedHistory(pageParam, signal),
    initialPageParam: null as FeedHistoryCursor | null,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    maxPages: 4,
  });
  const deliveries = useQuery({
    queryKey: ["track-deliveries", wallet.session?.wallet],
    queryFn: ({ signal }) => fetchAlertDeliveries(signal),
    enabled: Boolean(wallet.session && !wallet.locked),
  });
  const selectFilter = (value: TrackFilter) => {
    setFilter(value);
    void saveTrackFilter(value).catch(() => undefined);
  };
  const rows = (feed.data?.notifications ?? []).filter(
    (item) =>
      filter === "all" ||
      (filter === "wallet" && Boolean(item.wallet)) ||
      (filter === "kol" && item.type.startsWith("kol_")) ||
      false,
  );
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("goBack")}
            onPress={() => router.back()}
            style={styles.icon}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
          <View style={styles.flex}>
            <Text style={styles.eyebrow}>{t("readOnlyTracking")}</Text>
            <Text style={styles.title}>{t("track")}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("refreshTrack")}
            accessibilityState={{ busy: feed.isFetching }}
            disabled={feed.isFetching}
            onPress={() => feed.refetch()}
            style={styles.icon}
          >
            <Ionicons name="refresh" size={18} color={colors.text} />
          </Pressable>
        </View>
        <Text style={styles.boundary}>{t("trackBoundary")}</Text>
        <View accessibilityRole="radiogroup" style={styles.filters}>
          {TRACK_FILTERS.map((item) => (
            <Pressable
              accessibilityRole="radio"
              accessibilityLabel={t("selectTrackFilter", {
                filter: t(`trackFilter_${item}`),
              })}
              accessibilityState={{ checked: filter === item }}
              key={item}
              onPress={() => selectFilter(item)}
              style={[styles.filter, filter === item && styles.filterActive]}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === item && styles.filterTextActive,
                ]}
              >
                {t(`trackFilter_${item}`)}
              </Text>
            </Pressable>
          ))}
        </View>
        {feed.isLoading ? (
          <State loading text={t("loadingTrack")} />
        ) : feed.isError || !feed.data ? (
          <State
            error
            text={feed.error?.message ?? t("trackUnavailable")}
            onRetry={() => feed.refetch()}
          />
        ) : (
          <>
            <Text style={styles.section}>{t("sourceStatus")}</Text>
            <View style={styles.sources}>
              <Source
                label={t("launchPools")}
                count={feed.data.coverage?.pumpfunLive.recordCount ?? 0}
                quality={
                  feed.data.coverage?.pumpfunLive.dataQuality ??
                  t("unavailable")
                }
              />
              <Source
                label={t("smartMoney")}
                count={feed.data.coverage?.smartMoney.recordCount ?? 0}
                quality={
                  feed.data.coverage?.smartMoney.dataQuality ?? t("unavailable")
                }
              />
              <Source
                label={t("whaleTransactions")}
                count={feed.data.coverage?.whaleTransactions.recordCount ?? 0}
                quality={
                  feed.data.coverage?.whaleTransactions.dataQuality ??
                  t("unavailable")
                }
              />
            </View>
            <Text style={styles.section}>{t("observedEventHistory")}</Text>
            {filter === "social" ? (
              <State text={t("socialTrackUnavailable")} />
            ) : rows.length ? (
              rows.map((item) => (
                <TrackEventCard
                  key={item.id}
                  item={item}
                  onOpen={() =>
                    router.push({
                      pathname: "/token/[address]",
                      params: { address: item.tokenAddress },
                    })
                  }
                />
              ))
            ) : (
              <State text={t("noTrackEvents")} />
            )}
            <Text style={styles.section}>{t("durableFeedHistory")}</Text>
            {history.isLoading ? (
              <State loading text={t("loadingFeedHistory")} />
            ) : history.isError || !history.data ? (
              <State error text={history.error?.message ?? t("feedHistoryUnavailable")} onRetry={() => history.refetch()} />
            ) : history.data.pages.flatMap((page) => page.events).length ? (
              <>
                {history.data.pages.flatMap((page) => page.events).slice(0, 200).map((item) => (
                  <FeedHistoryCard key={item.id} item={item} onOpen={item.mint ? () => router.push({ pathname: "/token/[address]", params: { address: item.mint! } }) : undefined} />
                ))}
                {history.hasNextPage ? (
                  <Pressable accessibilityRole="button" accessibilityLabel={t("loadOlderHistory")} accessibilityState={{ busy: history.isFetchingNextPage }} disabled={history.isFetchingNextPage} onPress={() => history.fetchNextPage()} style={styles.retry}>
                    <Text style={styles.retryText}>{history.isFetchingNextPage ? t("loadingFeedHistory") : t("loadOlderHistory")}</Text>
                  </Pressable>
                ) : <Text style={styles.limit}>{t("feedHistoryEnd")}</Text>}
              </>
            ) : <State text={t("noFeedHistory")} />}
            <Text style={styles.limit}>{t("trackCursorReadyBoundary")}</Text>
          </>
        )}
        <Text style={styles.section}>{t("deliveryEvidence")}</Text>
        {!wallet.session ? (
          <State text={t("verifyForDeliveryEvidence")} />
        ) : wallet.locked ? (
          <State text={t("unlockForDeliveryEvidence")} />
        ) : deliveries.isLoading ? (
          <State loading text={t("loadingDeliveries")} />
        ) : deliveries.isError || !deliveries.data ? (
          <State
            error
            text={deliveries.error?.message ?? t("deliveryUnavailable")}
            onRetry={() => deliveries.refetch()}
          />
        ) : deliveries.data.data.length ? (
          deliveries.data.data.slice(0, 30).map((item) => (
            <View
              accessibilityRole="summary"
              key={item.id}
              style={styles.delivery}
            >
              <View style={styles.flex}>
                <Text style={styles.eventTitle}>
                  {item.channel} · {item.status}
                </Text>
                <Text style={styles.meta}>{item.eventKey}</Text>
              </View>
              <Text style={styles.meta}>
                {new Date(item.updatedAt).toLocaleString()}
              </Text>
              {item.reason ? (
                <Text style={styles.reason}>{item.reason}</Text>
              ) : null}
            </View>
          ))
        ) : (
          <State text={t("noDeliveryEvidence")} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function FeedHistoryCard({ item, onOpen }: { item: FeedHistoryEvent; onOpen?: () => void }) {
  const content = <><View style={styles.eventTop}><Text style={styles.type}>{item.kind.replaceAll("_", " ")}</Text><Text style={styles.meta}>{new Date(item.observedAt).toLocaleString()}</Text></View><Text style={styles.eventTitle}>{item.mint ?? item.topic}</Text><Text style={styles.message}>{item.source} · {item.channel} · {item.dataQuality}</Text><Text style={styles.dedupe}>{item.replaySequence} · {item.id}</Text></>;
  return onOpen ? <Pressable accessibilityRole="button" accessibilityLabel={`Open ${item.kind} history event`} onPress={onOpen} style={styles.event}>{content}</Pressable> : <View accessibilityRole="summary" style={styles.event}>{content}</View>;
}

export function TrackEventCard({
  item,
  onOpen,
}: {
  item: TrackNotification;
  onOpen: () => void;
}) {
  const { t } = useSettings();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("openTrackEvent", {
        symbol: item.tokenSymbol,
        type: item.type,
      })}
      onPress={onOpen}
      style={styles.event}
    >
      <View style={styles.eventTop}>
        <Text style={[styles.type, { color: typeTone(item.type) }]}>
          {item.type.replaceAll("_", " ")}
        </Text>
        <Text style={styles.meta}>
          {new Date(item.observedAt).toLocaleString()}
        </Text>
      </View>
      <Text style={styles.eventTitle}>{item.title}</Text>
      <Text style={styles.message}>{item.message}</Text>
      <View style={styles.eventBottom}>
        <Text style={styles.meta}>
          {item.source} · {item.dataQuality}
        </Text>
        {item.amountUsd != null ? (
          <Text style={styles.amount}>{compactUsd(item.amountUsd)}</Text>
        ) : null}
      </View>
      <Text style={styles.dedupe}>{t("dedupeId", { id: item.id })}</Text>
    </Pressable>
  );
}

function Source({
  label,
  count,
  quality,
}: {
  label: string;
  count: number;
  quality: string;
}) {
  return (
    <View accessibilityRole="summary" style={styles.source}>
      <Text style={styles.sourceCount}>{count}</Text>
      <Text style={styles.sourceLabel}>{label}</Text>
      <Text style={styles.meta}>{quality}</Text>
    </View>
  );
}
export function State({
  loading,
  error,
  text,
  onRetry,
}: {
  loading?: boolean;
  error?: boolean;
  text: string;
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
      <Text style={error ? styles.reason : styles.message}>{text}</Text>
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("retryTrack")}
          onPress={onRetry}
          style={styles.retry}
        >
          <Text style={styles.retryText}>{t("retry")}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 100 },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  flex: { flex: 1 },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  title: { color: colors.text, fontSize: 28, fontWeight: "900" },
  boundary: {
    color: colors.warning,
    fontSize: 10,
    lineHeight: 15,
    marginVertical: spacing.md,
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: spacing.lg,
  },
  filter: {
    minHeight: 40,
    paddingHorizontal: 13,
    justifyContent: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentDim,
  },
  filterText: { color: colors.muted, fontSize: 10, fontWeight: "800" },
  filterTextActive: { color: colors.accent },
  section: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sources: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  source: {
    flexGrow: 1,
    minWidth: 100,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: spacing.md,
  },
  sourceCount: { color: colors.text, fontSize: 18, fontWeight: "900" },
  sourceLabel: { color: colors.text, fontSize: 10, fontWeight: "700" },
  meta: { color: colors.muted, fontSize: 8, lineHeight: 12 },
  event: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 11,
    padding: spacing.md,
    marginBottom: 6,
  },
  eventTop: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  type: { fontSize: 9, fontWeight: "900", textTransform: "uppercase" },
  eventTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4,
  },
  message: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 3 },
  eventBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 8,
    marginTop: 7,
  },
  amount: { color: colors.text, fontSize: 11, fontWeight: "900" },
  dedupe: { color: colors.muted, fontSize: 7, marginTop: 5 },
  limit: {
    color: colors.warning,
    fontSize: 9,
    lineHeight: 14,
    marginTop: spacing.sm,
  },
  delivery: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: 5,
  },
  reason: {
    color: colors.negative,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },
  state: {
    minHeight: 72,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    justifyContent: "center",
  },
  retry: {
    marginTop: spacing.sm,
    minHeight: 38,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  retryText: { color: colors.accent, fontWeight: "800" },
});
