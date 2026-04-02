import { Category, CategorySummary, Goal, SummaryMetrics, Transaction } from '@/types';
import * as remote from '@/lib/budget-remote';
import { supabase } from '@/lib/supabase';
import { differenceInDays, endOfMonth, endOfYear, format, startOfMonth, startOfYear } from 'date-fns';
import { create } from 'zustand';

async function getUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

interface BudgetStore {
  transactions: Transaction[];
  categories: Category[];
  goals: Goal[];
  isLoading: boolean;
  isInitialized: boolean;

  hydrateFromRemote: () => Promise<void>;
  resetLocalState: () => void;
  /** @deprecated Hydration runs after sign-in; kept for existing screen effects. */
  initialize: () => void;

  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateGoal: (id: string, goal: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  resetAllData: () => Promise<void>;

  getSummaryMetrics: (period?: 'month' | 'year' | 'all') => SummaryMetrics;
  getCategorySummaries: (period?: 'month' | 'year' | 'all', type?: 'income' | 'expense') => CategorySummary[];
  getTransactionsByDateRange: (startDate: string, endDate: string) => Transaction[];
  getSavingsRate: (period?: 'month' | 'year' | 'all') => number;
  getDaysUntilDeadline: (deadline: string) => number | null;
}

export const useBudgetStore = create<BudgetStore>((set, get) => ({
  transactions: [],
  categories: [],
  goals: [],
  isLoading: false,
  isInitialized: false,

  resetLocalState: () => {
    set({
      transactions: [],
      categories: [],
      goals: [],
      isInitialized: false,
      isLoading: false,
    });
  },

  initialize: () => {},

  hydrateFromRemote: async () => {
    const uid = await getUserId();
    if (!uid) {
      get().resetLocalState();
      return;
    }
    set({ isLoading: true });
    try {
      const { categories, transactions, goals } = await remote.fetchAllForUser(uid);
      set({ categories, transactions, goals, isInitialized: true, isLoading: false });
    } catch (e) {
      console.error('hydrateFromRemote failed', e);
      set({ isLoading: false, isInitialized: true });
    }
  },

  addTransaction: async (transaction) => {
    const uid = await getUserId();
    if (!uid) return;
    const id = remote.randomId();
    const now = new Date().toISOString();
    const newTransaction: Transaction = {
      ...transaction,
      id,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ transactions: [newTransaction, ...state.transactions] }));
    try {
      await remote.insertTransactionRemote(uid, newTransaction);
    } catch (e) {
      set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) }));
      throw e;
    }
  },

  updateTransaction: async (id, transaction) => {
    const prev = get().transactions.find((t) => t.id === id);
    if (!prev) return;
    const updated: Transaction = {
      ...prev,
      ...transaction,
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      transactions: state.transactions.map((t) => (t.id === id ? updated : t)),
    }));
    try {
      await remote.updateTransactionRemote(updated);
    } catch (e) {
      set((state) => ({
        transactions: state.transactions.map((t) => (t.id === id ? prev : t)),
      }));
      throw e;
    }
  },

  deleteTransaction: async (id) => {
    const prev = get().transactions;
    set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) }));
    try {
      await remote.deleteTransactionRemote(id);
    } catch (e) {
      set({ transactions: prev });
      throw e;
    }
  },

  addCategory: async (category) => {
    const uid = await getUserId();
    if (!uid) return;
    const id = remote.randomId();
    const newCategory: Category = {
      ...category,
      id,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ categories: [...state.categories, newCategory] }));
    try {
      await remote.insertCategoryRemote(uid, newCategory);
    } catch (e) {
      set((state) => ({ categories: state.categories.filter((c) => c.id !== id) }));
      throw e;
    }
  },

  deleteCategory: async (id) => {
    const cat = get().categories.find((c) => c.id === id);
    if (!cat || cat.isDefault) return;
    const prev = get().categories;
    set((state) => ({ categories: state.categories.filter((c) => c.id !== id) }));
    try {
      await remote.deleteCategoryRemote(id);
    } catch (e) {
      set({ categories: prev });
      throw e;
    }
  },

  addGoal: async (goal) => {
    const uid = await getUserId();
    if (!uid) return;
    const id = remote.randomId();
    const now = new Date().toISOString();
    const newGoal: Goal = {
      ...goal,
      id,
      currentAmount: goal.currentAmount || 0,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ goals: [...state.goals, newGoal] }));
    try {
      await remote.insertGoalRemote(uid, newGoal);
    } catch (e) {
      set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
      throw e;
    }
  },

  updateGoal: async (id, goal) => {
    const prev = get().goals.find((g) => g.id === id);
    if (!prev) return;
    const updated: Goal = {
      ...prev,
      ...goal,
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? updated : g)),
    }));
    try {
      await remote.updateGoalRemote(updated);
    } catch (e) {
      set((state) => ({
        goals: state.goals.map((g) => (g.id === id ? prev : g)),
      }));
      throw e;
    }
  },

  deleteGoal: async (id) => {
    const prev = get().goals;
    set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
    try {
      await remote.deleteGoalRemote(id);
    } catch (e) {
      set({ goals: prev });
      throw e;
    }
  },

  resetAllData: async () => {
    const uid = await getUserId();
    if (!uid) return;
    set({ isLoading: true });
    try {
      const categories = await remote.deleteAllUserData(uid);
      set({ transactions: [], goals: [], categories, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
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
    return differenceInDays(deadlineDate, today);
  },
}));
