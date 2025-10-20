"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, DollarSign, TrendingUp, Plus, Eye, Edit, BarChart3, Calendar } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Course, User } from "@/types"

interface Student {
  student: {
    id: number
    email: string
    firstName: string
    lastName: string
    totalPoints: number
    level: number
    streakDays: number
    profilePicUrl: string | null
    createdAt: string
    updatedAt: string
  }
}

interface StudentsResponse {
  success: boolean
  instructorId: string
  studentCount: number
  students: Student[]
}

export default function InstructorDashboard() {
  const { user, token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [instructorStats, setInstructorStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    avgRating: 0,
    coursesPublished: 0,
    coursesDraft: 0,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch courses
        const coursesResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/courses/instructor/${user?.id}/courses`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        )

        // Fetch students
        const studentsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/courses/instructor/${user?.id}/students`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (coursesResponse.ok && studentsResponse.ok) {
          const coursesData = await coursesResponse.json()
          const studentsData: StudentsResponse = await studentsResponse.json()

          setCourses(coursesData.courses.slice(0, 3))
          setStudents(studentsData.students)

          // Calculate dynamic stats
          const totalCourses = coursesData.courses.length
          const coursesPublished = coursesData.courses.filter((course: Course) => course.isPublished).length
          const coursesDraft = totalCourses - coursesPublished
          const totalStudents = studentsData.studentCount
          
          // Calculate total revenue from published courses
          const totalRevenue = coursesData.courses
            .filter((course: Course) => course.isPublished)
            .reduce((sum: number, course: Course) => sum + parseFloat(course.price.toString() || "0"), 0)

          // Calculate average rating from courses with ratings
          const coursesWithRatings = coursesData.courses.filter((course: Course) => course.rating > 0)
          const avgRating = coursesWithRatings.length > 0 
            ? coursesWithRatings.reduce((sum: number, course: Course) => sum + course.rating, 0) / coursesWithRatings.length
            : 0

          setInstructorStats({
            totalCourses,
            totalStudents,
            totalRevenue,
            avgRating: parseFloat(avgRating.toFixed(1)),
            coursesPublished,
            coursesDraft,
          })
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.id && token) {
      fetchData()
    }
  }, [user?.id, token])

  // Format date to relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    
    return date.toLocaleDateString()
  }

  // Get recent students (last 4)
  const recentStudents = students.slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
          <p className="text-muted-foreground">Manage your courses and track your success</p>
        </div>
      </div> */}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : instructorStats.totalCourses}</div>
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
            <div className="text-2xl font-bold">{loading ? "..." : instructorStats.totalStudents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all your published courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : "$" + instructorStats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From published courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : instructorStats.avgRating}</div>
            <p className="text-xs text-muted-foreground">
              {instructorStats.avgRating > 0 ? 'Based on course ratings' : 'No ratings yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* My Courses & Recent Students */}
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
            ) : courses.length > 0 ? (
              courses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="mb-1">
                      <h4 className="font-medium">{course.title}</h4>
                      <p className="text-xs truncate line-clamp-1">{course.description}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{course.enrollmentCount} students</span>
                      <span>${parseFloat(course.price.toString() || "0").toLocaleString()}</span>
                      {course.rating > 0 && <span>⭐ {course.rating}</span>}
                      <Badge variant={course.isPublished ? "default" : "secondary"}>
                        {course.isPublished ? "Published" : "Draft"}
                      </Badge>
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
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No courses yet</p>
                <Button variant="link" asChild>
                  <Link href="/instructor/courses/new">Create your first course</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Students</CardTitle>
                <CardDescription>Students enrolled in your courses</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/instructor/students">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : recentStudents.length > 0 ? (
              recentStudents.map((student) => (
                <div key={student.student.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      {student.student.profilePicUrl ? (
                        <img 
                          src={student.student.profilePicUrl} 
                          alt={`${student.student.firstName} ${student.student.lastName}`}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <Users className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {student.student.firstName} {student.student.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{student.student.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">Level {student.student.level}</Badge>
                        <Badge variant="outline" className="text-xs">{student.student.totalPoints} pts</Badge>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatRelativeTime(student.student.createdAt)}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No students yet</p>
                <p className="text-sm">Students will appear here when they enroll in your courses</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}