import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView, 
  TextInput,
  RefreshControl 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { expenseService } from '@/services/dataService';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { colors } from '@/theme/colors';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingState } from '@/components/common/LoadingState';

export default function ExpensesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchExpenses = async () => {
    if (!user) return;
    try {
      const data = await expenseService.getExpenses(user.id);
      setExpenses(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [user]);

  const filteredExpenses = expenses.filter(e => 
    e.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.categories?.name && e.categories.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) return <LoadingState message="Loading your expenses..." />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Expenses</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/expense/create')}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search merchant or category..."
          placeholderTextColor={colors.dark.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {filteredExpenses.length === 0 ? (
        <EmptyState
          title="No expenses found"
          description={searchQuery ? "No results match your search query." : "You haven't added any expenses yet."}
          actionLabel="+ Add Expense"
          onAction={() => router.push('/expense/create')}
        />
      ) : (
        <FlatList
          data={filteredExpenses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchExpenses(); }} tintColor={colors.primary[500]} />}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card}
              onPress={() => router.push(`/expense/${item.id}`)}
            >
              <View style={styles.cardLeft}>
                <View style={styles.iconCircle}>
                  <Text style={styles.icon}>💸</Text>
                </View>
                <View>
                  <Text style={styles.merchant}>{item.merchant}</Text>
                  <Text style={styles.subtext}>
                    {item.categories?.name || 'Uncategorized'} • {formatDate(item.expense_date)}
                  </Text>
                </View>
              </View>
              <Text style={styles.amount}>-{formatCurrency(item.amount, item.currency)}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.dark.textPrimary,
  },
  addButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: colors.dark.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.dark.textPrimary,
    borderWidth: 1,
    borderColor: colors.dark.cardBorder,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  card: {
    backgroundColor: colors.dark.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.dark.cardBorder,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.dark.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
  },
  merchant: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.dark.textPrimary,
  },
  subtext: {
    fontSize: 13,
    color: colors.dark.textMuted,
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.danger,
  },
});
