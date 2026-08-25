import { Ionicons } from "@expo/vector-icons";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
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
  createUserAlert,
  deleteUserAlert,
  fetchAlertDeliveries,
  fetchAlertEvaluations,
  fetchMonitorAlerts,
  fetchUserAlerts,
  setUserAlertActive,
  type CreateAlertInput,
} from "@/api/client";
import type { UserAlert } from "@/api/schema";
import { MonitorTokenTable } from "@/components/MonitorTokenTable";
import { isSolanaAddress } from "@/security/input";
import { useWalletSession } from "@/security/WalletSessionProvider";
import { useSettings } from "@/settings/SettingsProvider";
import { colors, spacing } from "@/theme";

type ViewMode = "live" | "rules" | "delivery";
type AlertType = CreateAlertInput["type"];
const modes: { id: ViewMode; key: "live" | "rules" | "delivery" }[] = [
  { id: "live", key: "live" },
  { id: "rules", key: "rules" },
  { id: "delivery", key: "delivery" },
];

export default function MonitorScreen() {
  const [mode, setMode] = useState<ViewMode>("live");
  const wallet = useWalletSession();
  const queryClient = useQueryClient();
  const { t } = useSettings();
  const live = useQuery({
    queryKey: ["monitor-live"],
    queryFn: ({ signal }) => fetchMonitorAlerts(signal),
    refetchInterval: 30_000,
  });
  const authorized = Boolean(wallet.session && !wallet.locked);
  const rules = useQuery({
    queryKey: ["user-alerts"],
    queryFn: ({ signal }) => fetchUserAlerts(signal),
    enabled: authorized,
  });
  const deliveries = useQuery({
    queryKey: ["alert-deliveries"],
    queryFn: ({ signal }) => fetchAlertDeliveries(signal),
    enabled: authorized && mode === "delivery",
  });
  const evaluations = useInfiniteQuery({ queryKey: ["alert-evaluations"], initialPageParam: null as { evaluatedAt: number; id: string } | null, queryFn: ({ pageParam, signal }) => fetchAlertEvaluations(pageParam, signal), getNextPageParam: (last, pages) => pages.length >= 4 ? undefined : last.page.nextCursor ?? undefined, enabled: authorized && mode === "delivery" });
  const refresh = () =>
    mode === "live"
      ? live.refetch()
      : mode === "rules"
        ? rules.refetch()
        : Promise.all([deliveries.refetch(), evaluations.refetch()]);
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={
              live.isRefetching || rules.isRefetching || deliveries.isRefetching || evaluations.isRefetching
            }
            onRefresh={refresh}
            tintColor={colors.accent}
          />
        }
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>{t("observationDesk")}</Text>
            <Text accessibilityRole="header" style={styles.title}>
              {t("monitor")}
            </Text>
          </View>
          <View accessibilityRole="summary" style={styles.liveBadge}>
            <View
              style={[styles.dot, live.data?.freshness.isStale && styles.stale]}
            />
            <Text style={styles.badgeText}>
              {live.data?.dataQuality?.replaceAll("_", " ").toUpperCase() ??
                t("connecting")}
            </Text>
          </View>
        </View>
        <View accessibilityRole="tablist" style={styles.tabs}>
          {modes.map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="tab"
              accessibilityLabel={t("selectMonitorView", { view: t(item.key) })}
              accessibilityState={{ selected: mode === item.id }}
              onPress={() => setMode(item.id)}
              style={[styles.tab, mode === item.id && styles.tabActive]}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === item.id && styles.tabTextActive,
                ]}
              >
                {t(item.key)}
              </Text>
            </Pressable>
          ))}
        </View>
        {mode === "live" ? (
          <View>
            <MonitorTokenTable />
            <View style={styles.activityHead}>
              <Text accessibilityRole="header" style={styles.sectionTitle}>
                {t("signedActivity")}
              </Text>
              <Text style={styles.sectionHint}>{t("signedActivityBoundary")}</Text>
            </View>
            <LiveFeed query={live} />
          </View>
        ) : !authorized ? (
          <IdentityGate
            locked={wallet.locked}
            busy={wallet.busy}
            onUnlock={wallet.unlock}
            onVerify={wallet.connectAndVerify}
            error={wallet.error}
          />
        ) : mode === "rules" ? (
          <Rules
            data={rules.data?.data ?? []}
            loading={rules.isLoading}
            error={rules.error?.message}
            retrying={rules.isFetching}
            onRetry={() => rules.refetch()}
            onChanged={() =>
              queryClient.invalidateQueries({ queryKey: ["user-alerts"] })
            }
          />
        ) : (
          <View>
            <Delivery data={deliveries.data?.data ?? []} loading={deliveries.isLoading} error={deliveries.error?.message} retrying={deliveries.isFetching} onRetry={() => deliveries.refetch()} />
            <EvaluationHistory data={evaluations.data?.pages.flatMap((page) => page.data) ?? []} loading={evaluations.isLoading} error={evaluations.error?.message} retrying={evaluations.isFetching && !evaluations.isFetchingNextPage} onRetry={() => evaluations.refetch()} hasMore={evaluations.hasNextPage} loadingMore={evaluations.isFetchingNextPage} onLoadMore={() => evaluations.fetchNextPage()} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function LiveFeed({
  query,
}: {
  query: ReturnType<
    typeof useQuery<Awaited<ReturnType<typeof fetchMonitorAlerts>>, Error>
  >;
}) {
  const { t } = useSettings();
  const router = useRouter();
  if (query.isLoading) return <State loading text={t("loadingActivity")} />;
  if (query.isError)
    return (
      <State
        error
        text={t("evidenceLoadFailed")}
        action={t("retry")}
        actionBusy={query.isFetching}
        onAction={() => query.refetch()}
      />
    );
  return (
    <View>
      <Text style={styles.provenance}>
        {t("source")}: {query.data?.source} ·{" "}
        {t("signedObservations", { count: query.data?.recordCount ?? 0 })}
      </Text>
      {query.data?.alerts.length ? (
        query.data.alerts.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={t("openMonitorToken", {
              symbol: item.tokenSymbol,
            })}
            onPress={() =>
              router.push({
                pathname: "/token/[address]",
                params: { address: item.tokenAddress },
              })
            }
            style={styles.event}
          >
            <View
              style={[
                styles.eventIcon,
                item.type.includes("buy") ? styles.buy : styles.sell,
              ]}
            >
              <Ionicons
                name={item.type.includes("buy") ? "arrow-down" : "arrow-up"}
                size={15}
                color={
                  item.type.includes("buy") ? colors.positive : colors.negative
                }
              />
            </View>
            <View style={styles.flex}>
              <Text style={styles.eventTitle}>
                {item.tokenSymbol} · {item.type.replaceAll("_", " ")}
              </Text>
              <Text style={styles.eventMeta}>
                {short(item.txHash)} · {item.source} ·{" "}
                {relative(item.timestamp, t)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={15} color={colors.muted} />
          </Pressable>
        ))
      ) : (
        <State text={t("noActivity")} />
      )}
    </View>
  );
}

function Rules({
  data,
  loading,
  error,
  retrying,
  onRetry,
  onChanged,
}: {
  data: UserAlert[];
  loading: boolean;
  error?: string;
  retrying: boolean;
  onRetry: () => void;
  onChanged: () => void;
}) {
  const { t } = useSettings();
  const [open, setOpen] = useState(false);
  if (loading) return <State loading text={t("loadingRules")} />;
  if (error) return <State error text={error} action={t("retry")} actionBusy={retrying} onAction={onRetry} />;
  return (
    <View>
      <View style={styles.sectionHead}>
        <View>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            {t("alertRules")}
          </Text>
          <Text style={styles.sectionHint}>{t("rulesSchedulerBoundary")}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("createAlertRule")}
          onPress={() => setOpen((value) => !value)}
          style={styles.primary}
        >
          <Ionicons
            name={open ? "close" : "add"}
            size={15}
            color={colors.background}
          />
          <Text style={styles.primaryText}>
            {open ? t("close") : t("newRule")}
          </Text>
        </Pressable>
      </View>
      {open ? (
        <AlertComposer
          onCreated={() => {
            setOpen(false);
            onChanged();
          }}
        />
      ) : null}
      {data.map((item) => (
        <AlertCard key={item.id} alert={item} onChanged={onChanged} />
      ))}
      {!data.length && !open ? <State text={t("noAlertRules")} /> : null}
    </View>
  );
}

