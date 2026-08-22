import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme';

export function ComingSoon({ title, description, icon }: { title: string; description: string; icon: keyof typeof Ionicons.glyphMap }) {
  return <SafeAreaView style={styles.safe}><View style={styles.content}><View style={styles.icon}><Ionicons name={icon} size={28} color={colors.accent} /></View><Text style={styles.title}>{title}</Text><Text style={styles.description}>{description}</Text><Text style={styles.notice}>This surface is queued for a verified backend-connected slice. No simulated values are shown.</Text></View></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }, icon: { width: 58, height: 58, borderRadius: 18, backgroundColor: colors.accentDim, alignItems: 'center', justifyContent: 'center' }, title: { color: colors.text, fontSize: 26, fontWeight: '900', marginTop: spacing.lg }, description: { color: colors.muted, textAlign: 'center', marginTop: spacing.sm }, notice: { color: colors.warning, fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: spacing.xl, maxWidth: 300 } });
