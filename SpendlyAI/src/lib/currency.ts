export const CURRENCIES = ['EUR', 'USD', 'GBP', 'RON', 'CHF', 'JPY'];
export function formatMoney(amount: number, currency = 'EUR', locale?: string): string {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}
