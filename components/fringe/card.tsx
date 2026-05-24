import { useTheme } from '@/theme/ThemeContext';
import React from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

type Tone = 'elev' | 'subtle' | 'accent' | string;
type Radius = keyof ReturnType<typeof useTheme>['r'] | number;

type Props = {
  children: React.ReactNode;
  tone?: Tone;
  pad?: number;
  radius?: Radius;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
};

export function Card({ children, tone = 'elev', pad = 16, radius = 'lg', style, onPress }: Props) {
  const { c, r, sh } = useTheme();

  const bg =
    tone === 'elev' ? c.bgElev : tone === 'subtle' ? c.bgSubtle : tone === 'accent' ? c.accent : tone;

  const borderRadius = typeof radius === 'number' ? radius : r[radius];

  const base: ViewStyle = {
    backgroundColor: bg,
    borderRadius,
    padding: pad,
    borderWidth: tone === 'elev' || tone === 'accent' ? 0 : 1,
    borderColor: c.line,
    ...(tone === 'elev' ? sh.md : sh.sm),
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [base, pressed && { transform: [{ scale: 0.985 }] }, style]}>
        {children}
      </Pressable>
    );
  }

  return <View style={[base, style]}>{children}</View>;
}
