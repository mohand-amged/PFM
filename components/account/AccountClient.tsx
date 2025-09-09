'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Clock, 
  Shield, 
  Settings, 
  Palette, 
  Bell, 
  DollarSign, 
  Download,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { ThemeRadioGroup } from '@/components/theme-toggle';

interface AccountClientProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    createdAt: Date;
  };
  wallet: any;
  preferences: any;
}

export default function AccountClient({ user, wallet, preferences }: AccountClientProps) {
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl">{user.name || 'User'}</CardTitle>
              <p className="text-muted-foreground">{user.email}</p>
              <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                Active
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Member since</p>
                <p className="text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Quick Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Theme Selector */}
          <div className="space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-between h-auto p-4"
              onClick={() => setShowThemeSelector(!showThemeSelector)}
            >
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-muted-foreground" />
                <div className="text-left">
                  <p className="font-medium">Appearance</p>
                  <p className="text-sm text-muted-foreground">Change theme settings</p>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${showThemeSelector ? 'rotate-90' : ''}`} />
            </Button>
            
            {showThemeSelector && (
              <div className="pl-4 pr-2 py-3 bg-muted/50 rounded-lg">
                <ThemeRadioGroup />
              </div>
            )}
          </div>

          <Separator />

          {/* Notifications */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Notifications</p>
                <p className="text-sm text-muted-foreground">
                  {preferences?.emailNotifications ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
            <Link href="/settings?tab=preferences">
              <Button variant="ghost" size="sm">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Currency */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Currency</p>
                <p className="text-sm text-muted-foreground">{wallet?.currency || 'USD'}</p>
              </div>
            </div>
            <Link href="/settings?tab=preferences">
              <Button variant="ghost" size="sm">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Account Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link href="/settings" className="block">
            <Button variant="ghost" className="w-full justify-between h-auto p-4">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-muted-foreground" />
                <div className="text-left">
                  <p className="font-medium">Advanced Settings</p>
                  <p className="text-sm text-muted-foreground">Full settings panel</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Link href="/data" className="block">
            <Button variant="ghost" className="w-full justify-between h-auto p-4">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-muted-foreground" />
                <div className="text-left">
                  <p className="font-medium">Data Management</p>
                  <p className="text-sm text-muted-foreground">Export & import data</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Navigation Helper */}
      <div className="text-center text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
        <p>Looking for something else?</p>
        <div className="flex justify-center gap-4 mt-2">
          <Link href="/dashboard" className="text-primary hover:underline">
            Dashboard
          </Link>
          <Link href="/profile" className="text-primary hover:underline">
            Profile
          </Link>
          <Link href="/settings" className="text-primary hover:underline">
            Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
