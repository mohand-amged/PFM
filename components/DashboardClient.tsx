'use client';

import Link from 'next/link';

interface User {
  id: string;
  name?: string;
  email: string;
}

interface DashboardClientProps {
  user: User;
  subscriptions: any[];
  subscriptionStats: {
    totalMonthly: number;
    totalAnnual: number;
    upcomingRenewals: any[];
  };
}

export default function DashboardClient({ 
  user, 
  subscriptions, 
  subscriptionStats 
}: DashboardClientProps) {
  // Removed modal forms - using page navigation instead
  // Using simplified data - in a real app, this would come from server data
  const expenses: any[] = [];
  const savingsGoals: any[] = [];
  const recentExpenses: any[] = [];
  const savingsProgress = { totalCurrent: 0, totalTarget: 0 };
  
  // Simplified demo data - in a real app, this would come from server
  const monthlyExpenses = 0;
  const weeklyExpenses = 0;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome back, {user.name || user.email}</p>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-blue-500">
          <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Active Subscriptions</h2>
          <p className="text-3xl font-bold mt-2 text-blue-600">{subscriptions.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(subscriptionStats.totalMonthly)}/month
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-red-500">
          <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Monthly Expenses</h2>
          <p className="text-3xl font-bold mt-2 text-red-600">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(monthlyExpenses)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(weeklyExpenses)} this week
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-green-500">
          <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Savings Progress</h2>
          <p className="text-3xl font-bold mt-2 text-green-600">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(savingsProgress.totalCurrent)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {savingsGoals.filter(g => g.progress >= 100).length} of {savingsGoals.length} goals completed
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-purple-500">
          <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Net Position</h2>
          <p className="text-3xl font-bold mt-2 text-purple-600">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
              savingsProgress.totalCurrent - (subscriptionStats.totalMonthly + monthlyExpenses)
            )}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Savings minus monthly outflow</p>
        </div>
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Subscriptions Summary */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Subscriptions</h2>
            <Link href="/subscriptions" className="text-blue-600 hover:underline text-sm">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Total Services</span>
              <span className="font-semibold dark:text-white">{subscriptions.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Monthly Cost</span>
              <span className="font-semibold dark:text-white">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(subscriptionStats.totalMonthly)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Annual Cost</span>
              <span className="font-semibold dark:text-white">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(subscriptionStats.totalAnnual)}
              </span>
            </div>
          </div>
        </div>

        {/* Expenses Summary */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Expenses</h2>
            <Link href="/expenses" className="text-blue-600 hover:underline text-sm">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">This Month</span>
              <span className="font-semibold dark:text-white">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(monthlyExpenses)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">This Week</span>
              <span className="font-semibold dark:text-white">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(weeklyExpenses)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Total Entries</span>
              <span className="font-semibold dark:text-white">
                {expenses.length}
              </span>
            </div>
          </div>
        </div>

        {/* Savings Summary */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Savings</h2>
            <Link href="/savings" className="text-blue-600 hover:underline text-sm">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Total Saved</span>
              <span className="font-semibold dark:text-white">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(savingsProgress.totalCurrent)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Active Goals</span>
              <span className="font-semibold dark:text-white">{savingsGoals.filter(g => g.progress < 100).length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Completed Goals</span>
              <span className="font-semibold dark:text-white">{savingsGoals.filter(g => g.progress >= 100).length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Upcoming Renewals */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold dark:text-white">Upcoming Renewals</h2>
            <Link href="/subscriptions" className="text-sm text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          {subscriptionStats.upcomingRenewals.length > 0 ? (
            <div className="space-y-3">
              {subscriptionStats.upcomingRenewals.slice(0, 3).map((sub) => (
                <div key={sub.id} className="border-b border-gray-200 dark:border-gray-700 pb-2 last:border-b-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium dark:text-white">{sub.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Renews on {new Date(sub.billingDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-semibold dark:text-white">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(sub.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No upcoming renewals in the next 30 days.</p>
          )}
        </div>

        {/* Recent Expenses */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold dark:text-white">Recent Expenses</h2>
            <Link href="/expenses" className="text-sm text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          {recentExpenses.length > 0 ? (
            <div className="space-y-3">
              {recentExpenses.map((expense) => (
                <div key={expense.id} className="border-b border-gray-200 dark:border-gray-700 pb-2 last:border-b-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium dark:text-white">{expense.description}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {expense.category} • {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-semibold text-red-600">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(expense.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No expenses recorded yet.</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link 
          href="/subscriptions/new" 
          className="bg-blue-600 text-white p-6 rounded-lg shadow hover:bg-blue-700 transition-colors block"
        >
          <h3 className="text-lg font-bold mb-2">Add Subscription</h3>
          <p className="opacity-90 text-sm">Track a new service</p>
        </Link>
        <Link 
          href="/expenses" 
          className="bg-red-600 text-white p-6 rounded-lg shadow hover:bg-red-700 transition-colors block"
        >
          <h3 className="text-lg font-bold mb-2">Add Expense</h3>
          <p className="opacity-90 text-sm">Record a new expense</p>
        </Link>
        <Link 
          href="/savings" 
          className="bg-green-600 text-white p-6 rounded-lg shadow hover:bg-green-700 transition-colors block"
        >
          <h3 className="text-lg font-bold mb-2">Add Savings Goal</h3>
          <p className="opacity-90 text-sm">Create a saving target</p>
        </Link>
        <Link 
          href="/analytics" 
          className="bg-purple-600 text-white p-6 rounded-lg shadow hover:bg-purple-700 transition-colors block"
        >
          <h3 className="text-lg font-bold mb-2">View Analytics</h3>
          <p className="opacity-90 text-sm">Analyze your finances</p>
        </Link>
      </div>

      {/* Modal forms removed - using page navigation instead */}
    </div>
  );
}
