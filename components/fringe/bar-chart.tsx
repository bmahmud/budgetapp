import { useTheme } from '@/theme/ThemeContext';
import React from 'react';
import { Text, View } from 'react-native';

export type BarDatum = { label: string; income: number; expense: number };

type Props = {
  data: BarDatum[];
  height?: number;
  barW?: number;
};

export function BarChart({ data, height = 140, barW = 14 }: Props) {
  const { c } = useTheme();
  const max = Math.max(...data.flatMap((d) => [d.income, d.expense]), 1);

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          height,
          gap: 6,
        }}>
        {data.map((d, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'center',
              gap: 3,
              height: '100%',
            }}>
            <View
              style={{
                width: barW,
                height: `${(d.income / max) * 100}%`,
                minHeight: 2,
                backgroundColor: c.positive,
                borderTopLeftRadius: 4,
                borderTopRightRadius: 4,
              }}
            />
            <View
              style={{
                width: barW,
                height: `${(d.expense / max) * 100}%`,
                minHeight: 2,
                backgroundColor: c.negative,
                borderTopLeftRadius: 4,
                borderTopRightRadius: 4,
              }}
            />
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
        {data.map((d, i) => (
          <Text key={i} style={{ flex: 1, textAlign: 'center', fontSize: 11, color: c.ink3, fontWeight: '500' }}>
            {d.label}
          </Text>
        ))}
      </View>
    </View>
  );
}
