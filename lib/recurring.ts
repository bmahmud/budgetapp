import type { RecurringFrequency } from '@/types';

export function recurringFrequencyLabel(freq?: RecurringFrequency): string {
  if (freq === 'biweekly') return 'Every 2 weeks';
  if (freq === 'monthly') return 'Monthly';
  return 'Recurring';
}

export function recurringFrequencyHint(
  freq: RecurringFrequency,
  type: 'income' | 'expense',
): string {
  if (freq === 'biweekly' && type === 'income') {
    return 'Repeats every 2 weeks — log each paycheck when it arrives';
  }
  if (freq === 'biweekly') return 'Repeats every 2 weeks';
  return 'Repeats monthly';
}
