import React from 'react';
import { getExpenses, getExpenseStats } from '@/app/actions/expenses';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ExpensesClient from '@/components/ExpensesClient';

export const dynamic = 'force-dynamic';

interface Expense {
  id: string;
  name: string;
  amount: number;
  currency: string;
  date: Date | string;
  category: string | null;
  description: string | null;
  createdAt: Date | string;
  userId: string;
}

interface ExpenseStats {
  totalExpenses: number;
  totalCount: number;
  thisMonthTotal: number;
  categoryTotals: Record<string, number>;
  expenses: Expense[];
}

export default async function ExpensesPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  let expenses: Expense[] = [];
  let stats: ExpenseStats = {
    totalExpenses: 0,
    totalCount: 0,
    thisMonthTotal: 0,
    categoryTotals: {},
    expenses: [],
  };

  try {
    const [expensesData, statsData] = await Promise.all([
      getExpenses(),
      getExpenseStats(),
    ]);
    
    expenses = Array.isArray(expensesData) ? expensesData : [];
    stats = statsData || {
      totalExpenses: 0,
      totalCount: 0,
      thisMonthTotal: 0,
      categoryTotals: {},
      expenses: [],
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error loading expenses:', error);
    }
  }

  return (
    <ExpensesClient
      initialExpenses={expenses}
      initialStats={stats}
    />
  );
}
