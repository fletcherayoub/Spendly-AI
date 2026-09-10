import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing, type SpendlyTheme } from '@/constants/theme';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';
import { useSpendlyTheme } from '@/hooks/use-spendly-theme';
import { useSettingsStore, type ThemeMode } from '@/store/settings-store';

const THEME_OPTIONS: { mode: ThemeMode; label: string }[] = [
  { mode: 'light', label: 'Light' },
  { mode: 'dark', label: 'Dark' },
  { mode: 'system', label: 'System' },
];

/** Segmented Light / Dark / System control. Persisted via the settings store. */
export function AppearanceSelector() {
  const t = useSpendlyTheme();
  const styles = createStyles(t);
  const scheme = useAppColorScheme();
  const themeMode = useSettingsStore((s) => s.themeMode);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Appearance</Text>
        <Text style={styles.active}>{scheme === 'dark' ? 'Dark' : 'Light'}</Text>
      </View>
      <View style={styles.segment}>
        {THEME_OPTIONS.map((option) => {
          const selected = themeMode === option.mode;
          return (
            <Pressable
              key={option.mode}
              style={[styles.tab, selected && styles.tabSelected]}
              onPress={() => setThemeMode(option.mode)}>
              <Text style={[styles.tabLabel, selected && styles.tabLabelSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.hint}>
        {themeMode === 'system' ? 'Following your device setting' : `Always ${themeMode}`}
      </Text>
    </View>
  );
}

const createStyles = (t: SpendlyTheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: t.card,
      borderRadius: 16,
      padding: Spacing.four,
      gap: Spacing.three,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
    },
    title: {
      color: t.ink,
      fontSize: 17,
      fontWeight: '700',
    },
    active: {
      color: t.primary,
      fontSize: 13,
      fontWeight: '700',
    },
    segment: {
      flexDirection: 'row',
      backgroundColor: t.background,
      borderRadius: 14,
      padding: 4,
      gap: 4,
    },
    tab: {
      flex: 1,
      paddingVertical: Spacing.two,
      borderRadius: 10,
      alignItems: 'center',
    },
    tabSelected: {
      backgroundColor: t.primary,
      elevation: 2,
      shadowColor: t.primary,
      shadowOpacity: 0.3,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    tabLabel: {
      color: t.muted,
      fontSize: 15,
      fontWeight: '600',
    },
    tabLabelSelected: {
      color: t.onPrimary,
    },
    hint: {
      color: t.muted,
      fontSize: 13,
    },
  });
