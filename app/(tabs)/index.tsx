import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, FringePalette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBudgetStore } from '@/store/budget-store';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/auth-context';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { session } = useAuth();
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
  const user = session?.user;
  const userName = (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? 'User';
  const initials = userName.trim().charAt(0).toUpperCase() || 'U';
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;

  const cardSurface = [
    styles.summaryCard,
    {
      backgroundColor: theme.card,
      borderColor: theme.border,
      shadowColor: FringePalette.purple,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerTextWrap}>
              <Image source={require('../../assets/images/logo.png')} style={styles.headerLogo} resizeMode="contain" />
              <ThemedText style={[styles.appSubtitle, { color: theme.mutedText }]}>
                Budgeting personal Mobile App
              </ThemedText>
              <ThemedText style={[styles.tagline, { color: theme.mutedText }]}>
                Track. Plan. Save. Effortlessly.
              </ThemedText>
            </View>
            <TouchableOpacity
              style={[styles.avatarButton, { borderColor: theme.border }]}
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/settings')}
              accessibilityRole="button"
              accessibilityLabel="Open profile settings">
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              ) : (
                <ThemedText style={[styles.avatarInitial, { color: theme.tint }]}>{initials}</ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </ThemedView>

        {/* Summary Cards Row */}
        <View style={styles.summaryRow}>
          <View style={cardSurface}>
            <View style={styles.summaryCardHeader}>
              <IconSymbol name="wallet.pass.fill" size={20} color={FringePalette.income} />
            </View>
            <ThemedText style={[styles.summaryLabel, { color: theme.mutedText }]}>Total Balance</ThemedText>
            <ThemedText type="title" style={styles.summaryValue}>${Math.abs(totalBalance).toLocaleString()}</ThemedText>
            {hasBalanceData && balanceChange !== null && (
              <View style={styles.summaryChange}>
                <IconSymbol
                  name={balanceChange >= 0 ? 'arrow.up' : 'arrow.down'}
                  size={12}
                  color={balanceChange >= 0 ? FringePalette.income : FringePalette.expense}
                />
                <ThemedText
                  style={[
                    styles.summaryChangeText,
                    { color: balanceChange >= 0 ? FringePalette.income : FringePalette.expense },
                  ]}>
                  {Math.abs(balanceChange).toFixed(0)}% vs last month
                </ThemedText>
              </View>
            )}
          </View>

          <View style={cardSurface}>
            <View style={styles.summaryCardHeader}>
              <IconSymbol name="chart.line.uptrend.xyaxis" size={20} color={FringePalette.teal} />
            </View>
            <ThemedText style={[styles.summaryLabel, { color: theme.mutedText }]}>Total Income</ThemedText>
            <ThemedText type="title" style={styles.summaryValue}>${metrics.totalIncome.toLocaleString()}</ThemedText>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={cardSurface}>
            <View style={styles.summaryCardHeader}>
              <IconSymbol name="chart.line.downtrend.xyaxis" size={20} color={FringePalette.expense} />
            </View>
            <ThemedText style={[styles.summaryLabel, { color: theme.mutedText }]}>Total Expenses</ThemedText>
            <ThemedText type="title" style={styles.summaryValue}>${metrics.totalExpenses.toLocaleString()}</ThemedText>
          </View>

          <View style={cardSurface}>
            <View style={styles.summaryCardHeader}>
              <IconSymbol name="banknote.fill" size={20} color={FringePalette.purpleLight} />
            </View>
            <ThemedText style={[styles.summaryLabel, { color: theme.mutedText }]}>Savings Rate</ThemedText>
            <ThemedText type="title" style={styles.summaryValue}>{savingsRate.toFixed(1)}%</ThemedText>
            {hasSavingsData && savingsRateChange !== null && (
              <View style={styles.summaryChange}>
                <IconSymbol
                  name={savingsRateChange >= 0 ? 'arrow.up' : 'arrow.down'}
                  size={12}
                  color={savingsRateChange >= 0 ? FringePalette.income : FringePalette.expense}
                />
                <ThemedText
                  style={[
                    styles.summaryChangeText,
                    { color: savingsRateChange >= 0 ? FringePalette.income : FringePalette.expense },
                  ]}>
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
            <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
              <ThemedText style={[styles.viewAll, { color: theme.primary }]}>View All →</ThemedText>
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
                  style={[
                    styles.transactionItem,
                    { backgroundColor: theme.card, borderColor: theme.border },
                  ]}
                  onPress={() => router.push(`/transactions/${transaction.id}`)}>
                  <View style={[styles.transactionIcon, { backgroundColor: `${category?.color || '#999'}20` }]}>
                    <IconSymbol name={category?.icon || 'circle.fill'} size={16} color={category?.color || '#999'} />
                  </View>
                  <View style={styles.transactionInfo}>
                    <ThemedText style={styles.transactionName} numberOfLines={1} ellipsizeMode="tail">
                      {transaction.notes || category?.name || 'Transaction'}
                    </ThemedText>
                    <ThemedText style={[styles.transactionMeta, { color: theme.mutedText }]} numberOfLines={1} ellipsizeMode="tail">
                      {category?.name || 'Uncategorized'} • {format(new Date(transaction.date), 'MMM dd')} •{' '}
                      {isIncome ? '(I)' : '(E)'}
                    </ThemedText>
                  </View>
                  <ThemedText
                    style={[
                      styles.transactionAmount,
                      { color: isIncome ? FringePalette.income : FringePalette.expense },
                    ]}>
                    {isIncome ? '+' : '-'}${Math.round(transaction.amount).toLocaleString()}
                  </ThemedText>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Smart Tip */}
        <View style={styles.smartTip}>
          <IconSymbol name="lightbulb.fill" size={20} color="#FFFFFF" />
          <ThemedText lightColor="#FFFFFF" darkColor="#F8FAFC" style={styles.smartTipText}>
            {metrics.totalIncome > 0 ? (
              <>
                You are spending {((metrics.totalExpenses / metrics.totalIncome) * 100).toFixed(0)}% of your income.
                Financial experts recommend keeping expenses under 70% for healthy savings.
              </>
            ) : (
              <>Start tracking your income and expenses to get personalized financial insights and tips.</>
            )}
          </ThemedText>
        </View>

        {/* Financial Goals Section */}
        {allGoals.length > 0 && (
          <View style={styles.goalsSection}>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Financial Goals</ThemedText>
              <TouchableOpacity onPress={() => router.push('/(tabs)/goals')}>
                <ThemedText style={[styles.addButton, { color: theme.primary }]}>Add Goal</ThemedText>
              </TouchableOpacity>
            </View>

            {allGoals.map((goal) => {
              const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
              const daysLeft = goal.deadline ? getDaysUntilDeadline(goal.deadline) : null;
              const isOverdue = daysLeft !== null && daysLeft < 0;

              return (
                <ThemedView
                  key={goal.id}
                  style={[styles.goalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <View style={styles.goalHeader}>
                    <ThemedText type="defaultSemiBold" style={styles.goalName}>{goal.name}</ThemedText>
                    <ThemedText style={[styles.goalStatus, { color: theme.mutedText }]}>
                      {isOverdue ? 'Deadline passed' : daysLeft !== null ? `${daysLeft} days left` : 'No deadline'}
                    </ThemedText>
                  </View>
                  <View style={styles.goalProgress}>
                    <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${Math.min(progress, 100)}%`, backgroundColor: theme.primary },
                        ]}
                      />
                    </View>
                    <ThemedText style={styles.progressText}>{progress.toFixed(0)}%</ThemedText>
                  </View>
                  <View style={styles.goalAmounts}>
                    <ThemedText style={styles.goalAmount}>
                      ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                    </ThemedText>
                    <ThemedText style={[styles.goalRemaining, { color: theme.mutedText }]}>
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
        style={[styles.fab, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
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
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerLogo: {
    width: 180,
    height: 56,
  },
  appSubtitle: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  tagline: {
    fontSize: 15,
    marginTop: 8,
    fontWeight: '500',
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
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
    fontWeight: '600',
  },
  addButton: {
    fontSize: 14,
    fontWeight: '600',
    padding: 4,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
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
    borderRadius: 14,
    backgroundColor: FringePalette.tipBanner,
  },
  smartTipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    opacity: 0.95,
  },
  goalsSection: {
    marginTop: 24,
  },
  goalCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
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
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
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
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
});
