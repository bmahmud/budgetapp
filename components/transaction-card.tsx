import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { IconSymbol } from './ui/icon-symbol';
import { Transaction, Category } from '@/types';
import { format } from 'date-fns';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface TransactionCardProps {
  transaction: Transaction;
  category?: Category;
  onPress?: () => void;
}

export function TransactionCard({ transaction, category, onPress }: TransactionCardProps) {
  const colorScheme = useColorScheme();
  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? '#4CAF50' : '#F44336';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <ThemedView style={styles.card}>
        <View style={styles.leftSection}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: category?.color ? `${category.color}20` : '#E0E0E0' },
            ]}>
            <IconSymbol
              name={category?.icon || 'circle.fill'}
              size={24}
              color={category?.color || Colors[colorScheme ?? 'light'].icon}
            />
          </View>
          <View style={styles.infoContainer}>
            <ThemedText type="defaultSemiBold" style={styles.categoryName}>
              {category?.name || 'Unknown'}
            </ThemedText>
            {transaction.notes && (
              <ThemedText style={styles.notes} numberOfLines={1}>
                {transaction.notes}
              </ThemedText>
            )}
            <ThemedText style={styles.date}>{format(new Date(transaction.date), 'MMM dd, yyyy')}</ThemedText>
          </View>
        </View>
        <View style={styles.rightSection}>
          <ThemedText
            type="defaultSemiBold"
            style={[styles.amount, { color: amountColor }]}>
            {isIncome ? '+' : '-'}${transaction.amount.toFixed(2)}
          </ThemedText>
          {transaction.isRecurring && (
            <IconSymbol name="arrow.clockwise" size={16} color={Colors[colorScheme ?? 'light'].icon} />
          )}
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 16,
    marginVertical: 4,
    borderRadius: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    marginBottom: 4,
  },
  notes: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    opacity: 0.6,
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amount: {
    fontSize: 18,
    fontWeight: '600',
  },
});

