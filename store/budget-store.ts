import { Category, CategorySummary, Goal, SummaryMetrics, Transaction } from '@/types';
import { differenceInDays, endOfMonth, endOfYear, format, startOfMonth, startOfYear } from 'date-fns';
import { create } from 'zustand';

// Default categories
const DEFAULT_CATEGORIES: Category[] = [
  // Income categories
  { id: 'cat_salary', name: 'Salary', icon: 'briefcase.fill', color: '#4CAF50', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat_freelance', name: 'Freelance', icon: 'laptopcomputer', color: '#2196F3', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat_investment', name: 'Investment', icon: 'chart.line.uptrend.xyaxis', color: '#9C27B0', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat_other_income', name: 'Other Income', icon: 'plus.circle.fill', color: '#00BCD4', isDefault: true, createdAt: new Date().toISOString() },
  
  // Expense categories
  { id: 'cat_food', name: 'Food & Dining', icon: 'fork.knife', color: '#FF9800', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat_rent', name: 'Bills & Utilities', icon: 'house.fill', color: '#F44336', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat_transport', name: 'Transportation', icon: 'car.fill', color: '#3F51B5', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat_entertainment', name: 'Entertainment', icon: 'tv.fill', color: '#E91E63', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat_shopping', name: 'Shopping', icon: 'bag.fill', color: '#E91E63', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat_healthcare', name: 'Healthcare', icon: 'cross.case.fill', color: '#00BCD4', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat_education', name: 'Education', icon: 'book.fill', color: '#673AB7', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat_savings', name: 'Savings', icon: 'banknote.fill', color: '#4CAF50', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat_other_expense', name: 'Other Expense', icon: 'minus.circle.fill', color: '#607D8B', isDefault: true, createdAt: new Date().toISOString() },
];

interface BudgetStore {
  // State (in-memory only, session-based)
  transactions: Transaction[];
  categories: Category[];
  goals: Goal[];
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  initialize: () => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => void;
  deleteCategory: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  resetAllData: () => void;

  // Computed
  getSummaryMetrics: (period?: 'month' | 'year' | 'all') => SummaryMetrics;
  getCategorySummaries: (period?: 'month' | 'year' | 'all', type?: 'income' | 'expense') => CategorySummary[];
  getTransactionsByDateRange: (startDate: string, endDate: string) => Transaction[];
  getSavingsRate: (period?: 'month' | 'year' | 'all') => number;
  getDaysUntilDeadline: (deadline: string) => number | null;
}

export const useBudgetStore = create<BudgetStore>((set, get) => ({
  transactions: [],
  categories: [...DEFAULT_CATEGORIES],
  goals: [],
  isLoading: false,
  isInitialized: false,

  initialize: () => {
    set({ isInitialized: true, isLoading: false });
  },

  addTransaction: (transaction) => {
    const id = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    const newTransaction: Transaction = {
      ...transaction,
      id,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({
      transactions: [newTransaction, ...state.transactions],
    }));
  },

  updateTransaction: (id, transaction) => {
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, ...transaction, updatedAt: new Date().toISOString() } : t
      ),
    }));
  },

  deleteTransaction: (id) => {
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    }));
  },

  addCategory: (category) => {
    const id = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newCategory: Category = {
      ...category,
      id,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      categories: [...state.categories, newCategory],
    }));
  },

  deleteCategory: (id) => {
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id && c.isDefault),
    }));
  },

  addGoal: (goal) => {
    const id = `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    const newGoal: Goal = {
      ...goal,
      id,
      currentAmount: goal.currentAmount || 0,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({
      goals: [...state.goals, newGoal],
    }));
  },

  updateGoal: (id, goal) => {
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === id ? { ...g, ...goal, updatedAt: new Date().toISOString() } : g
      ),
    }));
  },

  deleteGoal: (id) => {
    set((state) => ({
      goals: state.goals.filter((g) => g.id !== id),
    }));
  },

  resetAllData: () => {
    set({
      transactions: [],
      goals: [],
      categories: [...DEFAULT_CATEGORIES],
    });
  },

  getSummaryMetrics: (period = 'month') => {
    const { transactions } = get();
    let filtered = transactions;

    if (period === 'month') {
      const now = new Date();
      const start = format(startOfMonth(now), 'yyyy-MM-dd');
      const end = format(endOfMonth(now), 'yyyy-MM-dd');
      filtered = transactions.filter((t) => t.date >= start && t.date <= end);
    } else if (period === 'year') {
      const now = new Date();
      const start = format(startOfYear(now), 'yyyy-MM-dd');
      const end = format(endOfYear(now), 'yyyy-MM-dd');
      filtered = transactions.filter((t) => t.date >= start && t.date <= end);
    } else if (period === 'all') {
      // Use all transactions
      filtered = transactions;
    }

    const totalIncome = filtered.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = filtered.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalIncome - totalExpenses;

    return { totalIncome, totalExpenses, netBalance };
  },

  getCategorySummaries: (period = 'month', type) => {
    const { transactions, categories } = get();
    let filtered = transactions;

    if (period === 'month') {
      const now = new Date();
      const start = format(startOfMonth(now), 'yyyy-MM-dd');
      const end = format(endOfMonth(now), 'yyyy-MM-dd');
      filtered = transactions.filter((t) => t.date >= start && t.date <= end);
    } else if (period === 'year') {
      const now = new Date();
      const start = format(startOfYear(now), 'yyyy-MM-dd');
      const end = format(endOfYear(now), 'yyyy-MM-dd');
      filtered = transactions.filter((t) => t.date >= start && t.date <= end);
    } else if (period === 'all') {
      // Use all transactions
      filtered = transactions;
    }

    if (type) {
      filtered = filtered.filter((t) => t.type === type);
    }

    const categoryMap = new Map<string, CategorySummary>();

    filtered.forEach((transaction) => {
      const category = categories.find((c) => c.id === transaction.categoryId);
      if (!category) return;

      const existing = categoryMap.get(transaction.categoryId);
      if (existing) {
        existing.totalAmount += transaction.amount;
        existing.transactionCount += 1;
      } else {
        categoryMap.set(transaction.categoryId, {
          categoryId: transaction.categoryId,
          categoryName: category.name,
          totalAmount: transaction.amount,
          transactionCount: 1,
        });
      }
    });

    return Array.from(categoryMap.values()).sort((a, b) => b.totalAmount - a.totalAmount);
  },

  getTransactionsByDateRange: (startDate, endDate) => {
    const { transactions } = get();
    return transactions.filter((t) => t.date >= startDate && t.date <= endDate);
  },

  getSavingsRate: (period = 'month') => {
    const metrics = get().getSummaryMetrics(period);
    if (metrics.totalIncome === 0) return 0;
    return ((metrics.totalIncome - metrics.totalExpenses) / metrics.totalIncome) * 100;
  },

  getDaysUntilDeadline: (deadline) => {
    if (!deadline) return null;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const days = differenceInDays(deadlineDate, today);
    return days;
  },
}));
