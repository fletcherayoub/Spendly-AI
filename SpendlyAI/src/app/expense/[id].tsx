import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { expenseService } from '@/services/dataService';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { colors } from '@/theme/colors';
import { LoadingState } from '@/components/common/LoadingState';

export default function ExpenseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [expense, setExpense] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, query by ID. Here we load list and find
    if (id) {
      expenseService.getExpenses('').then(() => {
        // mock view
        setLoading(false);
      });
    }
  }, [id]);

  const handleDelete = () => {
    Alert.alert('Delete Expense', 'Are you sure you want to delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (id) await expenseService.deleteExpense(id);
          router.back();
        },
      },
    ]);
  };

  if (loading) return <LoadingState message="Fetching expense details..." />;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.merchantTitle}>Starbucks Coffee</Text>
          <Text style={styles.amountText}>-$8.40</Text>
          <Text style={styles.dateText}>Recorded on {formatDate(new Date().toISOString())}</Text>
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteText}>Delete Expense</Text>
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
    gap: 20,
  },
  header: {
    marginTop: 10,
  },
  backText: {
    color: colors.primary[500],
    fontSize: 16,
    fontWeight: '700',
  },
  detailCard: {
    backgroundColor: colors.dark.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.dark.cardBorder,
  },
  merchantTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.dark.textPrimary,
    marginBottom: 8,
  },
  amountText: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.danger,
    marginBottom: 12,
  },
  dateText: {
    fontSize: 14,
    color: colors.dark.textMuted,
  },
  deleteButton: {
    backgroundColor: '#3F1D1D',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7F1D1D',
  },
  deleteText: {
    color: '#FCA5A5',
    fontWeight: '700',
    fontSize: 16,
  },
});
