import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaxContentWidth, Spacing, type SpendlyTheme } from '@/constants/theme';
import { useSpendlyTheme } from '@/hooks/use-spendly-theme';
import { useSettingsStore } from '@/store/settings-store';

export default function PolicyScreen() {
  const t = useSpendlyTheme();
  const s = createStyles(t);
  const acceptPolicy = useSettingsStore((x) => x.acceptPolicy);
  const [privacy, setPrivacy] = useState(false);
  const [terms, setTerms] = useState(false);
  const canContinue = privacy && terms;

  return (
    <View style={s.root}>
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.scroll}>
          <Text style={s.title}>Welcome to Spendly AI</Text>
          <Text style={s.sub}>Snap. Track. Understand your spending.</Text>
          <View style={s.card}>
            <Text style={s.body}>
              We securely store receipt images and expenses. AI receives only the minimum
              needed for receipt processing. AI results are always editable and require
              your confirmation before saving.
            </Text>
          </View>
          <CheckRow label="I accept the Privacy Policy" value={privacy} onToggle={() => setPrivacy(!privacy)} link="/privacy" />
          <CheckRow label="I accept the Terms of Service" value={terms} onToggle={() => setTerms(!terms)} link="/terms" />
          <Pressable
            disabled={!canContinue}
            onPress={() => { acceptPolicy(); router.replace('/onboarding'); }}
            style={[s.cta, !canContinue && s.ctaDisabled]}>
            <Text style={s.ctaText}>Accept & Continue</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function CheckRow({ label, value, onToggle, link }: { label: string; value: boolean; onToggle: () => void; link: string }) {
  const t = useSpendlyTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 }}>
      <Pressable onPress={onToggle} style={{ width: 26, height: 26, borderRadius: 8, borderWidth: 1.5, borderColor: t.primary, alignItems: 'center', justifyContent: 'center', backgroundColor: value ? t.primary : 'transparent' }}>
        <Text style={{ color: '#fff', fontWeight: '800' }}>{value ? '✓' : ''}</Text>
      </Pressable>
      <Pressable onPress={onToggle} style={{ flex: 1 }}><Text style={{ color: t.ink }}>{label}</Text></Pressable>
      <Pressable onPress={() => router.push(link as never)}><Text style={{ color: t.primary, fontWeight: '700' }}>View</Text></Pressable>
    </View>
  );
}

const createStyles = (t: SpendlyTheme) => StyleSheet.create({
  root: { flex: 1, backgroundColor: t.background, flexDirection: 'row', justifyContent: 'center' },
  safe: { flex: 1, maxWidth: MaxContentWidth },
  scroll: { padding: Spacing.four, gap: Spacing.three },
  title: { color: t.ink, fontSize: 26, fontWeight: '800' },
  sub: { color: t.muted, fontSize: 15 },
  card: { backgroundColor: t.card, borderRadius: 16, padding: Spacing.four },
  body: { color: t.ink, fontSize: 14, lineHeight: 20 },
  cta: { backgroundColor: t.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: Spacing.four },
  ctaDisabled: { opacity: 0.4 },
  ctaText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
