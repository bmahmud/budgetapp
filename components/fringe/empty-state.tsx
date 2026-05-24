import { FringeIcon } from '@/components/fringe/icon';
import { useTheme } from '@/theme/ThemeContext';
import React from 'react';
import { Text, View } from 'react-native';

type Props = {
  icon?: string;
  title: string;
  body?: string;
  action?: React.ReactNode;
};

export function EmptyState({ icon = 'sparkle', title, body, action }: Props) {
  const { c } = useTheme();
  return (
    <View style={{ alignItems: 'center', padding: 40 }}>
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: c.accentSoft,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 14,
        }}>
        <FringeIcon name={icon} size={24} color={c.accent} strokeWidth={2} />
      </View>
      <Text style={{ fontSize: 16, fontWeight: '700', color: c.ink1, marginBottom: 6 }}>{title}</Text>
      {body ? (
        <Text style={{ fontSize: 13, color: c.ink2, textAlign: 'center', maxWidth: 260, lineHeight: 19 }}>{body}</Text>
      ) : null}
      {action}
    </View>
  );
}
