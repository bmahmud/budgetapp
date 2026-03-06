import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useBudgetStore } from '@/store/budget-store';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const {
    transactions,
    goals,
    categories,
    isInitialized,
    initialize,
    getSummaryMetrics,
    getCategorySummaries,
    getSavingsRate,
    getDaysUntilDeadline,
  } = useBudgetStore();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // Use 'all' to show all-time totals on dashboard
  const metrics = getSummaryMetrics('all');
  const savingsRate = getSavingsRate('all');
  const totalBalance = metrics.netBalance;
  const recentTransactions = transactions.slice(0, 5);
  const allGoals = goals;
  const expenseSummaries = getCategorySummaries('all', 'expense');

  // Calculate last month's metrics for comparison
  const lastMonthMetrics = getSummaryMetrics('month'); // For now, we'll calculate this properly
  const lastMonthStart = new Date();
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
  lastMonthStart.setDate(1);
  const lastMonthEnd = new Date(lastMonthStart.getFullYear(), lastMonthStart.getMonth() + 1, 0);
  
  const lastMonthTransactions = transactions.filter((t) => {
    const tDate = new Date(t.date);
    return tDate >= lastMonthStart && tDate <= lastMonthEnd;
  });
  
  const lastMonthIncome = lastMonthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const lastMonthExpenses = lastMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const lastMonthBalance = lastMonthIncome - lastMonthExpenses;
  const lastMonthSavingsRate = lastMonthIncome > 0 
    ? ((lastMonthIncome - lastMonthExpenses) / lastMonthIncome) * 100 
    : 0;

  // Calculate percentage changes
  const balanceChange = lastMonthBalance !== 0 
    ? ((totalBalance - lastMonthBalance) / Math.abs(lastMonthBalance)) * 100 
    : null;
  const savingsRateChange = lastMonthSavingsRate !== 0 
    ? savingsRate - lastMonthSavingsRate 
    : null;

  // Only show changes if we have data for both periods
  const hasBalanceData = totalBalance !== 0 || lastMonthBalance !== 0;
  const hasSavingsData = savingsRate !== 0 || lastMonthSavingsRate !== 0;

  const getCategoryById = (id: string) => categories.find((c) => c.id === id);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>Personal Budget Tracker</ThemedText>
        </ThemedView>

        {/* Summary Cards Row */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryCardHeader}>
              <IconSymbol name="wallet.pass.fill" size={20} color="#4CAF50" />
            </View>
            <ThemedText style={styles.summaryLabel}>Total Balance</ThemedText>
            <ThemedText type="title" style={styles.summaryValue}>${Math.abs(totalBalance).toLocaleString()}</ThemedText>
            {hasBalanceData && balanceChange !== null && (
              <View style={styles.summaryChange}>
                <IconSymbol 
                  name={balanceChange >= 0 ? "arrow.up" : "arrow.down"} 
                  size={12} 
                  color={balanceChange >= 0 ? "#4CAF50" : "#F44336"} 
                />
                <ThemedText style={[styles.summaryChangeText, { color: balanceChange >= 0 ? "#4CAF50" : "#F44336" }]}>
                  {Math.abs(balanceChange).toFixed(0)}% vs last month
                </ThemedText>
              </View>
            )}
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryCardHeader}>
              <IconSymbol name="chart.line.uptrend.xyaxis" size={20} color="#2196F3" />
            </View>
            <ThemedText style={styles.summaryLabel}>Total Income</ThemedText>
            <ThemedText type="title" style={styles.summaryValue}>${metrics.totalIncome.toLocaleString()}</ThemedText>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryCardHeader}>
              <IconSymbol name="chart.line.downtrend.xyaxis" size={20} color="#F44336" />
            </View>
            <ThemedText style={styles.summaryLabel}>Total Expenses</ThemedText>
            <ThemedText type="title" style={styles.summaryValue}>${metrics.totalExpenses.toLocaleString()}</ThemedText>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryCardHeader}>
              <IconSymbol name="banknote.fill" size={20} color="#FF9800" />
            </View>
            <ThemedText style={styles.summaryLabel}>Savings Rate</ThemedText>
            <ThemedText type="title" style={styles.summaryValue}>{savingsRate.toFixed(1)}%</ThemedText>
            {hasSavingsData && savingsRateChange !== null && (
              <View style={styles.summaryChange}>
                <IconSymbol 
                  name={savingsRateChange >= 0 ? "arrow.up" : "arrow.down"} 
                  size={12} 
                  color={savingsRateChange >= 0 ? "#4CAF50" : "#F44336"} 
                />
                <ThemedText style={[styles.summaryChangeText, { color: savingsRateChange >= 0 ? "#4CAF50" : "#F44336" }]}>
                  {Math.abs(savingsRateChange).toFixed(1)}% vs last month
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* Recent Transactions Section */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Recent Transactions</ThemedText>
            <TouchableOpacity onPress={() => router.push('/transactions')}>
              <ThemedText style={styles.viewAll}>View All →</ThemedText>
            </TouchableOpacity>
          </View>

          {recentTransactions.length === 0 ? (
            <ThemedView style={styles.emptyState}>
              <ThemedText style={styles.emptyText}>No transactions yet</ThemedText>
            </ThemedView>
          ) : (
            recentTransactions.map((transaction) => {
              const category = getCategoryById(transaction.categoryId);
              const isIncome = transaction.type === 'income';
              return (
                <TouchableOpacity
                  key={transaction.id}
                  style={styles.transactionItem}
                  onPress={() => router.push(`/transactions/${transaction.id}`)}>
                  <View style={[styles.transactionIcon, { backgroundColor: `${category?.color || '#999'}20` }]}>
                    <IconSymbol name={category?.icon || 'circle.fill'} size={16} color={category?.color || '#999'} />
                  </View>
                  <View style={styles.transactionInfo}>
                    <ThemedText style={styles.transactionName} numberOfLines={1} ellipsizeMode="tail">
                      {transaction.notes || category?.name || 'Transaction'}
                    </ThemedText>
                    <ThemedText style={styles.transactionMeta} numberOfLines={1} ellipsizeMode="tail">
                      {category?.name || 'Uncategorized'} • {format(new Date(transaction.date), 'MMM dd')}
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.transactionAmount, { color: isIncome ? '#4CAF50' : '#F44336' }]}>
                    {isIncome ? '+' : '-'}${Math.round(transaction.amount).toLocaleString()}
                  </ThemedText>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Smart Tip */}
        <ThemedView style={styles.smartTip}>
          <IconSymbol name="lightbulb.fill" size={20} color="#FFC107" />
          <ThemedText style={styles.smartTipText}>
            {metrics.totalIncome > 0 ? (
              <>You're spending {((metrics.totalExpenses / metrics.totalIncome) * 100).toFixed(0)}% of your income. Financial experts recommend keeping expenses under 70% for healthy savings.</>
            ) : (
              <>Start tracking your income and expenses to get personalized financial insights and tips.</>
            )}
          </ThemedText>
        </ThemedView>

        {/* Financial Goals Section */}
        {allGoals.length > 0 && (
          <View style={styles.goalsSection}>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Financial Goals</ThemedText>
              <TouchableOpacity onPress={() => router.push('/goals')}>
                <ThemedText style={styles.addButton}>Add Goal</ThemedText>
              </TouchableOpacity>
            </View>

            {allGoals.map((goal) => {
              const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
              const daysLeft = goal.deadline ? getDaysUntilDeadline(goal.deadline) : null;
              const isOverdue = daysLeft !== null && daysLeft < 0;

              return (
                <ThemedView key={goal.id} style={styles.goalCard}>
                  <View style={styles.goalHeader}>
                    <ThemedText type="defaultSemiBold" style={styles.goalName}>{goal.name}</ThemedText>
                    <ThemedText style={styles.goalStatus}>
                      {isOverdue ? 'Deadline passed' : daysLeft !== null ? `${daysLeft} days left` : 'No deadline'}
                    </ThemedText>
                  </View>
                  <View style={styles.goalProgress}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
                    </View>
                    <ThemedText style={styles.progressText}>{progress.toFixed(0)}%</ThemedText>
                  </View>
                  <View style={styles.goalAmounts}>
                    <ThemedText style={styles.goalAmount}>
                      ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                    </ThemedText>
                    <ThemedText style={styles.goalRemaining}>
                      ${(goal.targetAmount - goal.currentAmount).toLocaleString()} remaining to reach your goal
                    </ThemedText>
                  </View>
                </ThemedView>
              );
            })}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/transactions/add')}
        activeOpacity={0.8}>
        <IconSymbol name="plus" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333',
  },
  summaryCardHeader: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  summaryChangeText: {
    fontSize: 11,
    color: '#4CAF50',
  },
  transactionsSection: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAll: {
    fontSize: 14,
    color: '#0a7ea4',
    fontWeight: '600',
  },
  addButton: {
    fontSize: 14,
    color: '#0a7ea4',
    fontWeight: '600',
    padding: 4,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333',
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  transactionInfo: {
    flex: 1,
    marginRight: 8,
  },
  transactionName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionMeta: {
    fontSize: 11,
    opacity: 0.7,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '600',
    minWidth: 80,
    textAlign: 'right',
  },
  smartTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333',
  },
  smartTipText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    opacity: 0.8,
  },
  goalsSection: {
    marginTop: 24,
  },
  goalCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalName: {
    fontSize: 16,
    flex: 1,
  },
  goalStatus: {
    fontSize: 12,
    opacity: 0.7,
  },
  goalProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 40,
  },
  goalAmounts: {
    marginTop: 4,
  },
  goalAmount: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  goalRemaining: {
    fontSize: 12,
    opacity: 0.7,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.7,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0a7ea4',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
