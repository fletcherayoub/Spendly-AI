import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing, Spendly } from '@/constants/theme';

export default function BudgetScreen() {
  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.title}>Budget</Text>
        <View style={styles.card}>
          <Text style={styles.hint}>Monthly budgets per category will appear here.</Text>
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
    paddingTop: Spacing.four,
    gap: Spacing.three,
  },
  title: {
    color: Spendly.ink,
    fontSize: 24,
    fontWeight: '800',
  },
  card: {
    backgroundColor: Spendly.card,
    borderRadius: 16,
    padding: Spacing.four,
  },
  hint: {
    color: Spendly.muted,
    fontSize: 14,
  },
});
