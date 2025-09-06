import { getUserSubscriptions, calculateSubscriptionStats } from '@/lib/subscriptions';
import { getWalletStats } from '@/app/actions/wallet';
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

  try {
    // Load subscription and wallet data in parallel
    const [subscriptionsResult, walletResult] = await Promise.allSettled([
      getUserSubscriptions(user.id),
      getWalletStats(),
    ]);
    
    if (subscriptionsResult.status === 'fulfilled') {
      subscriptions = subscriptionsResult.value;
      subscriptionStats = calculateSubscriptionStats(subscriptions);
    }
    
    if (walletResult.status === 'fulfilled') {
      walletStats = walletResult.value;
    }
  } catch (error) {
    // Log error in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to load dashboard data:', error);
    }
  }

  return (
    <DashboardClient
      user={user}
      subscriptions={subscriptions}
      subscriptionStats={subscriptionStats}
      walletStats={walletStats}
    />
  );
}
