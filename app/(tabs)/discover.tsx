import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchTrending, type TrendingPeriod, type TrendingSort } from '@/api/client';
import { TokenRow } from '@/components/TokenRow';
import { colors, spacing } from '@/theme';

const periods: TrendingPeriod[] = ['1h', '6h', '24h'];
const sorts: { id: TrendingSort; label: string }[] = [
  { id: 'trending', label: 'Trending' }, { id: 'gainers', label: 'Gainers' },
  { id: 'volume', label: 'Volume' }, { id: 'new', label: 'New' },
];

export default function DiscoverScreen() {
  const router = useRouter();
  const [period, setPeriod] = useState<TrendingPeriod>('24h');
  const [sort, setSort] = useState<TrendingSort>('trending');
  const [search, setSearch] = useState('');
  const query = useQuery({ queryKey: ['trending', period, sort], queryFn: ({ signal }) => fetchTrending(period, sort, signal) });
  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (query.data?.tokens ?? []).filter((token) => !needle || `${token.symbol} ${token.name} ${token.address}`.toLowerCase().includes(needle));
  }, [query.data, search]);
  const stale = query.data?.freshness?.isStale;

  return <SafeAreaView style={styles.safe} edges={['top']}>
    <FlatList
      data={rows}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <TokenRow token={item} onPress={() => router.push({ pathname: '/token/[address]', params: { address: item.address, snapshot: JSON.stringify(item) } })} />}
      refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} tintColor={colors.accent} />}
      contentContainerStyle={rows.length ? undefined : styles.grow}
      ListHeaderComponent={<View>
        <View style={styles.header}><View><Text style={styles.eyebrow}>TERMINAL DEX</Text><Text style={styles.heading}>Market pulse</Text></View><View style={styles.live}><View style={[styles.dot, stale && styles.staleDot]} /><Text style={styles.liveText}>{stale ? 'STALE' : 'LIVE'}</Text></View></View>
        <TextInput value={search} onChangeText={setSearch} placeholder="Search symbol, name, or mint" placeholderTextColor={colors.muted} style={styles.search} autoCapitalize="none" autoCorrect={false} />
        <View style={styles.controlRow}>{sorts.map((item) => <Pressable key={item.id} onPress={() => setSort(item.id)} style={[styles.pill, sort === item.id && styles.activePill]}><Text style={[styles.pillText, sort === item.id && styles.activePillText]}>{item.label}</Text></Pressable>)}</View>
        <View style={styles.periodRow}>{periods.map((item) => <Pressable key={item} onPress={() => setPeriod(item)}><Text style={[styles.period, period === item && styles.activePeriod]}>{item}</Text></Pressable>)}<Text numberOfLines={1} style={styles.source}>{query.data ? `Source: ${query.data.source}` : 'Real market data'}</Text></View>
      </View>}
      ListEmptyComponent={query.isLoading
        ? <View style={styles.state}><ActivityIndicator color={colors.accent} /><Text style={styles.stateText}>Loading live markets…</Text></View>
        : query.isError
          ? <View style={styles.state}><Text style={styles.errorTitle}>Market data unavailable</Text><Text style={styles.stateText}>{query.error.message}</Text><Pressable style={styles.retry} onPress={() => query.refetch()}><Text style={styles.retryText}>Retry</Text></Pressable></View>
          : <View style={styles.state}><Text style={styles.errorTitle}>No matching tokens</Text><Text style={styles.stateText}>Clear search or choose another market window.</Text></View>}
    />
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background }, grow: { flexGrow: 1 },
  header: { padding: spacing.lg, paddingTop: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { color: colors.accent, fontSize: 10, letterSpacing: 2.2, fontWeight: '900' }, heading: { color: colors.text, fontSize: 27, fontWeight: '900', letterSpacing: -0.8, marginTop: 2 },
  live: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 12 }, dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.accent }, staleDot: { backgroundColor: colors.warning }, liveText: { color: colors.muted, fontSize: 9, fontWeight: '900' },
  search: { marginHorizontal: spacing.lg, height: 44, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, color: colors.text, paddingHorizontal: spacing.md, fontSize: 14 },
  controlRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.lg }, pill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.surface }, activePill: { backgroundColor: colors.accent }, pillText: { color: colors.muted, fontSize: 11, fontWeight: '800' }, activePillText: { color: colors.background },
  periodRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border }, period: { color: colors.muted, fontSize: 11, fontWeight: '800' }, activePeriod: { color: colors.accent }, source: { color: colors.muted, fontSize: 10, flex: 1, textAlign: 'right' },
  state: { flex: 1, minHeight: 300, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md }, stateText: { color: colors.muted, textAlign: 'center', lineHeight: 20 }, errorTitle: { color: colors.text, fontSize: 17, fontWeight: '800' }, retry: { backgroundColor: colors.accent, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 }, retryText: { color: colors.background, fontWeight: '900' },
});
