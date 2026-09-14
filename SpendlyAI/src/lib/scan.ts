import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

const log = logger.scope('ScanService');

export interface ScanResult {
  merchant: string | null;
  date: string | null;
  total: number | null;
  currency: string | null;
  tax: number | null;
  items: { name: string; qty?: number; price?: number }[] | null;
  category: string | null;
  confidence: number | null;
  raw?: unknown;
}

/** Calls scan-receipt Edge Function. Cleans image base64 before sending. */
export async function scanReceiptBase64(
  rawBase64: string,
  mimeType = 'image/jpeg'
): Promise<ScanResult> {
  // Strip data URL header if present (e.g. data:image/jpeg;base64,...)
  const cleanBase64 = rawBase64.replace(/^data:image\/\w+;base64,/, '').trim();

  log.info(`Sending image to scan-receipt function (${(cleanBase64.length / 1024).toFixed(1)} KB base64)`);

  let d: Record<string, unknown> = {};

  try {
    const { data, error } = await supabase.functions.invoke('scan-receipt', {
      body: { imageBase64: cleanBase64, mimeType },
    });

    if (error) {
      log.warn('Supabase scan-receipt edge function returned error:', error);
    } else {
      log.info('Received raw response from scan-receipt function:', data);
      d = (data as { data?: Record<string, unknown> })?.data ?? (data as Record<string, unknown>) ?? {};
    }
  } catch (err) {
    log.error('Edge function network call failed:', err);
  }

  const num = (v: unknown): number | null =>
    typeof v === 'number' ? v : v != null && !Number.isNaN(Number(v)) ? Number(v) : null;

  // No fake defaults: throw if AI returned nothing usable.
  const parsedMerchant = (d.merchant as string) ?? (d.vendor as string) ?? null;
  const parsedTotal = num(d.total ?? d.amount);
  const parsedItems = Array.isArray(d.items) ? (d.items as ScanResult['items']) : null;
  const merchant = parsedMerchant;
  const total = parsedTotal;
  if (!merchant && total == null && !parsedItems) {
    throw new Error('AI could not read this receipt. Try a clearer photo.');
  }
  const date = (d.date as string) ?? new Date().toISOString().slice(0, 10);
  const currency = ((d.currency as string) ?? 'EUR').toUpperCase();
  const tax = num(d.tax);
  const items = parsedItems;
  const category = (d.category as string) ?? 'other';
  const confidence = num(d.confidence);

  const result: ScanResult = {
    merchant,
    date,
    total,
    currency,
    tax,
    items,
    category,
    confidence,
  };

  log.info('Parsed final scan result:', result);
  return result;
}
