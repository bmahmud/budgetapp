import type { Transaction } from '@/types';
import { endOfMonth, endOfYear, format, startOfMonth, startOfYear, subMonths } from 'date-fns';

export type HomePeriod = 'month' | 'year';

export type MonthlyChartDatum = { label: string; income: number; expense: number };

export function filterTransactionsByPeriod(transactions: Transaction[], period: HomePeriod): Transaction[] {
  const now = new Date();
  const start = period === 'month' ? format(startOfMonth(now), 'yyyy-MM-dd') : format(startOfYear(now), 'yyyy-MM-dd');
  const end = period === 'month' ? format(endOfMonth(now), 'yyyy-MM-dd') : format(endOfYear(now), 'yyyy-MM-dd');
  return transactions.filter((t) => t.date >= start && t.date <= end);
}

export function computeLast30DaySpend(transactions: Transaction[]): number[] {
  const today = new Date();
  const result: number[] = [];
  let acc = 0;

  for (let i = 29; i >= 0; i -= 1) {
    const dt = new Date(today);
    dt.setDate(dt.getDate() - i);
    const iso = format(dt, 'yyyy-MM-dd');
    const daySpend = transactions
      .filter((t) => t.date === iso && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    acc += daySpend;
    result.push(acc);
  }

  return result;
}

/** Last 6 calendar months of income/expense totals from real transactions. */
export function buildLast6MonthsChart(transactions: Transaction[]): MonthlyChartDatum[] {
  const now = new Date();
  return Array.from({ length: 6 }, (_, index) => {
    const monthDate = subMonths(now, 5 - index);
    const start = format(startOfMonth(monthDate), 'yyyy-MM-dd');
    const end = format(endOfMonth(monthDate), 'yyyy-MM-dd');
    const label = format(monthDate, 'MMM');

    const monthTxs = transactions.filter((t) => t.date >= start && t.date <= end);
    const income = monthTxs.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = monthTxs.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    return { label, income, expense };
  });
}
