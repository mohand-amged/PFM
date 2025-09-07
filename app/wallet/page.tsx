import React from 'react';
import { getWallet, getWalletStats, getIncomes } from '@/app/actions/wallet';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import WalletClient from '@/components/wallet/wallet-client';

export const dynamic = 'force-dynamic';

export default async function WalletPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  try {
    const [wallet, stats, incomes] = await Promise.all([
      getWallet(),
      getWalletStats(),
      getIncomes(),
    ]);

    return (
      <WalletClient 
        stats={stats} 
        incomes={incomes} 
        wallet={wallet} 
      />
    );
  } catch (error) {
    console.error('Error loading wallet data:', error);
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Wallet</h1>
          <p className="text-gray-600 mt-2">Manage your balance, budget, and income</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Wallet</h2>
          <p className="text-red-700 mb-4">There was an issue loading your wallet data. Please refresh the page or try again later.</p>
          <a 
            href="/wallet" 
            className="inline-block bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Refresh Page
          </a>
        </div>
      </div>
    );
  }
}
