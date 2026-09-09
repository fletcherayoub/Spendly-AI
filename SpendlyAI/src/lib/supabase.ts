import 'react-native-url-polyfill/auto';

import { Platform } from 'react-native';
import { createMMKV, type MMKV } from 'react-native-mmkv';
import { createClient, type SupportedStorage } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
  );
}

// Session persistence: MMKV on native (fast, synchronous), localStorage on web.
function createAuthStorage(): SupportedStorage {
  if (Platform.OS === 'web') {
    return {
      getItem: (key: string) =>
        typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null,
      setItem: (key: string, value: string) => {
        if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
      },
      removeItem: (key: string) => {
        if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
      },
    };
  }
  const mmkv: MMKV = createMMKV({ id: 'spendly-auth' });
  return {
    getItem: (key: string) => mmkv.getString(key) ?? null,
    setItem: (key: string, value: string) => {
      mmkv.set(key, value);
    },
    removeItem: (key: string) => {
      mmkv.remove(key);
    },
  };
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: createAuthStorage(),
    autoRefreshToken: true,
    persistSession: true,
    // Native handles the redirect manually via WebBrowser; web lets Supabase do it.
    detectSessionInUrl: Platform.OS === 'web',
  },
});
