'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ClearButton from '@/components/ui/clear-button';
import { resetProfileData } from '@/app/actions/clear-data';

export default function ProfileActions() {
  return (
    <div className="space-y-2">
      <Button className="w-full" asChild>
        <Link href="/dashboard">
          View Dashboard
        </Link>
      </Button>
      <Button variant="outline" className="w-full" asChild>
        <Link href="/analytics">
          Analytics
        </Link>
      </Button>
      <Button variant="outline" className="w-full" asChild>
        <Link href="/settings">
          Settings
        </Link>
      </Button>
      <ClearButton 
        pageType="profile" 
        onClear={async () => {
          await resetProfileData();
          window.location.reload();
        }}
        size="default"
        variant="outline"
        className="w-full"
      />
    </div>
  );
}
