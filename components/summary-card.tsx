import { StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { IconSymbol } from './ui/icon-symbol';
import { SummaryMetrics } from '@/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface SummaryCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
  isPositive?: boolean;
}

function SummaryCard({ title, value, icon, color, isPositive }: SummaryCardProps) {
  const colorScheme = useColorScheme();
  const valueColor = isPositive !== undefined ? (isPositive ? '#4CAF50' : '#F44336') : Colors[colorScheme ?? 'light'].text;

  return (
    <ThemedView style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        <IconSymbol name={icon} size={24} color={color} />
      </View>
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText type="title" style={[styles.value, { color: valueColor }]}>
        ${Math.round(Math.abs(value)).toLocaleString()}
      </ThemedText>
    </ThemedView>
  );
}

interface SummaryCardsProps {
  metrics: SummaryMetrics;
}

export function SummaryCards({ metrics }: SummaryCardsProps) {
  return (
    <View style={styles.container}>
      <SummaryCard title="Income" value={metrics.totalIncome} icon="arrow.down.circle.fill" color="#4CAF50" isPositive />
      <SummaryCard title="Expenses" value={metrics.totalExpenses} icon="arrow.up.circle.fill" color="#F44336" isPositive={false} />
      <SummaryCard
        title="Balance"
        value={metrics.netBalance}
        icon="dollarsign.circle.fill"
        color={metrics.netBalance >= 0 ? '#4CAF50' : '#F44336'}
        isPositive={metrics.netBalance >= 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
  },
});

