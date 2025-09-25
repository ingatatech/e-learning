"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Clock, Award, TrendingUp, Play, Calendar, Target, CheckCircle, PlayCircle, Book, Star, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"

interface EnrolledCourse {
  id: string
  course: {
    id: string
    title: string
    description: string
    thumbnail: string
    instructor: {
      firstName: string
      lastName: string
      profilePicUrl: string
    }
    level: "beginner" | "intermediate" | "advanced"
    category: {
      name: string
    }
    duration: string
    rating: number
    reviewCount: number
    language: string
    certificateIncluded: boolean
    modules: Array<{
      id: string
      title: string
      lessons: Array<{
        id: string
        title: string
        completed: boolean
        duration: string
        isProject?: boolean
        order: number
        content?: string
        videoUrl?: string
        assessments?: Array<{
          id: string
          title: string
        }>
      }>
    }>
  }
  enrolledAt: string
  lastAccessed: string
  progress: number
  status: "not_started" | "in_progress" | "completed" | "paused"
  totalLessons: number
  completedLessons: number
}

export default function StudentDashboard() {
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    totalHoursSpent: 0,
    averageProgress: 0,
    certificatesEarned: 0
  })
  const [currentDate, setCurrentDate] = useState(new Date())
  const { token, user } = useAuth()

  // Function to generate learning steps
  const generateLearningSteps = (course: any) => {
    const steps: any[] = []

    course.modules?.forEach((module: any) => {
      const sortedLessons = [...module.lessons].sort((a: any, b: any) => {
        if (a.isProject && !b.isProject) return 1
        if (!a.isProject && b.isProject) return -1
        return a.order - b.order
      })

      sortedLessons.forEach((lesson: any) => {
        if (lesson.content && lesson.content.trim()) {
          steps.push({
            id: `${lesson.id}-content`,
            type: "content",
            lessonId: lesson.id.toString(),
          })
        }

        if (lesson.videoUrl && lesson.videoUrl.trim()) {
          steps.push({
            id: `${lesson.id}-video`,
            type: "video",
            lessonId: lesson.id.toString(),
          })
        }

        lesson.assessments?.forEach((assessment: any) => {
          steps.push({
            id: `${lesson.id}-assessment-${assessment.id}`,
            type: "assessment",
            lessonId: lesson.id.toString(),
            assessment,
          })
        })
      })
    })

    return steps
  }

  // Function to calculate progress for a course
  const calculateCourseProgress = async (courseId: string, userId: string) => {
    if (!token) return 0

    try {
      // Fetch progress data
      const progressResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/progress/course/${courseId}/user/${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (progressResponse.ok) {
        const progressData = await progressResponse.json()
        
        // Get the course to generate steps
        const courseResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/get/${courseId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        
        if (courseResponse.ok) {
          const courseData = await courseResponse.json()
          const allSteps = generateLearningSteps(courseData.course)
          
          // Calculate completed steps
          const completedSteps = allSteps.filter((step) => {
            if (step.type === "assessment" && step.assessment) {
              return progressData.progress?.completedSteps?.some(
                (s: any) => s.assessmentId === step.assessment.id && s.isCompleted,
              )
            }
            return progressData.progress?.completedSteps?.some(
              (s: any) => String(s.lessonId) === String(step.lessonId) && !s.assessmentId && s.isCompleted,
            )
          }).length

          // Calculate progress percentage
          return allSteps.length > 0 ? Math.round((completedSteps / allSteps.length) * 100) : 0
        }
      }
    } catch (error) {
      console.error("Failed to calculate progress:", error)
    }
    
    return 0
  }

  useEffect(() => {
    const fetchMyCourses = async () => {
      if (!user || !token) return
      setLoading(true)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/enrollments/user-enrollments`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: user.id,
          }),
          method: "POST",
        })
        
        if (response.ok) {
          const data = await response.json()
          
          const enrollmentsWithProgress = await Promise.all(
            data.enrollments.map(async (enrollment: any) => {
              // Calculate progress for each course
              const progress = await calculateCourseProgress(enrollment.course.id, user.id)
              
              return {
                ...enrollment,
                progress,
                status: progress === 0 ? "not_started" : 
                       progress === 100 ? "completed" : "in_progress",
                totalLessons: enrollment.course.modules?.reduce((total: number, module: any) => 
                  total + (module.lessons?.length || 0), 0) || 0,
                completedLessons: Math.floor(progress / 100 * (enrollment.course.modules?.reduce((total: number, module: any) => 
                  total + (module.lessons?.length || 0), 0) || 0))
              }
            })
          )
          
          setEnrollments(enrollmentsWithProgress)
          
          // Calculate stats
          const totalCourses = enrollmentsWithProgress.length
          const completedCourses = enrollmentsWithProgress.filter((c: EnrolledCourse) => c.status === "completed").length
          const inProgressCourses = enrollmentsWithProgress.filter((c: EnrolledCourse) => c.status === "in_progress").length
          const certificatesEarned = enrollmentsWithProgress.filter((c: EnrolledCourse) => c.course.certificateIncluded).length
          const averageProgress = totalCourses > 0 
            ? enrollmentsWithProgress.reduce((sum: number, c: EnrolledCourse) => sum + c.progress, 0) / totalCourses 
            : 0
          
          setStats({
            totalCourses,
            completedCourses,
            inProgressCourses,
            totalHoursSpent: Math.floor(Math.random() * 100) + 50, // Mock data for hours
            averageProgress: Math.round(averageProgress),
            certificatesEarned
          })
        }
      } catch (error) {
        console.error("Failed to fetch enrolled courses:", error)
        
        // Fallback mock data
        setStats({
          totalCourses: 3,
          completedCourses: 1,
          inProgressCourses: 1,
          totalHoursSpent: 67,
          averageProgress: 58,
          certificatesEarned: 1
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMyCourses()
  }, [user, token])

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDate = (date: Date) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return {
      month: months[date.getMonth()],
      day: days[date.getDay()],
      date: date.getDate(),
      year: date.getFullYear()
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const today = new Date()
    const isCurrentMonth = currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear()
    
    const days = []
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    
    // Add day labels
    dayLabels.forEach(day => {
      days.push(
        <div key={`label-${day}`} className="text-center text-xs font-medium text-muted-foreground p-2">
          {day}
        </div>
      )
    })
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = isCurrentMonth && day === today.getDate()
      const hasEvent = day === 18 || day === 6 // Mock events
      
      days.push(
        <div
          key={day}
          className={`p-2 text-center text-sm cursor-pointer hover:bg-accent rounded-md relative ${
            isToday ? 'bg-primary text-primary-foreground font-semibold' : 'text-foreground'
          }`}
        >
          {day}
          {hasEvent && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full"></div>
          )}
        </div>
      )
    }
    
    return days
  }

  // Mock upcoming tasks
  const upcomingTasks = [
    {
      id: 1,
      title: "Discussion Algorithm",
      time: "09:00 AM - 12:00 PM",
      color: "bg-blue-500"
    },
    {
      id: 2,
      title: "Simple Home Page Design",
      time: "09:00 AM - 15:00 PM",
      color: "bg-green-500"
    }
  ]

  const currentDateFormatted = formatDate(new Date())

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-30/50 to-blue-50 dark:from-gray-900/20 dark:to-gray-800/20 rounded-lg p-1">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section - Welcome, Charts and Courses */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-green-400 to-green-600 dark:from-green-600 dark:to-green-700 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h1 className="text-3xl font-bold mb-2">
                  Hi {user?.firstName || 'Student'}!
                </h1>
                <p className="text-lg opacity-90">
                  You have completed {stats.completedCourses} lesson{stats.completedCourses !== 1 ? 's' : ''} in the last day. Start your learning today.
                </p>
              </div>
              <div className="absolute right-4 top-4 opacity-20">
                <div className="w-32 h-32 rounded-full border-4 border-white flex items-center justify-center">
                  <BookOpen className="w-16 h-16" />
                </div>
              </div>
            </div>

            {/* My Courses */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">My Courses</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-primary">All</Button>
                    <Button variant="ghost" size="sm">Ongoing</Button>
                    <Button variant="ghost" size="sm">Complete</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    // Loading state
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 border rounded-lg animate-pulse">
                        <div className="w-12 h-12 bg-muted rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                        <div className="w-20 h-2 bg-muted rounded"></div>
                      </div>
                    ))
                  ) : enrollments.length > 0 ? (
                    enrollments.slice(0, 4).map((enrollment) => (
                      <div key={enrollment.id} className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center">
                          {enrollment.course.thumbnail ? (
                            <img 
                              src={enrollment.course.thumbnail} 
                              alt={enrollment.course.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <BookOpen className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">{enrollment.course.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            By {enrollment.course.instructor.firstName} {enrollment.course.instructor.lastName}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium">{enrollment.course.rating || 4.3}</span>
                          </div>
                          <div className="w-16">
                            <Progress value={enrollment.progress} className="h-2" />
                          </div>
                          <span className="text-xs text-muted-foreground w-8">{enrollment.progress}%</span>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/courses/${enrollment.course.id}/learn`}>
                              View Course
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h4 className="font-medium mb-2">No courses enrolled</h4>
                      <p className="text-sm text-muted-foreground mb-4">Start learning by enrolling in a course</p>
                      <Button asChild>
                        <Link href="/courses">Browse Courses</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Section - Upcoming Tasks and Calendar */}
          <div className="space-y-6">
            {/* Upcoming Tasks */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Upcoming Task</CardTitle>
                  <Button variant="ghost" size="sm">See all</Button>
                </div>
                <p className="text-sm text-muted-foreground">Sunday 28,jun 2020</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className={`w-3 h-3 rounded-full ${task.color}`}></div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{task.title}</h4>
                        <p className="text-xs text-muted-foreground">{task.time}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Calendar */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{currentDateFormatted.month} {currentDate.getDate()} {currentDateFormatted.day}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => navigateMonth('prev')}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => navigateMonth('next')}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  {renderCalendar()}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}