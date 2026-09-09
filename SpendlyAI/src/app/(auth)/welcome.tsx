import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/theme/colors';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>✨</Text>
          </View>
          <Text style={styles.title}>Spendly AI</Text>
          <Text style={styles.tagline}>
            Understand your money.{'\n'}One receipt at a time.
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>📷</Text>
            <View>
              <Text style={styles.featureTitle}>Instant Receipt Scanning</Text>
              <Text style={styles.featureSub}>Extract merchant, items, tax & total automatically</Text>
            </View>
          </View>
          
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>💡</Text>
            <View>
              <Text style={styles.featureTitle}>Smart AI Insights</Text>
              <Text style={styles.featureSub}>Discover hidden spending trends and save more</Text>
            </View>
          </View>
          
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>🎯</Text>
            <View>
              <Text style={styles.featureTitle}>Budgets & Goals</Text>
              <Text style={styles.featureSub}>Stay on track with personalized monthly targets</Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={() => router.push('/(auth)/sign-up')}
          >
            <Text style={styles.primaryButtonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => router.push('/(auth)/sign-in')}
          >
            <Text style={styles.secondaryButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary[500] + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary[500] + '40',
  },
  logoIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.dark.textPrimary,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    color: colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  features: {
    marginVertical: 32,
    gap: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureIcon: {
    fontSize: 28,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark.textPrimary,
  },
  featureSub: {
    fontSize: 13,
    color: colors.dark.textMuted,
    marginTop: 2,
  },
  actions: {
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: colors.dark.card,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.dark.cardBorder,
  },
  secondaryButtonText: {
    color: colors.dark.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});
