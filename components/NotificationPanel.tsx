'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, Clock, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { markNotificationRead, markAllNotificationsRead, deleteNotification } from '@/app/actions/notifications';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'SUBSCRIPTION_RENEWAL' | 'LOW_BALANCE' | 'GOAL_ACHIEVED' | 'BUDGET_EXCEEDED';
  isRead: boolean;
  createdAt: Date | string;
  data?: any;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationCountChange?: (count: number) => void;
}

function formatRelativeTime(date: Date | string) {
  const now = new Date();
  const notificationDate = typeof date === 'string' ? new Date(date) : date;
  const diffInMs = now.getTime() - notificationDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return notificationDate.toLocaleDateString();
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'SUCCESS':
    case 'GOAL_ACHIEVED':
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'WARNING':
    case 'SUBSCRIPTION_RENEWAL':
    case 'LOW_BALANCE':
      return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    case 'BUDGET_EXCEEDED':
      return <AlertTriangle className="w-5 h-5 text-red-600" />;
    default:
      return <Info className="w-5 h-5 text-blue-600" />;
  }
}

function getNotificationBgColor(type: string) {
  switch (type) {
    case 'SUCCESS':
    case 'GOAL_ACHIEVED':
      return 'bg-green-50 border-green-200';
    case 'WARNING':
    case 'SUBSCRIPTION_RENEWAL':
    case 'LOW_BALANCE':
      return 'bg-yellow-50 border-yellow-200';
    case 'BUDGET_EXCEEDED':
      return 'bg-red-50 border-red-200';
    default:
      return 'bg-blue-50 border-blue-200';
  }
}

export default function NotificationPanel({ isOpen, onClose, onNotificationCountChange }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch notifications when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        
        // Update notification count in parent
        const unreadCount = data.filter((n: Notification) => !n.isRead).length;
        onNotificationCountChange?.(unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const formData = new FormData();
      formData.append('id', notificationId);
      await markNotificationRead(formData);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      
      // Update count
      const unreadCount = notifications.filter(n => n.id !== notificationId && !n.isRead).length;
      onNotificationCountChange?.(unreadCount);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsRead();
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      
      // Update count
      onNotificationCountChange?.(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      const formData = new FormData();
      formData.append('id', notificationId);
      await deleteNotification(formData);
      
      // Update local state
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Update count if it was unread
      if (notification && !notification.isRead) {
        const unreadCount = notifications.filter(n => n.id !== notificationId && !n.isRead).length;
        onNotificationCountChange?.(unreadCount);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const NotificationContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No notifications</p>
            <p className="text-gray-400 text-sm">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`relative p-4 rounded-lg border transition-all duration-200 ${
                  notification.isRead 
                    ? 'bg-gray-50 border-gray-200 opacity-75' 
                    : `${getNotificationBgColor(notification.type)} shadow-sm`
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={`font-medium text-sm ${
                        notification.isRead ? 'text-gray-600' : 'text-gray-900'
                      }`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="h-6 w-6 p-0 hover:bg-gray-200"
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(notification.id)}
                          className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className={`text-sm mb-2 ${
                      notification.isRead ? 'text-gray-500' : 'text-gray-700'
                    }`}>
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center text-xs text-gray-400">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatRelativeTime(notification.createdAt)}
                    </div>
                  </div>
                </div>
                
                {!notification.isRead && (
                  <div className="absolute top-4 left-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[90vw] h-[80vh] p-0">
          <NotificationContent />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[400px] p-0">
        <NotificationContent />
      </SheetContent>
    </Sheet>
  );
}
