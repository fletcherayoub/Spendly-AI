import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { colors } from '@/theme/colors';

export default function AIInsightsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>‹ AI Insights</Text>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.robotIconCircle}>
            <Text style={styles.robotIcon}>🤖</Text>
          </View>
          <Text style={styles.heroCardText}>Smart insights for{'\n'}your spending</Text>
        </View>

        {/* Insight Card 1 */}
        <View style={styles.insightCard}>
          <View style={[styles.iconBox, { backgroundColor: '#FFF3E0' }]}>
            <Text style={styles.cardIcon}>🍴</Text>
          </View>
          <View style={styles.cardTextContent}>
            <Text style={styles.cardTitle}>You spent 24% more on restaurants this month than last month.</Text>
            <Text style={styles.cardSub}>Consider cooking at home more often to save money.</Text>
          </View>
        </View>

        {/* Insight Card 2 */}
        <View style={styles.insightCard}>
          <View style={[styles.iconBox, { backgroundColor: '#F3E5F5' }]}>
            <Text style={styles.cardIcon}>🛍️</Text>
          </View>
          <View style={styles.cardTextContent}>
            <Text style={styles.cardTitle}>Biggest category</Text>
            <Text style={styles.cardMainStat}>Groceries</Text>
            <Text style={styles.cardSub}>38% of your total spending</Text>
          </View>
        </View>

        {/* Insight Card 3 */}
        <View style={styles.insightCard}>
          <View style={[styles.iconBox, { backgroundColor: '#FFFDE7' }]}>
            <Text style={styles.cardIcon}>💡</Text>
          </View>
          <View style={styles.cardTextContent}>
            <Text style={styles.cardTitle}>Saving opportunity</Text>
            <Text style={styles.cardSub}>You could save around €50/month by reducing food delivery.</Text>
          </View>
        </View>

        {/* Ask AI CTA */}
        <TouchableOpacity style={styles.askAiButton}>
          <Text style={styles.askAiIcon}>💬</Text>
          <Text style={styles.askAiText}>Ask AI</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.bg,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.light.textPrimary,
    marginVertical: 4,
  },
  heroCard: {
    backgroundColor: colors.primary[500],
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  robotIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  robotIcon: {
    fontSize: 24,
  },
  heroCardText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  insightCard: {
    backgroundColor: colors.light.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 14,
    borderWidth: 1,
    borderColor: colors.light.cardBorder,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: {
    fontSize: 22,
  },
  cardTextContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.light.textPrimary,
    lineHeight: 20,
  },
  cardMainStat: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.light.textPrimary,
    marginTop: 2,
  },
  cardSub: {
    fontSize: 13,
    color: colors.light.textSecondary,
    marginTop: 2,
  },
  askAiButton: {
    backgroundColor: colors.primary[500],
    borderRadius: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  askAiIcon: {
    fontSize: 18,
  },
  askAiText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
