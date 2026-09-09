import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { goalService } from '@/services/dataService';
import { formatCurrency } from '@/utils/formatters';
import { colors } from '@/theme/colors';
import { LoadingState } from '@/components/common/LoadingState';

export default function GoalsScreen() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');

  const loadGoals = async () => {
    if (!user) return;
    try {
      const data = await goalService.getGoals(user.id);
      setGoals(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, [user]);

  const handleCreate = async () => {
    if (!user) return;
    const target = parseFloat(targetAmount);
    if (!name || isNaN(target) || target <= 0) {
      Alert.alert('Validation Error', 'Please enter a goal title and target amount.');
      return;
    }

    try {
      await goalService.createGoal({
        user_id: user.id,
        name: name.trim(),
        target_amount: target,
        current_amount: 0,
      });
      setName('');
      setTargetAmount('');
      loadGoals();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  if (loading) return <LoadingState message="Loading savings goals..." />;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Savings Goals</Text>

        {/* Create Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>New Goal Target</Text>
          <TextInput
            style={styles.input}
            placeholder="Goal Title (e.g. New Car, Vacation)"
            placeholderTextColor={colors.dark.textMuted}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Target Amount ($)"
            placeholderTextColor={colors.dark.textMuted}
            keyboardType="numeric"
            value={targetAmount}
            onChangeText={setTargetAmount}
          />
          <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
            <Text style={styles.createButtonText}>Add Goal</Text>
          </TouchableOpacity>
        </View>

        {/* Goals List */}
        {goals.map((goal) => {
          const progress = Math.min(Math.round((Number(goal.current_amount) / Number(goal.target_amount)) * 100), 100);
          return (
            <View key={goal.id} style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalName}>{goal.name}</Text>
                <Text style={styles.goalTarget}>{formatCurrency(goal.target_amount)}</Text>
              </View>
              <View style={styles.progressRow}>
                <Text style={styles.savedText}>Saved: {formatCurrency(goal.current_amount)}</Text>
                <Text style={styles.percentText}>{progress}%</Text>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${progress}%` }]} />
              </View>
            </View>
          );
        })}
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
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.dark.textPrimary,
    marginTop: 10,
  },
  card: {
    backgroundColor: colors.dark.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.dark.cardBorder,
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.dark.textPrimary,
  },
  input: {
    backgroundColor: colors.dark.bg,
    borderRadius: 10,
    padding: 14,
    color: colors.dark.textPrimary,
    borderWidth: 1,
    borderColor: colors.dark.cardBorder,
  },
  createButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  goalCard: {
    backgroundColor: colors.dark.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.dark.cardBorder,
    gap: 10,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.dark.textPrimary,
  },
  goalTarget: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary[500],
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  savedText: {
    color: colors.dark.textSecondary,
    fontSize: 14,
  },
  percentText: {
    color: colors.dark.textPrimary,
    fontWeight: '700',
  },
  track: {
    height: 10,
    backgroundColor: colors.dark.bg,
    borderRadius: 5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary[500],
  },
});
