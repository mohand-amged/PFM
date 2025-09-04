import db from '@/lib/db';
import type { Expense } from '@prisma/client';

export interface ExpenseWithId extends Expense {
  id: string;
}

export interface ExpenseStats {
  totalMonthly: number;
  totalWeekly: number;
  recentExpenses: ExpenseWithId[];
  categoryBreakdown: Record<string, number>;
}

export async function getUserExpenses(userId: string): Promise<ExpenseWithId[]> {
  try {
    const expenses = await db.expense.findMany({
      where: {
        userId,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return expenses;
  } catch (error) {
    console.error('Failed to fetch expenses:', error);
    throw new Error('Failed to fetch expenses');
  }
}

export async function getExpenseById(id: string, userId: string): Promise<ExpenseWithId | null> {
  try {
    const expense = await db.expense.findFirst({
      where: {
        id,
        userId,
      },
    });

    return expense;
  } catch (error) {
    console.error('Failed to fetch expense:', error);
    throw new Error('Failed to fetch expense');
  }
}

export async function createExpense(
  userId: string,
  data: {
    name: string;
    amount: number;
    category: string;
    date: Date;
    description?: string;
  }
): Promise<ExpenseWithId> {
  try {
    const expense = await db.expense.create({
      data: {
        ...data,
        userId,
      },
    });

    return expense;
  } catch (error) {
    console.error('Failed to create expense:', error);
    throw new Error('Failed to create expense');
  }
}

export async function updateExpense(
  id: string,
  userId: string,
  data: {
    name?: string;
    amount?: number;
    category?: string;
    date?: Date;
    description?: string;
  }
): Promise<ExpenseWithId> {
  try {
    const expense = await db.expense.update({
      where: {
        id,
        userId,
      },
      data,
    });

    return expense;
  } catch (error) {
    console.error('Failed to update expense:', error);
    throw new Error('Failed to update expense');
  }
}

export async function deleteExpense(id: string, userId: string): Promise<void> {
  try {
    await db.expense.delete({
      where: {
        id,
        userId,
      },
    });
  } catch (error) {
    console.error('Failed to delete expense:', error);
    throw new Error('Failed to delete expense');
  }
}

export function calculateExpenseStats(expenses: ExpenseWithId[]): ExpenseStats {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Filter expenses for this month
  const monthlyExpenses = expenses.filter(expense => 
    new Date(expense.date) >= thisMonth
  );
  
  // Filter expenses for this week
  const weeklyExpenses = expenses.filter(expense => 
    new Date(expense.date) >= thisWeek
  );
  
  // Calculate totals
  const totalMonthly = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalWeekly = weeklyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Get recent expenses (last 5)
  const recentExpenses = expenses.slice(0, 5);
  
  // Calculate category breakdown for this month
  const categoryBreakdown: Record<string, number> = {};
  monthlyExpenses.forEach(expense => {
    categoryBreakdown[expense.category] = (categoryBreakdown[expense.category] || 0) + expense.amount;
  });
  
  return {
    totalMonthly,
    totalWeekly,
    recentExpenses,
    categoryBreakdown,
  };
}

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Healthcare',
  'Bills & Utilities',
  'Education',
  'Travel',
  'Personal Care',
  'Gifts & Donations',
  'Business',
  'Other'
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
