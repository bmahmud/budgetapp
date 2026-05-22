import { clearProfilePreferences } from '@/lib/profile-preferences';
import { supabase } from '@/lib/supabase';
import { useBudgetStore } from '@/store/budget-store';
import type { Session } from '@supabase/supabase-js';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import * as Linking from 'expo-linking';

interface AuthContextValue {
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  requestPasswordReset: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const SESSION_TIMEOUT_MS = 60 * 60 * 1000;
const SESSION_IDLE_MS = 15 * 60 * 1000;

async function signOutAndClearLocal(resetLocalState: () => void) {
  resetLocalState();
  await clearProfilePreferences();
  await supabase.auth.signOut();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hydrateFromRemote = useBudgetStore((s) => s.hydrateFromRemote);
  const resetLocalState = useBudgetStore((s) => s.resetLocalState);
  const lastActivityAtRef = useRef(Date.now());

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (mounted) {
        setSession(s);
        setIsLoading(false);
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!session?.user) {
      resetLocalState();
      return;
    }
    void hydrateFromRemote();
  }, [session?.user?.id, isLoading, hydrateFromRemote, resetLocalState]);

  useEffect(() => {
    if (!session) return;
    const lastSignInAt = session.user.last_sign_in_at ?? session.user.created_at;
    const sessionStartMs = Date.parse(lastSignInAt);
    const elapsedMs = Number.isNaN(sessionStartMs) ? 0 : Date.now() - sessionStartMs;
    const timeoutMs = Math.max(0, SESSION_TIMEOUT_MS - elapsedMs);

    const timeoutId = setTimeout(() => {
      void signOutAndClearLocal(resetLocalState);
    }, timeoutMs);

    return () => clearTimeout(timeoutId);
  }, [session?.user?.id, session?.user?.last_sign_in_at, session?.user?.created_at, resetLocalState]);

  useEffect(() => {
    if (!session) return;

    const touchActivity = () => {
      lastActivityAtRef.current = Date.now();
    };

    touchActivity();
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        touchActivity();
        return;
      }
      if (nextState === 'background' || nextState === 'inactive') {
        const idleMs = Date.now() - lastActivityAtRef.current;
        if (idleMs >= SESSION_IDLE_MS) {
          void signOutAndClearLocal(resetLocalState);
        }
      }
    });

    const idleCheckId = setInterval(() => {
      const idleMs = Date.now() - lastActivityAtRef.current;
      if (idleMs >= SESSION_IDLE_MS) {
        void signOutAndClearLocal(resetLocalState);
      }
    }, 60_000);

    return () => {
      subscription.remove();
      clearInterval(idleCheckId);
    };
  }, [session?.user?.id, resetLocalState]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return { error: error ? new Error(error.message) : null };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email: email.trim(), password });
    return { error: error ? new Error(error.message) : null };
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    const redirectTo = Linking.createURL('/reset-password');
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    return {
      error: error ? new Error('Unable to send reset email right now. Please try again later.') : null,
    };
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error ? new Error(error.message) : null };
  }, []);

  const signOut = useCallback(async () => {
    await signOutAndClearLocal(resetLocalState);
  }, [resetLocalState]);

  const value = useMemo(
    () => ({ session, isLoading, signIn, signUp, requestPasswordReset, updatePassword, signOut }),
    [session, isLoading, signIn, signUp, requestPasswordReset, updatePassword, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
