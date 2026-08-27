import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { MarketToken } from '@/api/schema';
import { compactUsd, signedPercent, tokenPrice } from '@/lib/format';
import { colors, spacing } from '@/theme';
import { TokenAvatar } from '@/components/TokenAvatar';
import { DexLogo, getDexBrand } from '@/components/DexLogo';
import { useSettings } from '@/settings/SettingsProvider';

type TokenRowPeriod = '1h' | '6h' | '24h';

export const TokenRow = memo(function TokenRow({ token, onPress, watched, onToggleWatch, dense = false, period = '1h' }: { token: MarketToken; onPress: () => void; watched?: boolean; onToggleWatch?: () => void; dense?: boolean; period?: TokenRowPeriod }) {
  const { t } = useSettings();
  const symbol = displayTokenIdentity(token);
  const age = reliableAgeLabel(token) ?? t('tokenAgeUnavailable');
  const holderCount = reliableHolderLabel(token);
  const holders = holderCount == null ? t('tokenHoldersUnavailable') : t('tokenHolderCount', { count: holderCount });
  const dex = getDexBrand(token.dex)?.name ?? token.dex?.trim();
  const change = selectedChange(token, period);
  const positive = change != null && change >= 0;
  const price = tokenPrice(token.price);
  const marketCap = compactUsd(token.marketCap);
  const changeLabel = change == null ? t('tokenChangeUnavailable') : signedPercent(change);
  return <View style={[styles.row, dense && styles.denseRow]}>
    <Pressable accessibilityRole="button" accessibilityLabel={t('openTokenDetails', { symbol })} onPress={onPress} style={({ pressed }) => [styles.detailsAction, dense && styles.denseDetailsAction, pressed && styles.pressed]}>
      <View style={styles.avatarWrap}><TokenAvatar symbol={symbol} identity={token.address} imageUrl={token.imageUrl} accessibilityLabel={t('tokenLogo', { symbol })} fallbackAccessibilityLabel={t('tokenLogoFallback', { symbol })} /><View style={styles.dexBadge}><DexLogo dex={token.dex} accessibilityLabel={dex ? t('dexLogo', { dex }) : t('unknownDexLogo')} /></View></View>
      <View style={styles.identity}><View style={styles.titleLine}><Text numberOfLines={1} style={styles.symbol}>{symbol}</Text><Text style={styles.age}>{age}</Text></View><View style={styles.metaLine}><Text numberOfLines={1} style={styles.meta}>{holders} · {t('tokenVolumeShort', { volume: compactUsd(token.volume24h) })}</Text><SocialEvidence token={token} label={(networks) => t('tokenSocialEvidence', { networks })} /></View></View>
      <View accessible accessibilityLabel={t('tokenMarketMetrics', { price, marketCap, period, change: changeLabel })} style={styles.metric}><Text style={styles.price}>{price}</Text><View style={styles.metricSecondLine}><Text style={styles.subMetric}>{t('tokenMarketCapShort', { marketCap })}</Text><View style={styles.inlineChange}>{change == null ? null : <Ionicons name={positive ? 'caret-up' : 'caret-down'} size={9} color={positive ? colors.positive : colors.negative} />}<Text style={[styles.inlineChangeText, { color: change == null ? colors.muted : positive ? colors.positive : colors.negative }]}>{change == null ? '—' : changeLabel}</Text></View></View></View>
    </Pressable>
    {onToggleWatch ? <Pressable accessibilityRole="button" accessibilityLabel={t(watched ? 'removeTokenFromWatchlist' : 'addTokenToWatchlist', { symbol })} hitSlop={10} onPress={(event) => { event.stopPropagation(); onToggleWatch(); }}><Ionicons name={watched ? 'star' : 'star-outline'} size={18} color={watched ? colors.warning : colors.muted} /></Pressable> : null}
  </View>;
}, (previous, next) => previous.token === next.token && previous.watched === next.watched && previous.dense === next.dense && previous.period === next.period && Boolean(previous.onToggleWatch) === Boolean(next.onToggleWatch));

export function displayTokenIdentity(token: MarketToken) {
  return token.symbol.trim() || token.name.trim() || `${token.address.slice(0, 4)}…${token.address.slice(-4)}`;
}

export function reliableAgeLabel(token: MarketToken) {
  if (!Number.isFinite(token.ageMinutes) || token.ageMinutes <= 0) return null;
  const label = token.ageLabel.trim();
  return label && label !== '—' && label.toLowerCase() !== 'new' ? label : null;
}

export function reliableHolderLabel(token: MarketToken) {
  const value = token.holderCount;
  if (value == null || !Number.isInteger(value) || value < 1 || token.holderCountFreshness === 'stale' || token.holderCountSafeForAutomation === false) return null;
  return `${compactCount(value)}${token.holderCountExact === false ? '+' : ''}`;
}

export function selectedChange(token: MarketToken, period: TokenRowPeriod) {
  const value = period === '24h' ? token.change24h : period === '6h' ? token.change6h : token.change1h;
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function SocialEvidence({ token, label }: { token: MarketToken; label: (networks: string) => string }) {
  const entries = [
    token.social?.twitter ? { key: 'twitter', icon: 'logo-twitter' as const, label: 'X' } : null,
    token.social?.telegram ? { key: 'telegram', icon: 'paper-plane' as const, label: 'Telegram' } : null,
    token.social?.website ? { key: 'website', icon: 'globe-outline' as const, label: 'Website' } : null,
  ].filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  if (!entries.length) return null;
  return <View accessible accessibilityLabel={label(entries.map((entry) => entry.label).join(', '))} style={styles.socials}>{entries.map((entry) => <Ionicons key={entry.key} name={entry.icon} size={11} color={colors.muted} />)}</View>;
}

function compactCount(value: number) {
  if (value < 1_000) return String(Math.round(value));
  if (value < 1_000_000) return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}K`;
  return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
}

const styles = StyleSheet.create({
  row: { minHeight: 76, flexDirection: 'row', alignItems: 'center', paddingRight: spacing.lg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  denseRow: { minHeight: 64, paddingRight: spacing.md },
  detailsAction: { flex: 1, minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingLeft: spacing.lg, paddingRight: spacing.md },
  denseDetailsAction: { minHeight: 64, gap: spacing.sm, paddingLeft: spacing.md, paddingRight: spacing.sm },
  pressed: { backgroundColor: colors.surfaceRaised }, avatarWrap: { position: 'relative' },
  dexBadge: { position: 'absolute', right: -4, bottom: -4 },
  identity: { flex: 1, minWidth: 70 }, titleLine: { flexDirection: 'row', alignItems: 'center', gap: 6 }, symbol: { color: colors.text, fontSize: 15, fontWeight: '800', maxWidth: 76 }, age: { color: colors.muted, fontSize: 10 }, metaLine: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 }, meta: { flexShrink: 1, color: colors.muted, fontSize: 10 }, socials: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metric: { alignItems: 'flex-end', minWidth: 106 }, price: { color: colors.text, fontSize: 13, fontWeight: '700' }, metricSecondLine: { marginTop: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }, subMetric: { color: colors.muted, fontSize: 10 }, inlineChange: { flexDirection: 'row', alignItems: 'center', gap: 2 }, inlineChangeText: { fontSize: 10, fontWeight: '800' },
});
