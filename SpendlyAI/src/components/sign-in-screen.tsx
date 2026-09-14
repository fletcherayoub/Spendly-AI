import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Spacing, type SpendlyTheme } from '@/constants/theme';
import { useSpendlyTheme } from '@/hooks/use-spendly-theme';
import { useAuthStore } from '@/store/auth-store';

export function SignInScreen() {
  const t = useSpendlyTheme();
  const styles = createStyles(t);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const actionInFlight = useAuthStore((s) => s.actionInFlight);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.hero}>
          <Image source={require('@/assets/images/icon.png')} style={styles.icon} />
          <Text style={styles.title}>Spendly AI</Text>
          <Text style={styles.subtitle}>Snap. Track. Understand your spending.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome</Text>
          <Text style={styles.cardText}>
            Scan receipts, track expenses and get AI-powered insights.
          </Text>

          {error ? (
            <Pressable onPress={clearError}>
              <Text style={styles.error}>{error}</Text>
            </Pressable>
          ) : null}

          <Pressable
            style={({ pressed }) => [styles.googleButton, pressed && styles.pressed]}
            onPress={signInWithGoogle}
            disabled={actionInFlight}>
            {actionInFlight ? (
              <ActivityIndicator color={t.primary} />
            ) : (
              <View style={styles.googleButtonContent}>
                <Image
                  source={require('@/assets/images/google-g.png')}
                  style={styles.googleIcon}
                />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </View>
            )}
          </Pressable>
        </View>

        <Text style={styles.disclaimer}>
          By continuing you accept our{' '}
          <Text style={styles.link} onPress={() => router.push('/terms' as never)}>
            Terms
          </Text>
          {' '}and{' '}
          <Text style={styles.link} onPress={() => router.push('/privacy' as never)}>
            Privacy Policy
          </Text>
          . Receipts stay private to your account — AI sees only what&apos;s needed to
          read a receipt, and nothing is saved until you review and confirm it.
        </Text>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (t: SpendlyTheme) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: t.primaryDark,
    },
    safe: {
      flex: 1,
      paddingHorizontal: Spacing.four,
      justifyContent: 'center',
      gap: Spacing.five,
    },
    hero: {
      alignItems: 'center',
      gap: Spacing.two,
    },
    icon: {
      width: 96,
      height: 96,
      borderRadius: 24,
    },
    title: {
      color: t.onPrimary,
      fontSize: 32,
      fontWeight: '800',
    },
    subtitle: {
      color: t.onPrimaryMuted,
      fontSize: 15,
      textAlign: 'center',
    },
    card: {
      backgroundColor: t.card,
      borderRadius: 20,
      padding: Spacing.four,
      gap: Spacing.three,
    },
    cardTitle: {
      color: t.ink,
      fontSize: 20,
      fontWeight: '700',
    },
    cardText: {
      color: t.muted,
      fontSize: 14,
      lineHeight: 20,
    },
    error: {
      color: t.danger,
      fontSize: 13,
    },
    googleButton: {
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    googleButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    googleIcon: {
      width: 20,
      height: 20,
    },
    googleButtonText: {
      color: t.ink,
      fontSize: 16,
      fontWeight: '700',
    },
    pressed: {
      opacity: 0.7,
    },
    disclaimer: {
      color: t.onPrimaryMuted,
      fontSize: 12,
      lineHeight: 17,
      textAlign: 'center',
      paddingHorizontal: Spacing.two,
    },
    link: {
      color: t.onPrimary,
      fontWeight: '700',
      textDecorationLine: 'underline',
    },
  });
