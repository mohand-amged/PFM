'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Bell, DollarSign } from 'lucide-react';
import PreferenceToggle from './PreferenceToggle';

interface SettingsClientProps {
  preferences: {
    id: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    reminderSevenDays: boolean;
    reminderOneDay: boolean;
    reminderSameDay: boolean;
    weeklyDigest: boolean;
    monthlyReport: boolean;
  };
}

export default function SettingsClient({ preferences: initialPreferences }: SettingsClientProps) {
  const [preferences, setPreferences] = useState(initialPreferences);

  const handlePreferenceChange = (preference: string, newValue: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [preference]: newValue
    }));
  };

  return (
    <>
      {/* Account Settings */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
        </div>
        <div className="space-y-6">
          <div className="space-y-4">
            <PreferenceToggle
              preference="emailNotifications"
              currentValue={preferences.emailNotifications}
              label="Email Notifications"
              description="Receive emails about subscription renewals and updates"
              disabled
            />
            <PreferenceToggle
              key={`pushNotifications-${preferences.pushNotifications}`}
              preference="pushNotifications"
              currentValue={preferences.pushNotifications}
              label="Push Notifications"
              description="Get browser notifications about upcoming renewals"
              onPreferenceChange={handlePreferenceChange}
            />
            <PreferenceToggle
              preference="weeklyDigest"
              currentValue={preferences.weeklyDigest}
              label="Weekly Digest"
              description="Receive a weekly summary of your expenses and subscriptions"
              disabled
            />
            <PreferenceToggle
              preference="monthlyReport"
              currentValue={preferences.monthlyReport}
              label="Monthly Report"
              description="Get a detailed monthly financial report"
              disabled
            />
          </div>
          
          {/* Info message when push notifications are disabled */}
          {!preferences.pushNotifications && (
            <div className="mt-6 p-4 bg-muted/30 border border-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-medium text-muted-foreground">Renewal Reminder Settings</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Enable push notifications above to configure when you want to be notified before subscriptions renew.
              </p>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  💡 Turn on push notifications to unlock renewal reminder settings with options for 7 days before, 1 day before, and same day notifications.
                </p>
              </div>
            </div>
          )}
          
          {/* Renewal Reminders - Conditional Section */}
          {preferences.pushNotifications && (
            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg animate-in fade-in-50 slide-in-from-top-3 duration-300">
              <div className="flex items-center gap-2 mb-3">
                <Bell className="w-5 h-5 text-primary" />
                <h3 className="font-medium text-foreground">Renewal Reminder Settings</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Configure when you want to be notified before subscriptions renew</p>
              <div className="space-y-3">
                <PreferenceToggle
                  preference="reminderSevenDays"
                  currentValue={preferences.reminderSevenDays}
                  label="7 days before"
                  description="Get reminded a week before subscription renewals"
                  onPreferenceChange={handlePreferenceChange}
                />
                <PreferenceToggle
                  preference="reminderOneDay"
                  currentValue={preferences.reminderOneDay}
                  label="1 day before"
                  description="Get reminded the day before subscription renewals"
                  onPreferenceChange={handlePreferenceChange}
                />
                <PreferenceToggle
                  preference="reminderSameDay"
                  currentValue={preferences.reminderSameDay}
                  label="Same day"
                  description="Get reminded on the day of renewal"
                  onPreferenceChange={handlePreferenceChange}
                />
              </div>
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-xs text-muted-foreground">
                  ✅ Renewal reminders are now functional! These notifications will be sent to your browser when enabled.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </>
  );
}
