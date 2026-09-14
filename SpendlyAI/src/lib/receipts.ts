import { decode } from 'base64-arraybuffer';
import { supabase } from '@/lib/supabase';

/** Upload receipt base64 to private receipts/<userId>/<ts>.jpg. Returns storage path. */
export async function uploadReceipt(userId: string, base64: string): Promise<string> {
  const clean = base64.replace(/^data:image\/\w+;base64,/, '');
  const path = `${userId}/${Date.now()}.jpg`;
  const { error } = await supabase.storage.from('receipts').upload(path, decode(clean), {
    contentType: 'image/jpeg',
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return path;
}
