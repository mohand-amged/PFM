import React from 'react';
import { getUserSubscriptions, getSpendingByCategory } from '@/lib/subscriptions';
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

  let subscriptions: Subscription[] = [];
  let chartData: CategoryData[] = [];

  try {
    subscriptions = await getUserSubscriptions(user.id);
    chartData = getSpendingByCategory(subscriptions);
  } catch (error) {
    // Log error in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to load subscriptions:', error);
    }
  }

  const totalSpending = subscriptions.reduce((sum, sub) => sum + sub.price, 0);
  const averageMonthlySpending = totalSpending / (subscriptions.length || 1);
  const mostExpensiveSubscription = [...subscriptions].sort((a, b) => b.price - a.price)[0];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Spending Analytics</h1>
            <p className="text-gray-600 mt-2">Analyze your subscription spending patterns</p>
          </div>
          <Button asChild>
            <Link href="/subscriptions">
              Manage Subscriptions
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-600">Total Monthly Spending</h2>
          <p className="text-3xl font-bold mt-2">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalSpending)}
          </p>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-600">Average Subscription</h2>
          <p className="text-3xl font-bold mt-2">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(averageMonthlySpending)}
          </p>
          <p className="text-sm text-gray-500 mt-1">per month</p>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-600">Most Expensive</h2>
          {mostExpensiveSubscription ? (
            <>
              <p className="text-xl font-bold mt-2">{mostExpensiveSubscription.name}</p>
              <p className="text-2xl font-bold text-red-600">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(mostExpensiveSubscription.price)}
              </p>
            </>
          ) : (
            <p className="text-gray-500 mt-2">No subscriptions</p>
          )}
        </Card>
      </div>

      {/* Spending by Category */}
      <Card className="p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Spending by Category</h2>
          <Link href="/subscriptions" className="text-sm text-blue-600 hover:underline">
            View All Subscriptions →
          </Link>
        </div>
        
        {chartData.length > 0 ? (
          <div className="h-96">
            <SpendingChart data={chartData} />
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No subscription data available</h3>
              <p className="text-gray-500 mb-4">Add your first subscription to see analytics and spending insights.</p>
              <Button asChild>
                <Link href="/subscriptions/new">
                  Add Your First Subscription
                </Link>
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Category Breakdown */}
      {chartData.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">Category Breakdown</h2>
          <div className="space-y-4">
            {chartData.map((category) => (
              <div key={category.name}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-gray-900">{category.name}</span>
                  <span className="font-semibold text-gray-900">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(category.value)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${(category.value / totalSpending) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1 text-right">
                  {((category.value / totalSpending) * 100).toFixed(1)}% of total spending
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {subscriptions.length === 0 && (
        <Card className="p-8 text-center">
          <div className="max-w-md mx-auto">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start tracking your subscriptions</h3>
            <p className="text-gray-500 mb-6">Add your first subscription to begin analyzing your spending patterns and get insights into your monthly costs.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="/subscriptions/new">
                  Add Subscription
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
    </div>
  );
}
