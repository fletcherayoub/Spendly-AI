import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaxContentWidth, Spacing, type SpendlyTheme } from '@/constants/theme';
import { useSpendlyTheme } from '@/hooks/use-spendly-theme';
import { useAuthStore } from '@/store/auth-store';
import { useAddExpense } from '@/hooks/use-expenses';
import { CATEGORIES, suggestCategory } from '@/lib/categories';
import type { ExpenseCategory } from '@/types/expense';

export default function AddScreen() {
  const t = useSpendlyTheme();
  const s = createStyles(t);
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('other');
  const user = useAuthStore((x) => x.user);
  const add = useAddExpense();

  async function save() {
    if (!user) return;
    await add.mutateAsync({
      user_id: user.id, amount: Number(amount) || 0, currency: 'EUR',
      category: merchant && category === 'other' ? suggestCategory(merchant) : category,
      merchant: merchant || null, date: new Date().toISOString().slice(0, 10),
      note: null, receipt_url: null, items: null, tax: null, ai_confidence: null,
    });
    router.replace('/expenses' as never);
  }
  return (
    <View style={s.root}><SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.title}>Add expense</Text>
        <Text style={s.label}>Merchant</Text>
        <TextInput value={merchant} onChangeText={setMerchant} style={s.input} placeholder="e.g. Lidl" />
        <Text style={s.label}>Amount (EUR)</Text>
        <TextInput value={amount} onChangeText={setAmount} keyboardType="numeric" style={s.input} placeholder="0.00" />
        <Text style={s.label}>Category (auto-suggested)</Text>
        <View style={s.chips}>{CATEGORIES.map((c) => (
          <Pressable key={c.id} onPress={() => setCategory(c.id)} style={[s.chip, category === c.id && s.on]}>
            <Text style={category === c.id ? s.onT : s.chipT}>{c.emoji} {c.label}</Text>
          </Pressable>))}</View>
        {add.error ? <Text style={s.err}>{(add.error as Error).message}</Text> : null}
        <Pressable style={s.cta} onPress={save} disabled={add.isPending || !amount}>
          <Text style={s.ctaT}>{add.isPending ? 'Saving…' : 'Save expense'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView></View>
  );
}
const createStyles = (t: SpendlyTheme) => StyleSheet.create({
  root: { flex: 1, backgroundColor: t.background, flexDirection: 'row', justifyContent: 'center' },
  safe: { flex: 1, maxWidth: MaxContentWidth },
  scroll: { padding: Spacing.four, gap: 10 },
  title: { color: t.ink, fontSize: 24, fontWeight: '800' },
  label: { color: t.muted, fontSize: 13, fontWeight: '700', marginTop: 6 },
  input: { backgroundColor: t.card, color: t.ink, borderRadius: 12, padding: 12, fontSize: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: t.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  on: { backgroundColor: t.primary, borderColor: t.primary },
  chipT: { color: t.ink, fontSize: 13 },
  onT: { color: '#fff', fontSize: 13, fontWeight: '700' },
  err: { color: t.danger },
  cta: { backgroundColor: t.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 12 },
  ctaT: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
