import { memo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { MarketToken } from '@/api/schema';
import { compactUsd, signedPercent, tokenPrice } from '@/lib/format';
import { colors, spacing } from '@/theme';

export const TokenRow = memo(function TokenRow({ token, onPress, watched, onToggleWatch, dense = false }: { token: MarketToken; onPress: () => void; watched?: boolean; onToggleWatch?: () => void; dense?: boolean }) {
  const positive = token.change1h >= 0;
  return <Pressable accessibilityRole="button" accessibilityLabel={`Open ${token.symbol} details`} onPress={onPress} style={({ pressed }) => [styles.row, dense && styles.denseRow, pressed && styles.pressed]}>
    <View style={styles.avatarWrap}><TokenIdentityAvatar token={token} /><View accessible accessibilityLabel={`${token.dex} launchpad`} style={styles.dexBadge}><Ionicons name={token.dex.toLowerCase().includes('pump') ? 'flash' : 'swap-horizontal'} size={9} color={colors.text} /></View></View>
    <View style={styles.identity}><View style={styles.titleLine}><Text numberOfLines={1} style={styles.symbol}>{token.symbol}</Text><Text style={styles.age}>{token.ageLabel}</Text></View><View style={styles.metaLine}><Text numberOfLines={1} style={styles.meta}>{token.holderCount == null ? '— holders' : `${compactCount(token.holderCount)} holders`} · {compactUsd(token.volume24h)} vol</Text><SocialEvidence token={token} /></View></View>
    <View style={styles.metric}><Text style={styles.price}>{tokenPrice(token.price)}</Text><Text style={styles.subMetric}>{compactUsd(token.marketCap)} MC</Text></View>
    <View style={[styles.change, positive ? styles.positiveBg : styles.negativeBg]}><Ionicons name={positive ? 'caret-up' : 'caret-down'} size={10} color={positive ? colors.positive : colors.negative} /><Text style={[styles.changeText, { color: positive ? colors.positive : colors.negative }]}>{signedPercent(token.change1h)}</Text></View>
    {onToggleWatch ? <Pressable accessibilityRole="button" accessibilityLabel={watched ? `Remove ${token.symbol} from watchlist` : `Add ${token.symbol} to watchlist`} hitSlop={10} onPress={(event) => { event.stopPropagation(); onToggleWatch(); }}><Ionicons name={watched ? 'star' : 'star-outline'} size={18} color={watched ? colors.warning : colors.muted} /></Pressable> : null}
  </Pressable>;
}, (previous, next) => previous.token === next.token && previous.watched === next.watched && previous.dense === next.dense && Boolean(previous.onToggleWatch) === Boolean(next.onToggleWatch));

function TokenIdentityAvatar({ token }: { token: MarketToken }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  if (token.imageUrl && token.imageUrl !== failedUrl) return <Image accessible accessibilityLabel={`${token.symbol} token logo`} source={{ uri: token.imageUrl }} onError={() => setFailedUrl(token.imageUrl ?? null)} style={styles.avatar} />;
  return <View accessible accessibilityLabel={`${token.symbol} token logo unavailable; showing initials`} style={[styles.fallback, { backgroundColor: fallbackColor(token.address) }]}><Text style={styles.fallbackText}>{token.symbol.slice(0, 2).toUpperCase()}</Text></View>;
}

function SocialEvidence({ token }: { token: MarketToken }) {
  const entries = [
    token.social?.twitter ? { key: 'twitter', icon: 'logo-twitter' as const, label: 'X' } : null,
    token.social?.telegram ? { key: 'telegram', icon: 'paper-plane' as const, label: 'Telegram' } : null,
    token.social?.website ? { key: 'website', icon: 'globe-outline' as const, label: 'Website' } : null,
  ].filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  if (!entries.length) return null;
  return <View accessible accessibilityLabel={`Social evidence: ${entries.map((entry) => entry.label).join(', ')}`} style={styles.socials}>{entries.map((entry) => <Ionicons key={entry.key} name={entry.icon} size={11} color={colors.muted} />)}</View>;
}

function compactCount(value: number) {
  if (value < 1_000) return String(Math.round(value));
  if (value < 1_000_000) return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}K`;
  return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
}

function fallbackColor(identity: string) {
  const palette = ['#134e4a', '#164e63', '#312e81', '#4c1d95', '#7f1d1d', '#713f12'];
  const hash = Array.from(identity).reduce((value, character) => ((value * 31) + character.charCodeAt(0)) >>> 0, 0);
  return palette[hash % palette.length];
}

const styles = StyleSheet.create({
  row: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  denseRow: { minHeight: 64, gap: spacing.sm, paddingHorizontal: spacing.md },
  pressed: { backgroundColor: colors.surfaceRaised }, avatarWrap: { position: 'relative' }, avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surfaceRaised },
  dexBadge: { position: 'absolute', right: -3, bottom: -3, width: 17, height: 17, borderRadius: 9, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.background, backgroundColor: colors.violet },
  fallback: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accentDim }, fallbackText: { color: colors.accent, fontSize: 11, fontWeight: '800' },
  identity: { flex: 1, minWidth: 70 }, titleLine: { flexDirection: 'row', alignItems: 'center', gap: 6 }, symbol: { color: colors.text, fontSize: 15, fontWeight: '800', maxWidth: 76 }, age: { color: colors.muted, fontSize: 10 }, metaLine: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 }, meta: { flexShrink: 1, color: colors.muted, fontSize: 10 }, socials: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metric: { alignItems: 'flex-end' }, price: { color: colors.text, fontSize: 13, fontWeight: '700' }, subMetric: { color: colors.muted, fontSize: 10, marginTop: 4 },
  change: { width: 73, height: 30, borderRadius: 8, flexDirection: 'row', gap: 2, alignItems: 'center', justifyContent: 'center' }, positiveBg: { backgroundColor: colors.accentDim }, negativeBg: { backgroundColor: '#3a1820' }, changeText: { fontSize: 11, fontWeight: '800' },
});
