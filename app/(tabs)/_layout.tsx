import { Tabs } from 'expo-router';
import React from 'react';

import { FringeTabBar } from '@/components/fringe/tab-bar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <FringeTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="transactions" options={{ title: 'Activity' }} />
      <Tabs.Screen name="reports" options={{ title: 'Insights' }} />
      <Tabs.Screen name="goals" options={{ title: 'Goals' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
