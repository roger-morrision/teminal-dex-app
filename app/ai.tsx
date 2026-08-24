import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
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
  fetchAiGmgnHistory,
  fetchAiPaperReport,
  fetchAiPlatform,
  fetchAiRecommendations,
} from "@/api/client";
import type {
  AiGmgnHistory,
  AiPaperReport,
  AiPlatform,
  AiRecommendation,
} from "@/api/schema";
import { compactUsd, signedPercent } from "@/lib/format";
import { useWalletSession } from "@/security/WalletSessionProvider";
import { colors, spacing } from "@/theme";
import { useSettings } from "@/settings/SettingsProvider";

type Tab = "advisories" | "paper" | "history" | "governance";
const tabs = [
  { id: "advisories", key: "advisories" },
  { id: "paper", key: "paper" },
  { id: "history", key: "discoveryHistory" },
  { id: "governance", key: "governance" },
] as const;

export default function AiScreen() {
  const router = useRouter();
  const { t } = useSettings();
  const wallet = useWalletSession();
  const [tab, setTab] = useState<Tab>("advisories");
  const authorized = Boolean(wallet.session && !wallet.locked);
  const recommendations = useQuery({
    queryKey: ["ai-recommendations"],
    queryFn: ({ signal }) => fetchAiRecommendations(signal),
    refetchInterval: 60_000,
  });
  const paper = useQuery({
    queryKey: ["ai-paper-report"],
    queryFn: ({ signal }) => fetchAiPaperReport(signal),
    refetchInterval: 60_000,
  });
  const platform = useQuery({
    queryKey: ["ai-platform"],
    queryFn: ({ signal }) => fetchAiPlatform(signal),
    enabled: authorized && tab === "governance",
  });
  const gmgnHistory = useQuery({
    queryKey: ["ai-gmgn-history", wallet.session?.wallet],
    queryFn: ({ signal }) => fetchAiGmgnHistory(signal),
    enabled: authorized && tab === "history",
  });
  const refresh = () =>
    tab === "advisories"
      ? recommendations.refetch()
      : tab === "paper"
        ? paper.refetch()
        : tab === "history"
          ? gmgnHistory.refetch()
          : platform.refetch();
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={
              recommendations.isRefetching ||
              paper.isRefetching ||
              gmgnHistory.isRefetching ||
              platform.isRefetching
            }
            onRefresh={refresh}
            tintColor={colors.accent}
          />
        }
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("backAi")}
            onPress={() => router.back()}
            style={styles.back}
          >
            <Ionicons name="arrow-back" size={18} color={colors.text} />
          </Pressable>
          <View style={styles.flex}>
            <Text style={styles.eyebrow}>{t("evidenceNotOracle")}</Text>
            <Text accessibilityRole="header" style={styles.title}>
              {t("aiIntelligence")}
            </Text>
          </View>
          <View accessibilityRole="summary" style={styles.lock}>
            <Ionicons name="lock-closed" size={11} color={colors.warning} />
            <Text style={styles.lockText}>{t("executionOff")}</Text>
          </View>
        </View>
        <View accessibilityRole="summary" style={styles.notice}>
          <Ionicons
            name="information-circle"
            size={15}
            color={colors.warning}
          />
          <Text style={styles.noticeText}>{t("aiSafety")}</Text>
        </View>
        <View accessibilityRole="tablist" style={styles.tabs}>
          {tabs.map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="tab"
              accessibilityLabel={t("selectAiTab", { tab: t(item.key) })}
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
        {tab === "advisories" ? (
          <Advisories
            data={recommendations.data ?? []}
            loading={recommendations.isLoading}
            error={recommendations.error?.message}
            onOpen={(address) =>
              router.push({ pathname: "/token/[address]", params: { address } })
            }
          />
        ) : tab === "paper" ? (
          <Paper
            report={paper.data}
            loading={paper.isLoading}
            error={paper.error?.message}
          />
        ) : !authorized ? (
          <IdentityGate
            locked={wallet.locked}
            busy={wallet.busy}
            error={wallet.error}
            onUnlock={wallet.unlock}
            onVerify={wallet.connectAndVerify}
          />
        ) : tab === "history" ? (
          <GmgnHistory
            data={gmgnHistory.data}
            loading={gmgnHistory.isLoading}
            error={gmgnHistory.error?.message}
            onOpen={(address) =>
              router.push({ pathname: "/token/[address]", params: { address } })
            }
          />
        ) : (
          <Governance
            data={platform.data}
            loading={platform.isLoading}
            error={platform.error?.message}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export function GmgnHistory({
  data,
  loading,
  error,
  onOpen,
}: {
  data?: AiGmgnHistory;
  loading: boolean;
  error?: string;
  onOpen: (address: string) => void;
}) {
  const { t } = useSettings();
  if (loading) return <State loading text={t("loadingDiscoveryHistory")} />;
  if (error || !data)
    return <State error text={error ?? t("discoveryHistoryUnavailable")} />;
  return (
    <View>
      <View accessibilityRole="summary" style={styles.phase31}>
        <Ionicons name="time" size={22} color={colors.accent} />
        <View style={styles.flex}>
          <Text style={styles.sectionTitle}>{t("gmgnDiscoveryHistory")}</Text>
          <Text style={styles.meta}>
            {t("gmgnHistorySummary", {
              observations: data.historySummary.observations,
              sweeps: data.historySummary.sweeps,
              shown: data.providerHistory.length,
            })}
          </Text>
        </View>
        <Text style={styles.locked}>{t("readOnly")}</Text>
      </View>
      <Text style={styles.provenance}>{t("gmgnHistoryBoundary")}</Text>
      {data.providerHistory.slice(0, 50).map((row) => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("openGmgnEvidence", {
            symbol: row.symbol ?? row.address.slice(0, 7),
          })}
          key={row.id}
          onPress={() => onOpen(row.address)}
          style={styles.card}
        >
          <View style={styles.cardTop}>
            <View style={styles.flex}>
              <Text style={styles.symbol}>
                {row.symbol ?? `${row.address.slice(0, 5)}…${row.address.slice(-5)}`}
              </Text>
              <Text style={styles.meta}>
                {row.name ?? row.provider} · {row.quality}
              </Text>
            </View>
            <Text style={row.mintVerified ? styles.verified : styles.blocker}>
              {row.mintVerified ? t("mintVerified") : t("mintUnverified")}
            </Text>
          </View>
          <View style={styles.evidenceRow}>
            <Evidence
              label={t("price")}
              value={row.priceUsd == null ? t("unavailable") : compactUsd(row.priceUsd)}
              good={row.priceUsd != null}
            />
            <Evidence
              label={t("liquidity")}
              value={row.liquidityUsd == null ? t("unavailable") : compactUsd(row.liquidityUsd)}
              good={row.liquidityUsd != null}
            />
            <Evidence
              label={t("volume24h")}
              value={row.volume24hUsd == null ? t("unavailable") : compactUsd(row.volume24hUsd)}
              good={row.volume24hUsd != null}
            />
            <Evidence
              label={t("confidence")}
              value={`${Math.round(row.confidence * 100)}%`}
              good={row.mintVerified && row.confidence >= 0.5}
            />
          </View>
          <Text style={styles.meta}>
            {t("gmgnObserved", {
              provider: row.provider,
              observed: new Date(row.observedAt).toLocaleString(),
            })}
          </Text>
        </Pressable>
      ))}
      {!data.providerHistory.length ? <State text={t("noGmgnHistory")} /> : null}
      {data.providerHistory.length > 50 ? (
        <Text style={styles.provenance}>
          {t("gmgnRenderLimit", { shown: 50, total: data.providerHistory.length })}
        </Text>
      ) : null}
    </View>
  );
}

function Advisories({
  data,
  loading,
  error,
  onOpen,
}: {
  data: AiRecommendation[];
  loading: boolean;
  error?: string;
  onOpen: (address: string) => void;
}) {
  const { t } = useSettings();
  if (loading) return <State loading text={t("loadingAdvisories")} />;
  if (error) return <State error text={error} />;
  return (
    <View>
      <Text style={styles.provenance}>{t("advisoryProvenance")}</Text>
      {data.map((item) => (
        <RecommendationCard
          key={`${item.tokenAddress}:${item.createdAt}`}
          recommendation={item}
          onOpen={() => onOpen(item.tokenAddress)}
        />
      ))}
      {!data.length ? <State text={t("noAdvisories")} /> : null}
    </View>
  );
}
export function RecommendationCard({
  recommendation,
  onOpen,
}: {
  recommendation: AiRecommendation;
  onOpen: () => void;
}) {
  const { t } = useSettings();
  const evidence = recommendation.recommendationEvidence;
  const usable = evidence.safeForAdvisoryUse;
  const reason = evidence.expired
    ? t("expiredReason")
    : evidence.missingFeatures.length
      ? t("missingFeatures", { count: evidence.missingFeatures.length })
      : t("incompleteEvidence");
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("openAdvisory", {
        symbol: recommendation.tokenSymbol,
      })}
      onPress={onOpen}
      style={styles.card}
    >
      <View style={styles.cardTop}>
        <View
          style={[
            styles.score,
            usable ? styles.scoreCurrent : styles.scoreBlocked,
          ]}
        >
          <Text style={styles.scoreValue}>
            {recommendation.score.toFixed(0)}
          </Text>
          <Text style={styles.scoreLabel}>{t("score")}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.symbol}>{recommendation.tokenSymbol}</Text>
          <Text style={styles.meta}>
            {recommendation.category.replaceAll("_", " ")} ·{" "}
            {recommendation.modelVersion}
          </Text>
        </View>
        <View>
          <Text style={styles.confidence}>
            {recommendation.confidence.toFixed(0)}%
          </Text>
          <Text style={styles.meta}>{t("confidence")}</Text>
        </View>
      </View>
      <View style={styles.evidenceRow}>
        <Evidence
          label={t("status")}
          value={evidence.status.replaceAll("_", " ")}
          good={usable}
        />
        <Evidence
          label={t("providers")}
          value={String(evidence.providerFamilies.length)}
          good={evidence.providerFamilies.length >= 2}
        />
        <Evidence
          label={t("costs")}
          value={evidence.costsIncluded ? t("included") : t("missing")}
          good={evidence.costsIncluded}
        />
        <Evidence
          label={t("pointTime")}
          value={evidence.pointInTime ? t("yes") : t("no")}
          good={evidence.pointInTime}
        />
      </View>
      <View style={styles.cardFoot}>
        <Text style={styles.meta}>
          {t("outcomesSummary", {
            resolved: recommendation.outcomes.resolved,
            total: recommendation.outcomes.total,
            wins: recommendation.outcomes.wins,
            losses: recommendation.outcomes.losses,
          })}
        </Text>
        <Text
          style={[
            styles.outcome,
            {
              color:
                (recommendation.outcomes.avgReturnPct ?? 0) >= 0
                  ? colors.positive
                  : colors.negative,
            },
          ]}
        >
          {recommendation.outcomes.avgReturnPct == null
            ? t("unresolved")
            : `${signedPercent(recommendation.outcomes.avgReturnPct)} ${t("average")}`}
        </Text>
      </View>
      {!usable ? (
        <Text style={styles.blocker}>
          {t("advisoryUnqualified", { reason })}
        </Text>
      ) : null}
    </Pressable>
  );
}

