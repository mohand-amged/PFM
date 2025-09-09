'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotificationPanel from './NotificationPanel';

interface NotificationBellProps {
  unreadCount?: number;
  onCountChange?: (count: number) => void;
}

export default function NotificationBell({ unreadCount = 0, onCountChange }: NotificationBellProps) {
  const [count, setCount] = useState(unreadCount);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setCount(unreadCount);
  }, [unreadCount]);

  const handleNotificationCountChange = (newCount: number) => {
    setCount(newCount);
    onCountChange?.(newCount);
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setIsOpen(true)}
        className="relative"
        data-notification-bell
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </Button>
      
      <NotificationPanel 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        onNotificationCountChange={handleNotificationCountChange}
      />
    </>
  );
}
