"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, DollarSign, UserPlus, Building, Settings, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  // Mock data - replace with real API calls
  const stats = {
    totalUsers: 1247,
    totalCourses: 89,
    totalRevenue: 45670,
    activeOrganizations: 12,
    newUsersThisMonth: 156,
    coursesPublishedThisMonth: 8,
  }

  const recentActivities = [
    { id: 1, action: "New user registered", user: "John Doe", time: "2 minutes ago" },
    { id: 2, action: "Course published", user: "Sarah Wilson", time: "15 minutes ago" },
    { id: 3, action: "Payment processed", user: "Mike Johnson", time: "1 hour ago" },
    { id: 4, action: "Organization created", user: "Tech Corp", time: "2 hours ago" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your learning platform</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/users/new">
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Link>
          </Button>
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
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{stats.newUsersThisMonth}</span> this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{stats.coursesPublishedThisMonth}</span> this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrganizations}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2</span> this month
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
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.user}</p>
                  </div>
                  <Badge variant="secondary">{activity.time}</Badge>
                </div>
              ))}
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
