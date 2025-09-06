'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationBellProps {
  unreadCount?: number;
}

export default function NotificationBell({ unreadCount = 0 }: NotificationBellProps) {
  const [count, setCount] = useState(unreadCount);

  // In a real app, you'd fetch this from an API or WebSocket
  useEffect(() => {
    setCount(unreadCount);
  }, [unreadCount]);

  return (
    <Button variant="ghost" size="sm" asChild>
      <Link href="/notifications" className="relative">
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </Link>
    </Button>
  );
}
