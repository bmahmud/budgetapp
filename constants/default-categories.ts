/**
 * Seed templates for new Supabase users (no ids — assigned on insert).
 */
export interface DefaultCategoryTemplate {
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
}

export const DEFAULT_CATEGORY_TEMPLATES: DefaultCategoryTemplate[] = [
  { name: 'Salary', icon: 'briefcase.fill', color: '#4CAF50', isDefault: true },
  { name: 'Mortgage/Rent', icon: 'house.fill', color: '#2196F3', isDefault: true },
  { name: 'Car Payment', icon: 'car.fill', color: '#0EA5E9', isDefault: true },
  { name: 'Investment', icon: 'chart.line.uptrend.xyaxis', color: '#9C27B0', isDefault: true },
  { name: 'Other Income', icon: 'plus.circle.fill', color: '#00BCD4', isDefault: true },
  { name: 'Food & Dining', icon: 'fork.knife', color: '#FF9800', isDefault: true },
  { name: 'Bills & Utilities', icon: 'house.fill', color: '#F44336', isDefault: true },
  { name: 'Transportation', icon: 'car.fill', color: '#3F51B5', isDefault: true },
  { name: 'Entertainment', icon: 'tv.fill', color: '#E91E63', isDefault: true },
  { name: 'Shopping', icon: 'bag.fill', color: '#E91E63', isDefault: true },
  { name: 'Healthcare', icon: 'cross.case.fill', color: '#00BCD4', isDefault: true },
  { name: 'Education', icon: 'book.fill', color: '#673AB7', isDefault: true },
  { name: 'Savings', icon: 'banknote.fill', color: '#4CAF50', isDefault: true },
  { name: 'Other Expense', icon: 'minus.circle.fill', color: '#607D8B', isDefault: true },
];
