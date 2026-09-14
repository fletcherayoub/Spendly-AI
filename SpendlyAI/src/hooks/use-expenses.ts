import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Expense, NewExpense } from '@/types/expense';

export function useExpenses(userId?: string) {
  return useQuery({
    queryKey: ['expenses', userId],
    enabled: !!userId,
    queryFn: async (): Promise<Expense[]> => {
      const { data, error } = await supabase.from('expenses')
        .select('*').eq('user_id', userId!).order('date', { ascending: false }).limit(200);
      if (error) throw error;
      return (data ?? []) as Expense[];
    },
  });
}

export function useAddExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewExpense & { user_id: string }) => {
      const { data, error } = await supabase.from('expenses').insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  });
}

export function useExpense(id?: string) {
  return useQuery({
    queryKey: ['expense', id],
    enabled: !!id,
    queryFn: async (): Promise<Expense> => {
      const { data, error } = await supabase.from('expenses').select('*').eq('id', id!).single();
      if (error) throw error;
      return data as Expense;
    },
  });
}

export function useUpdateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...changes }: Partial<Expense> & { id: string }) => {
      const { data, error } = await supabase.from('expenses').update(changes).eq('id', id).select().single();
      if (error) throw error;
      return data as Expense;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['expense', variables.id] });
    },
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  });
}


