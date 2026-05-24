import { FringeIcon, type FringeIconName } from '@/components/fringe/icon';
import { useTheme } from '@/theme/ThemeContext';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Tab = { routeName: string; label: string; icon: FringeIconName };

const TABS: Tab[] = [
  { routeName: 'index', label: 'Home', icon: 'home' },
  { routeName: 'transactions', label: 'Activity', icon: 'list' },
  { routeName: 'reports', label: 'Insights', icon: 'chart' },
  { routeName: 'goals', label: 'Goals', icon: 'target' },
  { routeName: 'settings', label: 'Settings', icon: 'settings' },
];

export function FringeTabBar({ state, navigation }: BottomTabBarProps) {
  const { c, sh } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const activeRoute = state.routes[state.index]?.name ?? 'index';

  function go(routeName: string) {
    const target = state.routes.find((r) => r.name === routeName);
    if (target) navigation.navigate(target.name);
  }

  return (
    <View
      style={{
        backgroundColor: c.bgBase,
        borderTopWidth: 0.5,
        borderTopColor: c.lineStrong,
        paddingTop: 10,
        paddingBottom: Math.max(insets.bottom, 12),
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          paddingHorizontal: 8,
        }}>
        {TABS.slice(0, 2).map((t) => (
          <TabBtn key={t.routeName} {...t} active={activeRoute === t.routeName} onPress={() => go(t.routeName)} />
        ))}

        <Pressable
          onPress={() => router.push('/transactions/add')}
          accessibilityLabel="Add transaction"
          style={({ pressed }) => [
            {
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: c.accent,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: -10,
              ...sh.fab,
            },
            pressed && { transform: [{ scale: 0.92 }] },
          ]}>
          <FringeIcon name="plus" size={22} color={c.accentOn} strokeWidth={2.4} />
        </Pressable>

        {TABS.slice(2).map((t) => (
          <TabBtn key={t.routeName} {...t} active={activeRoute === t.routeName} onPress={() => go(t.routeName)} />
        ))}
      </View>
    </View>
  );
}

function TabBtn({
  icon,
  label,
  active,
  onPress,
}: Tab & { active: boolean; onPress: () => void }) {
  const { c } = useTheme();
  const tint = active ? c.accent : c.ink3;
  return (
    <Pressable onPress={onPress} style={{ alignItems: 'center', gap: 3, paddingVertical: 4, paddingHorizontal: 10 }}>
      <FringeIcon name={icon} size={20} color={tint} fill={active ? c.accentSoft : 'none'} strokeWidth={active ? 2.2 : 1.8} />
      {active ? (
        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: c.accent, marginTop: 1 }} />
      ) : (
        <View style={{ height: 5 }} />
      )}
      <Text style={{ fontSize: 10, fontWeight: active ? '600' : '500', color: tint }}>{label}</Text>
    </Pressable>
  );
}
