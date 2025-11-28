"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  BookOpen,
  Users,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Home,
  GraduationCap,
  Building,
  UserPlus,
  DollarSign,
  PieChart,
  BookPlus,
  UserRoundCheck,
  Shield,
  Server,
  LogOut,
  User,
  HelpCircle,
  Bell,
  Search,
  BookMarked,
  Users2,
  BarChart2,
  Wallet,
  Cog,
  FileCog,
} from "lucide-react"
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
    { name: "My Courses", href: "/student/courses", icon: BookMarked },
    { name: "Explore Courses", href: "/courses", icon: Search },
  ],
  instructor: [
    { name: "Dashboard", href: "/instructor", icon: Home },
    {
      name: "Courses",
      icon: BookMarked,
      children: [
        { name: "Create Course", href: "/instructor/courses/create", icon: BookPlus },
        { name: "Manage Courses", href: "/instructor/courses", icon: BookOpen },
        { name: "Prepare Document", href: "/instructor/documents", icon: FileText },
      ],
    },
    { name: "Submissions", href: "/instructor/assessments", icon: FileCog },

    { name: "Students", href: "/instructor/students", icon: Users },
    { name: "Settings", href: "/settings", icon: Cog },
  ],
  gdv: [
    { name: "Dashboard", href: "/instructor", icon: Home },
    {
      name: "Organizations",
      icon: Building,
      children: [
        { name: "Add Organization", href: "/gdv/organizations/add", icon: Building },
        { name: "All Organizations", href: "/gdv/organizations", icon: Building },
      ],
    },
    {
      name: "Users",
      icon: Users2,
      children: [
        { name: "Add User", href: "/gdv/users/add", icon: UserPlus },
        { name: "All Users", href: "/gdv/users", icon: Users },
      ],
    },
    { name: "Settings", href: "/settings", icon: Cog },
  ],
  admin: [
    { name: "Dashboard", href: "/admin", icon: Home },
    {
      name: "Users",
      icon: Users2,
      children: [
        { name: "Add User", href: "/admin/users/add", icon: UserPlus },
        { name: "All Users", href: "/admin/users", icon: Users },
      ],
    },
    {
      name: "Organizations",
      icon: Building,
      children: [
        { name: "Add Organization", href: "/admin/organizations/add", icon: Building },
        { name: "All Organizations", href: "/admin/organizations", icon: Building },
      ],
    },
    { name: "Payments", href: "/admin/payments", icon: Wallet },
    { name: "Settings", href: "/settings", icon: Cog },
  ],
  sysAdmin: [
    { name: "Dashboard", href: "/sysAdmin", icon: Home },
    {
      name: "Users",
      icon: Users2,
      children: [
        { name: "Add User", href: "/sysAdmin/users/add", icon: UserPlus },
        { name: "All Users", href: "/sysAdmin/users", icon: Users },
      ],
    },
    {
      name: "Courses",
      icon: BookMarked,
      children: [
        { name: "Add Course", href: "/sysAdmin/courses/create", icon: BookPlus },
        { name: "Manage Courses", href: "/sysAdmin/courses", icon: BookOpen },
        { name: "Review Courses", href: "/sysAdmin/courses/draft", icon: BookOpen },
        { name: "Review Documents", href: "/sysAdmin/documents", icon: FileText },
      ],
    },
    {
      name: "Manage Organization",
      icon: Building,
      children: [{ name: "View Organization", href: "/sysAdmin/org", icon: Building }],
    },
    { name: "Settings", href: "/settings", icon: Cog },
  ],
}

const roleIcons: Record<string, any> = {
  admin: Shield,
  sysAdmin: Server,
  instructor: UserRoundCheck,
  student: GraduationCap,
}

