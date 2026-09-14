import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import type { Session, Subscription, User } from '@supabase/supabase-js';
import { create } from 'zustand';

import { queryClient } from '@/lib/query-client';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

const log = logger.scope('Auth');


export type AuthStatus = 'loading' | 'signedIn' | 'signedOut';

export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  status: AuthStatus;
  actionInFlight: boolean;
  error: string | null;
  /** Subscribe to session changes. Returns the unsubscribe function. */
  init: () => () => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const REDIRECT_PATH = 'auth/callback';

function getRedirectTo(): string {
  // spendlyai://auth/callback on native, web origin on web.
  return Platform.OS === 'web'
    ? `${window.location.origin}/auth/callback`
    : Linking.createURL(REDIRECT_PATH);
}

/** Parse OAuth redirect URL: supports PKCE `?code=` and implicit `#access_token&refresh_token`. */
function parseAuthRedirect(url: string): {
  code?: string;
  access_token?: string;
  refresh_token?: string;
  error?: string;
} {
  const fragment = url.includes('#') ? url.slice(url.indexOf('#') + 1) : '';
  const query = url.includes('?')
    ? url.slice(url.indexOf('?') + 1, fragment ? url.indexOf('#') : undefined)
    : '';
  const params = new URLSearchParams(query);
  const hash = new URLSearchParams(fragment);
  const get = (k: string) => params.get(k) ?? hash.get(k) ?? undefined;
  return {
    code: get('code'),
    access_token: get('access_token'),
    refresh_token: get('refresh_token'),
    error: get('error') ?? get('error_description'),
  };
}

/** Fallback row creation in case the DB trigger hasn't fired yet (RLS allows own insert). */
async function ensureProfile(user: User): Promise<void> {
  const meta = (user.user_metadata ?? {}) as Record<string, string | undefined>;
  await supabase.from('profiles').upsert(
    {
      id: user.id,
      email: user.email ?? null,
      display_name: meta.full_name ?? meta.name ?? null,
      avatar_url: meta.avatar_url ?? meta.picture ?? null,
    },
    { onConflict: 'id', ignoreDuplicates: true },
  );
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  session: null,
  user: null,
  status: 'loading',
  actionInFlight: false,
  error: null,

  init: () => {
    let subscription: Subscription | null = null;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        const session = data.session;
        set({
          session,
          user: session?.user ?? null,
          status: session ? 'signedIn' : 'signedOut',
        });
        if (session?.user) void ensureProfile(session.user);
      })
      .catch((e: unknown) => {
        log.error('Init failed', e);
        set({ status: 'signedOut', error: e instanceof Error ? e.message : 'Init failed' });
      });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      log.info(`Auth state changed: ${_event}`);
      set({
        session,
        user: session?.user ?? null,
        status: session ? 'signedIn' : 'signedOut',
      });
      if (session?.user) void ensureProfile(session.user);
    });
    subscription = data.subscription;

    return () => {
      subscription?.unsubscribe();
    };
  },

  signInWithGoogle: async () => {
    if (get().actionInFlight) return;
    set({ actionInFlight: true, error: null });
    try {
      WebBrowser.maybeCompleteAuthSession();
      const redirectTo = getRedirectTo();

      if (Platform.OS === 'web') {
        // Full-page redirect; detectSessionInUrl picks the session up on return.
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo },
        });
        if (error) throw error;
        return;
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error) throw error;
      if (!data.url) throw new Error('No OAuth URL returned');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type === 'dismiss' || result.type === 'cancel') return;
      if (result.type !== 'success') throw new Error('Google sign-in was not completed');

      const parsed = parseAuthRedirect(result.url);
      if (parsed.error) throw new Error(parsed.error);

      if (parsed.code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(parsed.code);
        if (exchangeError) throw exchangeError;
      } else if (parsed.access_token && parsed.refresh_token) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: parsed.access_token,
          refresh_token: parsed.refresh_token,
        });
        if (sessionError) throw sessionError;
      } else {
        throw new Error('No session returned from Google');
      }
    } catch (e: unknown) {
      log.error('Google sign-in error', e);
      set({ error: e instanceof Error ? e.message : 'Google sign-in failed' });
    } finally {
      set({ actionInFlight: false });
    }
  },

  signOut: async () => {
    set({ actionInFlight: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      queryClient.removeQueries({ queryKey: ['profile'] });
    } catch (e: unknown) {
      log.error('Sign-out error', e);
      set({ error: e instanceof Error ? e.message : 'Sign-out failed' });
    } finally {
      set({ actionInFlight: false });
    }
  },

  clearError: () => set({ error: null }),
}));

