import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { BottomTabInset, MaxContentWidth, Spacing, type SpendlyTheme } from '@/constants/theme';
import { CurrencyPicker } from '@/components/currency-picker';
import { useAddExpense, useDeleteExpense, useExpenses } from '@/hooks/use-expenses';
import { useSpendlyTheme } from '@/hooks/use-spendly-theme';
import { CATEGORIES, suggestCategory } from '@/lib/categories';
import { formatMoney } from '@/lib/currency';
import { validAmount } from '@/lib/validation';
import { useAuthStore } from '@/store/auth-store';
import { useSettingsStore } from '@/store/settings-store';
import type { ExpenseCategory } from '@/types/expense';

export default function ExpensesScreen() {
  const t = useSpendlyTheme();
  const s = createStyles(t);
  const user = useAuthStore((x) => x.user);
  const { data, isLoading, refetch, isRefetching } = useExpenses(user?.id);
  const del = useDeleteExpense();
  const add = useAddExpense();
  const defaultCurrency = useSettingsStore((x) => x.defaultCurrency);
  const [q, setQ] = useState('');
  // Inline manual-add sheet (no navigation — always works inside the tab)
  const [sheet, setSheet] = useState(false);
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(defaultCurrency);
  const [category, setCategory] = useState<ExpenseCategory>('other');
  const [formErr, setFormErr] = useState<string | null>(null);

  async function saveManual() {
    if (!user) return;
    const amt = validAmount(amount);
    if (amt == null) { setFormErr('Enter a valid amount greater than 0.'); return; }
    setFormErr(null);
    try {
      await add.mutateAsync({
        user_id: user.id, amount: amt, currency,
        category: merchant.trim() && category === 'other' ? suggestCategory(merchant.trim()) : category,
        merchant: merchant.trim() || null, date: new Date().toISOString().slice(0, 10),
        note: null, receipt_url: null, items: null, tax: null, ai_confidence: null,
      });
      setSheet(false);
      setMerchant(''); setAmount(''); setCategory('other'); setCurrency(defaultCurrency);
    } catch (e) {
      setFormErr(e instanceof Error ? e.message : 'Save failed');
    }
  }

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
          <Pressable style={s.cta} onPress={() => { setCurrency(defaultCurrency); setFormErr(null); setSheet(true); }}>
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
          refreshing={isRefetching}
          onRefresh={refetch}
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

        {/* Manual add sheet — in-tab modal, no router needed */}
        <Modal visible={sheet} animationType="slide" transparent onRequestClose={() => setSheet(false)}>
          <View style={s.backdrop}>
            <View style={s.sheet}>
              <Text style={s.sheetTitle}>Add expense</Text>
              <Text style={s.fLabel}>Merchant</Text>
              <TextInput value={merchant} onChangeText={setMerchant} placeholder="e.g. Marjane" placeholderTextColor={t.muted} style={s.search} />
              <Text style={s.fLabel}>Amount</Text>
              <TextInput value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="0.00" placeholderTextColor={t.muted} style={s.search} />
              <Text style={s.fLabel}>Currency</Text>
              <CurrencyPicker value={currency} onChange={setCurrency} />
              <Text style={s.fLabel}>Category</Text>
              <View style={s.chips}>
                {CATEGORIES.map((c) => (
                  <Pressable key={c.id} onPress={() => setCategory(c.id as ExpenseCategory)} style={[s.chip, category === c.id && s.chipOn]}>
                    <Text style={category === c.id ? s.chipOnT : s.chipT}>{c.emoji} {c.label}</Text>
                  </Pressable>
                ))}
              </View>
              {formErr ? <Text style={s.err}>{formErr}</Text> : null}
              {add.error ? <Text style={s.err}>{(add.error as Error).message}</Text> : null}
              <View style={s.row}>
                <Pressable style={s.ghost} onPress={() => setSheet(false)} disabled={add.isPending}>
                  <Text style={s.ghostT}>Cancel</Text>
                </Pressable>
                <Pressable style={[s.cta, add.isPending && { opacity: 0.6 }]} onPress={saveManual} disabled={add.isPending}>
                  <Text style={s.ctaT}>{add.isPending ? 'Saving…' : 'Save'}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
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
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    sheet: { backgroundColor: t.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: Spacing.four, gap: 8, maxHeight: '90%' },
    sheetTitle: { color: t.ink, fontSize: 20, fontWeight: '800' },
    fLabel: { color: t.muted, fontSize: 13, fontWeight: '700', marginTop: 6 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { borderWidth: 1, borderColor: t.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
    chipOn: { backgroundColor: t.primary, borderColor: t.primary },
    chipT: { color: t.ink, fontSize: 13 },
    chipOnT: { color: '#fff', fontSize: 13, fontWeight: '700' },
    err: { color: t.danger, fontSize: 13 },
  });