export function AlertComposer({ onCreated }: { onCreated: () => void }) {
  const { t } = useSettings();
  const [address, setAddress] = useState("");
  const [type, setType] = useState<AlertType>("price");
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [value, setValue] = useState("");
  const [name, setName] = useState("");
  const mutation = useMutation({
    mutationFn: createUserAlert,
    onSuccess: onCreated,
  });
  const numeric = Number(value);
  const valid =
    isSolanaAddress(address.trim()) &&
    Number.isFinite(numeric) &&
    numeric > 0 &&
    name.trim().length > 0;
  const conditions =
    type === "price"
      ? { condition, targetPrice: numeric }
      : type === "percentageChange"
        ? { condition, threshold: numeric, timeframe: "h1" }
        : { threshold: numeric, timeframe: "1h" };
  return (
    <View style={styles.composer}>
      <Text style={styles.label}>{t("ruleName")}</Text>
      <TextInput
        accessibilityLabel={t("alertName")}
        value={name}
        onChangeText={setName}
        maxLength={100}
        placeholder={t("alertNamePlaceholder")}
        placeholderTextColor={colors.muted}
        style={styles.input}
      />
      <Text style={styles.label}>{t("tokenAddressLabel")}</Text>
      <TextInput
        accessibilityLabel={t("alertTokenAddress")}
        value={address}
        onChangeText={setAddress}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder={t("solanaMintAddress")}
        placeholderTextColor={colors.muted}
        style={styles.input}
      />
      <Text style={styles.label}>{t("signal")}</Text>
      <View style={styles.choiceRow}>
        {(["price", "percentageChange", "volumeSpike"] as AlertType[]).map(
          (item) => (
            <Choice
              key={item}
              label={
                item === "percentageChange"
                  ? t("oneHourChange")
                  : item === "volumeSpike"
                    ? t("volumeSpike")
                    : t("price")
              }
              active={type === item}
              onPress={() => setType(item)}
            />
          ),
        )}
      </View>
      {type !== "volumeSpike" ? (
        <View style={styles.choiceRow}>
          <Choice
            label={t("aboveChoice")}
            active={condition === "above"}
            onPress={() => setCondition("above")}
          />
          <Choice
            label={t("belowChoice")}
            active={condition === "below"}
            onPress={() => setCondition("below")}
          />
        </View>
      ) : null}
      <Text style={styles.label}>
        {type === "price"
          ? t("targetUsd")
          : type === "percentageChange"
            ? t("changePercent")
            : t("volumeMultiplier")}
      </Text>
      <TextInput
        accessibilityLabel={t("alertThreshold")}
        value={value}
        onChangeText={setValue}
        keyboardType="decimal-pad"
        placeholder={t("positiveValue")}
        placeholderTextColor={colors.muted}
        style={styles.input}
      />
      <Text accessibilityRole="summary" style={styles.disclosure}>
        {t("alertDeliveryDisclosure")}
      </Text>
      {mutation.error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {mutation.error.message}
        </Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("saveAlertRule")}
        accessibilityState={{
          disabled: !valid || mutation.isPending,
          busy: mutation.isPending,
        }}
        disabled={!valid || mutation.isPending}
        onPress={() =>
          mutation.mutate({
            address: address.trim(),
            type,
            name: name.trim(),
            conditions,
            cooldownMinutes: 60,
            channels: ["inApp"],
          })
        }
        style={[styles.save, (!valid || mutation.isPending) && styles.disabled]}
      >
        <Text style={styles.saveText}>
          {mutation.isPending ? t("saving") : t("saveDatabaseRule")}
        </Text>
      </Pressable>
    </View>
  );
}

