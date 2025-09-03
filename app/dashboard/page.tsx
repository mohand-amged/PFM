import { getUserSubscriptions, calculateSubscriptionStats } from '@/lib/subscriptions';
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

  let subscriptions: Subscription[] = [];
  let totalMonthly = 0;
  let totalAnnual = 0;
  let upcomingRenewals: Subscription[] = [];

  try {
    subscriptions = await getUserSubscriptions(user.id);
    const stats: SubscriptionStats = calculateSubscriptionStats(subscriptions);
    totalMonthly = stats.totalMonthly;
    totalAnnual = stats.totalAnnual;
    upcomingRenewals = stats.upcomingRenewals;
  } catch (error) {
    // Log error in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to load subscriptions:', error);
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user.name || user.email}</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-600">Active Subscriptions</h2>
          <p className="text-3xl font-bold mt-2">{subscriptions.length}</p>
          <Link href="/subscriptions" className="text-blue-600 text-sm hover:underline mt-2 inline-block">
            View all subscriptions →
          </Link>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-600">Monthly Cost</h2>
          <p className="text-3xl font-bold mt-2">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalMonthly)}
          </p>
          <Link href="/analytics" className="text-blue-600 text-sm hover:underline mt-2 inline-block">
            View spending breakdown →
          </Link>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-600">Annual Cost</h2>
          <p className="text-3xl font-bold mt-2">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalAnnual)}
          </p>
        </div>
      </div>

      {/* Upcoming Renewals */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Upcoming Renewals</h2>
          <Link href="/subscriptions" className="text-sm text-blue-600 hover:underline">
            View All
          </Link>
        </div>
        {upcomingRenewals.length > 0 ? (
          <div className="space-y-4">
            {upcomingRenewals.map((sub) => (
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link 
          href="/subscriptions/new" 
          className="bg-blue-600 text-white p-6 rounded-lg shadow hover:bg-blue-700 transition-colors block"
        >
          <h3 className="text-xl font-bold mb-2">Add New Subscription</h3>
          <p className="opacity-90">Track a new subscription service</p>
        </Link>
        <Link 
          href="/analytics" 
          className="bg-green-600 text-white p-6 rounded-lg shadow hover:bg-green-700 transition-colors block"
        >
          <h3 className="text-xl font-bold mb-2">View Analytics</h3>
          <p className="opacity-90">Analyze your subscription spending</p>
        </Link>
      </div>
    </div>
  );
}
