"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Menu, X, Bell, User, Settings, LogOut, Sun, Moon } from "lucide-react"
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
    avatar?: string
    role: string
    totalPoints: number
    level: number
  }
}

export function Header({ user }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-primary">Ingata E-learning</h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/courses" className="text-sm font-medium hover:text-primary transition-colors">
              Courses
            </Link>
            <Link href="/leaderboard" className="text-sm font-medium hover:text-primary transition-colors">
              Leaderboard
            </Link>
            {user?.role === "instructor" && (
              <Link href="/instructor" className="text-sm font-medium hover:text-primary transition-colors">
                Instructor
              </Link>
            )}
            {user?.role === "admin" && (
              <Link href="/admin" className="text-sm font-medium hover:text-primary transition-colors">
                Admin
              </Link>
            )}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <Button variant="ghost" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {user ? (
              <>
                {/* User Points & Level */}
                <div className="hidden sm:flex items-center gap-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Level {user.level}
                  </Badge>
                  <Badge variant="outline">{user.totalPoints.toLocaleString()} pts</Badge>
                </div>

                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      {user.avatar ? (
                        <img
                          src={user.avatar || "/placeholder.svg"}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
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
                    <DropdownMenuItem onClick={() => handleLogout()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={toggleMobileMenu}>
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t pt-4">
            <div className="flex flex-col space-y-2">
              <Link
                href="/courses"
                className="text-sm font-medium hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Courses
              </Link>
              <Link
                href="/leaderboard"
                className="text-sm font-medium hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Leaderboard
              </Link>
              {user?.role === "instructor" && (
                <Link
                  href="/instructor"
                  className="text-sm font-medium hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Instructor
                </Link>
              )}
              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="text-sm font-medium hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
