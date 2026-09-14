export type ExpenseCategory =
  | 'groceries' | 'dining' | 'transport' | 'shopping' | 'health'
  | 'entertainment' | 'bills' | 'travel' | 'other';

export interface ReceiptItem { name: string; qty?: number; price?: number; }
export interface Expense {
  id: string; user_id: string; amount: number; currency: string;
  category: ExpenseCategory; merchant: string | null; date: string;
  note: string | null; receipt_url: string | null;
  items: ReceiptItem[] | null; tax: number | null; ai_confidence: number | null;
  created_at: string;
}
export interface Budget { id: string; user_id: string; month: string; category: ExpenseCategory | 'total'; limit: number; currency: string; }
export interface Goal { id: string; user_id: string; title: string; target: number; current: number; currency: string; deadline: string | null; }
export type NewExpense = Omit<Expense, 'id' | 'user_id' | 'created_at'> & { user_id?: string };
