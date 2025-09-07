'use client';

import { useState } from 'react';
import { deleteExpenseById } from '@/app/actions/expenses';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, Edit, Calendar, DollarSign, Receipt, Plus } from 'lucide-react';
import Link from 'next/link';

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

interface ExpensesClientProps {
  initialExpenses: Expense[];
  initialStats: ExpenseStats;
}

function formatDisplayDate(d: Date | string | null | undefined): string {
  if (!d) return '';
  try {
    const date = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString();
  } catch {
    return '';
  }
}

export default function ExpensesClient({
  initialExpenses,
  initialStats,
}: ExpensesClientProps) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [stats, setStats] = useState<ExpenseStats>(initialStats);

  // No longer need event listeners since we're using page navigation

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      await deleteExpenseById(id);
      // Optimistically update UI
      setExpenses(prev => prev.filter(expense => expense.id !== id));
      // Refresh page to get updated stats
      window.location.reload();
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense. Please try again.');
      // Reload page to ensure UI is in sync
      window.location.reload();
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Expenses</h1>
            <p className="text-gray-600 mt-2">Track and manage your expenses</p>
          </div>
          <Link href="/expenses/new">
            <Button className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Spent</p>
              <p className="text-2xl font-semibold">${stats.totalExpenses?.toFixed(2) || '0.00'}</p>
              <p className="text-xs text-gray-500">across {stats.totalCount || 0} expenses</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">This Month</p>
              <p className="text-2xl font-semibold">${stats.thisMonthTotal?.toFixed(2) || '0.00'}</p>
              <p className="text-xs text-gray-500">total expenses this month</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <Receipt className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Categories</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {stats.categoryTotals && Object.keys(stats.categoryTotals).length > 0 ? (
                  Object.entries(stats.categoryTotals).map(([category, total]) => (
                    <span key={category} className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                      {category}: ${Number(total)?.toFixed(2) || '0.00'}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500">No categories yet</span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Expenses List */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-2">
          <h2 className="text-lg sm:text-xl font-semibold">Recent Expenses</h2>
          <div className="flex gap-2">
            {/* Add any filters or sorting options here */}
          </div>
        </div>

        {expenses.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 gap-3 sm:gap-4">
                <div className="flex items-start sm:items-center flex-1 min-w-0">
                  <div className="p-2 sm:p-3 rounded-lg bg-blue-100 text-blue-600 mr-3 sm:mr-4 flex-shrink-0">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-sm sm:text-base truncate">{expense.name}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                      {expense.category && (
                        <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded w-fit">
                          {expense.category}
                        </span>
                      )}
                      <span className="text-xs sm:text-sm text-gray-500">
                        {formatDisplayDate(expense.date)}
                      </span>
                    </div>
                    {expense.description && (
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{expense.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-2 flex-shrink-0">
                  <span className="font-semibold text-sm sm:text-base">
                    ${Number(expense.amount)?.toFixed(2) || '0.00'}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link href={`/expenses/${expense.id}/edit`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0 touch-manipulation">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit expense</span>
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(expense.id)}
                      className="text-red-500 hover:text-red-700 h-8 w-8 sm:h-9 sm:w-9 p-0 touch-manipulation"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete expense</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Receipt className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No expenses yet</h3>
            <p className="text-gray-500 mb-6">Start tracking your expenses to see them here.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/expenses/new">
                <Button className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Expense
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full sm:w-auto">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
