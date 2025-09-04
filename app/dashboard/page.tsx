import { getUserSubscriptions, calculateSubscriptionStats } from '@/lib/subscriptions';
import { getUserExpenses, calculateExpenseStats } from '@/lib/expenses';
import { getUserSavings, calculateSavingStats } from '@/lib/savings';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Subscription {
  id: string;
  name: string;
  price: number;
  billingDate: Date;
  categories: string[];
  description?: string;
}

interface SubscriptionStats {
  totalMonthly: number;
  totalAnnual: number;
  upcomingRenewals: Subscription[];
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  // Initialize subscription data
  let subscriptions: Subscription[] = [];
  let totalMonthly = 0;
  let totalAnnual = 0;
  let upcomingRenewals: Subscription[] = [];

  // Initialize expense data
  let expenses: any[] = [];
  let expenseStats = {
    totalMonthly: 0,
    totalWeekly: 0,
    recentExpenses: [],
    categoryBreakdown: {},
  };

  // Initialize savings data
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
      const stats: SubscriptionStats = calculateSubscriptionStats(subscriptions);
      totalMonthly = stats.totalMonthly;
      totalAnnual = stats.totalAnnual;
      upcomingRenewals = stats.upcomingRenewals;
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
      console.error('Failed to load dashboard data:', error);
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user.name || user.email}</p>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <h2 className="text-lg font-semibold text-gray-600">Active Subscriptions</h2>
          <p className="text-3xl font-bold mt-2 text-blue-600">{subscriptions.length}</p>
          <p className="text-sm text-gray-500 mt-1">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalMonthly)}/month
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
          <h2 className="text-lg font-semibold text-gray-600">Monthly Expenses</h2>
          <p className="text-3xl font-bold mt-2 text-red-600">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(expenseStats.totalMonthly)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(expenseStats.totalWeekly)} this week
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <h2 className="text-lg font-semibold text-gray-600">Savings Progress</h2>
          <p className="text-3xl font-bold mt-2 text-green-600">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(savingStats.totalSaved)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {savingStats.completedGoals} of {savingStats.totalGoals} goals completed
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <h2 className="text-lg font-semibold text-gray-600">Net Position</h2>
          <p className="text-3xl font-bold mt-2 text-purple-600">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
              savingStats.totalSaved - (totalMonthly + expenseStats.totalMonthly)
            )}
          </p>
          <p className="text-sm text-gray-500 mt-1">Savings minus monthly outflow</p>
        </div>
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Subscriptions Summary */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Subscriptions</h2>
            <Link href="/subscriptions" className="text-blue-600 hover:underline text-sm">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Services</span>
              <span className="font-semibold">{subscriptions.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Monthly Cost</span>
              <span className="font-semibold">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalMonthly)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Annual Cost</span>
              <span className="font-semibold">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalAnnual)}
              </span>
            </div>
          </div>
        </div>

        {/* Expenses Summary */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Expenses</h2>
            <Link href="/expenses" className="text-blue-600 hover:underline text-sm">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">This Month</span>
              <span className="font-semibold">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(expenseStats.totalMonthly)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">This Week</span>
              <span className="font-semibold">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(expenseStats.totalWeekly)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Categories</span>
              <span className="font-semibold">
                {Object.keys(expenseStats.categoryBreakdown).length}
              </span>
            </div>
          </div>
        </div>

        {/* Savings Summary */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Savings</h2>
            <Link href="/savings" className="text-blue-600 hover:underline text-sm">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Saved</span>
              <span className="font-semibold">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(savingStats.totalSaved)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Goals</span>
              <span className="font-semibold">{savingStats.activeSavings.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completed Goals</span>
              <span className="font-semibold">{savingStats.completedGoals}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Upcoming Renewals */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Upcoming Renewals</h2>
            <Link href="/subscriptions" className="text-sm text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          {upcomingRenewals.length > 0 ? (
            <div className="space-y-3">
              {upcomingRenewals.slice(0, 3).map((sub) => (
                <div key={sub.id} className="border-b pb-2 last:border-b-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{sub.name}</h3>
                      <p className="text-sm text-gray-500">
                        Renews on {new Date(sub.billingDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-semibold">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(sub.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No upcoming renewals in the next 30 days.</p>
          )}
        </div>

        {/* Recent Expenses */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Expenses</h2>
            <Link href="/expenses" className="text-sm text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          {expenseStats.recentExpenses.length > 0 ? (
            <div className="space-y-3">
              {expenseStats.recentExpenses.slice(0, 3).map((expense: any) => (
                <div key={expense.id} className="border-b pb-2 last:border-b-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{expense.name}</h3>
                      <p className="text-sm text-gray-500">
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
            <p className="text-gray-500">No expenses recorded yet.</p>
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
          href="/expenses/new" 
          className="bg-red-600 text-white p-6 rounded-lg shadow hover:bg-red-700 transition-colors block"
        >
          <h3 className="text-lg font-bold mb-2">Add Expense</h3>
          <p className="opacity-90 text-sm">Record a new expense</p>
        </Link>
        <Link 
          href="/savings/new" 
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
    </div>
  );
}
