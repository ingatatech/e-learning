"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, Building2, UserPlus, Plus, GraduationCap, DollarSign } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton"
import { StatCard } from "@/components/dashboard/card"

export default function SystemAdminDashboard() {
  const { user, token } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stats/sysadmin/${user.organization!.id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchStats()
    }
  }, [token, user])

  const quickActions = [
    {
      title: "Add User",
      description: "Add new students or instructors",
      icon: UserPlus,
      href: "/sysAdmin/users/add",
      color: "bg-blue-500",
    },
    {
      title: "Create Course",
      description: "Create a new course",
      icon: Plus,
      href: "/sysAdmin/courses/create",
      color: "bg-green-500",
    },
    {
      title: "Manage Organization",
      description: "Update organization details",
      icon: Building2,
      href: "/sysAdmin/org",
      color: "bg-purple-500",
    },
  ]

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Administration</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your organization's learning platform</p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          System Administrator
        </Badge>
      </div> */}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">                
        <StatCard
          title="Total Students"
          content={stats ? stats.totalUsers : "..."}
          subtitle="Students & Instructors"
          icon={Users}
          index={0}
        />

        <StatCard
          title="Average Rating"
          content={stats ? stats.totalCourses : "..."}
          subtitle="Published Courses"
          icon={BookOpen}
          index={1}
        />
        
        <StatCard
          title="Enrollments"
          content={stats ? stats.totalEnrollments : "..."}
          subtitle="Active enrollments"
          icon={GraduationCap}
          index={2}
        />

        <StatCard
          title="Revenue"
          content={stats ? "$" + stats.totalRevenue : "..."}
          subtitle={stats && stats.revenueThisMonth + " this month"}
          icon={DollarSign}
          index={3}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks for your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${action.color}`}>
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{action.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest user registrations in your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent users</p>
                <Link href="/system-admin/users/add">
                  <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                    Add First User
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Course Performance</CardTitle>
            <CardDescription>Top performing courses in your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No courses available</p>
                <Link href="/system-admin/courses/add">
                  <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                    Create First Course
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
