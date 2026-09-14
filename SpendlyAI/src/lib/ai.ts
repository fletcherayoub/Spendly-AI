import { supabase } from '@/lib/supabase';
import type { Expense } from '@/types/expense';

export interface SpendSummary {
  month: string; curTotal: number; prevTotal: number;
  topCategory: { category: string; amount: number } | null;
  categories: { category: string; amount: number }[];
  count: number;
}

export function buildSummary(expenses: Expense[], month: string, prevMonth: string): SpendSummary {
  const cur = expenses.filter((e) => e.date.startsWith(month));
  const prev = expenses.filter((e) => e.date.startsWith(prevMonth));
  const map: Record<string, number> = {};
  cur.forEach((e) => { map[e.category] = (map[e.category] ?? 0) + Number(e.amount); });
  const categories = Object.entries(map).map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);
  return {
    month,
    curTotal: cur.reduce((s, e) => s + Number(e.amount), 0),
    prevTotal: prev.reduce((s, e) => s + Number(e.amount), 0),
    topCategory: categories[0] ?? null,
    categories,
    count: cur.length,
  };
}

export async function askAI(question: string, summary: SpendSummary): Promise<string> {
  const { data, error } = await supabase.functions.invoke('ask-ai', { body: { question, summary } });
  if (error) throw new Error(error.message);
  const answer = (data as { answer?: string })?.answer;
  if (!answer) throw new Error('AI returned nothing');
  return answer;
}

export async function aiInsight(summary: SpendSummary, budgets: unknown[] = []): Promise<string> {
  const { data, error } = await supabase.functions.invoke('monthly-insights', {
    body: { ...summary, budgets },
  });
  if (error) throw new Error(error.message);
  return ((data as { insight?: string })?.insight ?? 'Add more expenses to unlock insights.') as string;
}

export async function aiCategorize(merchant: string, items: unknown[] = [], amount: number | null = null): Promise<{ category: string; confidence: number }> {
  const { data, error } = await supabase.functions.invoke('categorize', { body: { merchant, items, amount } });
  if (error) throw new Error(error.message);
  const d = (data as { data?: { category: string; confidence: number } })?.data;
  return { category: d?.category ?? 'other', confidence: d?.confidence ?? 0.5 };
}

/** Local duplicate guard: same merchant + amount within ±2 days. */
export function findDuplicate(merchant: string, amount: number, date: string, expenses: Expense[]): Expense | null {
  const m = merchant.trim().toLowerCase();
  if (!m) return null;
  const d = new Date(date).getTime();
  return expenses.find((e) => {
    if ((e.merchant ?? '').trim().toLowerCase() !== m) return false;
    if (Math.abs(Number(e.amount) - amount) > 0.01) return false;
    return Math.abs(new Date(e.date).getTime() - d) <= 2 * 86400000;
  }) ?? null;
}
