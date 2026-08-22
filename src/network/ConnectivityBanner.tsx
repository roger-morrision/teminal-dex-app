import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '@/settings/SettingsProvider';
import { colors, spacing } from '@/theme';
import { useConnectivity } from './connectivity';

export function ConnectivityBanner() {
  const { status, recoveredAt } = useConnectivity(); const { t } = useSettings();
  if (status === 'offline') return <Banner online={false} text={t('offlineBanner')} />;
  return recoveredAt ? <RecoveredBanner key={recoveredAt} text={t('recoveredBanner')} /> : null;
}

function RecoveredBanner({ text }: { text: string }) { const [visible, setVisible] = useState(true); useEffect(() => { const timer = setTimeout(() => setVisible(false), 4_000); return () => clearTimeout(timer); }, []); return visible ? <Banner online text={text} /> : null; }
function Banner({ online, text }: { online: boolean; text: string }) { return <SafeAreaView edges={['top']} style={[styles.safe, online ? styles.online : styles.offline]}><View accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.row}><View style={[styles.dot, online && styles.dotOnline]} /><Text style={styles.text}>{text}</Text></View></SafeAreaView>; }

const styles = StyleSheet.create({ safe: { borderBottomWidth: 1 }, offline: { backgroundColor: '#2a1e0d', borderBottomColor: '#5a4720' }, online: { backgroundColor: colors.accentDim, borderBottomColor: '#28634f' }, row: { minHeight: 34, paddingHorizontal: spacing.lg, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm }, dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.warning }, dotOnline: { backgroundColor: colors.positive }, text: { flexShrink: 1, color: colors.text, fontSize: 9, fontWeight: '800', textAlign: 'center' } });
