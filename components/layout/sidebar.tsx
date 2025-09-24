"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BookOpen, BarChart3, Users, Settings, Award, TrendingUp, Calendar, MessageSquare, FileText, CreditCard, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Home, GraduationCap, Trophy, Building, UserPlus, DollarSign, PieChart, BookPlus, FileSearch, UserRoundCheck, Shield, Server, LogOut, User, HelpCircle, Bell } from "lucide-react"
import React from "react"
import { useAuth } from "@/hooks/use-auth"

interface SidebarProps {
  userRole: "admin" | "sysAdmin" | "instructor" | "student"
  className?: string
  user?: {
    name: string
    email: string
    avatar?: string
  }
}

interface NavigationItem {
  name: string
  href?: string
  icon: any
  children?: NavigationItem[]
}

const navigationItems: Record<string, NavigationItem[]> = {
  student: [
    { name: "Dashboard", href: "/student", icon: Home },
    { name: "My Courses", href: "/student/courses", icon: BookOpen },
    { name: "Explore Courses", href: "/courses", icon: FileSearch },
    { name: "Progress", href: "/student/progress", icon: TrendingUp },
    { name: "Achievements", href: "/student/achievements", icon: Award },
    { name: "Gamification", href: "/gamification", icon: Trophy },
    { name: "Calendar", href: "/student/calendar", icon: Calendar },
    { name: "Messages", href: "/student/messages", icon: MessageSquare },
  ],
  instructor: [
    { name: "Dashboard", href: "/instructor", icon: Home },
    { 
      name: "My Courses", 
      icon: BookOpen,
      children: [
        { name: "Add Course", href: "/instructor/courses/create", icon: BookPlus },
        { name: "All Courses", href: "/instructor/courses", icon: BookOpen }, 
      ]
    },
    { name: "Students", href: "/instructor/students", icon: Users },
    { name: "Analytics", href: "/instructor/analytics", icon: BarChart3 },
    { name: "Gamification", href: "/gamification", icon: Trophy },
    { name: "Assignments", href: "/instructor/assignments", icon: FileText },
    { name: "Messages", href: "/instructor/messages", icon: MessageSquare },
    { name: "Earnings", href: "/instructor/earnings", icon: CreditCard },
  ],
  admin: [
    { name: "Dashboard", href: "/admin", icon: Home },
    {
      name: "Users",
      icon: Users,
      children: [
        { name: "Add User", href: "/admin/users/add", icon: UserPlus },
        { name: "All Users", href: "/admin/users", icon: Users },
      ],
    },
    { 
      name: "Courses", 
      icon: BookOpen,
      children: [
        { name: "Add Course", href: "/admin/courses/add", icon: BookPlus },
        { name: "All Courses", href: "/admin/courses", icon: BookOpen },
      ]
    },
    {
      name: "Organizations",
      icon: GraduationCap,
      children: [
        { name: "Add Organization", href: "/admin/organizations/add", icon: Building },
        { name: "All Organizations", href: "/admin/organizations", icon: Building },
      ],
    },
    {
      name: "Analytics",
      icon: BarChart3,
      children: [
        { name: "Overview", href: "/admin/analytics", icon: PieChart },
        { name: "Revenue", href: "/admin/analytics/revenue", icon: DollarSign },
        { name: "User Analytics", href: "/admin/analytics/users", icon: Users },
      ],
    },
    { name: "Gamification", href: "/gamification", icon: Trophy },
    { name: "Payments", href: "/admin/payments", icon: CreditCard },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ],
  sysAdmin: [
    { name: "Dashboard", href: "/sysAdmin", icon: Home },
    {
      name: "Users",
      icon: Users,
      children: [
        { name: "Add User", href: "/sysAdmin/users/add", icon: UserPlus },
        { name: "All Users", href: "/sysAdmin/users", icon: Users },
      ],
    },
    { 
      name: "Courses", 
      icon: BookOpen,
      children: [
        { name: "Add Course", href: "/sysAdmin/courses/add", icon: BookPlus },
        { name: "All Courses", href: "/sysAdmin/courses", icon: BookOpen },
      ]
    },
    {
      name: "Manage Organization",
      icon: GraduationCap,
      children: [
        { name: "View Organization", href: "/sysAdmin/organizations", icon: Building },
      ],
    },
    {
      name: "Analytics",
      icon: BarChart3,
      children: [
        { name: "Revenue", href: "/sysAdmin/analytics/revenue", icon: DollarSign },
        { name: "User Analytics", href: "/sysAdmin/analytics/users", icon: Users },
      ],
    },
    { name: "Gamification", href: "/gamification", icon: Trophy },
    { name: "Payments", href: "/sysAdmin/payments", icon: CreditCard },
    { name: "Settings", href: "/sysAdmin/settings", icon: Settings },
  ],
}

const roleIcons: Record<string, any> = {
  admin: Shield,
  "sysAdmin": Server,
  instructor: UserRoundCheck,
  student: GraduationCap,
}