export function AlertCard({
  alert,
  onChanged,
}: {
  alert: UserAlert;
  onChanged: () => void;
}) {
  const { t } = useSettings();
  const toggle = useMutation({
    mutationFn: () => setUserAlertActive(alert.id, !alert.active),
    onSuccess: onChanged,
  });
  const remove = useMutation({
    mutationFn: () => deleteUserAlert(alert.id),
    onSuccess: onChanged,
  });
  return (
    <View style={styles.rule}>
      <View style={styles.ruleTop}>
        <View style={styles.flex}>
          <Text style={styles.ruleName}>{alert.name}</Text>
          <Text style={styles.ruleMeta}>
            {alert.type.replaceAll(/([A-Z])/g, " $1")} · {short(alert.address)}
          </Text>
        </View>
        <Pressable
          accessibilityRole="switch"
          accessibilityState={{
            checked: alert.active,
            disabled: toggle.isPending,
            busy: toggle.isPending,
          }}
          accessibilityLabel={t(alert.active ? "pauseAlert" : "activateAlert", {
            name: alert.name,
          })}
          onPress={() => toggle.mutate()}
          disabled={toggle.isPending}
          style={[styles.switch, alert.active && styles.switchOn]}
        >
          <View style={[styles.knob, alert.active && styles.knobOn]} />
        </Pressable>
      </View>
      <Text style={styles.condition}>{conditionLabel(alert, t)}</Text>
      <View style={styles.ruleFoot}>
        <Text style={styles.ruleMeta}>
          {t("alertHistory", {
            count: alert.triggerCount,
            last: alert.lastTriggered
              ? relative(alert.lastTriggered, t)
              : t("never"),
          })}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("deleteAlert", { name: alert.name })}
          accessibilityState={{
            disabled: remove.isPending,
            busy: remove.isPending,
          }}
          onPress={() => remove.mutate()}
          disabled={remove.isPending}
        >
          <Text style={styles.delete}>
            {remove.isPending ? t("deleting") : t("delete")}
          </Text>
        </Pressable>
      </View>
      {toggle.error || remove.error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {(toggle.error ?? remove.error)?.message}
        </Text>
      ) : null}
    </View>
  );
}

