import { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { BottomTabInset, MaxContentWidth, Spacing, type SpendlyTheme } from '@/constants/theme';
import { useBudgets } from '@/hooks/use-budgets';
import { useExpenses } from '@/hooks/use-expenses';
import { useSpendlyTheme } from '@/hooks/use-spendly-theme';
import { CATEGORIES } from '@/lib/categories';
import { convertTo, formatMoney } from '@/lib/currency';
import { useAuthStore } from '@/store/auth-store';
import { useSettingsStore } from '@/store/settings-store';

export default function InsightsScreen() {
  const t = useSpendlyTheme();
  const styles = createStyles(t);
  const user = useAuthStore((s) => s.user);

  const now = new Date();
  const currentMonthStr = now.toISOString().slice(0, 7);

  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthStr = prevMonthDate.toISOString().slice(0, 7);

  const { data: expenses = [], isLoading } = useExpenses(user?.id);
  const { data: budgets = [] } = useBudgets(user?.id, currentMonthStr);
  const defaultCurrency = useSettingsStore((s) => s.defaultCurrency);
  const money = (n: number) => formatMoney(n, defaultCurrency);

  // Compute analytics (all totals converted to default currency)

  // Compute analytics
  const analytics = useMemo(() => {
    const inDef = (e: { amount: number | string; currency: string }) =>
      convertTo(Number(e.amount), e.currency, defaultCurrency);
    const curExpenses = expenses.filter((e) => e.date.startsWith(currentMonthStr));
    const prevExpenses = expenses.filter((e) => e.date.startsWith(prevMonthStr));

    const curTotal = curExpenses.reduce((s, e) => s + inDef(e), 0);
    const prevTotal = prevExpenses.reduce((s, e) => s + inDef(e), 0);

    const diffPct =
      prevTotal > 0 ? (((curTotal - prevTotal) / prevTotal) * 100).toFixed(1) : null;

    // Category Breakdown (converted)
    const catMap: Record<string, number> = {};
    curExpenses.forEach((e) => {
      catMap[e.category] = (catMap[e.category] || 0) + inDef(e);
    });

    const catList = Object.entries(catMap)
      .map(([cat, amount]) => ({
        category: cat,
        amount,
        pct: curTotal > 0 ? (amount / curTotal) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const topCategory = catList[0] ?? null;

    // Recurring / Subscription detection (converted totals)
    const merchantCounts: Record<string, { count: number; total: number }> = {};
    expenses.forEach((e) => {
      if (!e.merchant) return;
      const m = e.merchant.trim().toLowerCase();
      if (!merchantCounts[m]) merchantCounts[m] = { count: 0, total: 0 };
      merchantCounts[m].count += 1;
      merchantCounts[m].total += inDef(e);
    });

    const recurring = Object.entries(merchantCounts)
      .filter(([m, data]) => data.count >= 2 || /netflix|spotify|disney|apple|amazon|gym|fitness|hulu|patreon/i.test(m))
      .map(([m, data]) => ({ merchant: m, count: data.count, total: data.total }))
      .slice(0, 5);

    // Health Score calculation (0-100)
    let score = 85;
    const totalBudgetObj = budgets.find((b) => b.category === 'total');
    const totalLimit = totalBudgetObj ? Number(totalBudgetObj.limit) : 0;

    if (totalLimit > 0 && curTotal > totalLimit) score -= 25;
    if (diffPct && Number(diffPct) > 20) score -= 10;
    if (catList.some((c) => c.pct > 50)) score -= 10;
    score = Math.max(20, Math.min(100, score));

    return {
      curTotal,
      prevTotal,
      diffPct,
      catList,
      topCategory,
      recurring,
      score,
      totalLimit,
    };
  }, [expenses, currentMonthStr, prevMonthStr, budgets, defaultCurrency]);

  if (isLoading) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={t.primary} />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>AI Insights & Analytics</Text>
          <Pressable style={styles.askBtn} onPress={() => router.push('/ai' as never)}>
            <Text style={styles.askBtnT}>🧠 Ask AI about my spending</Text>
          </Pressable>

          {/* AI Health Score Card */}
          <View style={styles.scoreCard}>
            <View style={styles.scoreRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.scoreBadgeText}>AI Financial Health Score</Text>
                <Text style={styles.scoreNumber}>{analytics.score}/100</Text>
                <Text style={styles.scoreSub}>
                  {analytics.score >= 80
                    ? 'Excellent spending control! You are on track.'
                    : analytics.score >= 60
                    ? 'Good pace, but watch your high-category spending.'
                    : 'Caution: Spending limit exceeded or high growth.'}
                </Text>
              </View>
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreEmoji}>
                  {analytics.score >= 80 ? '🌟' : analytics.score >= 60 ? '📊' : '⚠️'}
                </Text>
              </View>
            </View>
          </View>

          {/* Month-over-Month Comparison */}
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Month-Over-Month Comparison</Text>
            <View style={styles.momRow}>
              <View>
                <Text style={styles.momLabel}>This Month ({currentMonthStr})</Text>
                <Text style={styles.momVal}>{money(analytics.curTotal)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.momLabel}>Last Month ({prevMonthStr})</Text>
                <Text style={styles.momVal}>{money(analytics.prevTotal)}</Text>
              </View>
            </View>

            {analytics.diffPct !== null && (
              <View style={styles.diffBadge}>
                <Text
                  style={[
                    styles.diffText,
                    { color: Number(analytics.diffPct) > 0 ? t.danger : '#10B981' },
                  ]}>
                  {Number(analytics.diffPct) > 0 ? '▲' : '▼'} {Math.abs(Number(analytics.diffPct))}% versus last month
                </Text>
              </View>
            )}
          </View>

          {/* Category Share & Visual Bars */}
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Category Spending Share</Text>
            {analytics.catList.length === 0 ? (
              <Text style={styles.mutedText}>No expenses logged yet this month.</Text>
            ) : (
              analytics.catList.map((item) => {
                const catInfo = CATEGORIES.find((c) => c.id === item.category) ?? {
                  label: item.category,
                  emoji: '📌',
                };
                return (
                  <View key={item.category} style={styles.catRow}>
                    <View style={styles.catMeta}>
                      <Text style={styles.catName}>
                        {catInfo.emoji} {catInfo.label}
                      </Text>
                      <Text style={styles.catAmt}>
                        {money(item.amount)} ({item.pct.toFixed(0)}%)
                      </Text>
                    </View>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${item.pct}%`, backgroundColor: t.primary }]} />
                    </View>
                  </View>
                );
              })
            )}
          </View>

          {/* Subscription & Recurring Merchants */}
          {analytics.recurring.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardHeading}>🔄 Subscriptions & Recurring Charges</Text>
              <Text style={styles.mutedText}>
                We detected frequent transactions from these merchants:
              </Text>
              {analytics.recurring.map((r) => (
                <View key={r.merchant} style={styles.recurringRow}>
                  <Text style={styles.recName}>{r.merchant.toUpperCase()}</Text>
                  <Text style={styles.recMeta}>
                    {r.count} charges · {money(r.total)} total
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* AI Smart Tips Card */}
          <View style={[styles.card, { backgroundColor: t.card }]}>
            <Text style={styles.cardHeading}>💡 AI Smart Recommendation</Text>
            {analytics.topCategory ? (
              <Text style={styles.tipText}>
                Your highest spending category this month is{' '}
                <Text style={{ fontWeight: '800' }}>{analytics.topCategory.category.toUpperCase()}</Text> ({money(analytics.topCategory.amount)}).
                Setting a category limit in the Budget tab can help you save up to 15% next month!
              </Text>
            ) : (
              <Text style={styles.tipText}>
                Start adding or scanning expenses to unlock personalized AI budget recommendations.
              </Text>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
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
    askBtn: {
      backgroundColor: t.primary,
      borderRadius: 14,
      paddingVertical: 13,
      alignItems: 'center',
    },
    askBtnT: { color: '#fff', fontWeight: '800', fontSize: 15 },
    scoreCard: {
      backgroundColor: t.primary,
      borderRadius: 20,
      padding: Spacing.four,
    },
    scoreRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    scoreBadgeText: {
      color: t.onPrimaryMuted,
      fontSize: 13,
      fontWeight: '700',
    },
    scoreNumber: {
      color: t.onPrimary,
      fontSize: 36,
      fontWeight: '900',
      marginTop: 2,
    },
    scoreSub: {
      color: t.onPrimary,
      fontSize: 13,
      marginTop: 4,
      lineHeight: 18,
      opacity: 0.9,
    },
    scoreCircle: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    scoreEmoji: {
      fontSize: 24,
    },
    card: {
      backgroundColor: t.card,
      borderRadius: 18,
      padding: Spacing.four,
      gap: 12,
    },
    cardHeading: {
      color: t.ink,
      fontSize: 17,
      fontWeight: '800',
    },
    momRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    momLabel: {
      color: t.muted,
      fontSize: 12,
    },
    momVal: {
      color: t.ink,
      fontSize: 20,
      fontWeight: '800',
      marginTop: 2,
    },
    diffBadge: {
      alignSelf: 'flex-start',
      backgroundColor: t.border,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginTop: 4,
    },
    diffText: {
      fontSize: 12,
      fontWeight: '700',
    },
    catRow: {
      gap: 6,
    },
    catMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    catName: {
      color: t.ink,
      fontSize: 14,
      fontWeight: '700',
    },
    catAmt: {
      color: t.ink,
      fontSize: 13,
      fontWeight: '600',
    },
    barTrack: {
      height: 8,
      backgroundColor: t.border,
      borderRadius: 4,
      overflow: 'hidden',
    },
    barFill: {
      height: '100%',
      borderRadius: 4,
    },
    recurringRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderBottomColor: t.border,
    },
    recName: {
      color: t.ink,
      fontSize: 13,
      fontWeight: '700',
    },
    recMeta: {
      color: t.muted,
      fontSize: 12,
    },
    mutedText: {
      color: t.muted,
      fontSize: 13,
    },
    tipText: {
      color: t.ink,
      fontSize: 14,
      lineHeight: 20,
    },
  });
