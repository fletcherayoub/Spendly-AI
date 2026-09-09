import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { expenseService } from '@/services/dataService';
import { colors } from '@/theme/colors';

export default function CreateExpenseScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    const numAmount = parseFloat(amount);
    if (!merchant || isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid merchant and positive amount.');
      return;
    }

    setLoading(true);
    try {
      await expenseService.createExpense({
        user_id: user.id,
        merchant: merchant.trim(),
        amount: numAmount,
        notes: notes.trim() || null,
        expense_date: new Date().toISOString().split('T')[0],
      });
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Manual Expense Entry</Text>

        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Merchant / Store Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Starbucks, Uber, Carrefour"
              placeholderTextColor={colors.dark.textMuted}
              value={merchant}
              onChangeText={setMerchant}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={colors.dark.textMuted}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Add extra context..."
              placeholderTextColor={colors.dark.textMuted}
              multiline
              value={notes}
              onChangeText={setNotes}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Save Expense</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.dark.textPrimary,
    marginTop: 10,
  },
  formCard: {
    backgroundColor: colors.dark.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.dark.cardBorder,
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.dark.textPrimary,
  },
  input: {
    backgroundColor: colors.dark.bg,
    borderRadius: 12,
    padding: 16,
    color: colors.dark.textPrimary,
    borderWidth: 1,
    borderColor: colors.dark.cardBorder,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
