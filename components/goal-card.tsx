import { Card } from '@/components/fringe/card';
import { RingProgress } from '@/components/fringe/ring-progress';
import { useTheme } from '@/theme/ThemeContext';
import { Goal } from '@/types';
import { differenceInDays, isPast, parseISO } from 'date-fns';
import React from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Text, View } from 'react-native';

const GOAL_COLORS = ['#9FE1CB', '#5546E0', '#6A61C8', '#197B5A', '#F59E0B', '#B0413F', '#3B82F6'];

type Props = {
  goal: Goal;
  onPress?: () => void;
};

export function GoalCard({ goal, onPress }: Props) {
  const { c } = useTheme();
  const pct = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const accentColor = goal.color || GOAL_COLORS[0];

  let daysText = '';
  if (goal.deadline) {
    const deadlineDate = parseISO(goal.deadline);
    if (isPast(deadlineDate) && goal.currentAmount < goal.targetAmount) {
      daysText = 'Past due';
    } else {
      daysText = `${differenceInDays(deadlineDate, new Date())} days left`;
    }
  }

  return (
    <Card onPress={onPress} pad={16} radius="lg">
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        <RingProgress pct={pct} size={56} thickness={5} color={accentColor}>
          <IconSymbol name="target" size={20} color={accentColor} />
        </RingProgress>
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 2,
            }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: c.ink1, flex: 1 }} numberOfLines={1}>
              {goal.name}
            </Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: accentColor, fontVariant: ['tabular-nums'] }}>
              {Math.round(pct)}%
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: c.ink1, fontVariant: ['tabular-nums'] }}>
              ${Math.round(goal.currentAmount).toLocaleString()}
            </Text>
            <Text style={{ fontSize: 13, color: c.ink3, fontVariant: ['tabular-nums'] }}>
              {' '}
              / ${Math.round(goal.targetAmount).toLocaleString()}
            </Text>
          </View>
          {daysText ? <Text style={{ fontSize: 11, color: c.ink3 }}>{daysText}</Text> : null}
        </View>
      </View>
    </Card>
  );
}
