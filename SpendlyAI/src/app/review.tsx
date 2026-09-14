import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaxContentWidth, Spacing, type SpendlyTheme } from '@/constants/theme';
import { useSpendlyTheme } from '@/hooks/use-spendly-theme';
import { useAuthStore } from '@/store/auth-store';
import { useSettingsStore } from '@/store/settings-store';
import { useAddExpense } from '@/hooks/use-expenses';
import { CurrencyPicker } from '@/components/currency-picker';
import { CATEGORIES } from '@/lib/categories';
import { safeParseScan, validAmount, validCurrency, validDate } from '@/lib/validation';
import type { ExpenseCategory } from '@/types/expense';

/** Review-before-save: AI output is editable, saved only on Confirm. */
export default function ReviewScreen() {
  const t = useSpendlyTheme();
  const s = createStyles(t);
  const { scan } = useLocalSearchParams<{ scan?: string }>();
  const parsed = safeParseScan(scan);
  const defaultCurrency = useSettingsStore((x) => x.defaultCurrency);
  const [merchant, setMerchant] = useState((parsed.merchant as string) ?? '');
  const [amount, setAmount] = useState(parsed.total != null ? String(parsed.total) : '');
  const [currency, setCurrency] = useState(((parsed.currency as string) ?? defaultCurrency).toUpperCase());
  const [date, setDate] = useState((parsed.date as string) ?? new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<ExpenseCategory>((parsed.category as ExpenseCategory) ?? 'other');
  const [note, setNote] = useState('');
  const [formErr, setFormErr] = useState<string | null>(null);
  const user = useAuthStore((x) => x.user);
  const add = useAddExpense();

  async function confirm() {
    if (!user) return;
    const amt = validAmount(amount);
    if (amt == null) { setFormErr('Enter a valid amount greater than 0.'); return; }
    if (!validCurrency(currency)) { setFormErr('Please choose a currency from the list.'); return; }
    if (!validDate(date)) { setFormErr('Date must be YYYY-MM-DD.'); return; }
    setFormErr(null);
    await add.mutateAsync({
      user_id: user.id, amount: amt, currency,
      category, merchant: merchant.trim() || null, date, note: note.trim() || null,
      receipt_url: null, items: (parsed.items as never) ?? null,
      tax: (parsed.tax as number) ?? null, ai_confidence: (parsed.confidence as number) ?? null,
    });
    router.replace('/expenses' as never);
  }

  return (
    <View style={s.root}><SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.title}>Review receipt</Text>
        <Text style={s.hint}>AI can be wrong — check and edit before saving.</Text>
        <Field label="Merchant" value={merchant} onChange={setMerchant} />
        <Field label="Amount" value={amount} onChange={setAmount} kb="numeric" />
        <Text style={s.label}>Currency</Text>
        <CurrencyPicker value={currency} onChange={setCurrency} />
        <Field label="Date (YYYY-MM-DD)" value={date} onChange={setDate} />
        <Field label="Note" value={note} onChange={setNote} />
        <Text style={s.label}>Category</Text>
        <View style={s.chips}>
          {CATEGORIES.map((c) => (
            <Pressable key={c.id} onPress={() => setCategory(c.id)} style={[s.chip, category === c.id && s.chipOn]}>
              <Text style={category === c.id ? s.chipOnT : s.chipT}>{c.emoji} {c.label}</Text>
            </Pressable>
          ))}
        </View>
        {formErr ? <Text style={s.err}>{formErr}</Text> : null}
        {add.error ? <Text style={s.err}>{(add.error as Error).message}</Text> : null}
        <Pressable style={s.cta} onPress={confirm} disabled={add.isPending}>
          <Text style={s.ctaText}>{add.isPending ? 'Saving…' : 'Confirm & Save'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView></View>
  );
}
function Field({ label, value, onChange, kb }: { label: string; value: string; onChange: (v: string) => void; kb?: 'numeric' }) {
  const t = useSpendlyTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: t.muted, fontSize: 13, fontWeight: '700' }}>{label}</Text>
      <TextInput value={value} onChangeText={onChange} keyboardType={kb === 'numeric' ? 'numeric' : 'default'}
        style={{ backgroundColor: t.card, color: t.ink, borderRadius: 12, padding: 12, fontSize: 16 }} />
    </View>
  );
}
const createStyles = (t: SpendlyTheme) => StyleSheet.create({
  root: { flex: 1, backgroundColor: t.background, flexDirection: 'row', justifyContent: 'center' },
  safe: { flex: 1, maxWidth: MaxContentWidth },
  scroll: { padding: Spacing.four, gap: Spacing.three },
  title: { color: t.ink, fontSize: 24, fontWeight: '800' },
  hint: { color: t.muted, fontSize: 13 },
  label: { color: t.muted, fontSize: 13, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: t.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  chipOn: { backgroundColor: t.primary, borderColor: t.primary },
  chipT: { color: t.ink, fontSize: 13 },
  chipOnT: { color: '#fff', fontSize: 13, fontWeight: '700' },
  err: { color: t.danger, fontSize: 13 },
  cta: { backgroundColor: t.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  ctaText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