export function Sidebar({ userRole, className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const items = navigationItems[userRole] || []

  useEffect(() => {
  const mq = window.matchMedia("(max-width: 768px)"); // adjust breakpoint
  const handleResize = (e: MediaQueryListEvent | MediaQueryList) => {
    setIsCollapsed(e.matches);
  };

  // initial check
  setIsCollapsed(mq.matches);

  // listen for changes
  mq.addEventListener ? mq.addEventListener("change", handleResize) : mq.addListener(handleResize);

  return () => {
    mq.removeEventListener ? mq.removeEventListener("change", handleResize) : mq.removeListener(handleResize);
  };
}, []);

  // Function to get the most specific matching item for a given path
  const getMostSpecificMatch = (
    items: NavigationItem[],
    currentPath: string,
  ): { item: NavigationItem; parent?: NavigationItem } | null => {
    let bestMatch: { item: NavigationItem; parent?: NavigationItem } | null = null
    let bestMatchLength = 0

    const searchItems = (itemList: NavigationItem[], parent?: NavigationItem) => {
      itemList.forEach((item) => {
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
      const directMatch = items.find((item) => item.href === pathname)
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
    logout()
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
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
      <li key={item.name} className="relative max-w-full">
        {hasChildren ? (
          <div>
            {/* Parent Item */}
            <button
              onClick={() => toggleExpanded(item.name)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-300 dark:hover:bg-green-900/30 hover:bg-green-50 hover:text-green-700 dark:hover:text-white w-full group relative",
                "border-l-4 border-transparent hover:border-green-400",
                isCollapsed && "justify-center px-3",
                childIsActive &&
                  "bg-gradient-to-r from-green-50 dark:from-green-900 to-green-25 text-green-700 dark:text-white border-l-green-500",
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-colors duration-300",
                  childIsActive ? "text-green-600 dark:text-white" : "text-gray-600 group-hover:text-green-600",
                )}
              />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left font-medium">{item.name}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-300 text-gray-400",
                      isExpanded && "rotate-180",
                      childIsActive && "text-green-600",
                    )}
                  />
                </>
              )}
            </button>

            {/* Children Items */}
            {isExpanded && !isCollapsed && item.children && (
              <div className="mt-2 space-y-1 ml-4 border-l border-gray-100 pl-4">
                {item.children.map((child) => (
                  <Link
                    key={child.name}
                    href={child.href || "#"}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-300 group relative",
                      "border-l-4 border-transparent hover:border-green-400",
                      "hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-white",
                      isItemActive(child) &&
                        "bg-gradient-to-r from-green-500 to-green-600 text-white border-l-green-600 shadow-lg transform scale-[1.02]",
                    )}
                  >
                    <child.icon
                      className={cn(
                        "h-4 w-4 flex-shrink-0 transition-colors duration-300",
                        isItemActive(child) ? "text-white" : "text-gray-500 group-hover:text-green-600",
                      )}
                    />
                    <span className="font-medium">{child.name}</span>
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
              "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-300 group relative",
              "border-l-4 border-transparent hover:border-green-400",
              "hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-white",
              isActive &&
                "bg-gradient-to-r from-green-50 dark:from-green-900 to-green-25 text-green-700 dark:text-white border-l-green-600 shadow-lg transform scale-[1.02]",
              isCollapsed && "justify-center px-3",
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5 flex-shrink-0 transition-colors duration-300",
                isActive ? "text-green" : "text-gray-600 group-hover:text-green-600",
              )}
            />
            {!isCollapsed && (
              <>
                <span className="font-medium">{item.name}</span>
              </>
            )}
          </Link>
        )}
      </li>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div
      className={cn("sticky top-0 h-screen flex flex-col transition-all duration-300", isCollapsed ? "w-20" : "w-80")}
    >
      {/* Sidebar */}
      <div
        className={cn(
          "bg-background border border-border h-full flex flex-col transition-all duration-300 shadow-xl rounded-2xl m-4",
          isCollapsed ? "w-16" : "w-72",
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                {React.createElement(roleIcons[userRole] || BookOpen, { className: "w-5 h-5 text-white" })}
              </div>
              <div>
                <h2 className="font-bold text-text">Ingata E-learning</h2>
                <p className="text-xs text-gray-500 capitalize font-medium">
                  {userRole === "sysAdmin" ? "System Admin" : userRole}
                </p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-9 w-9 p-0 hover:bg-gray-100 rounded-xl transition-all duration-300"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-800 dark:text-gray-200" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-800 dark:text-gray-200" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 pr-1 py-2 overflow-y-auto">
          <ul className="space-y-2 max-w-full">{items.map((item) => renderNavigationItem(item))}</ul>
        </nav>

        {/* Enhanced Footer */}
        <div className={cn("border-t border-border rounded-b-2xl", isCollapsed ? "p-3" : "p-4")}>
          {isCollapsed ? (
            // Collapsed footer - simple icon buttons
            <div className="flex flex-col gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl hover:bg-white">
                    <Avatar className="h-8 w-8 ring-2 ring-green-200">
                      <AvatarImage
                        src={user?.profilePicture || "/placeholder.svg"}
                        alt={user.firstName + " " + user.lastName}
                      />
                      <AvatarFallback className="text-xs bg-green-500 text-white font-semibold">
                        {user.firstName + " " + user.lastName ? getInitials(user.firstName + " " + user.lastName) : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl border-gray-200">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer rounded-lg">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/help" className="cursor-pointer rounded-lg">
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Help & Support
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-600 rounded-lg"
                  >
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
                  <Button
                    variant="ghost"
                    className="w-full justify-start p-3 h-auto hover:bg-muted rounded-xl shadow-sm border border-transparent hover:border-border transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Avatar className="h-10 w-10 ring-2 ring-green-200">
                        <AvatarImage
                          src={user?.profilePicture || ""}
                          alt={user.firstName + " " + user.lastName}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-sm font-semibold bg-green-500 text-white">
                          {user.firstName + " " + user.lastName
                            ? getInitials(user.firstName + " " + user.lastName)
                            : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-semibold truncate text-text">
                          {user.firstName + " " + user.lastName || "User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate font-medium">
                          {user?.email || "user@example.com"}
                        </p>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-xl border-border">
                  <DropdownMenuLabel className="flex flex-col p-3">
                    <span className="font-semibold text-text">{user.firstName + " " + user.lastName || "User"}</span>
                    <span className="text-sm text-gray-500 font-medium">{user?.email || "user@example.com"}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer rounded-lg">
                      <User className="mr-2 h-4 w-4" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer rounded-lg">
                      <Bell className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-600 rounded-lg"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Quick Actions */}
              <div className="flex gap-2 pt-3 border-t border-muted">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 hover:bg-white rounded-xl h-9 transition-all duration-300"
                  asChild
                >
                  <Link href="/help">
                    <HelpCircle className="h-4 w-4 text-gray-600" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 hover:bg-white rounded-xl h-9 transition-all duration-300"
                  asChild
                >
                  <Link href="/settings">
                    <Cog className="h-4 w-4 text-gray-600" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 rounded-xl h-9 text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-300"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
