import { useColorScheme } from 'react-native';

import { useSettingsStore } from '@/store/settings-store';

/**
 * Effective color scheme: explicit user choice wins, otherwise the OS setting.
 * Every themed surface (Spendly palette, tab bar, nav theme) reads this hook,
 * so the Settings toggle re-themes the whole app instantly.
 */
export function useAppColorScheme(): 'light' | 'dark' {
  const themeMode = useSettingsStore((s) => s.themeMode);
  const system = useColorScheme();
  if (themeMode === 'light') return 'light';
  if (themeMode === 'dark') return 'dark';
  return system === 'dark' ? 'dark' : 'light';
}
