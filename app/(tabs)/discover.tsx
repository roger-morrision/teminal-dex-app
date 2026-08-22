import { Ionicons } from '@expo/vector-icons';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchDiscovery, searchTokens, type DiscoveryFilters, type DiscoveryMode, type TrendingPeriod } from '@/api/client';
import type { MarketToken } from '@/api/schema';
import { TokenRow } from '@/components/TokenRow';
import { defaultFilters, loadFilters, loadWatchlist, saveFilters, saveWatchlist } from '@/store/discovery';
import { useSettings } from '@/settings/SettingsProvider';
import { colors, spacing } from '@/theme';

const periods: TrendingPeriod[] = ['1h', '6h', '24h'];
const modes: { id: DiscoveryMode; key: 'trending' | 'gainers' | 'losers' | 'volume' | 'newPairs' | 'hotSearches' | 'surge' | 'nextBc' | 'pumpLive' | 'watchlist' }[] = [
  { id: 'trending', key: 'trending' }, { id: 'gainers', key: 'gainers' }, { id: 'losers', key: 'losers' },
  { id: 'volume', key: 'volume' }, { id: 'new-pairs', key: 'newPairs' }, { id: 'hot-searches', key: 'hotSearches' },
  { id: 'surge', key: 'surge' }, { id: 'nextbc', key: 'nextBc' }, { id: 'pump-live', key: 'pumpLive' }, { id: 'watchlist', key: 'watchlist' },
];

function useDebouncedValue(value: string, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => { const timer = setTimeout(() => setDebounced(value), delay); return () => clearTimeout(timer); }, [delay, value]);
  return debounced;
}

