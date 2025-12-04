"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Star,
  Clock,
  Play,
  BookOpen,
  Trophy,
  Target,
  Crown,
  Award,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  Calendar,
  BookmarkCheck,
  GraduationCap,
  User,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useCourses } from "@/hooks/use-courses"

// Enhanced Course type with enrollment data
interface EnrolledCourse {
  id: string
  course: {
    id: string
    title: string
    description: string
    thumbnail: string
    level: string
    price: number
    isPublished: boolean
    modules: Array<{
      id: string
      title: string
      lessons: Array<{
        id: string
        title: string
        completed: boolean
        duration: string
        isProject: boolean
        isExercise: boolean
        order: number
      }>
    }>
    instructor: {
      firstName: string
      lastName: string
    }
    language: string
  }
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
  enrollmentDate: string
  lastAccessed: string
  progress: number
  status: "not_started" | "in_progress" | "completed" | "paused"
  totalLessons: number
  completedLessons: number
  timeSpent: string
  estimatedCompletion: string
  certificateIncluded: boolean
  modules: Array<{
    id: string
    title: string
    lessons: Array<{
      id: string
      title: string
      completed: boolean
      duration: string
      isProject: boolean
      isExercise: boolean
    }>
  }>
  deadline?: string
}

export default function MyCoursesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    totalHoursSpent: 0,
    averageProgress: 0,
    certificatesEarned: 0,
  })
  const { token, user } = useAuth()
  const { fetchSingleCourse } = useCourses()

  // Function to generate learning steps (same as in the first file)
  const generateLearningSteps = (course: EnrolledCourse["course"]) => {
    const steps: any[] = []

    course.modules?.forEach((module) => {
      const sortedLessons = [...module.lessons].sort((a, b) => {
        if (a.isProject && !b.isProject) return 1
        if (!a.isProject && b.isProject) return -1
        return a.order - b.order
      })

      sortedLessons.forEach((lesson) => {
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

        lesson.assessments?.forEach((assessment) => {
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
        const courseResponse = await fetchSingleCourse(courseId)

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

  // Helper function to check if enrollment is expired
  const isEnrollmentExpired = (enrollment: any) => {
    if (!enrollment.deadline || enrollment.status === "completed") return false
    const expiryDate = new Date(enrollment.deadline)
    const now = new Date()
    return now > expiryDate
  }

  // Helper function to calculate days until expiration
  const getDaysUntilExpiration = (enrollment: any) => {
    if (!enrollment.deadline) return null
    const expiryDate = new Date(enrollment.deadline)
    const now = new Date()
    if (now > expiryDate) return 0
    const timeDiff = expiryDate.getTime() - now.getTime()
    return Math.ceil(timeDiff / (1000 * 3600 * 24))
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
          setEnrollments(data.enrollments)

          const enrollmentsWithProgress = await Promise.all(
            data.enrollments.map(async (enrollment: any) => {
              // Calculate progress for each course
              const progress = await calculateCourseProgress(enrollment.course.id, user.id)

              return {
                ...enrollment,
                progress,
                status: progress === 0 ? "not_started" : progress === 100 ? "completed" : "in_progress",
                totalLessons:
                  enrollment.course.modules?.reduce(
                    (total: number, module: any) => total + (module.lessons?.length || 0),
                    0,
                  ) || 0,
                completedLessons: Math.floor(
                  (progress / 100) *
                    (enrollment.course.modules?.reduce(
                      (total: number, module: any) => total + (module.lessons?.length || 0),
                      0,
                    ) || 0),
                ),
              }
            }),
          )

          setEnrollments(enrollmentsWithProgress)

          // Calculate stats
          const totalCourses = data.enrollments.length
          const completedCourses = data.enrollments.filter(
            (c: EnrolledCourse) => c.course.status === "completed",
          ).length
          const inProgressCourses = data.enrollments.filter(
            (c: EnrolledCourse) => c.course.status === "in_progress",
          ).length
          const certificatesEarned = data.enrollments.filter((c: EnrolledCourse) => c.course.certificateIncluded).length
          const averageProgress =
            totalCourses > 0
              ? data.enrollments.reduce((sum: number, c: EnrolledCourse) => sum + c.progress, 0) / totalCourses
              : 0

          setStats({
            totalCourses,
            completedCourses,
            inProgressCourses,
            totalHoursSpent: Math.floor(Math.random() * 100) + 50, // Mock data
            averageProgress: Math.round(averageProgress),
            certificatesEarned,
          })
        }
      } catch (error) {
        console.error("Failed to fetch enrolled enrollments:", error)

        setStats({
          totalCourses: 3,
          completedCourses: 1,
          inProgressCourses: 1,
          totalHoursSpent: 67,
          averageProgress: 58,
          certificatesEarned: 1,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMyCourses()
  }, [user, token])

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const matchesSearch =
      enrollment.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.course.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "in_progress" && enrollment.status === "in_progress") ||
      (activeTab === "completed" && enrollment.status === "completed") ||
      (activeTab === "not_started" && enrollment.status === "not_started")

    return matchesSearch && matchesTab
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "in_progress":
        return <PlayCircle className="w-4 h-4 text-blue-500" />
      case "paused":
        return <PauseCircle className="w-4 h-4 text-yellow-500" />
      default:
        return <BookOpen className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500 hover:bg-green-600"
      case "in_progress":
        return "bg-blue-500 hover:bg-blue-600"
      case "paused":
        return "bg-yellow-500 hover:bg-yellow-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "beginner":
        return <Target className="w-3 h-3" />
      case "intermediate":
        return <Trophy className="w-3 h-3" />
      case "advanced":
        return <Crown className="w-3 h-3" />
      default:
        return <Target className="w-3 h-3" />
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-500 hover:bg-green-600"
      case "intermediate":
        return "bg-blue-500 hover:bg-blue-600"
      case "advanced":
        return "bg-purple-500 hover:bg-purple-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  if (!user || !token) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex justify-center items-center h-screen">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-lg">Loading your courses...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <div className="text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10 rounded-3xl -z-10"></div>
          <div className="py-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold text-primary">My Learning Journey</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Track your progress, continue learning, and unlock achievements
            </p>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-card border-2 border-primary/10 rounded-xl p-4 hover:border-primary/20 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  <span className="text-2xl font-bold text-primary">{stats.totalCourses}</span>
                </div>
                <p className="text-sm text-muted-foreground">Total Courses</p>
              </div>

              <div className="bg-card border-2 border-green-500/10 rounded-xl p-4 hover:border-green-500/20 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-2xl font-bold text-green-600">{stats.completedCourses}</span>
                </div>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>

              <div className="bg-card border-2 border-blue-500/10 rounded-xl p-4 hover:border-blue-500/20 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <PlayCircle className="w-5 h-5 text-blue-500" />
                  <span className="text-2xl font-bold text-blue-600">{stats.inProgressCourses}</span>
                </div>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>

              <div className="bg-card border-2 border-yellow-500/10 rounded-xl p-4 hover:border-yellow-500/20 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span className="text-2xl font-bold text-yellow-600">{stats.certificatesEarned}</span>
                </div>
                <p className="text-sm text-muted-foreground">Certificates</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Tabs */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search your enrollments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-2 focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:w-fit">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                All ({enrollments.length})
              </TabsTrigger>
              <TabsTrigger value="in_progress" className="flex items-center gap-2">
                <PlayCircle className="w-4 h-4" />
                In Progress ({enrollments.filter((c) => c.status === "in_progress").length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Completed ({enrollments.filter((c) => c.status === "completed").length})
              </TabsTrigger>
              <TabsTrigger value="not_started" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Not Started ({enrollments.filter((c) => c.status === "not_started").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredEnrollments.map((enrollment) => (
                  <Card
                    key={enrollment.id}
                    className="pt-0 overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group border-2 hover:border-primary/20 bg-gradient-to-b from-card to-card/50"
                  >
                    <div className="relative">
                      <img
                        src={enrollment.course.thumbnail || "/placeholder0.svg"}
                        alt={enrollment.course.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Progress Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={`${getStatusColor(enrollment.status)} shadow-md flex items-center gap-1`}>
                            {getStatusIcon(enrollment.status)}
                            {enrollment.status.replace("_", " ").toUpperCase()}
                          </Badge>
                          {enrollment.course.certificateIncluded && (
                            <Badge className="bg-yellow-500 hover:bg-yellow-600 shadow-md">
                              <Award className="w-3 h-3 mr-1" />
                              Certified
                            </Badge>
                          )}
                        </div>
                        <Progress value={enrollment.progress} className="h-2 bg-white/20" />
                        <p className="text-white text-sm mt-2 font-medium">{enrollment.progress}% Complete</p>
                      </div>

                      <div className="absolute top-2 right-2 flex gap-2">
                        {isEnrollmentExpired(enrollment) ? (
                          <Badge className="bg-red-500 hover:bg-red-600 shadow-md font-semibold">Expired</Badge>
                        ) : getDaysUntilExpiration(enrollment) !== null && getDaysUntilExpiration(enrollment) <= 7 ? (
                          <Badge className="bg-orange-500 hover:bg-orange-600 shadow-md font-semibold">
                            Expires in {getDaysUntilExpiration(enrollment)}{" "}
                            {getDaysUntilExpiration(enrollment) === 1 ? "day" : "days"}
                          </Badge>
                        ) : null}
                      </div>

                      {/* Level Badge */}
                      <div className="absolute top-2 left-2">
                        <Badge
                          className={`${getLevelColor(enrollment.course.level)} shadow-md flex items-center gap-1`}
                        >
                          {getLevelIcon(enrollment.course.level)}
                          {enrollment.course.level.charAt(0).toUpperCase() + enrollment.course.level.slice(1)}
                        </Badge>
                      </div>

                      {/* Continue Button Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                        <Button
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100 bg-primary/90 hover:bg-primary shadow-lg"
                          asChild
                          disabled={isEnrollmentExpired(enrollment)}
                        >
                          <Link href={`/courses/${enrollment.course.id}/learn`}>
                            {isEnrollmentExpired(enrollment) ? (
                              <>
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Access Expired
                              </>
                            ) : enrollment.status === "not_started" ? (
                              <>
                                <Play className="w-4 h-4 mr-2" />
                                Start Learning
                              </>
                            ) : enrollment.status === "completed" ? (
                              <>
                                <BookmarkCheck className="w-4 h-4 mr-2" />
                                Review
                              </>
                            ) : (
                              <>
                                <PlayCircle className="w-4 h-4 mr-2" />
                                Continue
                              </>
                            )}
                          </Link>
                        </Button>
                      </div>
                    </div>

                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-bold">{enrollment.course.rating}</span>
                          <span className="text-xs text-muted-foreground">({enrollment.course.reviewCount})</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
                        </div>
                      </div>
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {enrollment.course.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">{enrollment.course.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="flex items-center gap-2 mb-4">
                        {enrollment.instructor?.profilePicUrl ? (
                          <img
                            src={enrollment.instructor?.profilePicUrl || "/placeholder0.svg"}
                            alt={`${enrollment.instructor?.firstName} ${enrollment.instructor?.lastName}`}
                            className="w-7 h-7 rounded-full border-2 border-primary/20"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full border-2 border-primary/20 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium text-primary">
                            {enrollment.instructor?.firstName} {enrollment.instructor?.lastName}
                          </span>
                        </div>
                      </div>

                      {/* Enhanced Stats Grid */}
                      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                        <div className="flex items-center gap-1 p-2 bg-muted/50 rounded-lg">
                          <Clock className="w-3 h-3 text-blue-500" />
                          <span className="font-medium">
                            {enrollment.course.duration != 0 ? enrollment.course.duration + " hours" : "Not set"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 p-2 bg-muted/50 rounded-lg">
                          <Target className="w-3 h-3 text-orange-500" />
                          <span className="font-medium">{enrollment.course.language}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* <div className="text-sm text-muted-foreground">
                          {enrollment.course.lastAccessed !== "Never" 
                            ? `Last accessed ${new Date(enrollment.course.lastAccessed).toLocaleDateString()}`
                            : "Never accessed"
                          }
                        </div> */}
                        <Button size="sm" className="bg-primary hover:bg-primary/90 shadow-md rounded" asChild>
                          <Link href={`/courses/${enrollment.course.id}/learn`}>
                            {enrollment.course.status === "not_started" ? "Start" : "Continue"}
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Empty State */}
              {filteredEnrollments.length === 0 && (
                <div className="text-center py-16">
                  <div className="bg-muted/50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <GraduationCap className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">
                    {activeTab === "all" ? "No enrollments found" : `No ${activeTab.replace("_", " ")} enrollments`}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {activeTab === "all"
                      ? "Start your learning journey by enrolling in some enrollments"
                      : `You don't have any ${activeTab.replace("_", " ")} enrollments yet`}
                  </p>
                  <Button asChild>
                    <Link href="/enrollments">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Browse Courses
                    </Link>
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
