import type { Transaction } from '@/types';
import { endOfMonth, endOfYear, format, startOfMonth, startOfYear } from 'date-fns';

export type HomePeriod = 'month' | 'year';

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
