import '@/lib/supabase';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

function AuthStack() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const first = segments[0];
    const atEntry = pathname === '/' || pathname === '';

    if (!session) {
      const isPublic = first === '(auth)' || atEntry;
      if (!isPublic) {
        router.replace('/(auth)/login');
      }
      return;
    }

    if (first === '(auth)') {
      router.replace('/(tabs)');
    }
  }, [session, isLoading, segments, pathname, router]);

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
  const colorScheme = useColorScheme();

  const navigationTheme = useMemo(() => {
    const base = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
    const c = Colors[colorScheme ?? 'light'];
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: c.primary,
        background: c.background,
        card: c.card,
        text: c.text,
        border: c.border,
        notification: c.primary,
      },
    };
  }, [colorScheme]);

  return (
    <AuthProvider>
      <ThemeProvider value={navigationTheme}>
        <AuthStack />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
