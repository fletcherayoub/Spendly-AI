export const CURRENCIES = [
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'GBP', label: 'British Pound', symbol: '£' },
  { code: 'MAD', label: 'Moroccan Dirham', symbol: 'DH' },
  { code: 'RON', label: 'Romanian Leu', symbol: 'lei' },
  { code: 'CHF', label: 'Swiss Franc', symbol: 'CHF' },
  { code: 'JPY', label: 'Japanese Yen', symbol: '¥' },
  { code: 'AED', label: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SAR', label: 'Saudi Riyal', symbol: '﷼' },
  { code: 'CAD', label: 'Canadian Dollar', symbol: '$' },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]['code'];
export const CURRENCY_CODES = CURRENCIES.map((c) => c.code);

/** Static reference rates to EUR (approx, for display aggregation only). */
const TO_EUR: Record<string, number> = {
  EUR: 1, USD: 0.92, GBP: 1.17, MAD: 0.092, RON: 0.2, CHF: 1.05,
  JPY: 0.0061, AED: 0.25, SAR: 0.245, CAD: 0.67,
};

export function convertTo(amount: number, from: string, to: string): number {
  const f = TO_EUR[from.toUpperCase()] ?? 1;
  const t = TO_EUR[to.toUpperCase()] ?? 1;
  if (!t) return amount;
  return (amount * f) / t;
}

export function formatMoney(amount: number, currency = 'EUR', locale?: string): string {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}
