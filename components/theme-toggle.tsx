'use client'

import * as React from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" disabled>
        <Sun className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Loading theme...</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className={theme === 'light' ? 'bg-accent' : ''}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
          {theme === 'light' && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className={theme === 'dark' ? 'bg-accent' : ''}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
          {theme === 'dark' && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className={theme === 'system' ? 'bg-accent' : ''}
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
          {theme === 'system' && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ThemeRadioGroup() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="space-y-3 opacity-50">
        <div className="animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-muted rounded-full"></div>
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Light</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-3">
        <input
          type="radio"
          id="light"
          name="theme"
          value="light"
          checked={theme === 'light'}
          onChange={() => handleThemeChange('light')}
          className="w-4 h-4 text-primary accent-primary"
        />
        <label htmlFor="light" className="flex items-center space-x-2 cursor-pointer">
          <Sun className="h-4 w-4" />
          <span>Light</span>
        </label>
      </div>
      
      <div className="flex items-center space-x-3">
        <input
          type="radio"
          id="dark"
          name="theme"
          value="dark"
          checked={theme === 'dark'}
          onChange={() => handleThemeChange('dark')}
          className="w-4 h-4 text-primary accent-primary"
        />
        <label htmlFor="dark" className="flex items-center space-x-2 cursor-pointer">
          <Moon className="h-4 w-4" />
          <span>Dark</span>
        </label>
      </div>
      
      <div className="flex items-center space-x-3">
        <input
          type="radio"
          id="system"
          name="theme"
          value="system"
          checked={theme === 'system'}
          onChange={() => handleThemeChange('system')}
          className="w-4 h-4 text-primary accent-primary"
        />
        <label htmlFor="system" className="flex items-center space-x-2 cursor-pointer">
          <Monitor className="h-4 w-4" />
          <span>System</span>
        </label>
      </div>
    </div>
  )
}
