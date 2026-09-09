import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing, Spendly } from '@/constants/theme';

function Placeholder({ title, hint }: { title: string; hint: string }) {
  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.card}>
          <Text style={styles.hint}>{hint}</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

export default function ExpensesScreen() {
  return <Placeholder title="Expenses" hint="Your scanned receipts and manual expenses will appear here." />;
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
