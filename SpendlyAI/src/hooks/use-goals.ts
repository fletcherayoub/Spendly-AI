import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Goal } from '@/types/expense';

export function useGoals(userId?: string) {
  return useQuery({
    queryKey: ['goals', userId],
    enabled: !!userId,
    queryFn: async (): Promise<Goal[]> => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as Goal[];
    },
  });
}

export function useAddGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      user_id: string;
      title: string;
      target: number;
      current?: number;
      currency?: string;
      deadline?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('goals')
        .insert({
          user_id: input.user_id,
          title: input.title,
          target: input.target,
          current: input.current ?? 0,
          currency: input.currency ?? 'EUR',
          deadline: input.deadline ?? null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Goal;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  });
}

export function useUpdateGoalAmount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; current: number }) => {
      const { data, error } = await supabase
        .from('goals')
        .update({ current: input.current })
        .eq('id', input.id)
        .select()
        .single();

      if (error) throw error;
      return data as Goal;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('goals').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  });
}
