import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { budgetService, expenseService } from '@/services/dataService';
import { formatCurrency } from '@/utils/formatters';
import { colors } from '@/theme/colors';
import { LoadingState } from '@/components/common/LoadingState';

export default function BudgetScreen() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [newBudgetAmount, setNewBudgetAmount] = useState('');

  const loadData = async () => {
    if (!user) return;
    try {
      const [bData, eData] = await Promise.all([
        budgetService.getBudgets(user.id),
        expenseService.getExpenses(user.id)
      ]);
      setBudgets(bData || []);
      const spent = (eData || []).reduce((sum: number, e: any) => sum + Number(e.amount), 0);
      setTotalSpent(spent);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCreateBudget = async () => {
    if (!user || !newBudgetAmount) return;
    const amount = parseFloat(newBudgetAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid monthly budget limit.');
      return;
    }

    try {
      await budgetService.createBudget({
        user_id: user.id,
        amount,
        period: 'monthly',
        currency: 'USD',
      });
      setNewBudgetAmount('');
      loadData();
      Alert.alert('Success', 'Monthly budget created!');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  if (loading) return <LoadingState message="Loading budgets..." />;

  const currentBudget = budgets.length > 0 ? Number(budgets[0].amount) : 2000;
  const remaining = currentBudget - totalSpent;
  const percentage = Math.min(Math.round((totalSpent / currentBudget) * 100), 100);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Budget Planner</Text>

        {/* Budget Overview Card */}
        <View style={styles.budgetCard}>
          <Text style={styles.cardSub}>Monthly Spending Limit</Text>
          <Text style={styles.cardAmount}>{formatCurrency(currentBudget)}</Text>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.spentText}>Spent: {formatCurrency(totalSpent)}</Text>
              <Text style={styles.remainingText}>Remaining: {formatCurrency(remaining)}</Text>
            </View>
            <View style={styles.track}>
              <View 
                style={[
                  styles.fill, 
                  { width: `${percentage}%` },
                  percentage > 90 ? { backgroundColor: colors.danger } : {}
                ]} 
              />
            </View>
            <Text style={styles.warningText}>
              {percentage >= 100 
                ? "⚠️ You've reached your budget limit!" 
                : percentage >= 75 
                ? "⚠️ You're approaching your budget limit." 
                : `${100 - percentage}% of your monthly allowance remaining.`}
            </Text>
          </View>
        </View>

        {/* Update / Create Budget Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Set Monthly Target</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2500"
              placeholderTextColor={colors.dark.textMuted}
              keyboardType="numeric"
              value={newBudgetAmount}
              onChangeText={setNewBudgetAmount}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleCreateBudget}>
              <Text style={styles.saveButtonText}>Set Limit</Text>
            </TouchableOpacity>
          </View>
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
  budgetCard: {
    backgroundColor: colors.dark.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.dark.cardBorder,
  },
  cardSub: {
    fontSize: 14,
    color: colors.dark.textSecondary,
    marginBottom: 6,
  },
  cardAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.dark.textPrimary,
    marginBottom: 20,
  },
  progressSection: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  spentText: {
    color: colors.dark.textPrimary,
    fontWeight: '600',
  },
  remainingText: {
    color: colors.primary[500],
    fontWeight: '600',
  },
  track: {
    height: 12,
    backgroundColor: colors.dark.bg,
    borderRadius: 6,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary[500],
  },
  warningText: {
    fontSize: 13,
    color: colors.dark.textMuted,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: colors.dark.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.dark.cardBorder,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.dark.textPrimary,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: colors.dark.bg,
    borderRadius: 12,
    paddingHorizontal: 16,
    color: colors.dark.textPrimary,
    borderWidth: 1,
    borderColor: colors.dark.cardBorder,
  },
  saveButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
