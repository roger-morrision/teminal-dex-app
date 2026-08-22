import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { MarketToken } from '@/api/schema';
import { compactUsd, signedPercent, tokenPrice } from '@/lib/format';
import { colors, spacing } from '@/theme';

export function TokenRow({ token, onPress, watched, onToggleWatch }: { token: MarketToken; onPress: () => void; watched?: boolean; onToggleWatch?: () => void }) {
  const positive = token.change1h >= 0;
  return <Pressable accessibilityRole="button" accessibilityLabel={`Open ${token.symbol} details`} onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
    {token.imageUrl ? <Image source={{ uri: token.imageUrl }} style={styles.avatar} /> : <View style={styles.fallback}><Text style={styles.fallbackText}>{token.symbol.slice(0, 2)}</Text></View>}
    <View style={styles.identity}><View style={styles.titleLine}><Text numberOfLines={1} style={styles.symbol}>{token.symbol}</Text><Text style={styles.age}>{token.ageLabel}</Text></View><Text numberOfLines={1} style={styles.meta}>{token.dex} · {token.quoteSymbol}</Text></View>
    <View style={styles.metric}><Text style={styles.price}>{tokenPrice(token.price)}</Text><Text style={styles.subMetric}>{compactUsd(token.volume24h)} vol</Text></View>
    <View style={[styles.change, positive ? styles.positiveBg : styles.negativeBg]}><Ionicons name={positive ? 'caret-up' : 'caret-down'} size={10} color={positive ? colors.positive : colors.negative} /><Text style={[styles.changeText, { color: positive ? colors.positive : colors.negative }]}>{signedPercent(token.change1h)}</Text></View>
    {onToggleWatch ? <Pressable accessibilityRole="button" accessibilityLabel={watched ? `Remove ${token.symbol} from watchlist` : `Add ${token.symbol} to watchlist`} hitSlop={10} onPress={(event) => { event.stopPropagation(); onToggleWatch(); }}><Ionicons name={watched ? 'star' : 'star-outline'} size={18} color={watched ? colors.warning : colors.muted} /></Pressable> : null}
  </Pressable>;
}

const styles = StyleSheet.create({
  row: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  pressed: { backgroundColor: colors.surfaceRaised }, avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surfaceRaised },
  fallback: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accentDim }, fallbackText: { color: colors.accent, fontSize: 11, fontWeight: '800' },
  identity: { flex: 1, minWidth: 70 }, titleLine: { flexDirection: 'row', alignItems: 'center', gap: 6 }, symbol: { color: colors.text, fontSize: 15, fontWeight: '800', maxWidth: 76 }, age: { color: colors.muted, fontSize: 10 }, meta: { color: colors.muted, fontSize: 11, marginTop: 4, textTransform: 'uppercase' },
  metric: { alignItems: 'flex-end' }, price: { color: colors.text, fontSize: 13, fontWeight: '700' }, subMetric: { color: colors.muted, fontSize: 10, marginTop: 4 },
  change: { width: 73, height: 30, borderRadius: 8, flexDirection: 'row', gap: 2, alignItems: 'center', justifyContent: 'center' }, positiveBg: { backgroundColor: colors.accentDim }, negativeBg: { backgroundColor: '#3a1820' }, changeText: { fontSize: 11, fontWeight: '800' },
});
