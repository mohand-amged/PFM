'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { User, Settings, LogOut, Menu, X, Home, CreditCard, Target, Bell, Palette, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotificationBell from '@/components/NotificationBell';
import NotificationPanel from '@/components/NotificationPanel';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme-toggle';
import { EnhancedThemeToggle, CompactThemeToggle } from '@/components/EnhancedThemeToggle';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface NavbarProps {
  user: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showMobileNotifications, setShowMobileNotifications] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Fetch notification count
  useEffect(() => {
    if (!user) return;
    
    const fetchNotificationCount = async () => {
      try {
        const response = await fetch('/api/notifications/count');
        if (response.ok) {
          const data = await response.json();
          setNotificationCount(data.unread || 0);
        }
      } catch (error) {
        console.error('Error fetching notification count:', error);
      }
    };
    
    fetchNotificationCount();
    
    // Fetch notification count every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/transactions', label: 'Transactions', icon: CreditCard },
    { href: '/budgets', label: 'Budgets', icon: Target },
  ];

  const ProfileMenu = () => (
    <div className="relative">
      <button
        onClick={() => setShowProfileMenu(!showProfileMenu)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted transition-colors"
      >
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-sm font-medium hidden md:block">
          {user?.name || user?.email}
        </span>
      </button>

      {showProfileMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setShowProfileMenu(false)}
          />
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-popover rounded-md shadow-lg ring-1 ring-border z-20">
            <div className="py-1">
              <div className="px-4 py-2 border-b border-border">
                <p className="text-sm font-medium text-popover-foreground">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <Link
                href="/profile"
                className="flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-muted"
                onClick={() => setShowProfileMenu(false)}
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </Link>
              <Link
                href="/settings"
                className="flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-muted"
                onClick={() => setShowProfileMenu(false)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-destructive hover:bg-muted"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const MobileNavigation = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden p-2 hover:bg-primary/10">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[320px] px-0">
        <div className="flex flex-col h-full max-h-screen">
          {/* Header */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-base">
                  {user?.name || 'User'}
                </p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation Links - Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 py-6 pb-4">
            <div className="space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                      pathname === link.href
                        ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-4" />
                    <span className="font-medium text-base">{link.label}</span>
                  </Link>
                );
              })}
              
              {/* Account Link for Mobile */}
              <Link
                href="/account"
                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                  pathname === '/account'
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <User className="w-5 h-5 mr-4" />
                <span className="font-medium text-base">Account</span>
              </Link>
            </div>
            
            <hr className="my-6" />
            
            {/* Notifications */}
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground">Notifications</span>
              </div>
              <div className="relative">
                <Button
                  variant="ghost"
                  className="flex items-center w-full text-muted-foreground hover:bg-muted/50 hover:text-foreground px-4 py-3 rounded-xl transition-all duration-200 justify-start"
                  onClick={() => setShowMobileNotifications(true)}
                >
                  <Bell className="w-5 h-5 mr-4" />
                  <span className="font-medium">Notifications</span>
                  {notificationCount > 0 && (
                    <span className="ml-auto h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>
            
            <hr className="my-6" />
            
            {/* Theme Toggle */}
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Appearance
                </span>
              </div>
              <div className="px-2">
                <CompactThemeToggle />
              </div>
            </div>
          </div>
          
          {/* Footer Actions */}
          <div className="flex-shrink-0 px-4 py-4 border-t border-border bg-background">
            <div className="space-y-2">
              <Link
                href="/profile"
                className="flex items-center text-muted-foreground hover:bg-muted/50 hover:text-foreground px-4 py-3 rounded-xl transition-all duration-200"
              >
                <User className="w-5 h-5 mr-4" />
                <span className="font-medium">Profile</span>
              </Link>
              <Link
                href="/settings"
                className="flex items-center text-muted-foreground hover:bg-muted/50 hover:text-foreground px-4 py-3 rounded-xl transition-all duration-200"
              >
                <Settings className="w-5 h-5 mr-4" />
                <span className="font-medium">Settings</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center w-full text-destructive hover:bg-destructive/10 px-4 py-3 rounded-xl transition-all duration-200"
              >
                <LogOut className="w-5 h-5 mr-4" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  if (!user) {
    return null; // Don't show navbar on login/signup pages
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/dashboard" className="flex items-center space-x-2 group">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  FinanceTracker
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      pathname === link.href
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Profile / Mobile Menu */}
            <div className="flex items-center space-x-2">
              {/* Theme Toggle - Always visible on desktop */}
              <div className="hidden md:block">
                <EnhancedThemeToggle />
              </div>
              {/* Notifications */}
              <div className="hidden md:block">
                <NotificationBell 
                  unreadCount={notificationCount} 
                  onCountChange={setNotificationCount}
                />
              </div>
              {/* Profile Menu */}
              <div className="hidden md:block">
                <ProfileMenu />
              </div>
              {/* Mobile Navigation */}
              <MobileNavigation />
            </div>
          </div>
        </div>
      </nav>
      
      {/* Mobile NotificationPanel */}
      <NotificationPanel 
        isOpen={showMobileNotifications} 
        onClose={() => setShowMobileNotifications(false)}
        onNotificationCountChange={setNotificationCount}
      />
    </>
  );
}
