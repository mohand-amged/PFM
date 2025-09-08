'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ClearButton from '@/components/ui/clear-button';
import { clearSubscriptions } from '@/app/actions/clear-data';
import { Plus } from 'lucide-react';

export default function SubscriptionsHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Subscriptions</h1>
        <p className="text-gray-600 mt-2">Manage all your recurring subscriptions in one place</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/subscriptions/new">
          <Button className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Subscription
          </Button>
        </Link>
        <ClearButton 
          pageType="subscriptions" 
          onClear={async () => {
            await clearSubscriptions();
            window.location.reload();
          }}
          size="default"
          className="w-full sm:w-auto"
        />
      </div>
    </div>
  );
}