function Delivery({
  data,
  loading,
  error,
  retrying,
  onRetry,
}: {
  data: Awaited<ReturnType<typeof fetchAlertDeliveries>>["data"];
  loading: boolean;
  error?: string;
  retrying: boolean;
  onRetry: () => void;
}) {
  const { t } = useSettings();
  if (loading) return <State loading text={t("loadingDeliveries")} />;
  if (error) return <State error text={error} action={t("retry")} actionBusy={retrying} onAction={onRetry} />;
  return (
    <View>
      <Text accessibilityRole="summary" style={styles.provenance}>
        {t("deliveryLedgerBoundary")}
      </Text>
      {data.map((item) => (
        <View key={item.id} style={styles.delivery}>
          <View
            style={[
              styles.deliveryDot,
              item.status === "delivered"
                ? styles.delivered
                : item.status === "failed" || item.status === "unavailable"
                  ? styles.failed
                  : styles.pending,
            ]}
          />
          <View style={styles.flex}>
            <Text style={styles.eventTitle}>
              {item.channel} · {item.status}
            </Text>
            <Text style={styles.eventMeta}>
              {item.reason ??
                t("deliveryEvent", { event: short(item.eventKey) })}{" "}
              · {relative(Date.parse(item.createdAt), t)}
            </Text>
          </View>
        </View>
      ))}
      {!data.length ? <State text={t("noDeliveries")} /> : null}
    </View>
  );
}