export function Paper({
  report,
  loading,
  error,
}: {
  report?: AiPaperReport;
  loading: boolean;
  error?: string;
}) {
  const { t } = useSettings();
  if (loading) return <State loading text={t("loadingPaper")} />;
  if (error || !report)
    return <State error text={error ?? t("paperUnavailable")} />;
  const totalCosts =
    report.analytics.totalFeesUsd + report.analytics.totalSlippageCostUsd;
  return (
    <View>
      <View accessibilityRole="summary" style={styles.paperGate}>
        <View style={styles.flex}>
          <Text style={styles.sectionTitle}>{t("simulationLedger")}</Text>
          <Text style={styles.meta}>
            {t("simulationMeta", { status: report.operations.status })}
          </Text>
        </View>
        <Text style={styles.simBadge}>{report.mode.toUpperCase()}</Text>
      </View>
      <View style={styles.kpis}>
        <Kpi label={t("equity")} value={compactUsd(report.summary.equityUsd)} />
        <Kpi
          label={t("totalPnl")}
          value={compactUsd(report.summary.totalPnlUsd)}
          tone={report.summary.totalPnlUsd >= 0 ? "good" : "bad"}
        />
        <Kpi label={t("closed")} value={String(report.summary.closedTrades)} />
        <Kpi
          label={t("winRate")}
          value={
            report.summary.winRate == null
              ? t("collecting")
              : `${(report.summary.winRate * 100).toFixed(1)}%`
          }
        />
        <Kpi
          label={t("drawdown")}
          value={`${report.summary.maxDrawdownPct.toFixed(2)}%`}
          tone="bad"
        />
        <Kpi label={t("costs")} value={compactUsd(totalCosts)} />
      </View>
      <View accessibilityRole="summary" style={styles.readiness}>
        <View style={styles.readinessTop}>
          <Text style={styles.sectionTitle}>{t("liveReadinessGate")}</Text>
          <Text style={styles.locked}>{t("locked")}</Text>
        </View>
        <Text style={styles.readinessNote}>{report.readiness.note}</Text>
        <View style={styles.checks}>
          {Object.entries(report.readiness.checks)
            .filter(([key]) => !["simulationOnly", "killSwitch"].includes(key))
            .map(([key, passed]) => (
              <View key={key} style={styles.check}>
                <Ionicons
                  name={passed ? "checkmark-circle" : "ellipse-outline"}
                  size={12}
                  color={passed ? colors.positive : colors.muted}
                />
                <Text style={[styles.checkText, passed && styles.checkPassed]}>
                  {key.replaceAll(/([A-Z])/g, " $1").toLowerCase()}
                </Text>
              </View>
            ))}
        </View>
      </View>
      <Ledger
        title={t("operationalIntegrity")}
        empty={t("operationalEvidenceUnavailable")}
        rows={[
          {
            key: "operations",
            title: t("cycleOperations"),
            detail: t("cycleOperationsDetail", {
              cycle: report.operations.cycleStatus,
              failures: report.operations.failedOrAbandoned24h,
              reasons: report.operations.reasons.join(", ") || t("none"),
            }),
            value: report.operations.status,
          },
          {
            key: "mutations",
            title: t("mutationRecovery"),
            detail: t("mutationRecoveryDetail", {
              qualified: report.mutationHealth.qualifiedMutations,
              audited: report.mutationHealth.auditedMutations,
              review: report.mutationHealth.manualReview,
              reasons: report.mutationHealth.reasons.join(", ") || t("none"),
            }),
            value: report.mutationHealth.healthy ? t("healthy") : t("degraded"),
          },
          {
            key: "leases",
            title: t("jobLeaseFencing"),
            detail: t("jobLeaseDetail", {
              qualified: report.jobLeaseHealth.qualifiedLeases,
              observed: report.jobLeaseHealth.observedLeases,
              active: report.jobLeaseHealth.activeLeases,
            }),
            value: report.jobLeaseHealth.status.replaceAll("_", " "),
          },
          {
            key: "cycles",
            title: t("cycleHistory"),
            detail: t("cycleHistoryDetail", {
              qualified: report.cycleHistoryHealth.qualifiedTerminalCycles,
              required: report.cycleHistoryHealth.minimumHistory,
              running: report.cycleHistoryHealth.runningCycles,
            }),
            value: report.cycleHistoryHealth.status.replaceAll("_", " "),
          },
        ]}
      />
      <Text accessibilityRole="text" style={styles.readinessNote}>
        {t("operationalIntegrityBoundary")}
      </Text>
      <Ledger
        title={t("openSimulations")}
        empty={t("noOpenSimulations")}
        rows={report.positions.map((item) => ({
          key: item.id,
          title: `${item.tokenSymbol} · ${item.markStatus}`,
          detail: t("entryMark", {
            entry: item.entryPrice,
            mark: item.currentPrice ?? t("unavailable"),
          }),
          value:
            item.unrealizedPnlUsd == null
              ? t("markUnavailable")
              : compactUsd(item.unrealizedPnlUsd),
        }))}
      />
      <Ledger
        title={t("recentClosedSimulations")}
        empty={t("noClosedSimulations")}
        rows={report.closedTrades.slice(0, 10).map((item) => ({
          key: item.id,
          title: item.tokenSymbol,
          detail: item.exitReason.replaceAll("_", " "),
          value: `${compactUsd(item.realizedPnlUsd)} · ${signedPercent(item.returnPct)}`,
        }))}
      />
      <Ledger
        title={t("adaptiveResearchPool")}
        empty={t("noCandidates")}
        rows={report.potentialPool.slice(0, 10).map((item) => ({
          key: item.tokenAddress,
          title: `${item.tokenSymbol ?? item.tokenAddress.slice(0, 7)} · ${item.status.replaceAll("_", " ")}`,
          detail: t("observationsProgress", {
            count: item.observations,
            minutes: item.monitoredMinutes.toFixed(0),
            required: item.requiredMonitoringMinutes,
          }),
          value: `P${item.priority.toFixed(0)}`,
        }))}
      />
    </View>
  );
}

