import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { expenseService } from '@/services/dataService';
import { ReceiptExtractionResult } from '@/services/aiReceiptProvider';
import { colors } from '@/theme/colors';

export default function ReviewScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { extracted } = useLocalSearchParams<{ extracted: string }>();

  const initialData: ReceiptExtractionResult = extracted ? JSON.parse(extracted) : {
    merchant: '',
    date: new Date().toISOString().split('T')[0],
    subtotal: 0,
    tax: 0,
    total: 0,
    currency: 'USD',
    category: 'Groceries',
    confidence: 0.9,
    items: [],
  };

  const [merchant, setMerchant] = useState(initialData.merchant);
  const [total, setTotal] = useState(initialData.total.toString());
  const [date, setDate] = useState(initialData.date);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    const numericAmount = parseFloat(total);
    if (!merchant || isNaN(numericAmount)) {
      Alert.alert('Error', 'Please verify merchant and total amount.');
      return;
    }

    setLoading(true);
    try {
      await expenseService.createExpense({
        user_id: user.id,
        merchant,
        amount: numericAmount,
        expense_date: date,
        currency: initialData.currency || 'USD',
      });
      Alert.alert('Success', 'Expense saved successfully!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
    } catch (e: any) {
      Alert.alert('Save Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.badgeRow}>
          <Text style={styles.badgeText}>✨ AI Extraction ({Math.round(initialData.confidence * 100)}% Confidence)</Text>
        </View>
        <Text style={styles.title}>Review Extracted Expense</Text>

        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Merchant</Text>
            <TextInput
              style={styles.input}
              value={merchant}
              onChangeText={setMerchant}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Total Amount ($)</Text>
            <TextInput
              style={styles.input}
              value={total}
              onChangeText={setTotal}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
            />
          </View>
        </View>

        {initialData.items.length > 0 && (
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Detected Items</Text>
            {initialData.items.map((item, idx) => (
              <View key={idx} style={styles.itemRow}>
                <Text style={styles.itemName}>{item.name} x{item.quantity}</Text>
                <Text style={styles.itemPrice}>${item.total_price.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveText}>Save Expense</Text>}
        </TouchableOpacity>
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
  badgeRow: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary[500] + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    color: colors.primary[500],
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.dark.textPrimary,
  },
  formCard: {
    backgroundColor: colors.dark.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.dark.cardBorder,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.dark.textPrimary,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    color: colors.dark.textMuted,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.dark.bg,
    borderRadius: 10,
    padding: 14,
    color: colors.dark.textPrimary,
    borderWidth: 1,
    borderColor: colors.dark.cardBorder,
    fontSize: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.cardBorder,
  },
  itemName: {
    color: colors.dark.textPrimary,
    fontSize: 14,
  },
  itemPrice: {
    color: colors.dark.textSecondary,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
