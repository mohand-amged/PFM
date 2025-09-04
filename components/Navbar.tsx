'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { User, Settings, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme-toggle';

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
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/expenses', label: 'Expenses' },
    { href: '/subscriptions', label: 'Subscriptions' },
    { href: '/savings', label: 'Savings' },
    { href: '/analytics', label: 'Analytics' },
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
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px]">
        <div className="flex flex-col space-y-4 mt-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-lg font-medium px-4 py-2 rounded-lg transition-colors ${
                pathname === link.href
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {link.label}
            </Link>
          ))}
          
          <hr className="my-4" />
          
          <div className="px-4 py-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Theme</span>
            </div>
            <ThemeToggle />
          </div>
          
          <hr className="my-4" />
          
          <Link
            href="/profile"
            className="flex items-center text-muted-foreground hover:bg-muted px-4 py-2 rounded-lg"
          >
            <User className="w-5 h-5 mr-3" />
            Profile
          </Link>
          <Link
            href="/settings"
            className="flex items-center text-muted-foreground hover:bg-muted px-4 py-2 rounded-lg"
          >
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center text-destructive hover:bg-muted px-4 py-2 rounded-lg text-left"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );

  if (!user) {
    return null; // Don't show navbar on login/signup pages
  }

  return (
    <nav className="bg-background shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/dashboard" className="text-xl font-bold text-foreground">
              PFW
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-primary border-b-2 border-primary pb-1'
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Profile / Mobile Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            <div className="hidden md:block">
              <ProfileMenu />
            </div>
            <MobileNavigation />
          </div>
        </div>
      </div>
    </nav>
  );
}
