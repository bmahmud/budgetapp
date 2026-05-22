import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

export const PASSWORD_RECOVERY_PATH = '/(auth)/reset-password';

export function parseAuthParamsFromUrl() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return { hash: new URLSearchParams(), search: new URLSearchParams() };
  }

  const rawHash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash;

  return {
    hash: new URLSearchParams(rawHash),
    search: new URLSearchParams(window.location.search),
  };
}

export function hasPasswordRecoveryTokensInUrl(): boolean {
  const { hash, search } = parseAuthParamsFromUrl();
  const type = hash.get('type') || search.get('type');

  if (type === 'recovery') return true;
  if (hash.get('token_hash')) return true;
  if (hash.get('access_token') && hash.get('refresh_token')) return true;

  return false;
}

export function getPasswordResetRedirectUrl(): string {
  const configured =
    process.env.EXPO_PUBLIC_PASSWORD_RESET_REDIRECT_URL ??
    process.env.EXPO_PUBLIC_WEB_APP_URL;

  if (configured) {
    const base = configured.replace(/\/$/, '');
    return base.includes('reset-password') ? base : `${base}/reset-password`;
  }

  return Linking.createURL('/reset-password');
}
