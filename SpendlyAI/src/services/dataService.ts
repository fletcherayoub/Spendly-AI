import { supabase } from '../lib/supabase';

export interface Category {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
  is_default?: boolean;
}

export interface Expense {
  id?: string;
  user_id: string;
  merchant: string;
  amount: number;
  currency?: string;
  category_id?: string | null;
  expense_date?: string;
  notes?: string | null;
  receipt_id?: string | null;
  payment_method?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  categories?: Category;
}

export interface Budget {
  id?: string;
  user_id: string;
  category_id?: string | null;
  amount: number;
  currency?: string;
  period?: string;
  start_date?: string | null;
  end_date?: string | null;
  categories?: Category;
}

export interface SavingsGoal {
  id?: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount?: number;
  currency?: string;
  target_date?: string | null;
  icon?: string | null;
}

export const expenseService = {
  async getExpenses(userId: string) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*, categories(*)')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('expense_date', { ascending: false });

    if (error) throw error;
    return data as any[];
  },

  async createExpense(expense: Expense) {
    const { data, error } = await (supabase.from('expenses') as any)
      .insert([expense])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateExpense(id: string, expense: Partial<Expense>) {
    const { data, error } = await (supabase.from('expenses') as any)
      .update(expense)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteExpense(id: string) {
    const { error } = await (supabase.from('expenses') as any)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }
};

export const categoryService = {
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  }
};

export const budgetService = {
  async getBudgets(userId: string) {
    const { data, error } = await supabase
      .from('budgets')
      .select('*, categories(*)')
      .eq('user_id', userId);

    if (error) throw error;
    return data as any[];
  },

  async createBudget(budget: Budget) {
    const { data, error } = await (supabase.from('budgets') as any)
      .insert([budget])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

export const goalService = {
  async getGoals(userId: string) {
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data as any[];
  },

  async createGoal(goal: SavingsGoal) {
    const { data, error } = await (supabase.from('savings_goals') as any)
      .insert([goal])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
