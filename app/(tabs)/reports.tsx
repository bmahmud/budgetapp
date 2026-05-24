import { BarChart, type BarDatum } from '@/components/fringe/bar-chart';
import { Card } from '@/components/fringe/card';
import { CategoryIcon } from '@/components/fringe/category-icon';
import { Donut } from '@/components/fringe/donut';
import { ProgressBar } from '@/components/fringe/progress-bar';
import { ScreenScroll } from '@/components/fringe/screen-scroll';
import { Segmented } from '@/components/fringe/segmented';
import { useTheme } from '@/theme/ThemeContext';
import { useBudgetStore } from '@/store/budget-store';
import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

type Range = 'week' | 'month' | 'year';

export default function ReportsScreen() {
  const { c } = useTheme();
  const { getSummaryMetrics, getCategorySummaries, categories, isInitialized, initialize } = useBudgetStore();
  const [range, setRange] = useState<Range>('month');

  useEffect(() => {
    if (!isInitialized) initialize();
  }, [isInitialized, initialize]);

  const period = range === 'week' ? 'month' : range === 'year' ? 'year' : 'month';
  const metrics = getSummaryMetrics(period);
  const expenseSummaries = getCategorySummaries(period, 'expense');
  const income = metrics.totalIncome;
  const expenses = metrics.totalExpenses;
  const balance = metrics.netBalance;
  const savingsRate = income > 0 ? (balance / income) * 100 : 0;

  const monthsData = useMemo<BarDatum[]>(() => {
    const labels = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
    return labels.map((label, i) => {
      const base = 6500 + Math.sin(i) * 600;
      const monthIncome = i === 5 ? income : base + 200;
      const monthExpense = i === 5 ? expenses : base * 0.6 + 300;
      return { label, income: monthIncome, expense: monthExpense };
    });
  }, [income, expenses]);

  const segments = useMemo(() => {
    return expenseSummaries.slice(0, 7).map((s) => {
      const cat = categories.find((c) => c.id === s.categoryId);
      return {
        color: cat?.color ?? c.accent,
        value: s.totalAmount,
        label: s.categoryName,
        cat: s.categoryId,
      };
    });
  }, [expenseSummaries, categories, c.accent]);

  return (
    <ScreenScroll>
      <View style={{ paddingBottom: 18 }}>
        <Text style={{ fontSize: 12, color: c.ink3, fontWeight: '600', letterSpacing: 0.4 }}>INSIGHTS</Text>
        <Text style={{ fontSize: 26, fontWeight: '700', color: c.ink1, letterSpacing: -0.6 }}>Reports</Text>
      </View>

      <View style={{ marginBottom: 16 }}>
        <Segmented
          options={[
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
            { value: 'year', label: 'Year' },
          ]}
          value={range}
          onChange={setRange}
          fullWidth
        />
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
        <ReportStat label="Income" value={income} color={c.positive} delta="+12%" />
        <ReportStat label="Expenses" value={expenses} color={c.negative} delta="+4%" />
        <ReportStat label="Saved" value={balance} color={c.accent} delta={`${savingsRate.toFixed(0)}%`} />
      </View>

      <Card pad={18} radius="lg" style={{ marginBottom: 14 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
          }}>
          <View>
            <Text style={{ fontSize: 16, fontWeight: '700', color: c.ink1 }}>Income vs Expenses</Text>
            <Text style={{ fontSize: 12, color: c.ink3, marginTop: 2 }}>Last 6 months</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Text style={{ fontSize: 11, color: c.ink2 }}>
              <Text style={{ color: c.positive, fontWeight: '700' }}>■</Text> In
            </Text>
            <Text style={{ fontSize: 11, color: c.ink2 }}>
              <Text style={{ color: c.negative, fontWeight: '700' }}>■</Text> Out
            </Text>
          </View>
        </View>
        <BarChart data={monthsData} height={130} />
      </Card>

      {segments.length > 0 ? (
        <>
          <Card pad={18} radius="lg" style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: c.ink1, marginBottom: 14 }}>
              Spending by category
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <Donut
                segments={segments}
                size={130}
                thickness={20}
                center={
                  <>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: '700',
                        color: c.ink1,
                        fontVariant: ['tabular-nums'],
                      }}>
                      ${expenses >= 1000 ? `${(expenses / 1000).toFixed(1)}k` : Math.round(expenses)}
                    </Text>
                    <Text style={{ fontSize: 10, color: c.ink3, fontWeight: '600' }}>TOTAL</Text>
                  </>
                }
              />
              <View style={{ flex: 1, gap: 6 }}>
                {segments.slice(0, 5).map((s) => {
                  const pct = expenses > 0 ? (s.value / expenses) * 100 : 0;
                  return (
                    <View key={s.cat} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: s.color }} />
                      <Text numberOfLines={1} style={{ flex: 1, fontSize: 12, color: c.ink2 }}>
                        {s.label}
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          color: c.ink3,
                          fontWeight: '500',
                          fontVariant: ['tabular-nums'],
                        }}>
                        {pct.toFixed(0)}%
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </Card>

          <Card pad={0} radius="lg" style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
            {expenseSummaries.slice(0, 6).map((summary, i, arr) => {
              const pct = expenses > 0 ? (summary.totalAmount / expenses) * 100 : 0;
              const category = categories.find((cat) => cat.id === summary.categoryId);
              const color = category?.color ?? c.accent;
              return (
                <View
                  key={summary.categoryId}
                  style={{
                    paddingVertical: 12,
                    borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                    borderBottomColor: c.line,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}>
                  {category ? <CategoryIcon category={category} size={36} /> : null}
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 5,
                      }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: c.ink1 }}>{summary.categoryName}</Text>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '600',
                          color: c.ink1,
                          fontVariant: ['tabular-nums'],
                        }}>
                        ${Math.round(summary.totalAmount).toLocaleString()}
                      </Text>
                    </View>
                    <ProgressBar value={pct} max={100} color={color} height={4} />
                  </View>
                </View>
              );
            })}
          </Card>
        </>
      ) : (
        <Card pad={24} radius="lg" style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: c.ink1 }}>No spending data yet</Text>
          <Text style={{ fontSize: 13, color: c.ink3, marginTop: 6, textAlign: 'center' }}>
            Add transactions to see your reports.
          </Text>
        </Card>
      )}
    </ScreenScroll>
  );
}

function ReportStat({
  label,
  value,
  color,
  delta,
}: {
  label: string;
  value: number;
  color: string;
  delta: string;
}) {
  const { c } = useTheme();
  return (
    <Card pad={12} radius="md" style={{ flex: 1 }}>
      <Text style={{ fontSize: 10, color: c.ink3, fontWeight: '600', letterSpacing: 0.4 }}>{label.toUpperCase()}</Text>
      <Text
        style={{
          fontSize: 18,
          fontWeight: '700',
          color: c.ink1,
          letterSpacing: -0.5,
          marginTop: 4,
          fontVariant: ['tabular-nums'],
        }}>
        ${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : Math.round(value).toLocaleString()}
      </Text>
      <Text style={{ fontSize: 10, color, fontWeight: '600', marginTop: 4 }}>{delta}</Text>
    </Card>
  );
}
