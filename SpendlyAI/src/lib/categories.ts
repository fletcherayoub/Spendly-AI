import type { ExpenseCategory } from '@/types/expense';
export const CATEGORIES: { id: ExpenseCategory; label: string; emoji: string }[] = [
  { id: 'groceries', label: 'Groceries', emoji: '🛒' },
  { id: 'dining', label: 'Dining', emoji: '🍽️' },
  { id: 'transport', label: 'Transport', emoji: '🚕' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { id: 'health', label: 'Health', emoji: '💊' },
  { id: 'entertainment', label: 'Fun', emoji: '🎬' },
  { id: 'bills', label: 'Bills', emoji: '🧾' },
  { id: 'travel', label: 'Travel', emoji: '✈️' },
  { id: 'other', label: 'Other', emoji: '📌' },
];
const RULES: [RegExp, ExpenseCategory][] = [
  [/supermarket|grocery|lidl|aldi|carrefour/i, 'groceries'],
  [/restaurant|cafe|coffee|pizza|burger/i, 'dining'],
  [/uber|taxi|fuel|shell|parking|metro/i, 'transport'],
  [/pharmacy|hospital|clinic/i, 'health'],
  [/netflix|spotify|cinema/i, 'entertainment'],
  [/electric|water|gas|internet|rent/i, 'bills'],
  [/hotel|flight|airline/i, 'travel'],
];
export function suggestCategory(merchant: string, items = ''): ExpenseCategory {
  const hay = `${merchant} ${items}`;
  for (const [re, c] of RULES) if (re.test(hay)) return c;
  return 'other';
}
