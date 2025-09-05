import { getUserSubscriptions, calculateSubscriptionStats } from '@/lib/subscriptions';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardClient from '@/components/DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  // Initialize subscription data
  let subscriptions: any[] = [];
  let subscriptionStats = {
    totalMonthly: 0,
    totalAnnual: 0,
    upcomingRenewals: [],
  };

  try {
    // Load subscription data
    subscriptions = await getUserSubscriptions(user.id);
    subscriptionStats = calculateSubscriptionStats(subscriptions);
  } catch (error) {
    // Log error in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to load subscription data:', error);
    }
  }

  return (
    <DashboardClient
      user={user}
      subscriptions={subscriptions}
      subscriptionStats={subscriptionStats}
    />
  );
}
