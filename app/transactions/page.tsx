import { Suspense } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import TransactionTabs from '@/components/transactions/TransactionTabs';

export const metadata = {
  title: 'Transactions - Personal Finance Tracker',
  description: 'Manage all your expenses, subscriptions, and savings in one place.',
};

export default async function TransactionsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            Manage your expenses, subscriptions, and savings all in one place.
          </p>
        </div>

        {/* Transaction Tabs */}
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }>
          <TransactionTabs />
        </Suspense>
      </div>
    </div>
  );
}
