import * as Crypto from 'expo-crypto';

import { DEFAULT_CATEGORY_TEMPLATES } from '@/constants/default-categories';
import type { Category, Goal, Transaction } from '@/types';

import { supabase } from './supabase';

export function randomId(): string {
  return Crypto.randomUUID();
}

function mapCategory(row: {
  id: string;
  name: string;
  icon: string;
  color: string;
  is_default: boolean;
  created_at: string;
}): Category {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    isDefault: row.is_default,
    createdAt: row.created_at,
  };
}

function mapTransaction(row: {
  id: string;
  category_id: string;
  amount: string | number;
  date: string;
  notes: string | null;
  type: string;
  is_recurring: boolean;
  recurring_frequency: string | null;
  created_at: string;
  updated_at: string;
}): Transaction {
  return {
    id: row.id,
    categoryId: row.category_id,
    amount: Number(row.amount),
    date: row.date,
    notes: row.notes ?? undefined,
    type: row.type as 'income' | 'expense',
    isRecurring: row.is_recurring,
    recurringFrequency: (row.recurring_frequency as 'monthly' | undefined) ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapGoal(row: {
  id: string;
  name: string;
  target_amount: string | number;
  current_amount: string | number;
  deadline: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
}): Goal {
  return {
    id: row.id,
    name: row.name,
    targetAmount: Number(row.target_amount),
    currentAmount: Number(row.current_amount),
    deadline: row.deadline ?? undefined,
    color: row.color ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function seedCategoriesForUser(userId: string): Promise<Category[]> {
  const rows = DEFAULT_CATEGORY_TEMPLATES.map((t) => ({
    user_id: userId,
    name: t.name,
    icon: t.icon,
    color: t.color,
    is_default: t.isDefault,
  }));
  const { data, error } = await supabase.from('categories').insert(rows).select();
  if (error) throw error;
  return (data ?? []).map(mapCategory);
}

async function reconcileExistingDefaultCategories(
  userId: string,
  categories: Category[],
): Promise<Category[]> {
  const hasMortgageRent = categories.some((c) => c.name === 'Mortgage/Rent');
  const hasCarPayment = categories.some((c) => c.name === 'Car Payment');
  const freelanceCategory = categories.find((c) => c.name === 'Freelance');

  let nextCategories = [...categories];

  if (!hasMortgageRent && freelanceCategory) {
    const { data, error } = await supabase
      .from('categories')
      .update({
        name: 'Mortgage/Rent',
        icon: 'house.fill',
        color: '#2196F3',
      })
      .eq('id', freelanceCategory.id)
      .eq('user_id', userId)
      .select('*')
      .single();
    if (error) throw error;
    if (data) {
      const updatedCategory = mapCategory(data);
      nextCategories = nextCategories.map((c) => (c.id === updatedCategory.id ? updatedCategory : c));
    }
  }

  const latestHasCarPayment = nextCategories.some((c) => c.name === 'Car Payment');
  if (!hasCarPayment && !latestHasCarPayment) {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: userId,
        name: 'Car Payment',
        icon: 'car.fill',
        color: '#0EA5E9',
        is_default: true,
      })
      .select('*')
      .single();
    if (error) throw error;
    if (data) {
      nextCategories = [...nextCategories, mapCategory(data)];
    }
  }

  return nextCategories;
}

export async function fetchAllForUser(userId: string): Promise<{
  categories: Category[];
  transactions: Transaction[];
  goals: Goal[];
}> {
  const [catsRes, txRes, goalsRes] = await Promise.all([
    supabase.from('categories').select('*').order('created_at', { ascending: true }),
    supabase.from('transactions').select('*').order('date', { ascending: false }),
    supabase.from('goals').select('*').order('created_at', { ascending: true }),
  ]);

  if (catsRes.error) throw catsRes.error;
  if (txRes.error) throw txRes.error;
  if (goalsRes.error) throw goalsRes.error;

  let categories = (catsRes.data ?? []).map(mapCategory);
  if (categories.length === 0) {
    categories = await seedCategoriesForUser(userId);
  } else {
    categories = await reconcileExistingDefaultCategories(userId, categories);
  }

  return {
    categories,
    transactions: (txRes.data ?? []).map(mapTransaction),
    goals: (goalsRes.data ?? []).map(mapGoal),
  };
}

export async function insertTransactionRemote(userId: string, tx: Transaction): Promise<void> {
  const { error } = await supabase.from('transactions').insert({
    id: tx.id,
    user_id: userId,
    category_id: tx.categoryId,
    amount: tx.amount,
    date: tx.date,
    notes: tx.notes ?? null,
    type: tx.type,
    is_recurring: tx.isRecurring,
    recurring_frequency: tx.recurringFrequency ?? null,
    created_at: tx.createdAt,
    updated_at: tx.updatedAt,
  });
  if (error) throw error;
}

export async function updateTransactionRemote(tx: Transaction): Promise<void> {
  const { error } = await supabase
    .from('transactions')
    .update({
      category_id: tx.categoryId,
      amount: tx.amount,
      date: tx.date,
      notes: tx.notes ?? null,
      type: tx.type,
      is_recurring: tx.isRecurring,
      recurring_frequency: tx.recurringFrequency ?? null,
      updated_at: tx.updatedAt,
    })
    .eq('id', tx.id);
  if (error) throw error;
}

export async function deleteTransactionRemote(id: string): Promise<void> {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
}

export async function insertCategoryRemote(userId: string, c: Category): Promise<void> {
  const { error } = await supabase.from('categories').insert({
    id: c.id,
    user_id: userId,
    name: c.name,
    icon: c.icon,
    color: c.color,
    is_default: c.isDefault,
    created_at: c.createdAt,
  });
  if (error) throw error;
}

export async function deleteCategoryRemote(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

export async function insertGoalRemote(userId: string, g: Goal): Promise<void> {
  const { error } = await supabase.from('goals').insert({
    id: g.id,
    user_id: userId,
    name: g.name,
    target_amount: g.targetAmount,
    current_amount: g.currentAmount,
    deadline: g.deadline ?? null,
    color: g.color ?? null,
    created_at: g.createdAt,
    updated_at: g.updatedAt,
  });
  if (error) throw error;
}

export async function updateGoalRemote(g: Goal): Promise<void> {
  const { error } = await supabase
    .from('goals')
    .update({
      name: g.name,
      target_amount: g.targetAmount,
      current_amount: g.currentAmount,
      deadline: g.deadline ?? null,
      color: g.color ?? null,
      updated_at: g.updatedAt,
    })
    .eq('id', g.id);
  if (error) throw error;
}

export async function deleteGoalRemote(id: string): Promise<void> {
  const { error } = await supabase.from('goals').delete().eq('id', id);
  if (error) throw error;
}

/** Deletes all user budget data and re-seeds default categories. Returns fresh categories. */
export async function deleteAllUserData(userId: string): Promise<Category[]> {
  const { error: e1 } = await supabase.from('transactions').delete().eq('user_id', userId);
  if (e1) throw e1;
  const { error: e2 } = await supabase.from('goals').delete().eq('user_id', userId);
  if (e2) throw e2;
  const { error: e3 } = await supabase.from('categories').delete().eq('user_id', userId);
  if (e3) throw e3;
  return seedCategoriesForUser(userId);
}
