import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset, MaxContentWidth, Spacing, Spendly } from '@/constants/theme';
import { useProfile } from '@/hooks/use-profile';
import { useAuthStore } from '@/store/auth-store';

export default function HomeScreen() {
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Spendly.background,
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
    color: Spendly.muted,
    fontSize: 14,
  },
  name: {
    color: Spendly.ink,
    fontSize: 24,
    fontWeight: '800',
  },
  card: {
    backgroundColor: Spendly.primary,
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.one,
  },
  cardLabel: {
    color: '#CDE6DA',
    fontSize: 13,
  },
  cardValue: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
  },
  cardHint: {
    color: '#CDE6DA',
    fontSize: 13,
  },
});
