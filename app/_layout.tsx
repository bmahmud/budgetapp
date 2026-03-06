import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBudgetStore } from '@/store/budget-store';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const initialize = useBudgetStore((state) => state.initialize);
  const isInitialized = useBudgetStore((state) => state.isInitialized);

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="transactions/add" options={{ presentation: 'modal', title: 'Add Transaction' }} />
        <Stack.Screen name="transactions/[id]" options={{ presentation: 'card', title: 'Transaction' }} />
        <Stack.Screen name="goals" options={{ presentation: 'card', title: 'Goals' }} />
        <Stack.Screen name="goals/[id]" options={{ presentation: 'card', title: 'Goal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
