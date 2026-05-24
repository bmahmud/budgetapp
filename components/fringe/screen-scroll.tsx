import { useTheme } from '@/theme/ThemeContext';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = { children: React.ReactNode };

export function ScreenScroll({ children }: Props) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: c.bgBase }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: insets.top + 8,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}>
        {children}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}
