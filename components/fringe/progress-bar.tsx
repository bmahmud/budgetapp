import { useTheme } from '@/theme/ThemeContext';
import React from 'react';
import { Text, View } from 'react-native';

type Props = {
  value: number;
  max?: number;
  color?: string;
  bg?: string;
  height?: number;
  label?: string;
  valueLabel?: string;
};

export function ProgressBar({ value, max = 100, color, bg, height = 6, label, valueLabel }: Props) {
  const { c } = useTheme();
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0);
  const fill = color ?? c.accent;
  const track = bg ?? c.bgSubtle;

  return (
    <View>
      {(label || valueLabel) && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          {label ? <Text style={{ fontSize: 12, color: c.ink2 }}>{label}</Text> : null}
          {valueLabel ? (
            <Text style={{ fontSize: 12, color: c.ink1, fontWeight: '600' }}>{valueLabel}</Text>
          ) : null}
        </View>
      )}
      <View style={{ backgroundColor: track, height, borderRadius: height, overflow: 'hidden' }}>
        <View style={{ width: `${pct}%`, height: '100%', backgroundColor: fill, borderRadius: height }} />
      </View>
    </View>
  );
}
