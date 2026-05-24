import { useTheme } from '@/theme/ThemeContext';
import React, { useMemo } from 'react';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

type Props = {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
  strokeW?: number;
};

export function Sparkline({
  data,
  width = 100,
  height = 32,
  color,
  fill = true,
  strokeW = 2,
}: Props) {
  const { c } = useTheme();
  const stroke = color ?? c.accent;
  const id = useMemo(() => 'spark' + Math.random().toString(36).slice(2, 7), []);

  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const xStep = width / (data.length - 1);
  const points = data.map<[number, number]>((v, i) => [
    i * xStep,
    height - ((v - min) / range) * (height - 4) - 2,
  ]);
  const pathD = points.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const fillD = pathD + ` L${width},${height} L0,${height} Z`;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {fill && (
        <>
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={stroke} stopOpacity={0.18} />
              <Stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Path d={fillD} fill={`url(#${id})`} />
        </>
      )}
      <Path
        d={pathD}
        stroke={stroke}
        strokeWidth={strokeW}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
