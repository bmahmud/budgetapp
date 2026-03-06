export interface Transaction {
  id: string;
  amount: number;
  date: string; // ISO date string
  categoryId: string;
  notes?: string;
  type: 'income' | 'expense';
  isRecurring: boolean;
  recurringFrequency?: 'monthly';
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string; // ISO date string
  color?: string; // Goal color for UI
  createdAt: string;
  updatedAt: string;
}

export interface SummaryMetrics {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
}

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  totalAmount: number;
  transactionCount: number;
}

