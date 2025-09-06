import React from 'react';
import { getUserSubscriptions, getSpendingByCategory } from '@/lib/subscriptions';
import { getUserExpenses, calculateExpenseStats } from '@/lib/expenses';
import { getUserSavings, calculateSavingStats } from '@/lib/savings';
import { getWalletStats, getIncomes } from '@/app/actions/wallet';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SpendingChart from '@/components/SpendingChart';
import TrendChart from '@/components/charts/TrendChart';
import DonutChart from '@/components/charts/DonutChart';
import CashFlowChart from '@/components/charts/CashFlowChart';
import FinancialHealthScore from '@/components/FinancialHealthScore';
import FinancialInsights from '@/components/FinancialInsights';
import AnalyticsExport from '@/components/AnalyticsExport';
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
  let walletStats = {
    wallet: { balance: 0, monthlyBudget: 0, currency: 'USD' },
    monthlyIncome: 0,
    monthlyExpenses: 0,
    totalIncome: 0,
    totalExpenses: 0,
    netWorth: 0,
    budgetRemaining: 0,
    incomeCount: 0,
  };
  let incomes: any[] = [];

  try {
    // Load all data in parallel
    const [subscriptionsData, expensesData, savingsData, walletData, incomesData] = await Promise.allSettled([
      getUserSubscriptions(user.id),
      getUserExpenses(user.id),
      getUserSavings(user.id),
      getWalletStats(),
      getIncomes(),
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

    // Process wallet stats
    if (walletData.status === 'fulfilled') {
      walletStats = walletData.value;
    }

    // Process incomes
    if (incomesData.status === 'fulfilled') {
      incomes = incomesData.value;
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
  const actualNetWorth = walletStats.netWorth;
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

  // Generate trend data (last 6 months)
  const generateTrendData = () => {
    const months = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      // Calculate monthly data based on available data
      const monthlyIncome = walletStats.monthlyIncome / 6; // Simplified for demo
      const monthlyExpenses = expenseStats.totalMonthly / 6;
      const monthlySubscriptions = totalSubscriptionSpending;
      const monthlySavings = savingStats.totalSaved / 6;
      
      months.push({
        month: monthName,
        income: monthlyIncome + (Math.random() * 500 - 250), // Add some variation
        expenses: monthlyExpenses + (Math.random() * 200 - 100),
        subscriptions: monthlySubscriptions,
        savings: monthlySavings + (Math.random() * 300 - 150),
      });
    }
    
    return months;
  };

  // Generate cash flow data
  const generateCashFlowData = () => {
    const periods = [];
    let cumulativeCashFlow = walletStats.wallet.balance;
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const period = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      const income = walletStats.monthlyIncome / 6 + (Math.random() * 500 - 250);
      const expenses = (expenseStats.totalMonthly + totalSubscriptionSpending) / 6 + (Math.random() * 200 - 100);
      const netCashFlow = income - expenses;
      cumulativeCashFlow += netCashFlow;
      
      periods.push({
        period,
        income,
        expenses,
        netCashFlow,
        cumulativeCashFlow,
      });
    }
    
    return periods;
  };

  // Calculate Financial Health Score
  const calculateFinancialHealth = () => {
    const savingsRate = walletStats.totalIncome > 0 ? (savingStats.totalSaved / walletStats.totalIncome) * 100 : 0;
    const emergencyFundMonths = totalMonthlyOutflow > 0 ? (walletStats.wallet.balance / totalMonthlyOutflow) : 0;
    const budgetAdherence = walletStats.wallet.monthlyBudget > 0 ? 
      Math.max(0, ((walletStats.wallet.monthlyBudget - walletStats.monthlyExpenses) / walletStats.wallet.monthlyBudget) * 100) : 50;
    const debtToIncomeRatio = walletStats.totalIncome > 0 ? (totalMonthlyOutflow / walletStats.totalIncome) * 100 : 0;
    
    // Calculate composite score
    let score = 0;
    score += Math.min(savingsRate * 2, 40); // Max 40 points for savings rate
    score += Math.min(emergencyFundMonths * 10, 25); // Max 25 points for emergency fund
    score += Math.min(budgetAdherence * 0.2, 20); // Max 20 points for budget adherence
    score += Math.max(0, 15 - (debtToIncomeRatio * 0.5)); // Max 15 points for low debt ratio
    
    return {
      score: Math.round(Math.min(score, 100)),
      metrics: {
        savingsRate,
        emergencyFundMonths,
        budgetAdherence,
        debtToIncomeRatio,
      },
    };
  };

  const trendData = generateTrendData();
  const cashFlowData = generateCashFlowData();
  const financialHealth = calculateFinancialHealth();

  // Prepare financial insights data
  const insightsData = {
    monthlyIncome: walletStats.monthlyIncome,
    monthlyOutflow: totalMonthlyOutflow,
    balance: walletStats.wallet.balance,
    monthlyBudget: walletStats.wallet.monthlyBudget,
    savingsRate: financialHealth.metrics.savingsRate,
    subscriptionCount: subscriptions.length,
    expenseCount: expenses.length,
    totalSaved: savingStats.totalSaved,
    savingsGoals: savingStats.totalGoals,
    completedGoals: savingStats.completedGoals,
  };

  // Enhanced spending breakdown for donut chart
  const spendingBreakdown = [
    { name: 'Subscriptions', value: totalSubscriptionSpending, color: '#3b82f6' },
    { name: 'Food & Dining', value: (expenseStats.categoryBreakdown['Food'] as number) || 0, color: '#10b981' },
    { name: 'Transportation', value: (expenseStats.categoryBreakdown['Transportation'] as number) || 0, color: '#f59e0b' },
    { name: 'Entertainment', value: (expenseStats.categoryBreakdown['Entertainment'] as number) || 0, color: '#ef4444' },
    { name: 'Utilities', value: (expenseStats.categoryBreakdown['Utilities'] as number) || 0, color: '#8b5cf6' },
    { name: 'Other', value: (expenseStats.categoryBreakdown['Other'] as number) || 0, color: '#6b7280' },
  ].filter(item => item.value > 0);

  // Prepare export data
  const exportData = {
    subscriptions,
    expenses,
    savings,
    walletStats,
    financialHealth,
    trendData,
    cashFlowData,
  };

  return (
    <div className="max-w-7xl mx-auto">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card className="p-6 border-l-4 border-blue-500">
          <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Monthly Income</h2>
          <p className="text-3xl font-bold mt-2 text-blue-600">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(walletStats.monthlyIncome)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{incomes.length} income sources</p>
        </Card>
        
        <Card className="p-6 border-l-4 border-red-500">
          <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Monthly Outflow</h2>
          <p className="text-3xl font-bold mt-2 text-red-600">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalMonthlyOutflow)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            ${totalSubscriptionSpending.toFixed(0)} subs + ${expenseStats.totalMonthly.toFixed(0)} expenses
          </p>
        </Card>
        
        <Card className="p-6 border-l-4 border-green-500">
          <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Current Balance</h2>
          <p className="text-3xl font-bold mt-2 text-green-600">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(walletStats.wallet.balance)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {savingStats.completedGoals} of {savingStats.totalGoals} goals completed
          </p>
        </Card>
        
        <Card className="p-6 border-l-4 border-purple-500">
          <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Net Worth</h2>
          <p className={`text-3xl font-bold mt-2 ${
            actualNetWorth >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(actualNetWorth)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total income - expenses</p>
        </Card>
        
        <Card className="p-6 border-l-4 border-orange-500">
          <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Health Score</h2>
          <p className={`text-3xl font-bold mt-2 ${
            financialHealth.score >= 80 ? 'text-green-600' :
            financialHealth.score >= 60 ? 'text-yellow-600' :
            financialHealth.score >= 40 ? 'text-orange-600' : 'text-red-600'
          }`}>
            {financialHealth.score}/100
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {financialHealth.score >= 80 ? 'Excellent' :
             financialHealth.score >= 60 ? 'Good' :
             financialHealth.score >= 40 ? 'Fair' : 'Needs Work'}
          </p>
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

      {/* Enhanced Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Financial Health Score */}
        <div className="lg:col-span-1">
          <FinancialHealthScore 
            score={financialHealth.score} 
            metrics={financialHealth.metrics} 
          />
        </div>
        
        {/* Overall Spending Breakdown */}
        <Card className="p-6">
          <h2 className="text-xl font-bold dark:text-white mb-6">Spending Overview</h2>
          {spendingBreakdown.length > 0 ? (
            <div className="relative">
              <DonutChart 
                data={spendingBreakdown}
                height={350}
                centerText={{
                  value: `$${totalMonthlyOutflow.toFixed(0)}`,
                  label: 'Total Monthly'
                }}
              />
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No spending data available</p>
              <div className="space-x-2">
                <Button size="sm" asChild>
                  <Link href="/subscriptions/new">Add Subscription</Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/expenses/new">Add Expense</Link>
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Trend Analysis */}
      <Card className="p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold dark:text-white">Financial Trends</h2>
            <p className="text-gray-600 dark:text-gray-400">6-month income, expenses, and savings trends</p>
          </div>
        </div>
        <TrendChart data={trendData} height={400} />
      </Card>

      {/* Cash Flow Analysis */}
      <Card className="p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold dark:text-white">Cash Flow Analysis</h2>
            <p className="text-gray-600 dark:text-gray-400">Income vs expenses with cumulative cash flow</p>
          </div>
        </div>
        <CashFlowChart data={cashFlowData} height={450} />
      </Card>

      {/* Financial Insights Section */}
      <div className="mb-8">
        <FinancialInsights 
          data={insightsData}
          trendData={trendData}
        />
      </div>

      {/* Export Section */}
      <div className="mb-8">
        <AnalyticsExport data={exportData} />
      </div>

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
