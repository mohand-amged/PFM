'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Bell, PiggyBank } from 'lucide-react';
import ExpensesTab from './ExpensesTab';
import SubscriptionsTab from './SubscriptionsTab';
import SavingsTab from './SavingsTab';

export default function TransactionTabs() {
  const [activeTab, setActiveTab] = useState('expenses');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="expenses" className="flex items-center gap-2">
          <CreditCard size={16} />
          Expenses
        </TabsTrigger>
        <TabsTrigger value="subscriptions" className="flex items-center gap-2">
          <Bell size={16} />
          Subscriptions
        </TabsTrigger>
        <TabsTrigger value="savings" className="flex items-center gap-2">
          <PiggyBank size={16} />
          Savings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="expenses" className="mt-6">
        <ExpensesTab />
      </TabsContent>

      <TabsContent value="subscriptions" className="mt-6">
        <SubscriptionsTab />
      </TabsContent>

      <TabsContent value="savings" className="mt-6">
        <SavingsTab />
      </TabsContent>
    </Tabs>
  );
}
