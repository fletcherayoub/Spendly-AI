import { createMMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';

const settingsMmkv = createMMKV({ id: 'spendly-settings' });

interface SettingsState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  policyAcceptedV1: boolean;
  hasOnboarded: boolean;
  acceptPolicy: () => void;
  revokePolicy: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

/** App settings persisted in MMKV (synchronous, survives restarts). */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themeMode: 'system',
      setThemeMode: (themeMode) => set({ themeMode }),
      policyAcceptedV1: false,
      hasOnboarded: false,
      acceptPolicy: () => set({ policyAcceptedV1: true }),
      revokePolicy: () => set({ policyAcceptedV1: false, hasOnboarded: false }),
      completeOnboarding: () => set({ hasOnboarded: true }),
      resetOnboarding: () => set({ hasOnboarded: false }),
    }),
    {
      name: 'spendly-settings',
      storage: createJSONStorage(() => ({
        getItem: (key: string) => settingsMmkv.getString(key) ?? null,
        setItem: (key: string, value: string) => {
          settingsMmkv.set(key, value);
        },
        removeItem: (key: string) => {
          settingsMmkv.remove(key);
        },
      })),
    },
  ),
);
