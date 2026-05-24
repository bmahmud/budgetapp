import { FringeIcon } from '@/components/fringe/icon';
import { useTheme } from '@/theme/ThemeContext';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

type Props = {
  title: string;
  onAction?: () => void;
  actionText?: string;
};

export function SectionHeader({ title, onAction, actionText = 'View all' }: Props) {
  const { c } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: 12,
      }}>
      <Text style={{ fontSize: 17, fontWeight: '700', color: c.ink1, letterSpacing: -0.2 }}>{title}</Text>
      {onAction ? (
        <Pressable onPress={onAction} hitSlop={10}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: c.accent }}>{actionText}</Text>
            <FringeIcon name="chevR" size={14} color={c.accent} strokeWidth={2.4} />
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}
