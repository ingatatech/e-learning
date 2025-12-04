"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, ChevronDown, ChevronLeft, ChevronRight, LogOut, Moon, Settings, Sun, User } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"

interface LearningNavigationProps {
  courseTitle: string
  courseId: string
  currentStepTitle: string
  currentStepIndex: number
  totalSteps: number
  canGoNext: boolean
  canGoPrevious: boolean
  onNext: () => void
  onPrevious: () => void
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

export function LearningNavigation({
  courseTitle,
  courseId,
  currentStepTitle,
  currentStepIndex,
  totalSteps,
  canGoNext,
  canGoPrevious,
  onNext,
  onPrevious,
}: LearningNavigationProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { user } = useAuth()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  if (!user) {
    return null 
  }

  return (
    <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Course
            </Button>
            <div className="border-l pl-4">
              <h1 className="font-semibold text-lg">{courseTitle}</h1>
              <p className="text-sm text-muted-foreground">{currentStepTitle}</p>
            </div>
          </div>

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
                {/* <div className="hidden sm:flex items-center gap-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Level {user.level}
                  </Badge>
                  <Badge variant="outline">{user.totalPoints.toLocaleString()} pts</Badge>
                </div> */}

                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </Button>

                {/* User Menu */}
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
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            )}

            {/* <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onPrevious} disabled={!canGoPrevious}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <Button size="sm" onClick={onNext} disabled={!canGoNext}>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  )
}
