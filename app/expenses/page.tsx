import React from 'react';
import { getExpenses, getExpenseStats, deleteExpense } from '@/app/actions/expenses';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, Edit, Plus, Calendar, DollarSign, Receipt } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Expense {
  id: string;
  name: string;
  amount: number;
  currency: string;
  date: Date;
  category?: string;
  description?: string;
  createdAt: Date;
}

function formatDisplayDate(d: Date | string) {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString();
}

function getDaysFromNow(date: Date | string) {
  const today = new Date();
  const expenseDate = new Date(date);
  const diffTime = today.getTime() - expenseDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export default async function ExpensesPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  let expenses: Expense[] = [];
  let stats = {
    totalExpenses: 0,
    totalCount: 0,
    thisMonthTotal: 0,
    categoryTotals: {} as Record<string, number>,
    expenses: [] as Expense[],
  };

  try {
    expenses = await getExpenses();
    stats = await getExpenseStats();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to load expenses:', error);
    }
  }

  // Recent expenses (last 7 days)
  const recentExpenses = expenses.filter(expense => {
    const daysAgo = getDaysFromNow(expense.date);
    return daysAgo <= 7;
  });

  // Top categories
  const topCategories = Object.entries(stats.categoryTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Expenses</h1>
            <p className="text-gray-600 mt-2">Track and manage all your expenses in one place</p>
          </div>
          <Button asChild>
            <Link href="/expenses/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-600">Total Expenses</h3>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.totalExpenses)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Receipt className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-600">Total Count</h3>
              <p className="text-2xl font-bold">{stats.totalCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-600">This Month</h3>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.thisMonthTotal)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Expenses List */}
      {expenses.length > 0 ? (
        <div className="space-y-4">
          {expenses.map((expense) => {
            const daysAgo = getDaysFromNow(expense.date);
            const isRecent = daysAgo <= 1;

            return (
              <Card key={expense.id} className={`p-6 transition-all hover:shadow-md ${isRecent ? 'ring-2 ring-blue-200' : ''}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-semibold text-gray-900">{expense.name}</h2>
                      {isRecent && (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-6 text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-lg font-semibold">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: expense.currency || 'USD' }).format(expense.amount)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {formatDisplayDate(expense.date)}
                        </span>
                      </div>
                    </div>

                    {expense.description && (
                      <p className="text-gray-600 mb-3">{expense.description}</p>
                    )}

                    {expense.category && (
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 text-sm font-medium bg-purple-100 text-purple-800 rounded-full">
                          {expense.category}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/expenses/${expense.id}/edit`}>
                        <Edit className="w-4 h-4" />
                      </Link>
                    </Button>
                    
                    <form action={deleteExpense}>
                      <input type="hidden" name="id" value={expense.id} />
                      <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM13 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm-5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No expenses yet</h3>
            <p className="text-gray-500 mb-6">
              Start tracking your spending by adding your first expense. 
              Keep track of where your money goes and analyze spending patterns.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="/expenses/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Expense
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Recent Expenses Alert */}
      {recentExpenses.length > 0 && (
        <Card className="p-6 mt-8 bg-blue-50 border-blue-200">
          <div className="flex items-start">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <Receipt className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Recent Expenses ({recentExpenses.length})
              </h3>
              <p className="text-blue-700 mb-3">
                You&apos;ve added {recentExpenses.length} expense{recentExpenses.length !== 1 ? 's' : ''} in the past 7 days.
              </p>
              <div className="space-y-2">
                {recentExpenses.slice(0, 3).map((expense) => (
                  <div key={expense.id} className="flex justify-between items-center text-sm">
                    <span className="font-medium text-blue-900">{expense.name}</span>
                    <span className="text-blue-700">
                      {formatDisplayDate(expense.date)} - {new Intl.NumberFormat('en-US', { style: 'currency', currency: expense.currency || 'USD' }).format(expense.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Top Categories */}
      {topCategories.length > 0 && (
        <Card className="p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Spending Categories</h3>
          <div className="space-y-3">
            {topCategories.map(([category, amount]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="font-medium text-gray-700">{category}</span>
                <span className="text-gray-900 font-semibold">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
