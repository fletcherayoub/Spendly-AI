import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset, MaxContentWidth, Spacing, type SpendlyTheme } from '@/constants/theme';
import { useSpendlyTheme } from '@/hooks/use-spendly-theme';
import { useProfile } from '@/hooks/UserHooks/use-profile';
import { useAuthStore } from '@/store/auth-store';

export default function HomeScreen() {
  const t = useSpendlyTheme();
  const styles = createStyles(t);
  const user = useAuthStore((s) => s.user);
  const { data: profile } = useProfile(user?.id);
  const name = profile?.display_name ?? user?.email ?? 'there';

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.name}>{name}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>This month</Text>
          <Text style={styles.cardValue}>€0.00</Text>
          <Text style={styles.cardHint}>Connect expenses to see your spending here.</Text>
        </View>
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
  });
