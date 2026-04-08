import { supabase } from '@/lib/supabase';
import { useBudgetStore } from '@/store/budget-store';
import type { Session } from '@supabase/supabase-js';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hydrateFromRemote = useBudgetStore((s) => s.hydrateFromRemote);
  const resetLocalState = useBudgetStore((s) => s.resetLocalState);

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
    const expiresAtMs = (session.expires_at ?? 0) * 1000;
    const timeoutMs = Math.max(0, Math.min(SESSION_TIMEOUT_MS, expiresAtMs - Date.now()));

    const timeoutId = setTimeout(() => {
      void supabase.auth.signOut();
    }, timeoutMs);

    return () => clearTimeout(timeoutId);
  }, [session?.user?.id, session?.expires_at]);

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
    return { error: error ? new Error(error.message) : null };
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error ? new Error(error.message) : null };
  }, []);

  const signOut = useCallback(async () => {
    resetLocalState();
    await supabase.auth.signOut();
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
