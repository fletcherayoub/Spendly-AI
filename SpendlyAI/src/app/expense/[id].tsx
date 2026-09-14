import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { MaxContentWidth, Spacing, type SpendlyTheme } from '@/constants/theme';
import { useDeleteExpense, useExpense, useUpdateExpense } from '@/hooks/use-expenses';
import { useSpendlyTheme } from '@/hooks/use-spendly-theme';
import { CATEGORIES } from '@/lib/categories';
import { formatMoney } from '@/lib/currency';
import type { ExpenseCategory } from '@/types/expense';

export default function ExpenseDetailScreen() {
  const t = useSpendlyTheme();
  const styles = createStyles(t);
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: expense, isLoading, error } = useExpense(id);
  const updateMutation = useUpdateExpense();
  const deleteMutation = useDeleteExpense();

  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('other');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (expense) {
      setMerchant(expense.merchant ?? '');
      setAmount(expense.amount ? String(expense.amount) : '');
      setCategory(expense.category);
      setDate(expense.date ?? '');
      setNote(expense.note ?? '');
    }
  }, [expense]);

  async function handleSave() {
    if (!id || !amount) return;
    await updateMutation.mutateAsync({
      id,
      merchant: merchant || null,
      amount: Number(amount) || 0,
      category,
      date,
      note: note || null,
    });
    router.back();
  }

  async function handleDelete() {
    if (!id) return;
    await deleteMutation.mutateAsync(id);
    router.back();
  }

  if (isLoading) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={t.primary} />
        </SafeAreaView>
      </View>
    );
  }

  if (error || !expense) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.safe}>
          <Text style={styles.title}>Expense Not Found</Text>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>← Back to list</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.backBtnText}>← Back</Text>
            </Pressable>
            <Text style={styles.title}>Expense Details</Text>
          </View>

          {/* AI Scan Meta Badge if scanned */}
          {expense.ai_confidence !== null && (
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>
                ✨ AI Scanned Receipt ({(Number(expense.ai_confidence) * 100).toFixed(0)}% confidence)
              </Text>
            </View>
          )}

          {/* Edit Form */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Merchant / Business Name</Text>
            <TextInput
              value={merchant}
              onChangeText={setMerchant}
              style={styles.input}
              placeholder="e.g. Supermarket"
              placeholderTextColor={t.muted}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Amount ({expense.currency})</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={t.muted}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
            <TextInput
              value={date}
              onChangeText={setDate}
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={t.muted}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.chips}>
              {CATEGORIES.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => setCategory(c.id)}
                  style={[styles.chip, category === c.id && styles.chipOn]}>
                  <Text style={category === c.id ? styles.chipOnT : styles.chipT}>
                    {c.emoji} {c.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Note / Description</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              multiline
              style={[styles.input, { height: 80 }]}
              placeholder="Add optional notes..."
              placeholderTextColor={t.muted}
            />
          </View>

          {/* Scanned Line Items breakdown */}
          {expense.items && expense.items.length > 0 && (
            <View style={styles.itemsCard}>
              <Text style={styles.itemsTitle}>Parsed Receipt Items</Text>
              {expense.items.map((item, idx) => (
                <View key={idx} style={styles.itemRow}>
                  <Text style={styles.itemName}>
                    {item.qty ? `${item.qty}x ` : ''}
                    {item.name}
                  </Text>
                  {item.price != null && (
                    <Text style={styles.itemPrice}>{formatMoney(Number(item.price), expense.currency)}</Text>
                  )}
                </View>
              ))}
              {expense.tax != null && (
                <View style={[styles.itemRow, { borderTopWidth: 1, borderTopColor: t.border, paddingTop: 6 }]}>
                  <Text style={styles.taxLabel}>Calculated Tax</Text>
                  <Text style={styles.taxVal}>{formatMoney(Number(expense.tax), expense.currency)}</Text>
                </View>
              )}
            </View>
          )}

          {/* Save & Delete CTAs */}
          <View style={styles.actionRow}>
            <Pressable
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={updateMutation.isPending}>
              <Text style={styles.saveBtnText}>
                {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.deleteBtn}
              onPress={handleDelete}
              disabled={deleteMutation.isPending}>
              <Text style={styles.deleteBtnText}>
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (t: SpendlyTheme) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.background, flexDirection: 'row', justifyContent: 'center' },
    safe: { flex: 1, maxWidth: MaxContentWidth },
    scroll: { padding: Spacing.four, gap: Spacing.three },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
    backBtnText: { color: t.primary, fontWeight: '700', fontSize: 16 },
    title: { color: t.ink, fontSize: 24, fontWeight: '800' },
    aiBadge: {
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      borderWidth: 1,
      borderColor: t.primary,
      borderRadius: 12,
      padding: 10,
    },
    aiBadgeText: { color: t.primary, fontWeight: '700', fontSize: 13 },
    fieldGroup: { gap: 6 },
    label: { color: t.muted, fontSize: 13, fontWeight: '700' },
    input: {
      backgroundColor: t.card,
      color: t.ink,
      borderRadius: 12,
      padding: 12,
      fontSize: 16,
    },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      borderWidth: 1,
      borderColor: t.border,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    chipOn: { backgroundColor: t.primary, borderColor: t.primary },
    chipT: { color: t.ink, fontSize: 13 },
    chipOnT: { color: '#fff', fontSize: 13, fontWeight: '700' },
    itemsCard: {
      backgroundColor: t.card,
      borderRadius: 14,
      padding: 14,
      gap: 8,
      marginTop: 6,
    },
    itemsTitle: { color: t.ink, fontWeight: '800', fontSize: 15 },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    itemName: { color: t.ink, fontSize: 14 },
    itemPrice: { color: t.ink, fontWeight: '700', fontSize: 14 },
    taxLabel: { color: t.muted, fontSize: 13, fontWeight: '700' },
    taxVal: { color: t.ink, fontWeight: '700', fontSize: 13 },
    actionRow: { gap: 10, marginTop: 16 },
    saveBtn: {
      backgroundColor: t.primary,
      borderRadius: 14,
      paddingVertical: 15,
      alignItems: 'center',
    },
    saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
    deleteBtn: {
      borderWidth: 1,
      borderColor: t.dangerBorder,
      borderRadius: 14,
      paddingVertical: 13,
      alignItems: 'center',
    },
    deleteBtnText: { color: t.danger, fontWeight: '800', fontSize: 15 },
    backBtn: {
      marginTop: 20,
      backgroundColor: t.primary,
      borderRadius: 12,
      padding: 14,
      alignItems: 'center',
    },
  });
