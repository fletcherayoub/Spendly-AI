import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  RefreshControl 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { expenseService, budgetService } from '@/services/dataService';
import { formatCurrency } from '@/utils/formatters';
import { colors } from '@/theme/colors';
import { LoadingState } from '@/components/common/LoadingState';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    if (!user) return;
    try {
      const [expenseData, budgetData] = await Promise.all([
        expenseService.getExpenses(user.id),
        budgetService.getBudgets(user.id),
      ]);
      setExpenses(expenseData || []);
      setBudgets(budgetData || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const totalSpentMonth = expenses.reduce((sum, e) => sum + Number(e.amount), 842.50);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.light.bg} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[500]} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.userName}>{user?.user_metadata?.full_name || 'Alex'} 👋</Text>
          </View>
          <TouchableOpacity style={styles.notificationBell}>
            <Text style={styles.bellIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Emerald Spending Card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroCardLabel}>This month</Text>
          <Text style={styles.heroCardAmount}>€{totalSpentMonth.toFixed(2)}</Text>
          <View style={styles.trendRow}>
            <Text style={styles.trendText}>↓ 8% vs last month</Text>
          </View>
        </View>

        {/* 2x2 Category Grid */}
        <View style={styles.categoryGrid}>
          <View style={styles.categoryCard}>
            <View style={[styles.categoryIconCircle, { backgroundColor: '#FFF3E0' }]}>
              <Text style={styles.categoryIcon}>🍴</Text>
            </View>
            <View>
              <Text style={styles.categoryName}>Food</Text>
              <Text style={styles.categoryAmount}>€320</Text>
            </View>
          </View>

          <View style={styles.categoryCard}>
            <View style={[styles.categoryIconCircle, { backgroundColor: '#F3E5F5' }]}>
              <Text style={styles.categoryIcon}>🛍️</Text>
            </View>
            <View>
              <Text style={styles.categoryName}>Shopping</Text>
              <Text style={styles.categoryAmount}>€210</Text>
            </View>
          </View>

          <View style={styles.categoryCard}>
            <View style={[styles.categoryIconCircle, { backgroundColor: '#E3F2FD' }]}>
              <Text style={styles.categoryIcon}>🚗</Text>
            </View>
            <View>
              <Text style={styles.categoryName}>Transport</Text>
              <Text style={styles.categoryAmount}>€140</Text>
            </View>
          </View>

          <View style={styles.categoryCard}>
            <View style={[styles.categoryIconCircle, { backgroundColor: '#ECEFF1' }]}>
              <Text style={styles.categoryIcon}>⚙️</Text>
            </View>
            <View>
              <Text style={styles.categoryName}>Other</Text>
              <Text style={styles.categoryAmount}>€172</Text>
            </View>
          </View>
        </View>

        {/* Spending Overview Chart Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Spending overview</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/statistics')}>
              <Text style={styles.viewDetailsText}>View details &gt;</Text>
            </TouchableOpacity>
          </View>

          {/* Bar Chart Simulation */}
          <View style={styles.chartContainer}>
            {[35, 60, 45, 80, 50, 90, 65].map((h, i) => (
              <View key={i} style={styles.barColumn}>
                <View style={[styles.bar, { height: h }, i === 5 && styles.activeBar]} />
                <Text style={styles.barLabel}>{['24', '25', '26', '27', '28', '29', '30'][i]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Floating Scan Receipt Primary CTA */}
        <TouchableOpacity style={styles.scanCtaButton} onPress={() => router.push('/scan')}>
          <Text style={styles.scanCtaIcon}>📷</Text>
          <Text style={styles.scanCtaText}>Scan Receipt</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  greeting: {
    fontSize: 14,
    color: colors.light.textSecondary,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.light.textPrimary,
  },
  notificationBell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.light.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.light.cardBorder,
  },
  bellIcon: {
    fontSize: 18,
  },
  heroCard: {
    backgroundColor: colors.primary[500],
    borderRadius: 20,
    padding: 24,
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  heroCardLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 6,
  },
  heroCardAmount: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  trendRow: {
    flexDirection: 'row',
  },
  trendText: {
    color: '#FFFFFF',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: colors.light.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.light.cardBorder,
  },
  categoryIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryName: {
    fontSize: 13,
    color: colors.light.textSecondary,
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.light.textPrimary,
  },
  sectionCard: {
    backgroundColor: colors.light.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.light.cardBorder,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.light.textPrimary,
  },
  viewDetailsText: {
    color: colors.primary[500],
    fontSize: 13,
    fontWeight: '600',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 110,
    paddingTop: 10,
  },
  barColumn: {
    alignItems: 'center',
    gap: 6,
  },
  bar: {
    width: 24,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
  },
  activeBar: {
    backgroundColor: colors.primary[500],
  },
  barLabel: {
    fontSize: 11,
    color: colors.light.textMuted,
  },
  scanCtaButton: {
    backgroundColor: colors.primary[500],
    borderRadius: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 4,
  },
  scanCtaIcon: {
    fontSize: 20,
  },
  scanCtaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
