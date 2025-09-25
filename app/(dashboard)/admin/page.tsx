"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, DollarSign, UserPlus, Building, Settings, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"
import React from "react"
import { useAuth } from "@/hooks/use-auth"

// Define the types for the API response
interface ActivityUser {
  id: number
  email: string
  firstName: string
  lastName: string
  role: string
  isActive: boolean
  totalPoints: number
  level: number
  streakDays: number
  profilePicUrl: string | null
  createdAt: string
  updatedAt: string
}

interface Activity {
  id: number
  action: string
  targetId: string
  targetType: string
  details: string
  createdAt: string
  user: ActivityUser
}

// Fix: Use singular interface name and make data optional for initial state
interface ActivitiesResponse {
  page: number
  limit: number
  total: number
  data: Activity[]
}

export default function AdminDashboard() {
  // Fix: Initialize with null or proper structure
  const [activities, setActivities] = React.useState<ActivitiesResponse | null>(null)
  const { user, token } = useAuth()
  const [stats, setStats] = React.useState<any>(null)


  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logs?page=1&limit=5`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          setActivities(data)
        }
      } catch (error) {
        console.error("Failed to fetch activities:", error)
      }
    }

    const fetchStats = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stats`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      }
    }
    
    if (token) { // Only fetch if token exists
      fetchActivities()
      fetchStats()
    }
  }, [token]) // Add token as dependency

  // Function to format the time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return `${Math.floor(diffInSeconds / 2592000)} months ago`
  }

  // Function to get user display name
  const getUserDisplayName = (user: ActivityUser) => {
    return `${user.firstName} ${user.lastName}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your learning platform</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats ? stats.totalUsers.toLocaleString() : "..."}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{stats && "+" + stats.newUsersThisMonth + " this month"}</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats ? stats.totalCourses : "..."}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{stats && "+" + stats.coursesPublishedThisMonth + " this month"}</span> 
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">{stats ? "$" + stats.totalRevenue.toLocaleString() : "..."}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{stats && stats.revenueThisMonth + " from last month"}</span> 
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats ? stats.totalOrganizations : "..."}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{stats && "+" + stats.organizationsThisMonth + " this month"}</span> 
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent" asChild>
          <Link href="/admin/users">
            <Users className="w-6 h-6" />
            Manage Users
          </Link>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent" asChild>
          <Link href="/admin/courses">
            <BookOpen className="w-6 h-6" />
            Manage Courses
          </Link>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent" asChild>
          <Link href="/admin/organizations">
            <Building className="w-6 h-6" />
            Organizations
          </Link>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent" asChild>
          <Link href="/admin/analytics">
            <BarChart3 className="w-6 h-6" />
            Analytics
          </Link>
        </Button>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Fix: Add conditional rendering */}
              {activities && activities.data ? (
                activities.data.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.action}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {getUserDisplayName(activity.user)} • {activity.details}
                      </p>
                    </div>
                    <Badge variant="secondary" className="ml-2 flex-shrink-0">
                      {formatTimeAgo(activity.createdAt)}
                    </Badge>
                  </div>
                ))
              ) : (
                // Loading state or empty state
                <div className="text-center text-muted-foreground">
                  Loading activities...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Platform health overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Server Status</span>
                <Badge className="bg-green-100 text-green-800">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <Badge className="bg-green-100 text-green-800">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Storage</span>
                <Badge className="bg-yellow-100 text-yellow-800">85% Used</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">API Response</span>
                <Badge className="bg-green-100 text-green-800">Fast</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 