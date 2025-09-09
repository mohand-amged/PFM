'use server';

import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export interface ExpenseData {
  name: string;
  amount: number;
  currency?: string;
  date: Date;
  category?: string;
  description?: string;
}

export async function createExpense(formData: FormData) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const name = String(formData.get('name') || '').trim();
  const amountRaw = String(formData.get('amount') || '');
  const dateRaw = String(formData.get('date') || '').trim();
  const category = String(formData.get('category') || '').trim();
  const currency = String(formData.get('currency') || 'USD');

  if (!name) throw new Error('Expense name is required');

  const amount = parseFloat(amountRaw) || 0;
  const date = dateRaw ? new Date(dateRaw) : new Date();

  try {
    await db.expense.create({
      data: {
        name,
        amount,
        currency,
        date,
        category: category || null,
        userId: user.id,
      },
    });

    revalidatePath('/expenses');
    revalidatePath('/dashboard');
    revalidatePath('/analytics');
    
    // Check budget alerts after adding expense
    try {
      const { checkBudgetAlerts } = await import('@/app/actions/budgets');
      await checkBudgetAlerts(date.getMonth() + 1, date.getFullYear());
    } catch (alertError) {
      console.error('Error checking budget alerts:', alertError);
    }
    
  } catch (error) {
    console.error('Error creating expense:', error);
    throw error;
  }

  redirect('/expenses');
}

export async function createExpenseData(data: ExpenseData) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  try {
    const expense = await db.expense.create({
      data: {
        ...data,
        userId: user.id,
      },
    });

    revalidatePath('/expenses');
    revalidatePath('/dashboard');
    revalidatePath('/analytics');
    
    // Check budget alerts after adding expense
    try {
      const { checkBudgetAlerts } = await import('@/app/actions/budgets');
      await checkBudgetAlerts(data.date.getMonth() + 1, data.date.getFullYear());
    } catch (alertError) {
      console.error('Error checking budget alerts:', alertError);
    }
    
    return { success: true, expense };
  } catch (error) {
    console.error('Error creating expense:', error);
    return { success: false, error: 'Failed to create expense' };
  }
}

export async function getExpenses() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  try {
    const expenses = await db.expense.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
    });

    return expenses;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
}

export async function getExpenseById(id: string) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  try {
    const expense = await db.expense.findFirst({
      where: { 
        id,
        userId: user.id 
      },
    });

    return expense;
  } catch (error) {
    console.error('Error fetching expense:', error);
    return null;
  }
}

export async function updateExpense(id: string, data: Partial<ExpenseData>) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  try {
    const expense = await db.expense.update({
      where: { 
        id,
        userId: user.id 
      },
      data,
    });

    revalidatePath('/expenses');
    revalidatePath('/dashboard');
    revalidatePath('/analytics');
    
    return { success: true, expense };
  } catch (error) {
    console.error('Error updating expense:', error);
    return { success: false, error: 'Failed to update expense' };
  }
}

export async function deleteExpense(formData: FormData) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const id = String(formData.get('id') || '');
  if (!id) return;

  try {
    await db.expense.delete({
      where: { 
        id,
        userId: user.id 
      },
    });

    revalidatePath('/expenses');
    revalidatePath('/dashboard');
    revalidatePath('/analytics');
    
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
}

export async function deleteExpenseById(id: string) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  try {
    await db.expense.delete({
      where: { 
        id,
        userId: user.id 
      },
    });

    revalidatePath('/expenses');
    revalidatePath('/dashboard');
    revalidatePath('/analytics');
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting expense:', error);
    return { success: false, error: 'Failed to delete expense' };
  }
}

export async function getExpenseStats() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  try {
    const expenses = await db.expense.findMany({
      where: { userId: user.id },
    });

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalCount = expenses.length;
    
    // Get this month's expenses
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthExpenses = expenses.filter(expense => expense.date >= startOfMonth);
    const thisMonthTotal = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Category breakdown
    const categoryTotals = expenses.reduce((acc, expense) => {
      const category = expense.category || 'Other';
      acc[category] = (acc[category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalExpenses,
      totalCount,
      thisMonthTotal,
      categoryTotals,
      expenses: expenses.slice(0, 5), // Recent 5 expenses
    };
  } catch (error) {
    console.error('Error fetching expense stats:', error);
    return {
      totalExpenses: 0,
      totalCount: 0,
      thisMonthTotal: 0,
      categoryTotals: {},
      expenses: [],
    };
  }
}
