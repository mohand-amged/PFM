import React from 'react'
import { getUserSubscriptions, getSpendingByCategory } from '@/lib/subscriptions';
import SpendingChart from '@/app/components/SpendingChart';
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

interface CategoryData {
  name: string;
  value: number;
}

export default async function AnalyticsPage() {
  let subscriptions: Subscription[] = [];
  let chartData: CategoryData[] = [];

  try {
    subscriptions = await getUserSubscriptions();
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
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Spending Analytics</h1>
        <Link 
          href="/subscriptions" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Manage Subscriptions
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-600">Total Monthly Spending</h2>
          <p className="text-3xl font-bold mt-2">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalSpending)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-600">Average Subscription</h2>
          <p className="text-3xl font-bold mt-2">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(averageMonthlySpending)}
          </p>
          <p className="text-sm text-gray-500 mt-1">per month</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
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
        </div>
      </div>

      {/* Spending by Category */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Spending by Category</h2>
          <Link href="/subscriptions" className="text-sm text-blue-600 hover:underline">
            View All Subscriptions
          </Link>
        </div>
        
        {chartData.length > 0 ? (
          <div className="h-96">
            <SpendingChart data={chartData} />
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No subscription data available</p>
            <Link 
              href="/subscriptions/new" 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Subscription
            </Link>
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      {chartData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-6">Category Breakdown</h2>
          <div className="space-y-4">
            {chartData.map((category) => (
              <div key={category.name}>
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{category.name}</span>
                  <span className="font-semibold">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(category.value)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${(category.value / totalSpending) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1 text-right">
                  {((category.value / totalSpending) * 100).toFixed(1)}% of total
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}