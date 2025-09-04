import React from 'react';
import { getUserSubscriptions, getSpendingByCategory } from '@/lib/subscriptions';
import { getUserExpenses, calculateExpenseStats } from '@/lib/expenses';
import { getUserSavings, calculateSavingStats } from '@/lib/savings';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SpendingChart from '@/components/SpendingChart';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

interface Subscription {
  id: string;
  name: string;
  price: number;
  billingDate: Date;
  categories: string[];
  description?: string;
}

interface CategoryData {
  name: string;
  value: number;
}

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  // Initialize all data
  let subscriptions: Subscription[] = [];
  let subscriptionChartData: CategoryData[] = [];
  let expenses: any[] = [];
  let expenseStats = {
    totalMonthly: 0,
    totalWeekly: 0,
    recentExpenses: [],
    categoryBreakdown: {},
  };
  let savings: any[] = [];
  let savingStats = {
    totalSaved: 0,
    totalGoals: 0,
    completedGoals: 0,
    activeSavings: [],
    recentSavings: [],
    progressByCategory: {},
  };

  try {
    // Load all data in parallel
    const [subscriptionsData, expensesData, savingsData] = await Promise.allSettled([
      getUserSubscriptions(user.id),
      getUserExpenses(user.id),
      getUserSavings(user.id),
    ]);

    // Process subscriptions
    if (subscriptionsData.status === 'fulfilled') {
      subscriptions = subscriptionsData.value;
      subscriptionChartData = getSpendingByCategory(subscriptions);
    }

    // Process expenses
    if (expensesData.status === 'fulfilled') {
      expenses = expensesData.value;
      expenseStats = calculateExpenseStats(expenses);
    }

    // Process savings
    if (savingsData.status === 'fulfilled') {
      savings = savingsData.value;
      savingStats = calculateSavingStats(savings);
    }
  } catch (error) {
    // Log error in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to load analytics data:', error);
    }
  }

  // Calculate comprehensive metrics
  const totalSubscriptionSpending = subscriptions.reduce((sum, sub) => sum + sub.price, 0);
  const totalMonthlyOutflow = totalSubscriptionSpending + expenseStats.totalMonthly;
  const netWorth = savingStats.totalSaved - totalMonthlyOutflow;
  const averageMonthlySpending = totalSubscriptionSpending / (subscriptions.length || 1);
  const mostExpensiveSubscription = [...subscriptions].sort((a, b) => b.price - a.price)[0];
  
  // Prepare combined chart data
  const expenseChartData: CategoryData[] = Object.entries(expenseStats.categoryBreakdown).map(([name, value]) => ({
    name,
    value: value as number,
  }));
  
  const savingsChartData: CategoryData[] = Object.entries(savingStats.progressByCategory).map(([name, data]) => ({
    name,
    value: (data as any).saved,
  }));

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Analytics</h1>
            <p className="text-gray-600 mt-2">Comprehensive view of your subscriptions, expenses, and savings</p>
          </div>
          <Button asChild>
            <Link href="/dashboard">
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 border-l-4 border-blue-500">
          <h2 className="text-lg font-semibold text-gray-600">Monthly Subscriptions</h2>
          <p className="text-3xl font-bold mt-2 text-blue-600">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalSubscriptionSpending)}
          </p>
          <p className="text-sm text-gray-500 mt-1">{subscriptions.length} active services</p>
        </Card>
        
        <Card className="p-6 border-l-4 border-red-500">
          <h2 className="text-lg font-semibold text-gray-600">Monthly Expenses</h2>
          <p className="text-3xl font-bold mt-2 text-red-600">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(expenseStats.totalMonthly)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(expenseStats.totalWeekly)} this week
          </p>
        </Card>
        
        <Card className="p-6 border-l-4 border-green-500">
          <h2 className="text-lg font-semibold text-gray-600">Total Savings</h2>
          <p className="text-3xl font-bold mt-2 text-green-600">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(savingStats.totalSaved)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {savingStats.completedGoals} of {savingStats.totalGoals} goals completed
          </p>
        </Card>
        
        <Card className="p-6 border-l-4 border-purple-500">
          <h2 className="text-lg font-semibold text-gray-600">Net Position</h2>
          <p className={`text-3xl font-bold mt-2 ${
            netWorth >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(netWorth)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Savings vs monthly outflow</p>
        </Card>
      </div>
      
      {/* Total Outflow Summary */}
      <Card className="p-6 mb-8 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Total Monthly Outflow</h2>
            <p className="text-gray-600 mt-1">Combined subscriptions and expenses</p>
          </div>
          <p className="text-4xl font-bold text-orange-600">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalMonthlyOutflow)}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Subscriptions</p>
            <p className="text-2xl font-bold text-blue-600">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalSubscriptionSpending)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Other Expenses</p>
            <p className="text-2xl font-bold text-red-600">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(expenseStats.totalMonthly)}
            </p>
          </div>
        </div>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Subscription Categories */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Subscriptions by Category</h2>
            <Link href="/subscriptions" className="text-sm text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          
          {subscriptionChartData.length > 0 ? (
            <div className="h-64">
              <SpendingChart data={subscriptionChartData} />
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No subscription data</p>
              <Button size="sm" asChild>
                <Link href="/subscriptions/new">
                  Add Subscription
                </Link>
              </Button>
            </div>
          )}
        </Card>

        {/* Expense Categories */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Expenses by Category</h2>
            <Link href="/expenses" className="text-sm text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          
          {expenseChartData.length > 0 ? (
            <div className="h-64">
              <SpendingChart data={expenseChartData} />
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No expense data</p>
              <Button size="sm" asChild>
                <Link href="/expenses/new">
                  Add Expense
                </Link>
              </Button>
            </div>
          )}
        </Card>

        {/* Savings Progress */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Savings by Category</h2>
            <Link href="/savings" className="text-sm text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          
          {savingsChartData.length > 0 ? (
            <div className="h-64">
              <SpendingChart data={savingsChartData} />
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No savings data</p>
              <Button size="sm" asChild>
                <Link href="/savings/new">
                  Add Savings Goal
                </Link>
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Detailed Category Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Subscription Breakdown */}
        {subscriptionChartData.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6 text-blue-600">Subscription Breakdown</h2>
            <div className="space-y-4">
              {subscriptionChartData.map((category) => (
                <div key={category.name}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-gray-900">{category.name}</span>
                    <span className="font-semibold text-blue-600">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(category.value)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${(category.value / totalSubscriptionSpending) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1 text-right">
                    {((category.value / totalSubscriptionSpending) * 100).toFixed(1)}% of subscription spending
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Expense Breakdown */}
        {expenseChartData.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6 text-red-600">Expense Breakdown</h2>
            <div className="space-y-4">
              {expenseChartData.map((category) => (
                <div key={category.name}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-gray-900">{category.name}</span>
                    <span className="font-semibold text-red-600">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(category.value)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${(category.value / expenseStats.totalMonthly) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1 text-right">
                    {((category.value / expenseStats.totalMonthly) * 100).toFixed(1)}% of expense spending
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Savings Breakdown */}
        {savingsChartData.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6 text-green-600">Savings Progress</h2>
            <div className="space-y-4">
              {Object.entries(savingStats.progressByCategory).map(([categoryName, data]) => {
                const progress = ((data as any).saved / (data as any).target) * 100;
                return (
                  <div key={categoryName}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-900">{categoryName}</span>
                      <span className="font-semibold text-green-600">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((data as any).saved)} / {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((data as any).target)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1 text-right">
                      {progress.toFixed(1)}% complete
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      {/* No Data Fallback */}
      {subscriptions.length === 0 && expenses.length === 0 && savings.length === 0 && (
        <Card className="p-8 text-center">
          <div className="max-w-md mx-auto">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start tracking your finances</h3>
            <p className="text-gray-500 mb-6">Add subscriptions, expenses, or savings goals to begin analyzing your financial patterns and get comprehensive insights.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 justify-center">
              <Button asChild>
                <Link href="/subscriptions/new">
                  Add Subscription
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/expenses/new">
                  Add Expense
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/savings/new">
                  Add Savings Goal
                </Link>
              </Button>
            </div>
            <div className="mt-4">
              <Button variant="ghost" asChild>
                <Link href="/dashboard">
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
