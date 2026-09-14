import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaxContentWidth, Spacing, type SpendlyTheme } from '@/constants/theme';
import { useSpendlyTheme } from '@/hooks/use-spendly-theme';
import { useSettingsStore } from '@/store/settings-store';

const STEPS = [
  { e: '📸', t: 'Scan receipts', d: 'AI extracts merchant, date, total, tax and items. You review before saving.' },
  { e: '📊', t: 'Track & budget', d: 'Dashboard, monthly/category budgets and spending trends.' },
  { e: '🧠', t: 'Ask AI', d: 'Personalized insights from your spending. Minimum data shared.' },
];

export default function OnboardingScreen() {
  const t = useSpendlyTheme();
  const s = createStyles(t);
  const complete = useSettingsStore((x) => x.completeOnboarding);
  return (
    <View style={s.root}>
      <SafeAreaView style={s.safe}>
        <View style={s.wrap}>
          {STEPS.map((x) => (
            <View key={x.t} style={s.card}>
              <Text style={s.emoji}>{x.e}</Text>
              <Text style={s.title}>{x.t}</Text>
              <Text style={s.desc}>{x.d}</Text>
            </View>
          ))}
          <Pressable style={s.cta} onPress={() => { complete(); router.replace('/'); }}>
            <Text style={s.ctaText}>Get Started</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
const createStyles = (t: SpendlyTheme) => StyleSheet.create({
  root: { flex: 1, backgroundColor: t.background, flexDirection: 'row', justifyContent: 'center' },
  safe: { flex: 1, maxWidth: MaxContentWidth },
  wrap: { padding: Spacing.four, gap: Spacing.three },
  card: { backgroundColor: t.card, borderRadius: 16, padding: Spacing.four, gap: 4 },
  emoji: { fontSize: 28 },
  title: { color: t.ink, fontSize: 17, fontWeight: '800' },
  desc: { color: t.muted, fontSize: 14, lineHeight: 20 },
  cta: { backgroundColor: t.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  ctaText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