export function EvaluationHistory({ data, loading, error, retrying = false, onRetry, hasMore = false, loadingMore = false, onLoadMore }: { data: Awaited<ReturnType<typeof fetchAlertEvaluations>>["data"]; loading: boolean; error?: string; retrying?: boolean; onRetry?: () => void; hasMore?: boolean; loadingMore?: boolean; onLoadMore?: () => void }) {
  const { t } = useSettings();
  if (loading) return <State loading text={t("loadingEvaluations")} />;
  if (error) return <State error text={error} action={t("retry")} actionBusy={retrying} onAction={onRetry} />;
  return <View style={styles.evaluationSection}>
    <Text accessibilityRole="header" style={styles.sectionTitle}>{t("evaluationHistory")}</Text>
    <Text accessibilityRole="summary" style={styles.sectionHint}>{t("evaluationEvidenceBoundary")}</Text>
    {data.map((item) => <View key={item.id} style={styles.delivery}>
      <View style={[styles.deliveryDot, item.status === "triggered" ? styles.delivered : item.status === "unavailable" ? styles.failed : styles.pending]} />
      <View style={styles.flex}>
        <Text style={styles.eventTitle}>{item.alert.name} · {t(item.status === "triggered" ? "triggered" : item.status === "not_triggered" ? "notTriggered" : "unavailable")}</Text>
        <Text style={styles.eventMeta}>{t("evaluationMetric", { metric: item.metric.name, value: item.metric.value ?? t("unavailable"), threshold: item.metric.threshold ?? t("unavailable") })} · {relative(item.evaluatedAt, t)}</Text>
        <Text style={styles.eventMeta}>{item.source} · {short(item.sourceIdentity)}{item.reason ? ` · ${item.reason}` : ""}</Text>
      </View>
    </View>)}
    {hasMore && onLoadMore ? <Pressable accessibilityRole="button" accessibilityLabel={t("loadOlderEvaluations")} accessibilityState={{ disabled: loadingMore, busy: loadingMore }} disabled={loadingMore} onPress={onLoadMore} style={[styles.primary, loadingMore && styles.disabled]}><Text style={styles.primaryText}>{loadingMore ? t("loadingOlderEvaluations") : t("loadOlderEvaluations")}</Text></Pressable> : null}
    {!data.length ? <State text={t("noEvaluations")} /> : null}
  </View>;
}
function IdentityGate({
  locked,
  busy,
  onUnlock,
  onVerify,
  error,
}: {
  locked: boolean;
  busy: boolean;
  onUnlock: () => Promise<void>;
  onVerify: () => Promise<void>;
  error: string | null;
}) {
  const { t } = useSettings();
  return (
    <View style={styles.gate}>
      <Ionicons name="shield-checkmark" size={28} color={colors.accent} />
      <Text style={styles.sectionTitle}>
        {locked ? t("unlockPrivateAlerts") : t("verifyWalletOwnership")}
      </Text>
      <Text style={styles.sectionHint}>{t("privateAlertsBoundary")}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          locked ? t("unlockAlerts") : t("verifyWalletOwnership")
        }
        accessibilityState={{ disabled: busy, busy }}
        disabled={busy}
        onPress={locked ? onUnlock : onVerify}
        style={styles.primary}
      >
        <Text style={styles.primaryText}>
          {busy ? t("working") : locked ? t("unlock") : t("verifyWallet")}
        </Text>
      </Pressable>
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
function Choice({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: active }}
      onPress={onPress}
      style={[styles.choice, active && styles.choiceActive]}
    >
      <Text style={[styles.choiceText, active && styles.choiceTextActive]}>
        {label}
      </Text>
    </Pressable>
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
  const showAction = Boolean(action && onAction);
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
      {showAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={action}
          accessibilityState={{ busy: actionBusy, disabled: actionBusy }}
          disabled={actionBusy}
          onPress={onAction}
          style={[styles.stateAction, actionBusy && styles.stateActionDisabled]}
        >
          <Text style={styles.stateActionText}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
function short(value: string) {
  return value.length > 12 ? `${value.slice(0, 5)}…${value.slice(-5)}` : value;
}
function relative(timestamp: number, t: ReturnType<typeof useSettings>["t"]) {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  return seconds < 60
    ? t("secondsAgo", { count: seconds })
    : seconds < 3600
      ? t("minutesAgo", { count: Math.floor(seconds / 60) })
      : seconds < 86400
        ? t("hoursAgo", { count: Math.floor(seconds / 3600) })
        : t("daysAgo", { count: Math.floor(seconds / 86400) });
}
function conditionLabel(
  alert: UserAlert,
  t: ReturnType<typeof useSettings>["t"],
) {
  const c = alert.conditions;
  if (alert.type === "price")
    return t("priceCondition", {
      condition: String(c.condition ?? ""),
      value: String(c.targetPrice ?? "—"),
    });
  if (alert.type === "percentageChange")
    return t("changeCondition", {
      condition: String(c.condition ?? ""),
      value: String(c.threshold ?? "—"),
    });
  if (alert.type === "volumeSpike")
    return t("volumeCondition", { value: String(c.threshold ?? "—") });
  return alert.type;
}

const styles = StyleSheet.create({
  evaluationSection: { marginTop: spacing.xl, gap: spacing.sm },
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 90 },
  header: {
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
  },
  title: { color: colors.text, fontSize: 28, fontWeight: "900" },
  liveBadge: {
    maxWidth: 150,
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
  badgeText: {
    flexShrink: 1,
    color: colors.muted,
    fontSize: 7,
    fontWeight: "900",
  },
  tabs: {
    marginHorizontal: spacing.lg,
    flexDirection: "row",
    padding: 4,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  tab: { flex: 1, paddingVertical: 9, alignItems: "center", borderRadius: 9 },
  tabActive: { backgroundColor: colors.accentDim },
  tabText: { color: colors.muted, fontSize: 11, fontWeight: "800" },
  tabTextActive: { color: colors.accent },
  provenance: {
    color: colors.muted,
    fontSize: 9,
    margin: spacing.lg,
    textAlign: "right",
  },
  event: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  eventIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  buy: { backgroundColor: colors.accentDim },
  sell: { backgroundColor: "#3d2028" },
  flex: { flex: 1 },
  eventTitle: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  eventMeta: { color: colors.muted, fontSize: 9, marginTop: 4 },
  sectionHead: {
    padding: spacing.lg,
    gap: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activityHead: { marginHorizontal: spacing.lg, marginTop: spacing.sm },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: "900" },
  sectionHint: {
    color: colors.muted,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 4,
    maxWidth: 250,
  },
  primary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 9,
    backgroundColor: colors.accent,
  },
  primaryText: { color: colors.background, fontSize: 10, fontWeight: "900" },
  composer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  label: {
    color: colors.muted,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: spacing.md,
    marginBottom: 5,
  },
  input: {
    color: colors.text,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    padding: 11,
    fontSize: 12,
  },
  choiceRow: { flexDirection: "row", gap: 6, marginBottom: spacing.sm },
  choice: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
  },
  choiceActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentDim,
  },
  choiceText: { color: colors.muted, fontSize: 9, fontWeight: "800" },
  choiceTextActive: { color: colors.accent },
  disclosure: {
    color: colors.warning,
    fontSize: 9,
    lineHeight: 14,
    marginTop: spacing.md,
  },
  save: {
    alignItems: "center",
    padding: 12,
    marginTop: spacing.md,
    borderRadius: 9,
    backgroundColor: colors.accent,
  },
  saveText: { color: colors.background, fontSize: 11, fontWeight: "900" },
  disabled: { opacity: 0.35 },
  rule: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    backgroundColor: colors.surface,
  },
  ruleTop: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  ruleName: { color: colors.text, fontSize: 13, fontWeight: "900" },
  ruleMeta: {
    color: colors.muted,
    fontSize: 9,
    marginTop: 4,
    textTransform: "capitalize",
  },
  condition: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "800",
    paddingVertical: spacing.md,
  },
  ruleFoot: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  switch: {
    width: 39,
    height: 22,
    padding: 3,
    borderRadius: 11,
    backgroundColor: colors.border,
  },
  switchOn: { backgroundColor: colors.accent },
  knob: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.muted,
  },
  knobOn: { marginLeft: 17, backgroundColor: colors.background },
  delete: { color: colors.negative, fontSize: 9, fontWeight: "800" },
  delivery: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    backgroundColor: colors.surface,
  },
  deliveryDot: { width: 8, height: 8, borderRadius: 4 },
  delivered: { backgroundColor: colors.positive },
  failed: { backgroundColor: colors.negative },
  pending: { backgroundColor: colors.warning },
  gate: {
    margin: spacing.lg,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    backgroundColor: colors.surface,
  },
  error: { color: colors.negative, fontSize: 9, marginTop: spacing.sm },
  state: {
    minHeight: 260,
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  stateText: { color: colors.muted, textAlign: "center", lineHeight: 19 },
  stateAction: {
    minHeight: 44,
    minWidth: 120,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
  },
  stateActionDisabled: { opacity: 0.55 },
  stateActionText: { color: colors.background, fontWeight: "900" },
});
