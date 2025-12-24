export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  completedDates: string[]; // ISO date strings
  createdAt: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string; // ISO date string
  createdAt: string;
}

export type TimeRange = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface ExpenseCategory {
  name: string;
  icon: string;
  color: string;
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { name: 'Food', icon: '🍔', color: 'hsl(24 85% 55%)' },
  { name: 'Transport', icon: '🚗', color: 'hsl(210 70% 55%)' },
  { name: 'Shopping', icon: '🛍️', color: 'hsl(280 70% 55%)' },
  { name: 'Entertainment', icon: '🎬', color: 'hsl(340 70% 55%)' },
  { name: 'Bills', icon: '📄', color: 'hsl(45 90% 55%)' },
  { name: 'Health', icon: '💊', color: 'hsl(150 60% 45%)' },
  { name: 'Education', icon: '📚', color: 'hsl(180 60% 45%)' },
  { name: 'Other', icon: '📦', color: 'hsl(0 0% 50%)' },
];

export const HABIT_ICONS = ['🏃', '📚', '💧', '🧘', '💪', '🍎', '😴', '✍️', '🎯', '💡', '🎵', '🌱'];
export const HABIT_COLORS = [
  'hsl(24 85% 55%)',
  'hsl(150 60% 45%)',
  'hsl(210 70% 55%)',
  'hsl(280 70% 55%)',
  'hsl(340 70% 55%)',
  'hsl(45 90% 55%)',
];
