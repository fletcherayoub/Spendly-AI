import { SpendlyDark, SpendlyLight } from '@/constants/theme';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';

/**
 * Scheme-aware Spendly palette. Every screen/component reads colors from here,
 * so the whole app re-themes by editing `SpendlyLight`/`SpendlyDark` in
 * `src/constants/theme.ts` — no hexes anywhere else.
 */
export function useSpendlyTheme() {
  const scheme = useAppColorScheme();
  return scheme === 'dark' ? SpendlyDark : SpendlyLight;
}
