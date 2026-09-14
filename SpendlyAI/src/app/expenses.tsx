import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { BottomTabInset, MaxContentWidth, Spacing, type SpendlyTheme } from '@/constants/theme';
import { useDeleteExpense, useExpenses } from '@/hooks/use-expenses';
import { useSpendlyTheme } from '@/hooks/use-spendly-theme';
import { CATEGORIES } from '@/lib/categories';
import { formatMoney } from '@/lib/currency';
import { useAuthStore } from '@/store/auth-store';

export default function ExpensesScreen() {
  const t = useSpendlyTheme();
  const s = createStyles(t);
  const user = useAuthStore((x) => x.user);
  const { data, isLoading } = useExpenses(user?.id);
  const del = useDeleteExpense();
  const [q, setQ] = useState('');

  const list = (data ?? []).filter((e) =>
    q
      ? `${e.merchant ?? ''} ${e.category} ${e.note ?? ''}`
          .toLowerCase()
          .includes(q.toLowerCase())
      : true
  );

  return (
    <View style={s.root}>
      <SafeAreaView style={s.safe}>
        <Text style={s.title}>Expenses</Text>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search merchant, category…"
          placeholderTextColor={t.muted}
          style={s.search}
        />
        <View style={s.row}>
          <Pressable style={s.cta} onPress={() => router.push('/add' as never)}>
            <Text style={s.ctaT}>+ Add Manual</Text>
          </Pressable>
          <Pressable style={s.ghost} onPress={() => router.push('/scan' as never)}>
            <Text style={s.ghostT}>📸 Scan Receipt</Text>
          </Pressable>
        </View>

        {isLoading ? <Text style={s.muted}>Loading expenses…</Text> : null}
        {!isLoading && list.length === 0 ? (
          <Text style={s.muted}>No expenses found. Tap "+ Add Manual" or "Scan Receipt" to start.</Text>
        ) : null}

        <FlatList
          data={list}
          keyExtractor={(e) => e.id}
          contentContainerStyle={{ paddingBottom: BottomTabInset + Spacing.four }}
          renderItem={({ item }) => {
            const catInfo = CATEGORIES.find((c) => c.id === item.category);
            const emoji = catInfo?.emoji ?? '📌';

            return (
              <Pressable
                style={s.card}
                onPress={() => router.push(`/expense/${item.id}` as never)}>
                <View style={s.iconBg}>
                  <Text style={{ fontSize: 18 }}>{emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.m}>{item.merchant ?? item.category}</Text>
                  <Text style={s.sub}>
                    {item.date} · {catInfo?.label ?? item.category}
                  </Text>
                </View>
                <Text style={s.amt}>{formatMoney(Number(item.amount), item.currency)}</Text>
                <Pressable
                  onPress={(ev) => {
                    ev.stopPropagation();
                    del.mutate(item.id);
                  }}>
                  <Text style={s.del}>✕</Text>
                </Pressable>
              </Pressable>
            );
          }}
        />
      </SafeAreaView>
    </View>
  );
}

const createStyles = (t: SpendlyTheme) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.background, flexDirection: 'row', justifyContent: 'center' },
    safe: { flex: 1, maxWidth: MaxContentWidth, paddingHorizontal: Spacing.four, paddingTop: Spacing.four, gap: Spacing.three },
    title: { color: t.ink, fontSize: 26, fontWeight: '800' },
    search: { backgroundColor: t.card, color: t.ink, borderRadius: 12, padding: 12, fontSize: 15 },
    row: { flexDirection: 'row', gap: 10 },
    cta: { flex: 1, backgroundColor: t.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
    ctaT: { color: '#fff', fontWeight: '800' },
    ghost: { flex: 1, borderWidth: 1, borderColor: t.border, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
    ghostT: { color: t.ink, fontWeight: '700' },
    muted: { color: t.muted, marginTop: 10 },
    card: {
      backgroundColor: t.card,
      borderRadius: 16,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 10,
    },
    iconBg: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: t.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    m: { color: t.ink, fontWeight: '700', fontSize: 15 },
    sub: { color: t.muted, fontSize: 12, marginTop: 2 },
    amt: { color: t.ink, fontWeight: '800', fontSize: 15 },
    del: { color: t.danger, fontSize: 16, paddingLeft: 8, paddingVertical: 4 },
  });
