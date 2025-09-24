"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, DollarSign, TrendingUp, Plus, Eye, Edit, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Course } from "@/types"

export default function InstructorDashboard() {
  const { user, token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
      const fetcCourses = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/instructor/${user?.id}/courses`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          })
          if (response.ok) {
            const data = await response.json()
            setCourses(data.courses.slice(0, 3))
          }
        } catch (error) {
          console.error("Failed to fetch users:", error)
        } finally {
          setLoading(false)
        }
      }
  
      fetcCourses()
    }, [])
    
  // Mock data - replace with real API calls
  const instructorStats = {
    totalCourses: 8,
    totalStudents: 1247,
    totalRevenue: 15670,
    avgRating: 4.8,
    coursesPublished: 6,
    coursesDraft: 2,
  }

  const recentActivity = [
    { id: 1, action: "New student enrolled", course: "React Fundamentals", time: "2 minutes ago" },
    { id: 2, action: "Course review received", course: "Advanced JavaScript", time: "1 hour ago" },
    { id: 3, action: "Payment received", course: "React Fundamentals", time: "3 hours ago" },
    { id: 4, action: "Course updated", course: "Node.js Backend", time: "1 day ago" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
          <p className="text-muted-foreground">Manage your courses and track your success</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{instructorStats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              {instructorStats.coursesPublished} published, {instructorStats.coursesDraft} draft
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{instructorStats.totalStudents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${instructorStats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8.2%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{instructorStats.avgRating}</div>
            <p className="text-xs text-muted-foreground">Based on 1,247 reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* My Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>My Courses</CardTitle>
                <CardDescription>Manage and track your courses</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/instructor/courses">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              courses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="mb-1">
                      <h4 className="font-medium">{course.title}</h4>
                      <p className="text-xs truncate line-clamp-1">{course.description}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{course.enrollmentCount} students</span>
                      <span>${course.price || 0}</span>
                      {course.rating > 0 && <span>⭐ {course.rating}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/instructor/courses/${course.id}`}>
                        <Eye className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/instructor/courses/${course.id}/edit`}>
                        <Edit className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
            
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your courses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.course}</p>
                </div>
                <Badge variant="secondary">{activity.time}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent" asChild>
          <Link href="/instructor/courses/new">
            <Plus className="w-6 h-6" />
            Create Course
          </Link>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent" asChild>
          <Link href="/instructor/students">
            <Users className="w-6 h-6" />
            My Students
          </Link>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent" asChild>
          <Link href="/instructor/analytics">
            <BarChart3 className="w-6 h-6" />
            Analytics
          </Link>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent" asChild>
          <Link href="/instructor/earnings">
            <DollarSign className="w-6 h-6" />
            Earnings
          </Link>
        </Button>
      </div>
    </div>
  )
}
