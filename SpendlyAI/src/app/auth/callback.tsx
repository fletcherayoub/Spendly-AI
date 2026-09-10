import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import type { SpendlyTheme } from '@/constants/theme';
import { useSpendlyTheme } from '@/hooks/use-spendly-theme';
import { supabase } from '@/lib/supabase';

/**
 * OAuth landing route. Google redirects here (spendlyai://auth/callback on
 * native, /auth/callback on web). The native flow usually already stored the
 * session from the WebBrowser result — this screen just guarantees we never
 * strand the user here and always bounce to the Home tab.
 */
export default function AuthCallbackScreen() {
  const t = useSpendlyTheme();
  const styles = createStyles(t);
  const { code } = useLocalSearchParams<{ code?: string }>();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session && typeof code === 'string' && code.length > 0) {
          await supabase.auth.exchangeCodeForSession(code);
        }
      } catch {
        // Session handling errors surface via the auth store; just navigate.
      } finally {
        if (!cancelled) router.replace('/');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  return (
    <View style={styles.root}>
      <ActivityIndicator size="large" color={t.primary} />
    </View>
  );
}

const createStyles = (t: SpendlyTheme) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: t.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
