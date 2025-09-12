"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, BarChart3, Users, Settings, Award, TrendingUp, Calendar, MessageSquare, FileText, CreditCard, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Home, GraduationCap, Trophy, Building, UserPlus, DollarSign, PieChart, BookPlus, FileSearch } from "lucide-react"

interface SidebarProps {
  userRole: "admin" | "system-administrator" | "instructor" | "student"
  className?: string
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
}

export function Sidebar({ userRole, className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const pathname = usePathname()

  const items = navigationItems[userRole] || []

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName) ? prev.filter((name) => name !== itemName) : [...prev, itemName],
    )
  }

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const Icon = item.icon
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.name)

    let isActive = false
    if (item.href) {
      // For exact matches
      isActive = pathname === item.href
    } else if (hasChildren) {
      // For parent items, check if any child is active
      isActive =
        item.children?.some(
          (child) => child.href && (pathname === child.href || pathname.startsWith(child.href + "/")),
        ) || false
    }

    return (
      <li key={item.name}>
        {hasChildren ? (
          <div>
            <button
              onClick={() => toggleExpanded(item.name)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full",
                isCollapsed && "justify-center",
                level > 0 && "ml-4",
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.name}</span>
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </>
              )}
            </button>
            {isExpanded && !isCollapsed && item.children && (
              <ul className="ml-4 mt-1 space-y-1">
                {item.children.map((child) => renderNavigationItem(child, level + 1))}
              </ul>
            )}
          </div>
        ) : (
          <Link
            href={item.href || "#"}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isActive &&
                "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
              isCollapsed && "justify-center",
              level > 0 && "ml-4",
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
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
            <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <span className="font-semibold text-sidebar-primary pl-2">{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</span>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className="h-8 w-8 p-0">
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">{items.map((item) => renderNavigationItem(item))}</ul>
      </nav>

      {/* User Role Badge */}
      {!isCollapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <Badge variant="secondary" className="w-full justify-center">
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </Badge>
        </div>
      )}
    </div>
  )
}