function Governance({
  data,
  loading,
  error,
}: {
  data?: AiPlatform;
  loading: boolean;
  error?: string;
}) {
  const { t } = useSettings();
  if (loading) return <State loading text={t("loadingGovernance")} />;
  if (error || !data)
    return <State error text={error ?? t("governanceUnavailable")} />;
  return (
    <View>
      <View accessibilityRole="summary" style={styles.phase31}>
        <Ionicons name="shield-checkmark" size={22} color={colors.negative} />
        <View style={styles.flex}>
          <Text style={styles.sectionTitle}>
            {t("phaseStatus", {
              status: data.phase31.status.replaceAll("_", " "),
            })}
          </Text>
          <Text style={styles.meta}>
            {t("governanceProgress", {
              trades: data.metrics.closedTrades ?? 0,
              days: data.metrics.operatingDays ?? 0,
            })}
          </Text>
        </View>
        <Text style={styles.locked}>{t("noExecution")}</Text>
      </View>
      {data.phase31.blockers.length ? (
        <View style={styles.blockers}>
          {data.phase31.blockers.map((item) => (
            <Text key={item} style={styles.blockerChip}>
              {item.replaceAll("_", " ")}
            </Text>
          ))}
        </View>
      ) : null}
      <View style={styles.phaseGrid}>
        {data.phases.map((phase) => (
          <View key={phase.phase} style={styles.phase}>
            <View style={styles.phaseTop}>
              <Text style={styles.phaseNo}>P{phase.phase}</Text>
              <Ionicons
                name={phase.status === "ready" ? "checkmark-circle" : "time"}
                size={13}
                color={
                  phase.status === "ready" ? colors.positive : colors.warning
                }
              />
            </View>
            <Text style={styles.phaseTitle}>{phase.title}</Text>
            <Text style={styles.meta}>
              {t("evidenceRecords", {
                status: phase.status.replaceAll("_", " "),
                count: phase.evidenceCount,
              })}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function IdentityGate({
  locked,
  busy,
  error,
  onUnlock,
  onVerify,
}: {
  locked: boolean;
  busy: boolean;
  error: string | null;
  onUnlock: () => Promise<void>;
  onVerify: () => Promise<void>;
}) {
  const { t } = useSettings();
  const label = locked ? t("unlock") : t("verifyWallet");
  return (
    <View accessibilityRole="summary" style={styles.gate}>
      <Ionicons name="finger-print" size={28} color={colors.accent} />
      <Text style={styles.sectionTitle}>
        {locked ? t("unlockGovernance") : t("verifyWalletOwnership")}
      </Text>
      <Text style={styles.readinessNote}>{t("governanceOwnerScope")}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: busy, busy }}
        disabled={busy}
        onPress={locked ? onUnlock : onVerify}
        style={styles.action}
      >
        <Text style={styles.actionText}>{busy ? t("working") : label}</Text>
      </Pressable>
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
function Evidence({
  label,
  value,
  good,
}: {
  label: string;
  value: string;
  good: boolean;
}) {
  return (
    <View>
      <Text style={styles.evidenceLabel}>{label}</Text>
      <Text
        style={[
          styles.evidenceValue,
          { color: good ? colors.positive : colors.warning },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}
function Kpi({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "good" | "bad";
}) {
  return (
    <View style={[styles.kpi, responsiveStyles.kpi]}>
      <Text style={styles.evidenceLabel}>{label}</Text>
      <Text
        style={[
          styles.kpiValue,
          tone === "good" && { color: colors.positive },
          tone === "bad" && { color: colors.negative },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}
function Ledger({
  title,
  empty,
  rows,
}: {
  title: string;
  empty: string;
  rows: { key: string; title: string; detail: string; value: string }[];
}) {
  return (
    <View style={styles.ledger}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {rows.length ? (
        rows.map((row) => (
          <View key={row.key} style={styles.ledgerRow}>
            <View style={styles.flex}>
              <Text style={styles.ledgerTitle}>{row.title}</Text>
              <Text style={styles.meta}>{row.detail}</Text>
            </View>
            <Text style={styles.ledgerValue}>{row.value}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.empty}>{empty}</Text>
      )}
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
      {loading ? <ActivityIndicator color={colors.accent} /> : null}
      <Text style={styles.stateText}>{text}</Text>
    </View>
  );
}
const responsiveStyles = StyleSheet.create({
  kpi: { minWidth: 110, flexBasis: "30%", flexGrow: 1 },
});

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
    color: "#8f8bff",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.7,
  },
  title: { color: colors.text, fontSize: 25, fontWeight: "900" },
  lock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 7,
    borderWidth: 1,
    borderColor: "#5a4720",
    borderRadius: 8,
  },
  lockText: { color: colors.warning, fontSize: 7, fontWeight: "900" },
  notice: {
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    flexDirection: "row",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: "#5a4720",
    borderRadius: 11,
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
  tab: { flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 9 },
  tabActive: { backgroundColor: "#24213e" },
  tabText: { color: colors.muted, fontSize: 10, fontWeight: "800" },
  tabTextActive: { color: "#aaa6ff" },
  provenance: {
    color: colors.muted,
    fontSize: 9,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    textAlign: "right",
  },
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  score: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreCurrent: { backgroundColor: colors.accentDim },
  scoreBlocked: { backgroundColor: "#3d3220" },
  scoreValue: { color: colors.text, fontSize: 15, fontWeight: "900" },
  scoreLabel: { color: colors.muted, fontSize: 6, fontWeight: "900" },
  symbol: { color: colors.text, fontSize: 14, fontWeight: "900" },
  meta: { color: colors.muted, fontSize: 8, marginTop: 3 },
  confidence: {
    color: "#aaa6ff",
    textAlign: "right",
    fontSize: 12,
    fontWeight: "900",
  },
  verified: { color: colors.positive, fontSize: 8, fontWeight: "900" },
  evidenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  evidenceLabel: {
    color: colors.muted,
    fontSize: 7,
    textTransform: "uppercase",
  },
  evidenceValue: {
    fontSize: 9,
    fontWeight: "800",
    marginTop: 3,
    textTransform: "capitalize",
  },
  cardFoot: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
  },
  outcome: { fontSize: 9, fontWeight: "800" },
  blocker: { color: colors.warning, fontSize: 8, marginTop: spacing.sm },
  paperGate: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#37305d",
    borderRadius: 12,
    backgroundColor: "#171529",
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  simBadge: { color: "#aaa6ff", fontSize: 8, fontWeight: "900" },
  kpis: {
    marginHorizontal: spacing.lg,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  kpi: {
    width: "31.5%",
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  kpiValue: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "900",
    marginTop: 5,
  },
  readiness: {
    margin: spacing.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "#5a2630",
    borderRadius: 14,
    backgroundColor: "#211217",
  },
  readinessTop: { flexDirection: "row", justifyContent: "space-between" },
  locked: { color: colors.negative, fontSize: 8, fontWeight: "900" },
  readinessNote: {
    color: colors.muted,
    fontSize: 9,
    lineHeight: 14,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  checks: { marginTop: spacing.md, flexDirection: "row", flexWrap: "wrap" },
  check: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  checkText: { color: colors.muted, fontSize: 8 },
  checkPassed: { color: colors.positive },
  ledger: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    backgroundColor: colors.surface,
  },
  ledgerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  ledgerTitle: {
    color: colors.text,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  ledgerValue: { color: colors.text, fontSize: 9, fontWeight: "800" },
  empty: {
    color: colors.muted,
    fontSize: 9,
    textAlign: "center",
    padding: spacing.xl,
  },
  phase31: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: "#5a2630",
    borderRadius: 13,
    backgroundColor: "#211217",
  },
  blockers: {
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginBottom: spacing.md,
  },
  blockerChip: {
    color: colors.negative,
    fontSize: 8,
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#5a2630",
    borderRadius: 7,
  },
  phaseGrid: {
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  phase: {
    width: "48.5%",
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    backgroundColor: colors.surface,
  },
  phaseTop: { flexDirection: "row", justifyContent: "space-between" },
  phaseNo: { color: "#aaa6ff", fontSize: 8, fontWeight: "900" },
  phaseTitle: {
    color: colors.text,
    fontSize: 9,
    fontWeight: "800",
    marginTop: 8,
  },
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
  action: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 9,
    backgroundColor: colors.accent,
  },
  actionText: { color: colors.background, fontSize: 10, fontWeight: "900" },
  error: { color: colors.negative, fontSize: 9 },
  state: {
    minHeight: 260,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  stateText: { color: colors.muted, textAlign: "center", lineHeight: 18 },
});
