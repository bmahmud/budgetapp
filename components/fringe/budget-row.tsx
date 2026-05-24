import { CategoryIcon } from '@/components/fringe/category-icon';
import { ProgressBar } from '@/components/fringe/progress-bar';
import { useTheme } from '@/theme/ThemeContext';
import type { Category } from '@/types';
import React from 'react';
import { Text, View } from 'react-native';

type Props = {
  category: Category;
  spent: number;
  budget: number;
};

export function BudgetRow({ category, spent, budget }: Props) {
  const { c } = useTheme();
  const over = spent > budget;
  const color = category.color;

  return (
    <View style={{ paddingVertical: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <CategoryIcon category={category} size={32} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: c.ink1 }}>{category.name}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: over ? c.negative : c.ink1,
              fontVariant: ['tabular-nums'],
            }}>
            ${Math.round(spent).toLocaleString()}
          </Text>
          <Text style={{ fontSize: 13, color: c.ink3, fontVariant: ['tabular-nums'] }}>
            {' '}
            / ${Math.round(budget).toLocaleString()}
          </Text>
        </View>
      </View>
      <ProgressBar value={spent} max={budget} color={over ? c.negative : color} height={5} />
    </View>
  );
}
