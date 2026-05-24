import { FringeIcon } from '@/components/fringe/icon';
import { useTheme } from '@/theme/ThemeContext';
import React from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

type Tone = 'subtle' | 'elev' | 'accent' | 'ghost' | string;

type Props = {
  icon: string;
  onPress?: () => void;
  size?: number;
  tone?: Tone;
  color?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function IconButton({
  icon,
  onPress,
  size = 40,
  tone = 'subtle',
  color,
  style,
  accessibilityLabel,
}: Props) {
  const { c } = useTheme();
  const fg = color ?? c.ink1;
  const bg =
    tone === 'subtle'
      ? c.bgSubtle
      : tone === 'elev'
        ? c.bgElev
        : tone === 'accent'
          ? c.accent
          : tone === 'ghost'
            ? 'transparent'
            : tone;

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel ?? icon}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
        },
        pressed && { transform: [{ scale: 0.92 }] },
        style,
      ]}>
      <FringeIcon name={icon} size={size * 0.45} color={fg} strokeWidth={2} />
    </Pressable>
  );
}
