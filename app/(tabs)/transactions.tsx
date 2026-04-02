import { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { TransactionCard } from '@/components/transaction-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBudgetStore } from '@/store/budget-store';
import { useRouter } from 'expo-router';
import { Transaction } from '@/types';

export default function TransactionsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { transactions, categories, isLoading, isInitialized, initialize } = useBudgetStore();
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  const filteredTransactions = transactions.filter((t) => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  const getCategoryById = (id: string) => categories.find((c) => c.id === id);

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TransactionCard
      transaction={item}
      category={getCategoryById(item.categoryId)}
      onPress={() => router.push(`/transactions/${item.id}`)}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Transactions</ThemedText>
        <TouchableOpacity onPress={() => router.push('/transactions/add')}>
          <IconSymbol name="plus.circle.fill" size={28} color={theme.primary} />
        </TouchableOpacity>
      </ThemedView>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            { borderColor: theme.border },
            filter === 'all' && [styles.filterButtonActive, { backgroundColor: theme.tint, borderColor: theme.tint }],
          ]}
          onPress={() => setFilter('all')}>
          <ThemedText style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            { borderColor: theme.border },
            filter === 'income' && [styles.filterButtonActive, { backgroundColor: theme.tint, borderColor: theme.tint }],
          ]}
          onPress={() => setFilter('income')}>
          <ThemedText style={[styles.filterText, filter === 'income' && styles.filterTextActive]}>Income</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            { borderColor: theme.border },
            filter === 'expense' && [styles.filterButtonActive, { backgroundColor: theme.tint, borderColor: theme.tint }],
          ]}
          onPress={() => setFilter('expense')}>
          <ThemedText style={[styles.filterText, filter === 'expense' && styles.filterTextActive]}>Expense</ThemedText>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ThemedView style={styles.loadingContainer}>
          <ThemedText>Loading...</ThemedText>
        </ThemedView>
      ) : filteredTransactions.length === 0 ? (
        <ThemedView style={styles.emptyState}>
          <IconSymbol name="tray" size={64} color="#999" />
          <ThemedText style={styles.emptyText}>No transactions found</ThemedText>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/transactions/add')}>
            <IconSymbol name="plus.circle.fill" size={20} color="#fff" />
            <ThemedText style={styles.addButtonText}>Add Transaction</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      ) : (
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterButtonActive: {},
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    opacity: 0.7,
    marginTop: 16,
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

