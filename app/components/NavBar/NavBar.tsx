"use client";
import React from "react";
import { Search } from "../Search";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { NAV_LINKS } from "./SideBar";
import NavLink from "./NavLink";
import { Button } from "@/components/ui/button";
import Link from "next/link"
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type User = {
  id: string;
  email: string | null;
  name: string | null;
};

function NavBar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch current user on component mount
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <header className="fixed top-0 right-0 left-64 z-10 bg-background backdrop-blur-sm border-b border-border">
      <div className='flex items-center justify-between px-4 py-2'>
        {/* Menu for mobile */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-2 rounded-full bg-muted hover:bg-accent border border-border">
                <Menu className="w-6 h-6 text-foreground" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-background text-foreground w-64">
              <div className="flex flex-col h-full">
                {NAV_LINKS.map((navLink, i: number) => (
                  <NavLink key={i} navLink={navLink} />
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Search - Centered in the remaining space */}
        <div className="flex-1 max-w-2xl mx-auto">
          <Search onSearch={() => { /* TODO: implement search */ }} />
        </div>

        {/* Login | Sign-up */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm">{user.name || user.email}</span>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <Button asChild variant="outline">
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

export default NavBar;