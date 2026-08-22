import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchTokenDetail } from '@/api/client';
import { tokenSchema } from '@/api/schema';
import { compactUsd, signedPercent, tokenPrice } from '@/lib/format';
import { colors, spacing } from '@/theme';

export default function TokenDetail() {
  const router = useRouter();
  const { address, snapshot } = useLocalSearchParams<{ address: string; snapshot?: string }>();
  let parsed: unknown; try { parsed = snapshot ? JSON.parse(snapshot) : null; } catch { parsed = null; }
  const snapshotResult = tokenSchema.safeParse(parsed);
  const query = useQuery({ queryKey: ['token-detail', address], queryFn: ({ signal }) => fetchTokenDetail(address, signal), enabled: Boolean(address), retry: 2 });
  const token = query.data?.token ?? (snapshotResult.success ? snapshotResult.data : null);

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content} refreshControl={undefined}>
    <View style={styles.top}><Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={20} color={colors.text} /></Pressable><Text style={styles.address} numberOfLines={1}>{address}</Text><Pressable accessibilityRole="button" accessibilityLabel="Refresh token details" onPress={() => query.refetch()} style={styles.back}><Ionicons name="refresh" size={18} color={colors.text} /></Pressable></View>
    {token ? <>
      <View style={styles.identity}><View><Text style={styles.symbol}>{token.symbol}</Text><Text style={styles.name}>{token.name} · {token.dex}</Text></View>{query.isFetching ? <ActivityIndicator color={colors.accent} /> : <EvidenceBadge degraded={Boolean(query.data?.degraded)} />}</View>
      <Text style={styles.price}>{tokenPrice(token.price)}</Text><Text style={[styles.change, { color: token.change24h >= 0 ? colors.positive : colors.negative }]}>{signedPercent(token.change24h)} · 24h</Text>
      <View style={styles.grid}><Metric label="Market cap" value={compactUsd(token.marketCap)} /><Metric label="Liquidity" value={compactUsd(token.liquidity)} /><Metric label="24h volume" value={compactUsd(token.volume24h)} /><Metric label="Holders" value={token.holderCount?.toLocaleString() ?? '—'} /><Metric label="Top holder" value={token.topHolderPct == null ? '—' : `${token.topHolderPct.toFixed(1)}%`} /><Metric label="Snipers" value={token.sniperPct == null ? '—' : `${token.sniperPct.toFixed(1)}%`} /></View>
      <View style={styles.evidence}><Text style={styles.sectionTitle}>Data evidence</Text><EvidenceRow label="Source" value={token.source ?? 'unavailable'} /><EvidenceRow label="Quality" value={token.dataQuality ?? 'unavailable'} /><EvidenceRow label="Price automation" value={query.data?.priceEvidence?.safeForAutomation === true ? 'verified ready' : 'not verified'} warning={query.data?.priceEvidence?.safeForAutomation !== true} /><EvidenceRow label="Security automation" value={query.data?.securityEvidence?.safeForAutomation === true ? 'verified ready' : 'not verified'} warning={query.data?.securityEvidence?.safeForAutomation !== true} /></View>
      {query.isError ? <View style={styles.degraded}><Text style={styles.degradedText}>Live detail refresh failed. Showing the last validated Discovery snapshot.</Text><Pressable onPress={() => query.refetch()}><Text style={styles.retryText}>Retry</Text></Pressable></View> : null}
      <View style={styles.notice}><Ionicons name="shield-checkmark" color={colors.warning} size={18} /><Text style={styles.noticeText}>Trading remains locked. Execution requires wallet ownership, a fresh quote, simulation, explicit confirmation, and server-side policy approval.</Text></View>
    </> : query.isLoading ? <View style={styles.empty}><ActivityIndicator color={colors.accent} /><Text style={styles.name}>Loading verified token detail…</Text></View> : <View style={styles.empty}><Text style={styles.emptyTitle}>Token unavailable</Text><Text style={styles.name}>{query.error?.message ?? 'No validated token record was returned.'}</Text><Pressable style={styles.retry} onPress={() => query.refetch()}><Text style={styles.retryTextDark}>Retry</Text></Pressable></View>}
  </ScrollView></SafeAreaView>;
}

function Metric({ label, value }: { label: string; value: string }) { return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View>; }
function EvidenceBadge({ degraded }: { degraded: boolean }) { return <View style={[styles.badge, degraded && styles.badgeWarning]}><View style={[styles.badgeDot, degraded && styles.badgeDotWarning]} /><Text style={styles.badgeText}>{degraded ? 'DEGRADED' : 'LIVE DETAIL'}</Text></View>; }
function EvidenceRow({ label, value, warning }: { label: string; value: string; warning?: boolean }) { return <View style={styles.evidenceRow}><Text style={styles.evidenceLabel}>{label}</Text><Text style={[styles.evidenceValue, warning && styles.warning]}>{value}</Text></View>; }

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background }, content: { padding: spacing.lg }, top: { flexDirection: 'row', alignItems: 'center', gap: spacing.md }, back: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }, address: { flex: 1, color: colors.muted, fontSize: 11 },
  identity: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 40 }, symbol: { color: colors.text, fontSize: 38, fontWeight: '900' }, name: { color: colors.muted, marginTop: 4 }, badge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 10 }, badgeWarning: { borderColor: '#5a4824' }, badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent }, badgeDotWarning: { backgroundColor: colors.warning }, badgeText: { color: colors.muted, fontSize: 8, fontWeight: '900' },
  price: { color: colors.text, fontSize: 30, fontWeight: '800', marginTop: spacing.xl }, change: { fontWeight: '800', marginTop: spacing.sm }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: 32 }, metric: { width: '47%', padding: spacing.lg, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, metricLabel: { color: colors.muted, fontSize: 11 }, metricValue: { color: colors.text, fontSize: 17, fontWeight: '800', marginTop: 8 },
  evidence: { marginTop: spacing.xl, padding: spacing.lg, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '900', marginBottom: spacing.sm }, evidenceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }, evidenceLabel: { color: colors.muted, fontSize: 11 }, evidenceValue: { color: colors.text, fontSize: 11, fontWeight: '700', textTransform: 'capitalize' }, warning: { color: colors.warning },
  degraded: { marginTop: spacing.lg, padding: spacing.md, borderRadius: 12, backgroundColor: '#2d2715', flexDirection: 'row', alignItems: 'center', gap: spacing.md }, degradedText: { flex: 1, color: colors.warning, fontSize: 11, lineHeight: 17 }, retryText: { color: colors.accent, fontWeight: '900' },
  notice: { flexDirection: 'row', gap: spacing.md, padding: spacing.lg, borderRadius: 14, backgroundColor: '#2d2715', marginTop: spacing.xl }, noticeText: { flex: 1, color: colors.warning, fontSize: 11, lineHeight: 17 }, empty: { alignItems: 'center', paddingTop: 100, gap: spacing.md }, emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '800' }, retry: { backgroundColor: colors.accent, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 }, retryTextDark: { color: colors.background, fontWeight: '900' },
});
