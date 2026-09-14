import { CURRENCY_CODES } from '@/lib/currency';

export function validAmount(v: string): number | null {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0 || n > 1_000_000) return null;
  return Math.round(n * 100) / 100;
}
export function validCurrency(v: string): boolean {
  return (CURRENCY_CODES as string[]).includes(v.toUpperCase());
}
export function validDate(v: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
}
export function safeParseScan(s: string | undefined): Record<string, unknown> {
  if (!s) return {};
  try {
    const p = JSON.parse(s);
    return typeof p === 'object' && p !== null ? p : {};
  } catch {
    return {};
  }
}
