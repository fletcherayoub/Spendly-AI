import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset, MaxContentWidth, Spacing, type SpendlyTheme } from '@/constants/theme';
import { useSpendlyTheme } from '@/hooks/use-spendly-theme';
import { useBudgets, useSetBudget } from '@/hooks/use-budgets';
import { useExpenses } from '@/hooks/use-expenses';
import { useAddGoal, useGoals, useUpdateGoalAmount } from '@/hooks/use-goals';
import { CATEGORIES } from '@/lib/categories';
import { convertTo, formatMoney } from '@/lib/currency';
import { useAuthStore } from '@/store/auth-store';
import { useSettingsStore } from '@/store/settings-store';
import type { ExpenseCategory } from '@/types/expense';

export default function BudgetScreen() {
  const t = useSpendlyTheme();
  const styles = createStyles(t);
  const user = useAuthStore((s) => s.user);
  const defaultCurrency = useSettingsStore((s) => s.defaultCurrency);
  const money = (n: number, code?: string) => formatMoney(n, code ?? defaultCurrency);
  const inDef = (amount: number | string, code?: string) =>
    convertTo(Number(amount), code ?? defaultCurrency, defaultCurrency);

  const [activeTab, setActiveTab] = useState<'budgets' | 'goals'>('budgets');
  const currentMonth = new Date().toISOString().slice(0, 7);

  // Queries
  const { data: budgets = [], isLoading: budgetsLoading } = useBudgets(user?.id, currentMonth);
  const { data: expenses = [] } = useExpenses(user?.id);
  const { data: goals = [], isLoading: goalsLoading } = useGoals(user?.id);

  // Mutations
  const setBudgetMutation = useSetBudget();
  const addGoalMutation = useAddGoal();
  const updateGoalMutation = useUpdateGoalAmount();

  // Modals state
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'total'>('total');
  const [budgetLimitInput, setBudgetLimitInput] = useState('');

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');

  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  // Calculate monthly spending per category (converted to default currency)
  const monthExpenses = expenses.filter((e) => e.date.startsWith(currentMonth));
  const monthTotalSpent = monthExpenses.reduce((sum, e) => sum + inDef(e.amount, e.currency), 0);

  const categorySpentMap: Record<string, number> = {};
  monthExpenses.forEach((e) => {
    categorySpentMap[e.category] = (categorySpentMap[e.category] || 0) + inDef(e.amount, e.currency);
  });

  const totalBudgetObj = budgets.find((b) => b.category === 'total');
  const totalLimit = totalBudgetObj ? inDef(totalBudgetObj.limit, totalBudgetObj.currency) : 0;

  async function handleSaveBudget() {
    if (!user || !budgetLimitInput) return;
    await setBudgetMutation.mutateAsync({
      user_id: user.id,
      month: currentMonth,
      category: selectedCategory,
      limit: Number(budgetLimitInput),
      currency: defaultCurrency,
    });
    setShowBudgetModal(false);
    setBudgetLimitInput('');
  }

  async function handleSaveGoal() {
    if (!user || !goalTitle || !goalTarget) return;
    await addGoalMutation.mutateAsync({
      user_id: user.id,
      title: goalTitle,
      target: Number(goalTarget),
      currency: defaultCurrency,
      deadline: goalDeadline || null,
    });
    setShowGoalModal(false);
    setGoalTitle('');
    setGoalTarget('');
    setGoalDeadline('');
  }

  async function handleDeposit() {
    if (!depositGoalId || !depositAmount) return;
    const goal = goals.find((g) => g.id === depositGoalId);
    if (!goal) return;
    await updateGoalMutation.mutateAsync({
      id: depositGoalId,
      current: Number(goal.current) + Number(depositAmount),
    });
    setDepositGoalId(null);
    setDepositAmount('');
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Budget & Goals</Text>

          {/* Segmented Control */}
          <View style={styles.tabContainer}>
            <Pressable
              style={[styles.tabButton, activeTab === 'budgets' && styles.tabButtonActive]}
              onPress={() => setActiveTab('budgets')}>
              <Text style={activeTab === 'budgets' ? styles.tabTextActive : styles.tabText}>
                Monthly Budgets
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tabButton, activeTab === 'goals' && styles.tabButtonActive]}
              onPress={() => setActiveTab('goals')}>
              <Text style={activeTab === 'goals' ? styles.tabTextActive : styles.tabText}>
                Savings Goals
              </Text>
            </Pressable>
          </View>

          {/* BUDGETS VIEW */}
          {activeTab === 'budgets' && (
            <View style={styles.section}>
              {/* Overall Month Summary Card */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <View>
                    <Text style={styles.summaryLabel}>Total Spent ({currentMonth})</Text>
                    <Text style={styles.summaryAmount}>{money(monthTotalSpent)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.summaryLabel}>Monthly Limit ({defaultCurrency})</Text>
                    <Text style={styles.summaryLimit}>
                      {totalLimit > 0 ? money(totalLimit) : 'No limit'}
                    </Text>
                  </View>
                </View>

                {totalLimit > 0 && (
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${Math.min((monthTotalSpent / totalLimit) * 100, 100)}%`,
                          backgroundColor:
                            monthTotalSpent > totalLimit
                              ? t.danger
                              : monthTotalSpent > totalLimit * 0.8
                              ? '#EAB308'
                              : t.primary,
                        },
                      ]}
                    />
                  </View>
                )}

                <Pressable
                  style={styles.setTotalBtn}
                  onPress={() => {
                    setSelectedCategory('total');
                    setBudgetLimitInput(totalLimit ? String(totalLimit) : '');
                    setShowBudgetModal(true);
                  }}>
                  <Text style={styles.setTotalBtnText}>
                    {totalLimit > 0 ? '✏️ Edit Monthly Total Budget' : '+ Set Overall Monthly Limit'}
                  </Text>
                </Pressable>
              </View>

              {/* Category Budgets */}
              <View style={styles.headerRow}>
                <Text style={styles.sectionHeading}>Category Limits</Text>
                <Pressable
                  style={styles.addCategoryBtn}
                  onPress={() => {
                    setSelectedCategory('groceries');
                    setBudgetLimitInput('');
                    setShowBudgetModal(true);
                  }}>
                  <Text style={styles.addCategoryBtnText}>+ Set Limit</Text>
                </Pressable>
              </View>

              {budgetsLoading ? (
                <ActivityIndicator color={t.primary} style={{ marginTop: 20 }} />
              ) : budgets.filter((b) => b.category !== 'total').length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>
                    No category budgets set for this month. Tap "+ Set Limit" above to set spending goals per category!
                  </Text>
                </View>
              ) : (
                budgets
                  .filter((b) => b.category !== 'total')
                  .map((b) => {
                    const catInfo = CATEGORIES.find((c) => c.id === b.category) ?? {
                      label: b.category,
                      emoji: '📌',
                    };
                    const spent = categorySpentMap[b.category] || 0;
                    const limit = inDef(b.limit, b.currency);
                    const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
                    const isOver = spent > limit;

                    return (
                      <View key={b.id} style={styles.categoryCard}>
                        <View style={styles.summaryRow}>
                          <Text style={styles.catTitle}>
                            {catInfo.emoji} {catInfo.label}
                          </Text>
                          <Text style={[styles.catSpent, isOver && { color: t.danger }]}>
                            {money(spent)} / {money(limit)}
                          </Text>
                        </View>
                        <View style={styles.progressTrack}>
                          <View
                            style={[
                              styles.progressBar,
                              {
                                width: `${pct}%`,
                                backgroundColor: isOver ? t.danger : pct > 85 ? '#EAB308' : t.primary,
                              },
                            ]}
                          />
                        </View>
                        {isOver && (
                          <Text style={styles.alertText}>
                            ⚠️ Exceeded budget limit by {money(spent - limit)}
                          </Text>
                        )}
                      </View>
                    );
                  })
              )}
            </View>
          )}

          {/* GOALS VIEW */}
          {activeTab === 'goals' && (
            <View style={styles.section}>
              <View style={styles.headerRow}>
                <Text style={styles.sectionHeading}>Savings Targets</Text>
                <Pressable
                  style={styles.addCategoryBtn}
                  onPress={() => setShowGoalModal(true)}>
                  <Text style={styles.addCategoryBtnText}>+ New Goal</Text>
                </Pressable>
              </View>

              {goalsLoading ? (
                <ActivityIndicator color={t.primary} style={{ marginTop: 20 }} />
              ) : goals.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>
                    No savings goals yet. Create a goal to save for a trip, emergency fund, or major purchase!
                  </Text>
                </View>
              ) : (
                goals.map((g) => {
                  const current = Number(g.current);
                  const target = Number(g.target);
                  const pct = Math.min((current / target) * 100, 100);

                  return (
                    <View key={g.id} style={styles.goalCard}>
                      <View style={styles.summaryRow}>
                        <Text style={styles.goalTitle}>🎯 {g.title}</Text>
                        <Text style={styles.goalPct}>{pct.toFixed(0)}%</Text>
                      </View>
                      <Text style={styles.goalSub}>
                        {money(inDef(g.current, g.currency))} saved of {money(inDef(g.target, g.currency))}
                      </Text>
                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressBar,
                            { width: `${pct}%`, backgroundColor: pct >= 100 ? '#10B981' : t.primary },
                          ]}
                        />
                      </View>

                      {g.deadline ? (
                        <Text style={styles.goalDeadline}>Target date: {g.deadline}</Text>
                      ) : null}

                      <Pressable
                        style={styles.depositBtn}
                        onPress={() => setDepositGoalId(g.id)}>
                        <Text style={styles.depositBtnText}>+ Add Savings Deposit</Text>
                      </Pressable>
                    </View>
                  );
                })
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* SET BUDGET MODAL */}
      <Modal visible={showBudgetModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Budget Limit</Text>
            <Text style={styles.label}>Select Category</Text>
            <View style={styles.chipRow}>
              <Pressable
                style={[styles.chip, selectedCategory === 'total' && styles.chipOn]}
                onPress={() => setSelectedCategory('total')}>
                <Text style={selectedCategory === 'total' ? styles.chipOnT : styles.chipT}>
                  🌟 Overall Total
                </Text>
              </Pressable>
              {CATEGORIES.map((c) => (
                <Pressable
                  key={c.id}
                  style={[styles.chip, selectedCategory === c.id && styles.chipOn]}
                  onPress={() => setSelectedCategory(c.id)}>
                  <Text style={selectedCategory === c.id ? styles.chipOnT : styles.chipT}>
                    {c.emoji} {c.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Monthly Limit (EUR)</Text>
            <TextInput
              value={budgetLimitInput}
              onChangeText={setBudgetLimitInput}
              keyboardType="numeric"
              style={styles.input}
              placeholder="e.g. 500"
              placeholderTextColor={t.muted}
            />

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setShowBudgetModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.saveBtn}
                onPress={handleSaveBudget}
                disabled={setBudgetMutation.isPending}>
                <Text style={styles.saveBtnText}>
                  {setBudgetMutation.isPending ? 'Saving…' : 'Save Limit'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* NEW GOAL MODAL */}
      <Modal visible={showGoalModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Savings Goal</Text>
            <Text style={styles.label}>Goal Title</Text>
            <TextInput
              value={goalTitle}
              onChangeText={setGoalTitle}
              style={styles.input}
              placeholder="e.g. Summer Trip ✈️"
              placeholderTextColor={t.muted}
            />

            <Text style={styles.label}>Target Amount (EUR)</Text>
            <TextInput
              value={goalTarget}
              onChangeText={setGoalTarget}
              keyboardType="numeric"
              style={styles.input}
              placeholder="e.g. 1500"
              placeholderTextColor={t.muted}
            />

            <Text style={styles.label}>Target Date (Optional YYYY-MM-DD)</Text>
            <TextInput
              value={goalDeadline}
              onChangeText={setGoalDeadline}
              style={styles.input}
              placeholder="2026-12-31"
              placeholderTextColor={t.muted}
            />

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setShowGoalModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.saveBtn}
                onPress={handleSaveGoal}
                disabled={addGoalMutation.isPending}>
                <Text style={styles.saveBtnText}>
                  {addGoalMutation.isPending ? 'Saving…' : 'Create Goal'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* DEPOSIT MODAL */}
      <Modal visible={!!depositGoalId} animationType="fade" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Savings Deposit</Text>
            <Text style={styles.label}>Deposit Amount (EUR)</Text>
            <TextInput
              value={depositAmount}
              onChangeText={setDepositAmount}
              keyboardType="numeric"
              style={styles.input}
              placeholder="e.g. 50"
              placeholderTextColor={t.muted}
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setDepositGoalId(null)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.saveBtn}
                onPress={handleDeposit}
                disabled={updateGoalMutation.isPending}>
                <Text style={styles.saveBtnText}>
                  {updateGoalMutation.isPending ? 'Saving…' : 'Add Deposit'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (t: SpendlyTheme) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: t.background,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    safe: {
      flex: 1,
      maxWidth: MaxContentWidth,
    },
    scroll: {
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.four,
      paddingBottom: BottomTabInset + Spacing.four,
      gap: Spacing.three,
    },
    title: {
      color: t.ink,
      fontSize: 26,
      fontWeight: '800',
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: t.card,
      borderRadius: 14,
      padding: 4,
    },
    tabButton: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 10,
    },
    tabButtonActive: {
      backgroundColor: t.primary,
    },
    tabText: {
      color: t.muted,
      fontWeight: '700',
      fontSize: 14,
    },
    tabTextActive: {
      color: '#ffffff',
      fontWeight: '800',
      fontSize: 14,
    },
    section: {
      gap: Spacing.three,
      marginTop: 4,
    },
    summaryCard: {
      backgroundColor: t.card,
      borderRadius: 18,
      padding: Spacing.four,
      gap: 12,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    summaryLabel: {
      color: t.muted,
      fontSize: 13,
    },
    summaryAmount: {
      color: t.ink,
      fontSize: 26,
      fontWeight: '800',
      marginTop: 2,
    },
    summaryLimit: {
      color: t.ink,
      fontSize: 20,
      fontWeight: '700',
      marginTop: 2,
    },
    progressTrack: {
      height: 10,
      backgroundColor: t.border,
      borderRadius: 5,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      borderRadius: 5,
    },
    setTotalBtn: {
      alignItems: 'center',
      paddingVertical: 8,
      marginTop: 4,
    },
    setTotalBtnText: {
      color: t.primary,
      fontWeight: '700',
      fontSize: 13,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
    },
    sectionHeading: {
      color: t.ink,
      fontSize: 18,
      fontWeight: '800',
    },
    addCategoryBtn: {
      backgroundColor: t.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    addCategoryBtnText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 13,
    },
    emptyCard: {
      backgroundColor: t.card,
      borderRadius: 14,
      padding: 20,
      alignItems: 'center',
    },
    emptyText: {
      color: t.muted,
      fontSize: 13,
      textAlign: 'center',
      lineHeight: 18,
    },
    categoryCard: {
      backgroundColor: t.card,
      borderRadius: 16,
      padding: 14,
      gap: 8,
    },
    catTitle: {
      color: t.ink,
      fontWeight: '700',
      fontSize: 15,
    },
    catSpent: {
      color: t.ink,
      fontWeight: '700',
      fontSize: 14,
    },
    alertText: {
      color: t.danger,
      fontSize: 12,
      fontWeight: '600',
    },
    goalCard: {
      backgroundColor: t.card,
      borderRadius: 16,
      padding: 16,
      gap: 8,
    },
    goalTitle: {
      color: t.ink,
      fontWeight: '800',
      fontSize: 16,
    },
    goalPct: {
      color: t.primary,
      fontWeight: '800',
      fontSize: 15,
    },
    goalSub: {
      color: t.muted,
      fontSize: 13,
    },
    goalDeadline: {
      color: t.muted,
      fontSize: 12,
      fontStyle: 'italic',
    },
    depositBtn: {
      borderWidth: 1,
      borderColor: t.border,
      borderRadius: 10,
      paddingVertical: 8,
      alignItems: 'center',
      marginTop: 4,
    },
    depositBtnText: {
      color: t.ink,
      fontWeight: '700',
      fontSize: 13,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: t.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: Spacing.four,
      gap: 12,
      maxHeight: '80%',
    },
    modalTitle: {
      color: t.ink,
      fontSize: 20,
      fontWeight: '800',
    },
    label: {
      color: t.muted,
      fontSize: 13,
      fontWeight: '700',
      marginTop: 4,
    },
    input: {
      backgroundColor: t.card,
      color: t.ink,
      borderRadius: 12,
      padding: 12,
      fontSize: 16,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      borderWidth: 1,
      borderColor: t.border,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    chipOn: {
      backgroundColor: t.primary,
      borderColor: t.primary,
    },
    chipT: {
      color: t.ink,
      fontSize: 13,
    },
    chipOnT: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '700',
    },
    modalActions: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 12,
    },
    cancelBtn: {
      flex: 1,
      borderWidth: 1,
      borderColor: t.border,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
    },
    cancelBtnText: {
      color: t.ink,
      fontWeight: '700',
    },
    saveBtn: {
      flex: 1,
      backgroundColor: t.primary,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
    },
    saveBtnText: {
      color: '#fff',
      fontWeight: '800',
    },
  });
