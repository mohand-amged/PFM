'use client';

import Link from 'next/link';
import { Bell, CreditCard, Wallet, TrendingUp, PiggyBank, BarChart3 } from 'lucide-react';

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
  walletStats: {
    wallet: { balance: number; monthlyBudget: number; currency: string };
    monthlyIncome: number;
    monthlyExpenses: number;
    totalIncome: number;
    totalExpenses: number;
    netWorth: number;
    budgetRemaining: number;
    incomeCount: number;
  };
}

export default function DashboardClient({ 
  user, 
  subscriptions, 
  subscriptionStats,
  walletStats 
}: DashboardClientProps) {
  // Removed modal forms - using page navigation instead
  // Using simplified data - in a real app, this would come from server data
  const expenses: any[] = [];
  const savingsGoals: any[] = [];
  const recentExpenses: any[] = [];
  const savingsProgress = { totalCurrent: 0, totalTarget: 0 };
  
  // Use real wallet data
  const monthlyExpenses = walletStats.monthlyExpenses;
  const weeklyExpenses = walletStats.monthlyExpenses / 4; // Approximate
  
  // Calculate financial health score
  const totalMonthlyOutflow = subscriptionStats.totalMonthly + monthlyExpenses;
  const emergencyMonths = totalMonthlyOutflow > 0 ? walletStats.wallet.balance / totalMonthlyOutflow : 0;
  const savingsRate = walletStats.totalIncome > 0 ? (savingsProgress.totalCurrent / walletStats.totalIncome) * 100 : 0;
  
  const financialHealthScore = Math.min(100, Math.max(0, 
    (emergencyMonths * 15) + (savingsRate * 2) + (walletStats.monthlyIncome > totalMonthlyOutflow ? 25 : 0)
  ));

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome back, {user.name || user.email}</p>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="group bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-blue-950/20 p-4 sm:p-6 rounded-2xl shadow-sm border border-blue-200/50 dark:border-blue-900/30 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm sm:text-base font-semibold text-gray-600 dark:text-gray-300">Active Subscriptions</h2>
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Bell className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">{subscriptions.length}</p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(subscriptionStats.totalMonthly)}/month
          </p>
        </div>
        <div className="group bg-gradient-to-br from-white to-red-50/50 dark:from-gray-800 dark:to-red-950/20 p-4 sm:p-6 rounded-2xl shadow-sm border border-red-200/50 dark:border-red-900/30 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm sm:text-base font-semibold text-gray-600 dark:text-gray-300">Monthly Outflow</h2>
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-red-600" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-red-600 mb-1">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalMonthlyOutflow)}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Subs + Expenses
          </p>
        </div>
        <div className="group bg-gradient-to-br from-white to-green-50/50 dark:from-gray-800 dark:to-green-950/20 p-4 sm:p-6 rounded-2xl shadow-sm border border-green-200/50 dark:border-green-900/30 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm sm:text-base font-semibold text-gray-600 dark:text-gray-300">Current Balance</h2>
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <Wallet className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(walletStats.wallet.balance)}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {emergencyMonths.toFixed(1)} months emergency fund
          </p>
        </div>
        <div className="group bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-800 dark:to-purple-950/20 p-4 sm:p-6 rounded-2xl shadow-sm border border-purple-200/50 dark:border-purple-900/30 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm sm:text-base font-semibold text-gray-600 dark:text-gray-300">Financial Health</h2>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              financialHealthScore >= 80 ? 'bg-green-100 dark:bg-green-900/30' :
              financialHealthScore >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/30' :
              financialHealthScore >= 40 ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              <TrendingUp className={`w-4 h-4 ${
                financialHealthScore >= 80 ? 'text-green-600' :
                financialHealthScore >= 60 ? 'text-yellow-600' :
                financialHealthScore >= 40 ? 'text-orange-600' : 'text-red-600'
              }`} />
            </div>
          </div>
          <p className={`text-2xl sm:text-3xl font-bold mb-1 ${
            financialHealthScore >= 80 ? 'text-green-600' :
            financialHealthScore >= 60 ? 'text-yellow-600' :
            financialHealthScore >= 40 ? 'text-orange-600' : 'text-red-600'
          }`}>
            {Math.round(financialHealthScore)}/100
          </p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {financialHealthScore >= 80 ? 'Excellent' :
             financialHealthScore >= 60 ? 'Good' :
             financialHealthScore >= 40 ? 'Fair' : 'Needs Work'}
          </p>
        </div>
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Subscriptions Summary */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <Bell className="w-5 h-5 mr-2 text-blue-600" />
              Subscriptions
            </h2>
            <Link href="/subscriptions" className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium px-3 py-1 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
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
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-red-600" />
              Expenses
            </h2>
            <Link href="/expenses" className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium px-3 py-1 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
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
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <PiggyBank className="w-5 h-5 mr-2 text-green-600" />
              Savings
            </h2>
            <Link href="/savings" className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium px-3 py-1 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
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

      {/* Analytics Preview */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 sm:p-6 rounded-2xl mb-6 sm:mb-8 border border-blue-200/50 dark:border-blue-800/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
          <div className="mb-3 sm:mb-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              Financial Insights
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Quick overview of your financial health</p>
          </div>
          <Link href="/analytics" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm px-4 py-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-all">
            View Analytics
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white/80 dark:bg-gray-800/80 p-3 sm:p-4 rounded-xl border border-white/20 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Monthly Income</p>
                <p className="font-bold text-green-600 text-sm sm:text-base">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(walletStats.monthlyIncome)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 dark:bg-gray-800/80 p-3 sm:p-4 rounded-xl border border-white/20 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Savings Rate</p>
                <p className="font-bold text-blue-600 text-sm sm:text-base">
                  {savingsRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 dark:bg-gray-800/80 p-3 sm:p-4 rounded-xl border border-white/20 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                walletStats.budgetRemaining >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
              }`}>
                <PiggyBank className={`w-5 h-5 ${
                  walletStats.budgetRemaining >= 0 ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Budget Remaining</p>
                <p className={`font-bold text-sm sm:text-base ${
                  walletStats.budgetRemaining >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(walletStats.budgetRemaining)}
                </p>
              </div>
            </div>
          </div>
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
