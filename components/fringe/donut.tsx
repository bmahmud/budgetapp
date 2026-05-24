import { useTheme } from '@/theme/ThemeContext';
import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

export type DonutSegment = {
  color: string;
  value: number;
  label?: string;
  cat?: string;
};

type Props = {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  center?: React.ReactNode;
  gap?: number;
};

export function Donut({ segments, size = 180, thickness = 22, center, gap = 0.012 }: Props) {
  const { c } = useTheme();
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = size / 2 - thickness / 2;
  const circumference = 2 * Math.PI * r;
  let acc = 0;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G rotation={-90} originX={size / 2} originY={size / 2}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={c.bgSubtle}
            strokeWidth={thickness}
          />
          {segments.map((s, i) => {
            const frac = s.value / total;
            const dash = circumference * (frac - gap);
            const off = -circumference * acc;
            acc += frac;
            return dash > 0 ? (
              <Circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={thickness}
                strokeDasharray={`${dash} ${circumference}`}
                strokeDashoffset={off}
                strokeLinecap="butt"
              />
            ) : null;
          })}
        </G>
      </Svg>
      {center ? (
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
          {center}
        </View>
      ) : null}
    </View>
  );
}
