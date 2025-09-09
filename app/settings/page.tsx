import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getWallet, updateWallet } from '@/app/actions/wallet';
import { getUserPreferences } from '@/app/actions/preferences';
import db from '@/lib/db';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ThemeRadioGroup } from '@/components/theme-toggle';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import DangerZone from '@/components/settings/danger-zone';
import PreferenceToggle from '@/components/settings/PreferenceToggle';
import SettingsClient from '@/components/settings/SettingsClient';
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
  Clock,
  Database,
  Settings as SettingsIcon
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ExportData from '@/components/data/ExportData';
import ImportData from '@/components/data/ImportData';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const authUser = await getCurrentUser();
  
  if (!authUser) {
    redirect('/login');
  }

  // Get full user data from database including createdAt
  const [user, wallet, preferences] = await Promise.all([
    db.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    }),
    getWallet(),
    getUserPreferences()
  ]);

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

      {/* Tabs for different settings sections */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <SettingsIcon size={16} />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database size={16} />
            Data
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User size={16} />
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
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
            </div>
          </Card>
          
          {/* Notifications Settings */}
          <SettingsClient preferences={preferences} />

          {/* Financial Settings */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <DollarSign className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Financial</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-foreground mb-2">Default Currency</h3>
                <p className="text-sm text-muted-foreground mb-4">Currently set to {wallet?.currency || 'USD'} - Choose your preferred currency for all financial displays</p>
                
                <form action={updateWallet} className="space-y-3">
                  <input type="hidden" name="balance" value={wallet?.balance || 0} />
                  <input type="hidden" name="monthlyBudget" value={wallet?.monthlyBudget || 0} />
                  
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <select
                        name="currency"
                        defaultValue={wallet?.currency || 'USD'}
                        className="pl-10 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="EGP">EGP - Egyptian Pound 🇪🇬</option>
                        <option value="CAD">CAD - Canadian Dollar</option>
                        <option value="AUD">AUD - Australian Dollar</option>
                        <option value="JPY">JPY - Japanese Yen</option>
                        <option value="CHF">CHF - Swiss Franc</option>
                        <option value="CNY">CNY - Chinese Yuan</option>
                        <option value="INR">INR - Indian Rupee</option>
                        <option value="BRL">BRL - Brazilian Real</option>
                        <option value="MXN">MXN - Mexican Peso</option>
                        <option value="ZAR">ZAR - South African Rand</option>
                        <option value="SGD">SGD - Singapore Dollar</option>
                        <option value="HKD">HKD - Hong Kong Dollar</option>
                        <option value="SAR">SAR - Saudi Riyal</option>
                        <option value="AED">AED - UAE Dirham</option>
                        <option value="TRY">TRY - Turkish Lira</option>
                        <option value="RUB">RUB - Russian Ruble</option>
                        <option value="KRW">KRW - South Korean Won</option>
                      </select>
                    </div>
                    <Button type="submit" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <Globe className="w-4 h-4 mr-2" />
                      Update Currency
                    </Button>
                  </div>
                </form>
                
                <p className="text-xs text-muted-foreground mt-2">
                  ✅ Egyptian Pound and {wallet?.currency === 'EGP' ? '19 other' : '20'} currencies supported! 
                  This will update your wallet currency as well.
                </p>
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
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-muted rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Analytics data collection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch disabled className="opacity-50" defaultChecked={false} />
                      <span className="text-xs text-muted-foreground">Disabled</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-muted rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Usage statistics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch disabled className="opacity-50" defaultChecked={false} />
                      <span className="text-xs text-muted-foreground">Disabled</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  🔒 Your privacy is protected. Analytics and tracking are currently disabled by default.
                </p>
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
              <Button variant="outline" className="w-full justify-start hover:bg-blue-50 dark:hover:bg-blue-900/20" asChild>
                <a href="#danger-zone">
                  <Download className="w-4 h-4 mr-2 text-blue-600" />
                  Export Data
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start hover:bg-purple-50 dark:hover:bg-purple-900/20" asChild>
                <Link href="/profile">
                  <User className="w-4 h-4 mr-2 text-purple-600" />
                  View Profile
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start hover:bg-green-50 dark:hover:bg-green-900/20" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2 text-green-600" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </Card>

          {/* Account Info */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Account Info</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email:
                </span>
                <span className="text-sm text-foreground font-medium truncate ml-2">
                  {user.email}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Name:
                </span>
                <span className="text-sm text-foreground font-medium">
                  {user.name || 'Not set'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Member since:
                </span>
                <span className="text-sm text-foreground font-medium">
                  {user.createdAt 
                    ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'Date not available'
                  }
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Status:
                </span>
                <span className="text-sm text-green-700 dark:text-green-400 font-semibold flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Active
                </span>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <div id="danger-zone">
            <DangerZone userEmail={user.email} />
          </div>
        </div>
      </div>
    </TabsContent>

    <TabsContent value="data" className="mt-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ExportData />
        <ImportData />
      </div>
    </TabsContent>

    <TabsContent value="profile" className="mt-6">
      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Account Management</h2>
          </div>
          <div className="text-center p-8">
            <User size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Account Settings Coming Soon</h3>
            <p className="text-muted-foreground">
              Advanced account management and security settings will be available here.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              For now, basic account information is shown in the Preferences tab.
            </p>
          </div>
        </Card>
      </div>
    </TabsContent>
  </Tabs>
    </div>
  );
}
