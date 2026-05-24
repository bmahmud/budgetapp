import { useTheme } from '@/theme/ThemeContext';
import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

type Props = {
  size?: number;
  withWordmark?: boolean;
  tagline?: boolean;
};

export function Logo({ size = 36, withWordmark = true, tagline = false }: Props) {
  const { c, name } = useTheme();
  const dark = name === 'dark';

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Defs>
          <LinearGradient id="fringeGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#5546E0" />
            <Stop offset="100%" stopColor="#3F2FC9" />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={64} height={64} rx={16} fill="url(#fringeGrad)" />
        <Path d="M18 14 H46 V21 H26 V30 H42 V37 H26 V44 H18 Z" fill="#FFFFFF" />
        <Rect x={18} y={48} width={3} height={8} rx={1.5} fill="#7CDDB5" />
        <Rect x={24} y={48} width={3} height={11} rx={1.5} fill="#7CDDB5" />
        <Rect x={30} y={48} width={3} height={6} rx={1.5} fill="#7CDDB5" />
        <Rect x={36} y={48} width={3} height={13} rx={1.5} fill="#7CDDB5" />
        <Rect x={42} y={48} width={3} height={9} rx={1.5} fill="#7CDDB5" />
      </Svg>
      {withWordmark ? (
        <View>
          <Text
            style={{
              fontWeight: '700',
              fontSize: size * 0.6,
              letterSpacing: -0.5,
              color: dark ? '#F3F2F8' : '#0E122E',
            }}>
            fringe
          </Text>
          {tagline ? (
            <Text
              style={{
                fontSize: 9,
                letterSpacing: 1.6,
                color: c.accent,
                marginTop: 4,
                fontWeight: '600',
              }}>
              TRACK · PLAN · SAVE
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