export default function DiscoverScreen() {
  const router = useRouter(); const { t } = useSettings();
  const [period, setPeriod] = useState<TrendingPeriod>('24h');
  const [mode, setMode] = useState<DiscoveryMode>('trending');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<DiscoveryFilters>(defaultFilters);
  const [draftFilters, setDraftFilters] = useState<DiscoveryFilters>(defaultFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const debouncedSearch = useDebouncedValue(search.trim());

  useEffect(() => { void Promise.all([loadWatchlist(), loadFilters()]).then(([storedWatchlist, storedFilters]) => { setWatchlist(storedWatchlist); setFilters(storedFilters); setDraftFilters(storedFilters); }); }, []);

  const feed = useInfiniteQuery({
    queryKey: ['discovery', mode, period, filters],
    queryFn: ({ pageParam, signal }) => fetchDiscovery(mode, period, filters, pageParam, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page, pages) => {
      if (page.pagination) return page.pagination.hasMore ? page.pagination.nextCursor ?? undefined : undefined;
      const loaded = pages.reduce((total, item) => total + item.tokens.length, 0);
      return page.totalCount != null && loaded < page.totalCount ? String(loaded) : undefined;
    },
  });
  const remoteSearch = useQuery({ queryKey: ['token-search', debouncedSearch], queryFn: ({ signal }) => searchTokens(debouncedSearch, signal), enabled: debouncedSearch.length >= 2 });

  const feedRows = useMemo(() => {
    const seen = new Set<string>();
    return (feed.data?.pages.flatMap((page) => page.tokens) ?? []).filter((token) => !seen.has(token.address) && Boolean(seen.add(token.address)));
  }, [feed.data]);
  const rows = debouncedSearch.length >= 2 ? remoteSearch.data?.tokens ?? [] : mode === 'watchlist' ? feedRows.filter((token) => watchlist.includes(token.address)) : feedRows;
  const current = debouncedSearch.length >= 2 ? remoteSearch : feed;
  const firstPage = feed.data?.pages[0];
  const activeFilterCount = [filters.dex !== 'All', Boolean(filters.minLiquidity), Boolean(filters.minMarketCap)].filter(Boolean).length;

  function toggleWatch(address: string) {
    const next = watchlist.includes(address) ? watchlist.filter((item) => item !== address) : [address, ...watchlist].slice(0, 100);
    setWatchlist(next); void saveWatchlist(next);
  }
  function applyFilters() { setFilters(draftFilters); setFiltersOpen(false); void saveFilters(draftFilters); }
  function resetFilters() { setDraftFilters(defaultFilters); setFilters(defaultFilters); setFiltersOpen(false); void saveFilters(defaultFilters); }
  function openToken(token: MarketToken) { router.push({ pathname: '/token/[address]', params: { address: token.address, snapshot: JSON.stringify(token) } }); }

  return <SafeAreaView style={styles.safe} edges={['top']}>
    <FlatList
      data={rows}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <TokenRow token={item} onPress={() => openToken(item)} watched={watchlist.includes(item.address)} onToggleWatch={() => toggleWatch(item.address)} />}
      refreshControl={<RefreshControl refreshing={current.isRefetching} onRefresh={() => current.refetch()} tintColor={colors.accent} />}
      onEndReached={() => { if (debouncedSearch.length < 2 && feed.hasNextPage && !feed.isFetchingNextPage) void feed.fetchNextPage(); }}
      onEndReachedThreshold={0.4}
      contentContainerStyle={rows.length ? undefined : styles.grow}
      ListFooterComponent={feed.isFetchingNextPage ? <ActivityIndicator style={styles.footer} color={colors.accent} /> : null}
      ListHeaderComponent={<View>
        <View style={styles.header}><View><Text style={styles.eyebrow}>TERMINAL DEX</Text><Text accessibilityRole="header" style={styles.heading}>{t('discover')}</Text></View><View accessibilityRole="summary" style={styles.live}><View style={[styles.dot, firstPage?.freshness?.isStale && styles.staleDot]} /><Text style={styles.liveText}>{firstPage?.status?.toUpperCase() ?? t('realData')}</Text></View></View>
        <View style={styles.searchWrap}><Ionicons name="search" color={colors.muted} size={17} /><TextInput accessibilityLabel={t('searchTokens')} value={search} onChangeText={setSearch} placeholder={t('searchTokens')} placeholderTextColor={colors.muted} style={styles.search} autoCapitalize="none" autoCorrect={false} />{search ? <Pressable accessibilityRole="button" accessibilityLabel={t('clearSearch')} hitSlop={10} onPress={() => setSearch('')}><Ionicons name="close-circle" color={colors.muted} size={18} /></Pressable> : null}</View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.controlRow}>{modes.map((item) => { const label = t(item.key); return <Pressable key={item.id} accessibilityRole="tab" accessibilityLabel={t('selectMode', { mode: label })} accessibilityState={{ selected: mode === item.id }} onPress={() => { setMode(item.id); setSearch(''); }} style={[styles.pill, mode === item.id && styles.activePill]}><Text style={[styles.pillText, mode === item.id && styles.activePillText]}>{label}</Text></Pressable>; })}</ScrollView>
        <View style={styles.periodRow}>{periods.map((item) => <Pressable key={item} accessibilityRole="radio" accessibilityLabel={t('selectPeriod', { period: item })} accessibilityState={{ checked: period === item }} onPress={() => setPeriod(item)}><Text style={[styles.period, period === item && styles.activePeriod]}>{item}</Text></Pressable>)}<Pressable accessibilityRole="button" accessibilityLabel={t('openFilters')} onPress={() => setFiltersOpen(true)} style={[styles.filterButton, activeFilterCount > 0 && styles.filterActive]}><Ionicons name="options" size={14} color={activeFilterCount ? colors.background : colors.muted} /><Text style={[styles.filterText, activeFilterCount > 0 && styles.filterTextActive]}>{t('filter')}{activeFilterCount ? ` ${activeFilterCount}` : ''}</Text></Pressable><Text numberOfLines={1} style={styles.source}>{debouncedSearch.length >= 2 ? remoteSearch.data?.source ?? t('searching') : firstPage?.source ?? t('marketFeed')}</Text></View>
      </View>}
      ListEmptyComponent={current.isLoading || (search !== debouncedSearch)
        ? <State loading message={debouncedSearch.length >= 2 ? t('searchingSources') : t('loadingMarkets')} />
        : current.isError
          ? <State title={t('marketUnavailable')} message={current.error.message} action={t('retry')} onAction={() => current.refetch()} />
          : <State title={mode === 'watchlist' ? t('watchlistEmpty') : t('noMatchingTokens')} message={mode === 'watchlist' ? t('watchlistHint') : t('filtersHint')} />}
    />
    <FilterModal visible={filtersOpen} value={draftFilters} onChange={setDraftFilters} onClose={() => { setDraftFilters(filters); setFiltersOpen(false); }} onApply={applyFilters} onReset={resetFilters} />
  </SafeAreaView>;
}

function State({ loading, title, message, action, onAction }: { loading?: boolean; title?: string; message: string; action?: string; onAction?: () => void }) { return <View accessibilityRole={loading ? 'progressbar' : 'summary'} style={styles.state}>{loading ? <ActivityIndicator color={colors.accent} /> : null}{title ? <Text style={styles.errorTitle}>{title}</Text> : null}<Text style={styles.stateText}>{message}</Text>{action ? <Pressable accessibilityRole="button" accessibilityLabel={action} style={styles.retry} onPress={onAction}><Text style={styles.retryText}>{action}</Text></Pressable> : null}</View>; }

