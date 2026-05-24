import { Card } from '@/components/fringe/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/theme/ThemeContext';
import { SummaryMetrics } from '@/types';
import { Text, View } from 'react-native';

interface SummaryCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
  isPositive?: boolean;
}

function SummaryCard({ title, value, icon, color, isPositive }: SummaryCardProps) {
  const { c } = useTheme();
  const valueColor =
    isPositive !== undefined ? (isPositive ? c.positive : c.negative) : c.ink1;

  return (
    <Card pad={14} radius="lg" style={{ flex: 1, alignItems: 'center' }}>
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: `${color}22`,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
        }}>
        <IconSymbol name={icon as never} size={22} color={color} />
      </View>
      <Text style={{ fontSize: 11, fontWeight: '600', color: c.ink3, marginBottom: 4 }}>{title}</Text>
      <Text style={{ fontSize: 18, fontWeight: '700', color: valueColor }}>
        ${Math.round(Math.abs(value)).toLocaleString()}
      </Text>
    </Card>
  );
}

interface SummaryCardsProps {
  metrics: SummaryMetrics;
}

export function SummaryCards({ metrics }: SummaryCardsProps) {
  const { c } = useTheme();

  return (
    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
      <SummaryCard
        title="Income"
        value={metrics.totalIncome}
        icon="arrow.down.circle.fill"
        color={c.positive}
        isPositive
      />
      <SummaryCard
        title="Expenses"
        value={metrics.totalExpenses}
        icon="arrow.up.circle.fill"
        color={c.negative}
        isPositive={false}
      />
      <SummaryCard
        title="Balance"
        value={metrics.netBalance}
        icon="dollarsign.circle.fill"
        color={metrics.netBalance >= 0 ? c.positive : c.negative}
        isPositive={metrics.netBalance >= 0}
      />
    </View>
  );
}
