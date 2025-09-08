'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import ClearButton from '@/components/ui/clear-button';
import { clearNotifications } from '@/app/actions/clear-data';
import { markAllNotificationsRead } from '@/app/actions/notifications';
import { CheckCircle } from 'lucide-react';

interface NotificationsHeaderProps {
  unreadCount: number;
}

export default function NotificationsHeader({ unreadCount }: NotificationsHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600 mt-2">
          Stay updated with your financial activities and alerts
        </p>
      </div>
      <div className="flex gap-3">
        {unreadCount > 0 && (
          <form action={markAllNotificationsRead}>
            <Button variant="outline" type="submit">
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark All Read ({unreadCount})
            </Button>
          </form>
        )}
        <ClearButton 
          pageType="notifications" 
          onClear={async () => {
            await clearNotifications();
            window.location.reload();
          }}
          size="default"
          variant="outline"
          className=""
        />
      </div>
    </div>
  );
}