function FilterModal({ visible, value, onChange, onClose, onApply, onReset }: { visible: boolean; value: DiscoveryFilters; onChange: (value: DiscoveryFilters) => void; onClose: () => void; onApply: () => void; onReset: () => void }) {
  const { t } = useSettings(); return <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}><Pressable accessibilityRole="button" accessibilityLabel={t('closeFilters')} style={styles.scrim} onPress={onClose} /><SafeAreaView accessibilityViewIsModal style={styles.sheet} edges={['bottom']}><View style={styles.handle} /><Text accessibilityRole="header" style={styles.sheetTitle}>{t('marketFilters')}</Text><Text style={styles.fieldLabel}>DEX</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dexRow}>{['All', 'raydium', 'pumpswap', 'orca', 'meteora', 'pumpfun'].map((dex) => <Pressable key={dex} accessibilityRole="radio" accessibilityLabel={t('selectDex', { dex: dex === 'All' ? t('all') : dex })} accessibilityState={{ checked: value.dex === dex }} onPress={() => onChange({ ...value, dex })} style={[styles.dex, value.dex === dex && styles.activePill]}><Text style={[styles.pillText, value.dex === dex && styles.activePillText]}>{dex === 'All' ? t('all') : dex}</Text></Pressable>)}</ScrollView><Text style={styles.fieldLabel}>{t('minLiquidity')}</Text><TextInput accessibilityLabel={t('minLiquidity')} keyboardType="numeric" value={value.minLiquidity} onChangeText={(minLiquidity) => onChange({ ...value, minLiquidity: minLiquidity.replace(/[^0-9.]/g, '') })} placeholder="e.g. 25000" placeholderTextColor={colors.muted} style={styles.input} /><Text style={styles.fieldLabel}>{t('minMarketCap')}</Text><TextInput accessibilityLabel={t('minMarketCap')} keyboardType="numeric" value={value.minMarketCap} onChangeText={(minMarketCap) => onChange({ ...value, minMarketCap: minMarketCap.replace(/[^0-9.]/g, '') })} placeholder="e.g. 100000" placeholderTextColor={colors.muted} style={styles.input} /><View style={styles.sheetActions}><Pressable accessibilityRole="button" accessibilityLabel={t('reset')} style={styles.reset} onPress={onReset}><Text style={styles.resetText}>{t('reset')}</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={t('applyFilters')} style={styles.apply} onPress={onApply}><Text style={styles.applyText}>{t('applyFilters')}</Text></Pressable></View></SafeAreaView></Modal>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background }, grow: { flexGrow: 1 }, footer: { padding: spacing.xl },
  header: { padding: spacing.lg, paddingTop: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, eyebrow: { color: colors.accent, fontSize: 10, letterSpacing: 2.2, fontWeight: '900' }, heading: { color: colors.text, fontSize: 27, fontWeight: '900', letterSpacing: -0.8, marginTop: 2 },
  live: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 12 }, dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.accent }, staleDot: { backgroundColor: colors.warning }, liveText: { color: colors.muted, fontSize: 9, fontWeight: '900' },
  searchWrap: { marginHorizontal: spacing.lg, height: 44, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, gap: spacing.sm }, search: { flex: 1, color: colors.text, fontSize: 14 },
  controlRow: { gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.lg }, pill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.surface }, activePill: { backgroundColor: colors.accent }, pillText: { color: colors.muted, fontSize: 11, fontWeight: '800', textTransform: 'capitalize' }, activePillText: { color: colors.background },
  periodRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border }, period: { color: colors.muted, fontSize: 11, fontWeight: '800' }, activePeriod: { color: colors.accent }, filterButton: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 }, filterActive: { backgroundColor: colors.accent, borderColor: colors.accent }, filterText: { color: colors.muted, fontSize: 10, fontWeight: '800' }, filterTextActive: { color: colors.background }, source: { color: colors.muted, fontSize: 9, flex: 1, textAlign: 'right' },
  state: { flex: 1, minHeight: 300, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md }, stateText: { color: colors.muted, textAlign: 'center', lineHeight: 20 }, errorTitle: { color: colors.text, fontSize: 17, fontWeight: '800' }, retry: { backgroundColor: colors.accent, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 }, retryText: { color: colors.background, fontWeight: '900' },
  scrim: { flex: 1, backgroundColor: '#00000099' }, sheet: { backgroundColor: colors.surfaceRaised, padding: spacing.lg, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderColor: colors.border }, handle: { width: 44, height: 4, borderRadius: 2, alignSelf: 'center', backgroundColor: colors.border, marginBottom: spacing.lg }, sheetTitle: { color: colors.text, fontSize: 22, fontWeight: '900', marginBottom: spacing.lg }, fieldLabel: { color: colors.muted, fontSize: 11, fontWeight: '800', marginTop: spacing.md, marginBottom: spacing.sm }, dexRow: { gap: spacing.sm }, dex: { backgroundColor: colors.surface, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 }, input: { height: 44, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, color: colors.text, paddingHorizontal: spacing.md }, sheetActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl }, reset: { flex: 1, alignItems: 'center', padding: 13, borderWidth: 1, borderColor: colors.border, borderRadius: 11 }, resetText: { color: colors.text, fontWeight: '800' }, apply: { flex: 2, alignItems: 'center', padding: 13, backgroundColor: colors.accent, borderRadius: 11 }, applyText: { color: colors.background, fontWeight: '900' },
});
