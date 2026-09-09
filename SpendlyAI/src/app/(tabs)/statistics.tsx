import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { expenseService } from '@/services/dataService';
import { formatCurrency } from '@/utils/formatters';
import { colors } from '@/theme/colors';
import { LoadingState } from '@/components/common/LoadingState';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function StatisticsScreen() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    if (!user) return;
    expenseService.getExpenses(user.id).then(data => {
      setExpenses(data || []);
      setLoading(false);
    });
  }, [user]);

  if (loading) return <LoadingState message="Calculating spending statistics..." />;

  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const averageExpense = expenses.length > 0 ? totalSpent / expenses.length : 0;
  const largestExpense = expenses.reduce((max, e) => (Number(e.amount) > max ? Number(e.amount) : max), 0);

  // Group by category
  const categoryTotals: { [key: string]: { name: string; amount: number } } = {};
  expenses.forEach(e => {
    const catName = e.categories?.name || 'Other';
    if (!categoryTotals[catName]) {
      categoryTotals[catName] = { name: catName, amount: 0 };
    }
    categoryTotals[catName].amount += Number(e.amount);
  });

  const categoryList = Object.values(categoryTotals).sort((a, b) => b.amount - a.amount);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Spending Analytics</Text>

        {/* Time Filters */}
        <View style={styles.filterRow}>
          {(['week', 'month', 'year'] as const).map(filter => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, timeFilter === filter && styles.filterChipActive]}
              onPress={() => setTimeFilter(filter)}
            >
              <Text style={[styles.filterChipText, timeFilter === filter && styles.filterChipTextActive]}>
                {filter.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Metric Cards */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Spent</Text>
            <Text style={styles.metricValue}>{formatCurrency(totalSpent)}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Avg. Transaction</Text>
            <Text style={styles.metricValue}>{formatCurrency(averageExpense)}</Text>
          </View>
        </View>

        {/* Categories breakdown visual */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Breakdown by Category</Text>
          {categoryList.length === 0 ? (
            <Text style={styles.emptyText}>No spending data available for chart analysis.</Text>
          ) : (
            categoryList.map(cat => {
              const percentage = totalSpent > 0 ? Math.round((cat.amount / totalSpent) * 100) : 0;
              return (
                <View key={cat.name} style={styles.categoryBarRow}>
                  <View style={styles.categoryBarHeader}>
                    <Text style={styles.categoryName}>{cat.name}</Text>
                    <Text style={styles.categoryAmount}>{formatCurrency(cat.amount)} ({percentage}%)</Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${percentage}%` }]} />
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.dark.textPrimary,
    marginTop: 10,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 4,
  },
  filterChip: {
    flex: 1,
    backgroundColor: colors.dark.card,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.dark.cardBorder,
  },
  filterChipActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  filterChipText: {
    color: colors.dark.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.dark.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.dark.cardBorder,
  },
  metricLabel: {
    fontSize: 13,
    color: colors.dark.textMuted,
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.dark.textPrimary,
  },
  sectionCard: {
    backgroundColor: colors.dark.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.dark.cardBorder,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.dark.textPrimary,
    marginBottom: 16,
  },
  emptyText: {
    color: colors.dark.textMuted,
    textAlign: 'center',
    marginVertical: 20,
  },
  categoryBarRow: {
    marginBottom: 14,
  },
  categoryBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.dark.textPrimary,
  },
  categoryAmount: {
    fontSize: 14,
    color: colors.dark.textSecondary,
  },
  barTrack: {
    height: 8,
    backgroundColor: colors.dark.bg,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
  },
});
