import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const supabaseUrl =
  (Constants.expoConfig?.extra?.supabaseUrl as string | undefined) ??
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  '';
const supabaseAnonKey =
  (Constants.expoConfig?.extra?.supabaseAnonKey as string | undefined) ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

interface AuthStorageLike {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

const memoryStorage = new Map<string, string>();

const webStorage: AuthStorageLike = {
  getItem: async (key: string) => {
    if (typeof window === 'undefined') return memoryStorage.get(key) ?? null;

    return window.localStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (typeof window === 'undefined') {
      memoryStorage.set(key, value);
      return;
    }

    window.localStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    if (typeof window === 'undefined') {
      memoryStorage.delete(key);
      return;
    }

    window.localStorage.removeItem(key);
  },
};

function getAuthStorage(): AuthStorageLike {
  if (Platform.OS === 'web') return webStorage;

  // Avoid importing AsyncStorage during web static export on Vercel.
  const asyncStorageModule = require('@react-native-async-storage/async-storage');
  return asyncStorageModule.default as AuthStorageLike;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: getAuthStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
