import { ICONS } from '@/lib/fringe-icons';
import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export type FringeIconName = keyof typeof ICONS | 'target';

type Props = {
  name: FringeIconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  fill?: string;
};

export function FringeIcon({
  name,
  size = 20,
  color = '#000',
  strokeWidth = 1.75,
  fill = 'none',
}: Props) {
  if (name === 'target') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={strokeWidth} fill="none" />
        <Circle cx={12} cy={12} r={5} stroke={color} strokeWidth={strokeWidth} fill="none" />
        <Circle cx={12} cy={12} r={1.2} fill={color} />
      </Svg>
    );
  }

  const d = ICONS[name as keyof typeof ICONS];
  if (!d) return null;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d={d}
        stroke={color}
        strokeWidth={strokeWidth}
        fill={fill}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
