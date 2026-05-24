import '@/lib/supabase';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import { useEffect, useMemo } from 'react';
import 'react-native-reanimated';

import { FringeThemeProvider, useTheme } from '@/theme/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import {
  hasPasswordRecoveryTokensInUrl,
  PASSWORD_RECOVERY_PATH,
} from '@/lib/password-recovery';

function AuthStack() {
  const { session, isLoading, isRecoveringPassword } = useAuth();
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    function handleDeepLink(url: string) {
      if (!url.includes('reset-password') && !url.includes('type=recovery')) return;
      router.replace(PASSWORD_RECOVERY_PATH);
    }

    void Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => subscription.remove();
  }, [router]);

  useEffect(() => {
    if (isLoading) return;

    const first = segments[0];
    const atEntry = pathname === '/' || pathname === '';
    const onRecoveryRoute =
      pathname.includes('reset-password') || pathname.includes('forgot-password');
    const pendingRecoveryFromUrl = hasPasswordRecoveryTokensInUrl();
    const inPasswordRecovery =
      isRecoveringPassword || pendingRecoveryFromUrl || onRecoveryRoute;

    if (pendingRecoveryFromUrl && !pathname.includes('reset-password')) {
      router.replace(PASSWORD_RECOVERY_PATH);
      return;
    }

    if (!session) {
      const isPublic = first === '(auth)' || atEntry;
      if (!isPublic) {
        router.replace('/(auth)/login');
      }
      return;
    }

    if (inPasswordRecovery && !pathname.includes('reset-password')) {
      router.replace(PASSWORD_RECOVERY_PATH);
      return;
    }

    if (first === '(auth)' && !inPasswordRecovery) {
      router.replace('/(tabs)');
    }
  }, [session, isLoading, isRecoveringPassword, segments, pathname, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="transactions/add" options={{ presentation: 'modal', title: 'Add Transaction' }} />
      <Stack.Screen name="transactions/[id]" options={{ presentation: 'card', title: 'Transaction' }} />
      <Stack.Screen name="goals" options={{ presentation: 'card', title: 'Goals' }} />
      <Stack.Screen name="goals/[id]" options={{ presentation: 'card', title: 'Goal' }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <FringeThemeProvider>
      <RootLayoutNav />
    </FringeThemeProvider>
  );
}

function RootLayoutNav() {
  const { c, name } = useTheme();

  const navigationTheme = useMemo(() => {
    const base = name === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: c.accent,
        background: c.bgBase,
        card: c.bgElev,
        text: c.ink1,
        border: c.line,
        notification: c.accent,
      },
    };
  }, [name, c]);

  return (
    <AuthProvider>
      <ThemeProvider value={navigationTheme}>
        <AuthStack />
        <StatusBar style={name === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </AuthProvider>
  );
}
