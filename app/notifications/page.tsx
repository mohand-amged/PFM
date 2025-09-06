import React from 'react';
import { getNotifications, getNotificationStats, markAllNotificationsRead } from '@/app/actions/notifications';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  CreditCard, 
  Wallet, 
  Target, 
  TrendingDown,
  Check,
  X
} from 'lucide-react';
import { markNotificationRead, deleteNotification } from '@/app/actions/notifications';

export const dynamic = 'force-dynamic';

function getNotificationIcon(type: string) {
  switch (type) {
    case 'SUBSCRIPTION_RENEWAL': return <CreditCard className="w-5 h-5 text-blue-600" />;
    case 'LOW_BALANCE': return <Wallet className="w-5 h-5 text-red-600" />;
    case 'GOAL_ACHIEVED': return <Target className="w-5 h-5 text-green-600" />;
    case 'BUDGET_EXCEEDED': return <TrendingDown className="w-5 h-5 text-orange-600" />;
    case 'SUCCESS': return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'WARNING': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    default: return <Info className="w-5 h-5 text-blue-600" />;
  }
}

function getNotificationBg(type: string, isRead: boolean) {
  const baseClasses = isRead ? 'bg-gray-50' : 'bg-white';
  switch (type) {
    case 'SUBSCRIPTION_RENEWAL': return `${baseClasses} border-l-4 border-l-blue-500`;
    case 'LOW_BALANCE': return `${baseClasses} border-l-4 border-l-red-500`;
    case 'GOAL_ACHIEVED': return `${baseClasses} border-l-4 border-l-green-500`;
    case 'BUDGET_EXCEEDED': return `${baseClasses} border-l-4 border-l-orange-500`;
    case 'SUCCESS': return `${baseClasses} border-l-4 border-l-green-500`;
    case 'WARNING': return `${baseClasses} border-l-4 border-l-yellow-500`;
    default: return `${baseClasses} border-l-4 border-l-blue-500`;
  }
}

function formatTimeAgo(date: Date | string) {
  const now = new Date();
  const notificationDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return notificationDate.toLocaleDateString();
}

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const [notifications, stats] = await Promise.all([
    getNotifications(),
    getNotificationStats(),
  ]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-2">
              Stay updated with your financial activities and alerts
            </p>
          </div>
          <div className="flex gap-3">
            {stats.unread > 0 && (
              <form action={markAllNotificationsRead}>
                <Button variant="outline" type="submit">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark All Read ({stats.unread})
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-600">Total Notifications</h3>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              stats.unread > 0 ? 'bg-red-100' : 'bg-green-100'
            }`}>
              <Bell className={`w-6 h-6 ${stats.unread > 0 ? 'text-red-600' : 'text-green-600'}`} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-600">Unread</h3>
              <p className="text-2xl font-bold">{stats.unread}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`p-6 transition-all hover:shadow-md ${getNotificationBg(notification.type, notification.isRead)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className={`font-semibold ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    <p className={`text-sm ${notification.isRead ? 'text-gray-500' : 'text-gray-700'} mb-2`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                      <div className="flex items-center space-x-2">
                        {!notification.isRead && (
                          <form action={markNotificationRead} className="inline">
                            <input type="hidden" name="id" value={notification.id} />
                            <Button
                              type="submit"
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          </form>
                        )}
                        <form action={deleteNotification} className="inline">
                          <input type="hidden" name="id" value={notification.id} />
                          <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No notifications yet</h3>
            <p className="text-gray-500 mb-6">
              You&apos;ll receive notifications for subscription renewals, budget alerts, savings goals, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="/dashboard">
                  Back to Dashboard
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/wallet">
                  Set Budget Alerts
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Notification Types Info */}
      <Card className="p-6 mt-8 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Notification Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-800 text-sm">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span><strong>Subscription Renewals:</strong> 3 days before renewal</span>
          </div>
          <div className="flex items-center space-x-2">
            <Wallet className="w-4 h-4" />
            <span><strong>Low Balance:</strong> When balance is below 10% of budget</span>
          </div>
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span><strong>Goals Achieved:</strong> When you reach savings targets</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingDown className="w-4 h-4" />
            <span><strong>Budget Exceeded:</strong> When monthly spending exceeds budget</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
