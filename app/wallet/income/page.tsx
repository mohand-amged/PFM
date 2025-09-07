import React from 'react';
import { getWallet, getWalletStats, getIncomes } from '@/app/actions/wallet';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import IncomeManagementClient from '@/components/wallet/income-management-client';

export const dynamic = 'force-dynamic';

export default async function IncomeManagementPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const [wallet, stats, incomes] = await Promise.all([
    getWallet(),
    getWalletStats(),
    getIncomes(),
  ]);

  return (
    <IncomeManagementClient 
      stats={stats} 
      incomes={incomes} 
      wallet={wallet} 
    />
  );
}
