import { HeaderLogo } from '@/components/fringe/header-logo';
import { useTheme } from '@/theme/ThemeContext';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';

type Props = {
  name?: string;
  avatarUri?: string | null;
  initials?: string;
  onProfile?: () => void;
};

export function AppHeader({ name = 'there', avatarUri, initials = 'U', onProfile }: Props) {
  const { c } = useTheme();
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const displayInitials = initials.trim().slice(0, 2).toUpperCase() || 'U';

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        paddingBottom: 16,
      }}>
      <View>
        <Text style={{ fontSize: 13, color: c.ink3, fontWeight: '500' }}>{greet},</Text>
        <Text
          style={{
            fontSize: 24,
            fontWeight: '700',
            color: c.ink1,
            letterSpacing: -0.4,
            marginTop: 2,
          }}>
          {name}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <HeaderLogo />
        <Pressable
          onPress={onProfile}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            overflow: 'hidden',
            backgroundColor: c.accent,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: c.bgElev,
          }}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>{displayInitials}</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
