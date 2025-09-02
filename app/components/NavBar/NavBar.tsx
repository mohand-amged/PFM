"use client";
import React from "react";
import { Search } from "../Search";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { NAV_LINKS } from "./SideBar";
import NavLink from "./NavLink";

function NavBar() {
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

        {/* Empty space where auth buttons used to be */}
        <div className="w-24"></div>
      </div>
    </header>
  )
}

export default NavBar;