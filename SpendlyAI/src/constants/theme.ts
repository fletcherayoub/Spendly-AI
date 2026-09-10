/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * SPENDLY THEME — single source of truth for every color in the app.
 *
 * Workflow: never hardcode a hex outside this file. Add/change a token here
 * (in BOTH light and dark palettes) and every screen picks it up via
 * `useSpendlyTheme()`. Re-theming the whole app = editing the two palettes below.
 */
const spendlyBrand = {
  primary: '#0E6B4E',
  primaryDark: '#0A4A37',
  accent: '#22B07D',
} as const;

export const SpendlyLight = {
  ...spendlyBrand,
  primarySoft: '#DDF0E7',
  background: '#F4F7F5',
  card: '#FFFFFF',
  ink: '#10241C',
  muted: '#5F7269',
  onPrimary: '#FFFFFF',
  onPrimaryMuted: '#CDE6DA',
  border: '#D8E2DD',
  danger: '#C0392B',
  dangerBorder: '#E4CFC9',
  link: '#3C87F7',
} as const;

export const SpendlyDark = {
  ...spendlyBrand,
  primarySoft: '#143A2E',
  background: '#0C1210',
  card: '#141E1A',
  ink: '#EDF4F0',
  muted: '#93A89D',
  onPrimary: '#FFFFFF',
  onPrimaryMuted: '#CDE6DA',
  border: '#26352E',
  danger: '#E57373',
  dangerBorder: '#5A2B25',
  link: '#7AA9FF',
} as const;

export type SpendlyColor = keyof typeof SpendlyLight;
export type SpendlyTheme = Record<SpendlyColor, string>;

/** Back-compat alias (light palette). New code: use `useSpendlyTheme()` instead. */
export const Spendly = SpendlyLight;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
