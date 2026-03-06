import { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { SummaryCards } from '@/components/summary-card';
import { DonutChart } from '@/components/donut-chart';
import { useBudgetStore } from '@/store/budget-store';
import { CategorySummary } from '@/types';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from 'date-fns';

// Conditionally import VictoryPie - it may not work on web
let VictoryPie: any = null;
if (Platform.OS !== 'web') {
  try {
    const victoryNative = require('victory-native');
    VictoryPie = victoryNative.VictoryPie;
  } catch (e) {
    console.warn('VictoryPie not available:', e);
  }
}

type Period = 'month' | 'year' | 'all';

export default function ReportsScreen() {
  const { getSummaryMetrics, getCategorySummaries, isInitialized, initialize } = useBudgetStore();
  const [period, setPeriod] = useState<Period>('month');

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  const metrics = getSummaryMetrics(period);
  const expenseSummaries = getCategorySummaries(period, 'expense');
  const incomeSummaries = getCategorySummaries(period, 'income');

  const totalExpenses = expenseSummaries.reduce((sum, cat) => sum + cat.totalAmount, 0);
  
  // Map categories to specific colors as shown in the image
  const categoryColorMap: Record<string, string> = {
    'Shopping': '#E91E63', // Pink
    'Bills & Utilities': '#2196F3', // Blue
    'Transportation': '#9C27B0', // Purple
    'Food & Dining': '#FFC107', // Yellow
    'Entertainment': '#F44336', // Red
  };
  
  // Default colors for other categories
  const defaultColors = ['#FF9800', '#607D8B', '#00BCD4', '#673AB7', '#4CAF50', '#9E9E9E', '#795548'];
  
  // Prepare pie chart data - show ALL expenses, not just top 5
  const filteredExpenses = expenseSummaries.filter((cat) => cat.totalAmount > 0);
  
  // Prepare data for VictoryPie
  const pieData = filteredExpenses.map((cat) => ({
    x: cat.categoryName,
    y: cat.totalAmount,
  }));
  
  // Prepare data for custom DonutChart
  const donutChartData = filteredExpenses.map((cat, index) => ({
    name: cat.categoryName,
    value: cat.totalAmount,
    color: categoryColorMap[cat.categoryName] || defaultColors[index % defaultColors.length],
  }));
  
  // Color scale matching the image - map colors based on category names
  const colorScale = filteredExpenses.map((cat, index) => {
    return categoryColorMap[cat.categoryName] || defaultColors[index % defaultColors.length];
  });
  
  // Pie chart data for Income vs Expenses
  const incomeExpensePieData = [
    { x: 'Income', y: metrics.totalIncome, label: `Income\n$${Math.round(metrics.totalIncome).toLocaleString()}` },
    { x: 'Expenses', y: metrics.totalExpenses, label: `Expenses\n$${Math.round(metrics.totalExpenses).toLocaleString()}` },
  ].filter((item) => item.y > 0); // Only show items with values > 0


  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Reports & Analytics</ThemedText>
      </ThemedView>

      <View style={styles.periodSelector}>
        <TouchableOpacity
          style={[styles.periodButton, period === 'month' && styles.periodButtonActive]}
          onPress={() => setPeriod('month')}>
          <ThemedText style={[styles.periodText, period === 'month' && styles.periodTextActive]}>Month</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, period === 'year' && styles.periodButtonActive]}
          onPress={() => setPeriod('year')}>
          <ThemedText style={[styles.periodText, period === 'year' && styles.periodTextActive]}>Year</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, period === 'all' && styles.periodButtonActive]}
          onPress={() => setPeriod('all')}>
          <ThemedText style={[styles.periodText, period === 'all' && styles.periodTextActive]}>All Time</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <SummaryCards metrics={metrics} />

        {expenseSummaries.length > 0 && (
          <ThemedView style={styles.chartSection}>
            <ThemedText type="subtitle" style={styles.chartTitle}>
              Spending by Category
            </ThemedText>
            <View style={styles.chartContainer}>
              {donutChartData.length > 0 ? (
                <DonutChart
                  data={donutChartData}
                  total={totalExpenses}
                  size={300}
                  innerRadius={80}
                />
              ) : (
                <View style={styles.chartFallback}>
                  <View style={styles.chartFallbackCircle}>
                    <ThemedText 
                      style={styles.chartTotal}
                      adjustsFontSizeToFit
                      numberOfLines={1}
                      minimumFontScale={0.5}>
                      ${Math.round(totalExpenses).toLocaleString()}
                    </ThemedText>
                  </View>
                </View>
              )}
            </View>
            
            {/* Legend matching the image - show ALL categories with expenses */}
            <View style={styles.categoryLegend}>
              {expenseSummaries
                .filter((cat) => cat.totalAmount > 0)
                .map((cat, index) => {
                  const color = categoryColorMap[cat.categoryName] || defaultColors[index % defaultColors.length];
                  return (
                    <View key={cat.categoryId} style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: color }]} />
                      <ThemedText style={styles.legendText}>{cat.categoryName}</ThemedText>
                    </View>
                  );
                })}
            </View>
          </ThemedView>
        )}

        <ThemedView style={styles.chartSection}>
          <ThemedText type="subtitle" style={styles.chartTitle}>
            Income vs Expenses
          </ThemedText>
          <View style={styles.chartContainer}>
            {VictoryPie && incomeExpensePieData.length > 0 ? (
              <View style={styles.chartWrapper}>
                <VictoryPie
                  data={incomeExpensePieData}
                  width={300}
                  height={300}
                  colorScale={['#4CAF50', '#F44336']}
                  innerRadius={80}
                  labelRadius={({ innerRadius }) => (innerRadius as number) + 30}
                  style={{
                    labels: { fontSize: 12, fill: '#fff', fontWeight: 'bold' },
                  }}
                />
                <View style={styles.chartCenter}>
                  <ThemedText 
                    style={styles.chartTotal}
                    adjustsFontSizeToFit
                    numberOfLines={1}
                    minimumFontScale={0.5}>
                    ${Math.round(metrics.totalIncome - metrics.totalExpenses).toLocaleString()}
                  </ThemedText>
                  <ThemedText style={styles.chartSubtitle}>Net Balance</ThemedText>
                </View>
              </View>
            ) : (
              <View style={styles.chartFallback}>
                <ThemedText style={styles.chartFallbackTitle}>Income vs Expenses</ThemedText>
                {metrics.totalIncome > 0 && (
                  <View style={styles.fallbackItem}>
                    <View style={[styles.fallbackColorBar, { backgroundColor: '#4CAF50' }]} />
                    <ThemedText style={styles.fallbackLabel}>Income</ThemedText>
                    <ThemedText style={styles.fallbackValue}>${metrics.totalIncome.toLocaleString()}</ThemedText>
                  </View>
                )}
                {metrics.totalExpenses > 0 && (
                  <View style={styles.fallbackItem}>
                    <View style={[styles.fallbackColorBar, { backgroundColor: '#F44336' }]} />
                    <ThemedText style={styles.fallbackLabel}>Expenses</ThemedText>
                    <ThemedText style={styles.fallbackValue}>${metrics.totalExpenses.toLocaleString()}</ThemedText>
                  </View>
                )}
                {metrics.totalIncome > 0 || metrics.totalExpenses > 0 ? (
                  <View style={[styles.fallbackItem, { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#E0E0E0' }]}>
                    <ThemedText style={styles.fallbackLabel}>Net Balance</ThemedText>
                    <ThemedText style={[styles.fallbackValue, { color: metrics.netBalance >= 0 ? '#4CAF50' : '#F44336' }]}>
                      ${metrics.netBalance.toLocaleString()}
                    </ThemedText>
                  </View>
                ) : (
                  <ThemedText style={styles.emptyText}>No data available</ThemedText>
                )}
              </View>
            )}
          </View>
        </ThemedView>

        {expenseSummaries.length > 0 && (
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Top Categories
            </ThemedText>
            {expenseSummaries.slice(0, 5).map((summary) => (
              <ThemedView key={summary.categoryId} style={styles.categoryRow}>
                <ThemedText style={styles.categoryName}>{summary.categoryName}</ThemedText>
                <View style={styles.categoryAmountContainer}>
                  <ThemedText style={styles.categoryAmount}>${Math.round(summary.totalAmount).toLocaleString()}</ThemedText>
                  <ThemedText style={styles.categoryCount}>({summary.transactionCount})</ThemedText>
                </View>
              </ThemedView>
            ))}
          </ThemedView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#0a7ea4',
    borderColor: '#0a7ea4',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
  },
  periodTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  chartSection: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
  },
  chartTitle: {
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  chartWrapper: {
    position: 'relative',
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 110,
    left: 100,
    width: 100,
  },
  chartTotal: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    maxWidth: 120,
  },
  categoryLegend: {
    marginTop: 16,
    gap: 12,
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    opacity: 0.9,
  },
  chartWrapper: {
    position: 'relative',
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 120,
    left: 100,
    width: 100,
  },
  chartTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  chartSubtitle: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  categoryName: {
    fontSize: 16,
    flex: 1,
  },
  categoryAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryCount: {
    fontSize: 12,
    opacity: 0.6,
  },
  chartFallback: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  chartFallbackCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#1E1E1E',
    borderWidth: 2,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartFallbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  fallbackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  fallbackColorBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  fallbackLabel: {
    flex: 1,
    fontSize: 14,
  },
  fallbackValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 16,
  },
});

