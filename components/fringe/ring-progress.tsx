import { useTheme } from '@/theme/ThemeContext';
import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

type Props = {
  pct: number;
  size?: number;
  thickness?: number;
  color?: string;
  track?: string;
  children?: React.ReactNode;
};

export function RingProgress({ pct, size = 80, thickness = 8, color, track, children }: Props) {
  const { c } = useTheme();
  const stroke = color ?? c.accent;
  const trackColor = track ?? c.bgSubtle;
  const r = size / 2 - thickness / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, pct));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <G rotation={-90} originX={size / 2} originY={size / 2}>
          <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={thickness} />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={stroke}
            strokeWidth={thickness}
            strokeDasharray={`${(clamped / 100) * circumference} ${circumference}`}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {children}
      </View>
    </View>
  );
}
