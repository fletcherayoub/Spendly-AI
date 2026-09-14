import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Budget, ExpenseCategory } from '@/types/expense';

export function useBudgets(userId?: string, month?: string) {
  const currentMonth = month ?? new Date().toISOString().slice(0, 7);

  return useQuery({
    queryKey: ['budgets', userId, currentMonth],
    enabled: !!userId,
    queryFn: async (): Promise<Budget[]> => {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId!)
        .eq('month', currentMonth);

      if (error) throw error;
      return (data ?? []) as Budget[];
    },
  });
}

export function useSetBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      user_id: string;
      month: string;
      category: ExpenseCategory | 'total';
      limit: number;
      currency?: string;
    }) => {
      const { data, error } = await supabase
        .from('budgets')
        .upsert(
          {
            user_id: input.user_id,
            month: input.month,
            category: input.category,
            limit: input.limit,
            currency: input.currency ?? 'EUR',
          },
          { onConflict: 'user_id,month,category' }
        )
        .select()
        .single();

      if (error) throw error;
      return data as Budget;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('budgets').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  });
}
