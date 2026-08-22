import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import type { OhlcvResponse } from '@/api/schema';
import { colors } from '@/theme';

export function PriceChart({ data, compact = false }: { data: OhlcvResponse; compact?: boolean }) {
  const { width } = useWindowDimensions();
  const chartWidth = Math.max(240, width - (compact ? 64 : 32)); const height = compact ? 150 : 190;
  const candles = data.candles.slice(-120);
  if (candles.length < 2) return <View style={styles.empty}><Text style={styles.emptyText}>Not enough verified candles for this timeframe.</Text></View>;
  const closes = candles.map((item) => item.close); const min = Math.min(...closes); const max = Math.max(...closes); const span = max - min || 1;
  const points = closes.map((close, index) => ({ x: (index / (closes.length - 1)) * chartWidth, y: 12 + ((max - close) / span) * (height - 30) }));
  const line = points.map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ');
  const area = `${line} L${chartWidth},${height} L0,${height} Z`;
  const positive = closes.at(-1)! >= closes[0]!; const color = positive ? colors.positive : colors.negative;
  return <View><Svg accessibilityLabel={`${data.tf} token price chart with ${candles.length} candles`} width={chartWidth} height={height}><Defs><LinearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={color} stopOpacity="0.28" /><Stop offset="1" stopColor={color} stopOpacity="0" /></LinearGradient></Defs><Path d={area} fill="url(#fill)" /><Path d={line} fill="none" stroke={color} strokeWidth={2} /></Svg><View style={styles.legend}><Text style={styles.legendText}>{data.source} · {data.dataQuality}</Text><Text style={[styles.legendText, { color }]}>{candles.length} candles</Text></View></View>;
}
const styles = StyleSheet.create({ empty: { height: 190, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderRadius: 14 }, emptyText: { color: colors.muted, fontSize: 11 }, legend: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }, legendText: { color: colors.muted, fontSize: 9, textTransform: 'capitalize' } });
