"use client";
import React from "react";
import { Search } from "../Search";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { NAV_LINKS } from "./SideBar";
import NavLink from "./NavLink";
import { Button } from "@/components/ui/button";
import Link from "next/link"
import { useSession, signOut } from "next-auth/react";

function NavBar() {
  const { data: session, status } = useSession();

  return (
    <header className="fixed top-0 right-0 left-64 z-10 bg-black backdrop-blur-sm border-b">
      <div className='flex items-center justify-between px-4 py-2'>
        {/* Menu for mobile */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20">
                <Menu className="w-6 h-6 text-white" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-black/90 text-white w-64">
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
        <div className="flex items-center gap-2">
          {status === 'loading' && (
            <div className="w-24 h-8 bg-gray-700 rounded animate-pulse" />
          )}
          {status === 'unauthenticated' && (
            <>
              <Button className="bg-white text-black hover:bg-black hover:text-white" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button className="bg-black text-white hover:bg-white hover:text-black" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
          {status === 'authenticated' && (
            <>
              <span className="text-white">{session.user?.name}</span>
              <Button className="bg-red-500 text-white hover:bg-red-600" onClick={() => signOut()}>
                Sign Out
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default NavBar;