import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ThemeRadioGroup } from '@/components/theme-toggle';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { 
  Palette, 
  Bell, 
  Shield, 
  Download, 
  Trash2, 
  DollarSign, 
  Globe, 
  User, 
  ArrowLeft,
  Mail,
  Clock
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/profile">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your application preferences and account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appearance Settings */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Palette className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Appearance</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-foreground mb-2">Theme</h3>
                <p className="text-sm text-muted-foreground mb-4">Choose your preferred color scheme for the application.</p>
                <ThemeRadioGroup />
              </div>
            </div>
          </Card>

          {/* Account Settings */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Account</h2>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-foreground mb-2">Profile Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="text-foreground">{user.name || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="text-foreground">{user.email}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Profile editing functionality will be available soon.</p>
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">Email Notifications</h3>
                    <p className="text-sm text-muted-foreground">Receive emails about subscription renewals</p>
                  </div>
                  <Switch disabled />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Email notifications will be available in a future update.</p>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">Push Notifications</h3>
                    <p className="text-sm text-muted-foreground">Get notified about upcoming renewals</p>
                  </div>
                  <Switch disabled />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Push notifications will be available in a future update.</p>
              </div>
            </div>
          </Card>

          {/* Financial Settings */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <DollarSign className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Financial</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-foreground">Default Currency</h3>
                <p className="text-sm text-muted-foreground mb-2">Currently set to USD</p>
                <Button variant="outline" size="sm" disabled>
                  <Globe className="w-4 h-4 mr-2" />
                  Change Currency
                </Button>
                <p className="text-xs text-muted-foreground mt-2">Multi-currency support coming soon.</p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium text-foreground">Renewal Reminders</h3>
                <p className="text-sm text-muted-foreground mb-2">Get notified before subscriptions renew</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">7 days before</span>
                    <Switch disabled />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">1 day before</span>
                    <Switch disabled />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Reminder settings will be available in a future update.</p>
              </div>
            </div>
          </Card>

          {/* Privacy & Security */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Privacy & Security</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-foreground">Data Privacy</h3>
                <p className="text-sm text-muted-foreground mb-2">Control how your data is used and stored</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Analytics data collection</span>
                    <Switch disabled />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Usage statistics</span>
                    <Switch disabled />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Privacy settings will be available in a future update.</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start" disabled>
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/profile">
                  <User className="w-4 h-4 mr-2" />
                  View Profile
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </Card>

          {/* Account Info */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Account Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Member since:</span>
                <span className="text-foreground">Jan 2024</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Account type:</span>
                <span className="text-foreground">Free</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="p-6 border-red-200 dark:border-red-900">
            <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-foreground">Delete Account</h4>
                <p className="text-sm text-muted-foreground mb-3">Permanently delete your account and all associated data. This action cannot be undone.</p>
                <Button variant="destructive" size="sm" disabled>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
                <p className="text-xs text-muted-foreground mt-2">Account deletion will be available in a future update.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
