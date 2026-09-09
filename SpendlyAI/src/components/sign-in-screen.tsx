import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spacing, Spendly } from '@/constants/theme';
import { useAuthStore } from '@/store/auth-store';

export function SignInScreen() {
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
              <ActivityIndicator color={Spendly.primary} />
            ) : (
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            )}
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Spendly.primaryDark,
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
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    color: '#CDE6DA',
    fontSize: 15,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Spendly.card,
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  cardTitle: {
    color: Spendly.ink,
    fontSize: 20,
    fontWeight: '700',
  },
  cardText: {
    color: Spendly.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  error: {
    color: Spendly.danger,
    fontSize: 13,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8E2DD',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  googleButtonText: {
    color: Spendly.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
});
