import React from 'react';
import { getUserSubscriptions } from '@/lib/subscriptions';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { deleteSubscription } from '@/app/actions/subscription';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import SubscriptionsHeader from '@/components/SubscriptionsHeader';
import { Trash2, Edit, Plus, Calendar, DollarSign } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Subscription {
  id: string;
  name: string;
  price: number;
  billingDate: Date;
  categories: string[];
  description?: string;
}

function formatDisplayDate(d: Date | string) {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString();
}

function getDaysUntilBilling(billingDate: Date | string) {
  const today = new Date();
  const billing = new Date(billingDate);
  const diffTime = billing.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export default async function SubscriptionsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  let subscriptions: Subscription[] = [];

  try {
    subscriptions = await getUserSubscriptions(user.id);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to load subscriptions:', error);
    }
  }

  const totalMonthlySpending = subscriptions.reduce((sum, sub) => sum + sub.price, 0);
  const upcomingRenewals = subscriptions.filter(sub => {
    const daysUntil = getDaysUntilBilling(sub.billingDate);
    return daysUntil >= 0 && daysUntil <= 7;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <SubscriptionsHeader />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-600">Total Monthly</h3>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalMonthlySpending)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-600">Active Subscriptions</h3>
              <p className="text-2xl font-bold">{subscriptions.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-600">Renewals This Week</h3>
              <p className="text-2xl font-bold">{upcomingRenewals.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Subscriptions List */}
      {subscriptions.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {subscriptions.map((sub) => {
            const daysUntil = getDaysUntilBilling(sub.billingDate);
            const isUpcoming = daysUntil >= 0 && daysUntil <= 7;
            const isOverdue = daysUntil < 0;

            return (
              <Card key={sub.id} className={`p-4 sm:p-6 transition-all hover:shadow-md ${isUpcoming ? 'ring-2 ring-orange-200' : ''} ${isOverdue ? 'ring-2 ring-red-200' : ''}`}>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{sub.name}</h2>
                      <div className="flex flex-wrap gap-2">
                        {isUpcoming && (
                          <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                            Renews in {daysUntil} days
                          </span>
                        )}
                        {isOverdue && (
                          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            Overdue
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 flex-shrink-0" />
                        <span className="text-base sm:text-lg font-semibold">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(sub.price)}
                        </span>
                        <span className="text-sm">per month</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">
                          Next: {formatDisplayDate(sub.billingDate)}
                        </span>
                      </div>
                    </div>

                    {sub.description && (
                      <p className="text-sm sm:text-base text-gray-600 mb-3 line-clamp-2">{sub.description}</p>
                    )}

                    {sub.categories && sub.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3 sm:mb-0">
                        {sub.categories.map((category) => (
                          <span
                            key={category}
                            className="px-3 py-1 text-xs sm:text-sm font-medium bg-blue-100 text-blue-800 rounded-full"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-2 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <Link href={`/subscriptions/${sub.id}/edit`}>
                        <Button variant="outline" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0 touch-manipulation">
                          <Edit className="w-4 h-4" />
                          <span className="sr-only">Edit subscription</span>
                        </Button>
                      </Link>
                      
                      <form action={deleteSubscription}>
                        <input type="hidden" name="id" value={sub.id} />
                        <Button
                          type="submit"
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 sm:h-9 sm:w-9 p-0 touch-manipulation"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="sr-only">Delete subscription</span>
                        </Button>
                      </form>
                    </div>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No subscriptions yet</h3>
            <p className="text-gray-500 mb-6">
              Start tracking your recurring payments by adding your first subscription. 
              Keep track of costs, renewal dates, and spending patterns.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/subscriptions/new">
                <Button className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Subscription
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full sm:w-auto">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Upcoming Renewals Alert */}
      {upcomingRenewals.length > 0 && (
        <Card className="p-4 sm:p-6 mt-6 sm:mt-8 bg-orange-50 border-orange-200">
          <div className="flex items-start">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-orange-900 mb-2">
                Upcoming Renewals ({upcomingRenewals.length})
              </h3>
              <p className="text-orange-700 mb-3">
                You have {upcomingRenewals.length} subscription{upcomingRenewals.length !== 1 ? 's' : ''} renewing within the next 7 days.
              </p>
              <div className="space-y-2">
                {upcomingRenewals.map((sub) => (
                  <div key={sub.id} className="flex justify-between items-center text-sm">
                    <span className="font-medium text-orange-900">{sub.name}</span>
                    <span className="text-orange-700">
                      {formatDisplayDate(sub.billingDate)} - {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(sub.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
