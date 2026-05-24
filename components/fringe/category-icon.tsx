import { IconSymbol } from '@/components/ui/icon-symbol';
import type { Category } from '@/types';
import React from 'react';
import { View } from 'react-native';

type Props = {
  category: Category;
  size?: number;
};

export function CategoryIcon({ category, size = 42 }: Props) {
  const iconSize = Math.round(size * 0.45);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: `${category.color}22`,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <IconSymbol name={category.icon as never} size={iconSize} color={category.color} />
    </View>
  );
}
