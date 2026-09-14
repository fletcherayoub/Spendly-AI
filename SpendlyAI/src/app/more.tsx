import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing, type SpendlyTheme } from '@/constants/theme';
import { AppearanceSelector } from '@/components/appearance-selector';
import { CurrencyPicker } from '@/components/currency-picker';
import { useSpendlyTheme } from '@/hooks/use-spendly-theme';
import { useProfile } from '@/hooks/UserHooks/use-profile';
import { useAuthStore } from '@/store/auth-store';
import { useSettingsStore } from '@/store/settings-store';

export default function MoreScreen() {
  const t = useSpendlyTheme();
  const styles = createStyles(t);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const actionInFlight = useAuthStore((s) => s.actionInFlight);
  const { data: profile } = useProfile(user?.id);
  const defaultCurrency = useSettingsStore((s) => s.defaultCurrency);
  const setDefaultCurrency = useSettingsStore((s) => s.setDefaultCurrency);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.card}>
          <Text style={styles.name}>{profile?.display_name ?? 'Spendly user'}</Text>
          <Text style={styles.email}>{profile?.email ?? user?.email ?? ''}</Text>
        </View>

        <AppearanceSelector />

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Default currency (new expenses + home total)</Text>
          <CurrencyPicker value={defaultCurrency} onChange={setDefaultCurrency} />
          <Text style={styles.cardHint}>Totals convert automatically using reference rates.</Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}
          onPress={signOut}
          disabled={actionInFlight}>
          {actionInFlight ? (
            <ActivityIndicator color={t.danger} />
          ) : (
            <Text style={styles.signOutText}>Log out</Text>
          )}
        </Pressable>
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
      gap: Spacing.one,
    },
    name: {
      color: t.ink,
      fontSize: 17,
      fontWeight: '700',
    },
    email: {
      color: t.muted,
      fontSize: 14,
    },
    cardLabel: { color: t.ink, fontSize: 14, fontWeight: '700' },
    cardHint: { color: t.muted, fontSize: 12 },
    signOut: {
      borderWidth: 1,
      borderColor: t.dangerBorder,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
    },
    signOutText: {
      color: t.danger,
      fontSize: 16,
      fontWeight: '700',
    },
    pressed: {
      opacity: 0.7,
    },
  });
