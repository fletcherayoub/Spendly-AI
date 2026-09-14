import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset, MaxContentWidth, Spacing, type SpendlyTheme } from '@/constants/theme';
import { useSpendlyTheme } from '@/hooks/use-spendly-theme';
import { useProfile } from '@/hooks/UserHooks/use-profile';
import { useAuthStore } from '@/store/auth-store';
import { useSettingsStore } from '@/store/settings-store';
import { useExpenses } from '@/hooks/use-expenses';
import { convertTo, formatMoney } from '@/lib/currency';

export default function HomeScreen() {
  const t = useSpendlyTheme();
  const styles = createStyles(t);
  const user = useAuthStore((s) => s.user);
  const { data: profile } = useProfile(user?.id);
  const name = profile?.display_name ?? user?.email ?? 'there';
  const defaultCurrency = useSettingsStore((x) => x.defaultCurrency);
  const { data: expenses } = useExpenses(user?.id);
  const month = new Date().toISOString().slice(0, 7);
  const monthExpenses = (expenses ?? []).filter((e) => e.date.startsWith(month));
  // Per-currency totals + converted total in default currency.
  const byCurrency: Record<string, number> = {};
  monthExpenses.forEach((e) => {
    byCurrency[e.currency] = (byCurrency[e.currency] ?? 0) + Number(e.amount);
  });
  const totalInDefault = monthExpenses.reduce((s, e) => s + convertTo(Number(e.amount), e.currency, defaultCurrency), 0);
  const breakdown = Object.entries(byCurrency).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const recent = (expenses ?? []).slice(0, 5);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={{ gap: Spacing.four }}>
          <View style={styles.header}>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.name}>{name}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>This month · ≈ in {defaultCurrency}</Text>
            <Text style={styles.cardValue}>{formatMoney(totalInDefault, defaultCurrency)}</Text>
            {breakdown.map(([code, amt]) => (
              <Text key={code} style={styles.cardHint}>· {formatMoney(amt, code)}</Text>
            ))}
            <Text style={styles.cardHint}>{monthExpenses.length} transactions this month</Text>
          </View>
          {recent.map((e) => (
            <View key={e.id} style={styles.row}>
              <Text style={styles.rowM}>{e.merchant ?? e.category}</Text>
              <Text style={styles.rowA}>{formatMoney(Number(e.amount), e.currency)}</Text>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (t: SpendlyTheme) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: t.background,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    safe: {
      flex: 1,
      maxWidth: MaxContentWidth,
      paddingHorizontal: Spacing.four,
      paddingBottom: BottomTabInset + Spacing.three,
      gap: Spacing.four,
    },
    header: {
      paddingTop: Spacing.four,
    },
    greeting: {
      color: t.muted,
      fontSize: 14,
    },
    name: {
      color: t.ink,
      fontSize: 24,
      fontWeight: '800',
    },
    card: {
      backgroundColor: t.primary,
      borderRadius: 20,
      padding: Spacing.four,
      gap: Spacing.one,
    },
    cardLabel: {
      color: t.onPrimaryMuted,
      fontSize: 13,
    },
    cardValue: {
      color: t.onPrimary,
      fontSize: 34,
      fontWeight: '800',
    },
    cardHint: {
      color: t.onPrimaryMuted,
      fontSize: 13,
    },
    row: {
      backgroundColor: t.card,
      borderRadius: 14,
      padding: Spacing.three,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    rowM: { color: t.ink, fontWeight: '700' },
    rowA: { color: t.ink, fontWeight: '800' },
  });
