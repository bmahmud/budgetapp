/** Minimum days elapsed before linear month-end spend projection is shown. */
export const MIN_DAYS_FOR_PROJECTION = 7;

export function projectMonthEndSpend(
  expenses: number,
  daysIntoMonth: number,
  daysInMonth: number,
): number | null {
  if (expenses <= 0 || daysIntoMonth < MIN_DAYS_FOR_PROJECTION) return null;
  return (expenses / daysIntoMonth) * daysInMonth;
}

export function formatSafeToSpendInsight(params: {
  expenses: number;
  income: number;
  daysIntoMonth: number;
  daysInMonth: number;
  hasBudgetData: boolean;
}): string {
  const { expenses, income, daysIntoMonth, daysInMonth, hasBudgetData } = params;

  if (!hasBudgetData) {
    return 'Add income and expenses to see your monthly net.';
  }

  if (income <= 0) {
    return `You've spent $${expenses.toLocaleString()} this month with no income recorded yet.`;
  }

  const overspent = expenses - income;
  if (overspent > 0) {
    return `You've spent $${expenses.toLocaleString()} so far, which is $${overspent.toLocaleString()} over this month's income.`;
  }

  const remaining = income - expenses;
  const projected = projectMonthEndSpend(expenses, daysIntoMonth, daysInMonth);

  if (projected === null) {
    return `You've spent $${expenses.toLocaleString()} of $${income.toLocaleString()} income this month — $${remaining.toLocaleString()} left.`;
  }

  const dailyAvg = expenses / daysIntoMonth;
  const daily = Math.round(dailyAvg).toLocaleString();
  const projectedRounded = Math.round(projected).toLocaleString();

  if (projected <= income) {
    return `About $${daily}/day so far. On track to spend ~$${projectedRounded} of $${income.toLocaleString()} income.`;
  }

  return `About $${daily}/day so far. At this pace you may spend ~$${projectedRounded} vs $${income.toLocaleString()} income.`;
}
