import { CategoryIcon } from '@/components/fringe/category-icon';
import { FringeIcon } from '@/components/fringe/icon';
import { formatDisplayDate, relativeDay } from '@/lib/date-helpers';
import { useTheme } from '@/theme/ThemeContext';
import type { Category, Transaction } from '@/types';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

type Props = {
  transaction: Transaction;
  category?: Category;
  onPress?: () => void;
  compact?: boolean;
  dateMode?: 'relative' | 'exact' | 'both';
};

export function FringeTransactionRow({
  transaction,
  category,
  onPress,
  compact = false,
  dateMode = 'relative',
}: Props) {
  const { c } = useTheme();
  const isIncome = transaction.type === 'income';
  const label = category?.name ?? 'Unknown';
  const title = transaction.notes?.trim() || label;
  const relativeLabel = relativeDay(transaction.date);
  const exactLabel = formatDisplayDate(transaction.date);
  const dateLabel =
    dateMode === 'exact'
      ? exactLabel
      : dateMode === 'both'
        ? `${relativeLabel} · ${exactLabel}`
        : relativeLabel;

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: compact ? 10 : 12,
        paddingHorizontal: 4,
      }}>
      {category ? (
        <CategoryIcon category={category} size={compact ? 36 : 42} />
      ) : (
        <View style={{ width: compact ? 36 : 42, height: compact ? 36 : 42 }} />
      )}
      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={{
            fontSize: compact ? 14 : 15,
            fontWeight: '600',
            color: c.ink1,
            letterSpacing: -0.1,
          }}>
          {title}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <Text style={{ fontSize: 12, color: c.ink3 }}>{label}</Text>
          <Text style={{ fontSize: 12, color: c.ink3, opacity: 0.5 }}>·</Text>
          <Text style={{ fontSize: 12, color: c.ink3 }}>{dateLabel}</Text>
          {transaction.isRecurring ? (
            <>
              <Text style={{ fontSize: 12, color: c.ink3, opacity: 0.5 }}>·</Text>
              <FringeIcon name="refresh" size={11} color={c.ink3} strokeWidth={2} />
            </>
          ) : null}
        </View>
      </View>
      <Text
        style={{
          fontSize: compact ? 15 : 16,
          fontWeight: '600',
          color: isIncome ? c.positive : c.ink1,
          fontVariant: ['tabular-nums'],
        }}>
        {isIncome ? '+' : '−'}$
        {transaction.amount.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </Text>
    </Pressable>
  );
}