export function Sidebar({ userRole, className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()

  if (!user) {
    return null
  }

  const items = navigationItems[userRole] || []

  // Function to get the most specific matching item for a given path
  const getMostSpecificMatch = (items: NavigationItem[], currentPath: string): { item: NavigationItem; parent?: NavigationItem } | null => {
    let bestMatch: { item: NavigationItem; parent?: NavigationItem } | null = null
    let bestMatchLength = 0

    const searchItems = (itemList: NavigationItem[], parent?: NavigationItem) => {
      itemList.forEach(item => {
        if (item.href && currentPath === item.href && item.href.length > bestMatchLength) {
          bestMatch = { item, parent }
          bestMatchLength = item.href.length
        }

        if (item.children) {
          searchItems(item.children, item)
        }
      })
    }

    searchItems(items)
    return bestMatch
  }

  // Auto-expand parent when child is active and collapse others
  useEffect(() => {
    const match = getMostSpecificMatch(items, pathname)
    if (match?.parent) {
      setExpandedItems([match.parent.name])
    } else {
      // If no child is active, collapse all
      const directMatch = items.find(item => item.href === pathname)
      if (!directMatch?.children) {
        setExpandedItems([])
      }
    }
  }, [pathname, items])

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) => {
      if (prev.includes(itemName)) {
        return prev.filter((name) => name !== itemName)
      } else {
        // Collapse all others and expand this one
        return [itemName]
      }
    })
  }

  const handleLogout = () => {
    console.log("Logging out...")
    router.push("/login")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const isItemActive = (item: NavigationItem): boolean => {
    if (!item.href) return false
    
    const match = getMostSpecificMatch(items, pathname)
    return match?.item === item
  }

  const hasActiveChild = (item: NavigationItem): boolean => {
    if (!item.children) return false
    
    const match = getMostSpecificMatch(items, pathname)
    return match?.parent === item
  }

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const Icon = item.icon
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.name)
    const isActive = isItemActive(item)
    const childIsActive = hasActiveChild(item)

    return (
      <li key={item.name}>
        {hasChildren ? (
          <div>
            {/* Parent Item */}
            <button
              onClick={() => toggleExpanded(item.name)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full",
                isCollapsed && "justify-center",
                childIsActive && "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 flex-shrink-0",
                childIsActive && "text-primary"
              )} />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.name}</span>
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isExpanded && "rotate-180"
                  )} />
                </>
              )}
            </button>
            
            {/* Children Items */}
            {isExpanded && !isCollapsed && item.children && (
              <div className="mt-1">
                {item.children.map((child) => (
                  <Link
                    key={child.name}
                    href={child.href || "#"}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 ml-6 text-sm transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isItemActive(child) && "bg-primary text-primary-foreground font-medium shadow-sm"
                    )}
                  >
                    <child.icon className="h-4 w-4 flex-shrink-0" />
                    <span>{child.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Regular Item */
          <Link
            href={item.href || "#"}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isActive && "bg-primary text-primary-foreground shadow-sm",
              isCollapsed && "justify-center"
            )}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>{item.name}</span>}
          </Link>
        )}
      </li>
    )
  }

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300 h-[calc(100vh-4rem)] sticky top-16 left-0 z-40",
        isCollapsed ? "w-16" : "w-64",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              {React.createElement(roleIcons[userRole] || BookOpen, { className: "w-5 h-5 text-primary-foreground" })}
            </div>
            <span className="font-semibold text-primary pl-2">
              {userRole == "sysAdmin" ? "System Admin" : userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </span>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className="h-8 w-8 p-0">
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">{items.map((item) => renderNavigationItem(item))}</ul>
      </nav>

      {/* Enhanced Footer */}
      <div className={cn("border-t border-sidebar-border", isCollapsed ? "p-2" : "p-4")}>
        {isCollapsed ? (
          // Collapsed footer - simple icon buttons
          <div className="flex flex-col gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profilePicture} alt={user.firstName + " " + user.lastName} />
                    <AvatarFallback className="text-xs">
                      {user.firstName + " " + user.lastName ? getInitials(user.firstName + " " + user.lastName) : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/help" className="cursor-pointer">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Help & Support
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          // Expanded footer - full user info
          <div className="space-y-3">
            {/* User Info */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-2 h-auto hover:bg-sidebar-accent">
                  <div className="flex items-center gap-3 w-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.profilePicture} alt={user.firstName + " " + user.lastName} />
                      <AvatarFallback className="text-sm font-medium">
                        {user.firstName + " " + user.lastName ? getInitials(user.firstName + " " + user.lastName) : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium truncate">{user.firstName + " " + user.lastName || "User"}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email || "user@example.com"}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="flex flex-col p-3">
                  <span className="font-medium">{user.firstName + " " + user.lastName || "User"}</span>
                  <span className="text-sm text-muted-foreground">{user?.email || "user@example.com"}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/notifications" className="cursor-pointer">
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/help" className="cursor-pointer">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Help & Support
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="px-2 py-1">
                  <Badge variant="secondary" className="w-full justify-center">
                    {userRole === "sysAdmin" ? "System Admin" : userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                  </Badge>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Quick Actions */}
            <div className="flex gap-2 pt-2 border-t border-sidebar-border">
              <Button variant="ghost" size="sm" className="flex-1" asChild>
                <Link href="/help">
                  <HelpCircle className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="flex-1" asChild>
                <Link href="/settings">
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="flex-1" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}