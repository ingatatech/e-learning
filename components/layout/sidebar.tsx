"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  BarChart3,
  Users,
  Settings,
  Award,
  TrendingUp,
  Calendar,
  MessageSquare,
  FileText,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Home,
  GraduationCap,
  Trophy,
} from "lucide-react"

interface SidebarProps {
  userRole: "admin" | "instructor" | "student"
  className?: string
}

const navigationItems = {
  student: [
    { name: "Dashboard", href: "/student", icon: Home },
    { name: "My Courses", href: "/student/courses", icon: BookOpen },
    { name: "Progress", href: "/student/progress", icon: TrendingUp },
    { name: "Achievements", href: "/student/achievements", icon: Award },
    { name: "Gamification", href: "/gamification", icon: Trophy },
    { name: "Calendar", href: "/student/calendar", icon: Calendar },
    { name: "Messages", href: "/student/messages", icon: MessageSquare },
  ],
  instructor: [
    { name: "Dashboard", href: "/instructor", icon: Home },
    { name: "My Courses", href: "/instructor/courses", icon: BookOpen },
    { name: "Students", href: "/instructor/students", icon: Users },
    { name: "Analytics", href: "/instructor/analytics", icon: BarChart3 },
    { name: "Gamification", href: "/gamification", icon: Trophy },
    { name: "Assignments", href: "/instructor/assignments", icon: FileText },
    { name: "Messages", href: "/instructor/messages", icon: MessageSquare },
    { name: "Earnings", href: "/instructor/earnings", icon: CreditCard },
  ],
  admin: [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Courses", href: "/admin/courses", icon: BookOpen },
    { name: "Organizations", href: "/admin/organizations", icon: GraduationCap },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Gamification", href: "/gamification", icon: Trophy },
    { name: "Payments", href: "/admin/payments", icon: CreditCard },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ],
}

export function Sidebar({ userRole, className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const items = navigationItems[userRole] || []

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300",
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
            <span className="font-semibold text-sidebar-primary">EduFlow</span>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className="h-8 w-8 p-0">
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive &&
                      "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
                    isCollapsed && "justify-center",
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
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
