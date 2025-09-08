'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ClearButton from '@/components/ui/clear-button';
import { clearSavings } from '@/app/actions/clear-data';
import { Plus } from 'lucide-react';

export default function SavingsHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Savings</h1>
        <p className="text-gray-600 mt-2">Track your saving goals and build financial security</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/savings/new">
          <Button className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Saving Goal
          </Button>
        </Link>
        <ClearButton 
          pageType="savings" 
          onClear={async () => {
            await clearSavings();
            window.location.reload();
          }}
          size="default"
          className="w-full sm:w-auto"
        />
      </div>
    </div>
  );
}
