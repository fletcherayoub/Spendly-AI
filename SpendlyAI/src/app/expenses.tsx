import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing, type SpendlyTheme } from '@/constants/theme';
import { useSpendlyTheme } from '@/hooks/use-spendly-theme';

function Placeholder({
  title,
  hint,
  styles,
}: {
  title: string;
  hint: string;
  styles: ReturnType<typeof createStyles>;
}) {
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
  const t = useSpendlyTheme();
  const styles = createStyles(t);
  return (
    <Placeholder
      title="Expenses"
      hint="Your scanned receipts and manual expenses will appear here."
      styles={styles}
    />
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
      paddingTop: Spacing.four,
      gap: Spacing.three,
    },
    title: {
      color: t.ink,
      fontSize: 24,
      fontWeight: '800',
    },
    card: {
      backgroundColor: t.card,
      borderRadius: 16,
      padding: Spacing.four,
    },
    hint: {
      color: t.muted,
      fontSize: 14,
    },
  });
