"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Menu, X, Bell, User, Settings, LogOut, Sun, Moon, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { useAuth } from "@/hooks/use-auth"

interface HeaderProps {
  user?: {
    id: string
    firstName: string
    lastName: string
    email: string
    avatar?: string
    role: string
    totalPoints: number
    level: number
  }
}

export function Header({ user }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
  }


  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto px-4 sm:px-6 lg:px-10 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href={`/${user ? user.role : ""}`} className="flex items-center gap-3">
            {/* <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div> */}
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-foreground capitalize">
                {user && user.role == "sysAdmin" ? "System Admin Portal" : user &&user.role + "'s Portal"}
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Learn From Home</p>
            </div>
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9 rounded-lg"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {user ? (
              <>
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative h-9 w-9 rounded-lg">
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"></span>
                </Button>

                {/* User Profile Section with Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
                      <div className="flex items-center gap-3">
                        {/* Desktop User Info Display */}
                        <div className="hidden md:flex items-center gap-3 bg-muted/50 hover:bg-muted/70 transition-colors rounded-lg px-3 py-2">
                          <div className="flex items-center gap-3">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={`${user.firstName} ${user.lastName}`}
                                className="h-8 w-8 rounded-full object-cover ring-2 ring-background"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                            )}
                            <div className="flex flex-col text-left">
                              <span className="text-sm font-medium text-foreground">
                                {user.firstName} {user.lastName}
                              </span>
                              <span className="text-xs text-muted-foreground capitalize">
                                {user.role}
                              </span>
                            </div>
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>

                        {/* Mobile User Avatar */}
                        <div className="md:hidden h-9 w-9 rounded-lg flex items-center justify-center">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={`${user.firstName} ${user.lastName}`}
                              className="h-8 w-8 rounded-full object-cover ring-2 ring-background"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                          )}
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile">
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleLogout()} className="text-destructive focus:text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild className="rounded-lg">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild className="rounded-lg">
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        
      </div>
    </header>
  )
}