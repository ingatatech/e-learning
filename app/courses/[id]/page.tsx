"use client"

import { use, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Play,
  Users,
  Star,
  Share2,
  Heart,
  CheckCircle,
  Lock,
  ArrowLeft,
  Trophy,
  Target,
  Crown,
  Zap,
  Award,
  BookOpen,
  Flame,
  Shield,
  Gift,
} from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { useAuth } from "@/hooks/use-auth"
import type { Course } from "@/types"
import { CoursePaymentDialog } from "@/components/payment/course-payment-dialog"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Calendar, Clock } from "lucide-react"

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [currentProgress, setCurrentProgress] = useState(0)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const { token, user } = useAuth()
  const { id } = use(params)
  const [course, setCourse] = useState<Course>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [insCourses, setInsCourses] = useState(0)
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  // Add these state variables inside the component
const [accessExpired, setAccessExpired] = useState(false)
const [daysRemaining, setDaysRemaining] = useState<number | null>(null)
const [enrollmentData, setEnrollmentData] = useState<Enrollment | null>(null)
const [showExtendModal, setShowExtendModal] = useState(false)
const [extendDays, setExtendDays] = useState<number>(30)
const [isExtending, setIsExtending] = useState(false)
// Add these state variables inside the component
const [userRating, setUserRating] = useState<{ rating: number; review: string } | null>(null)
const [courseReviews, setCourseReviews] = useState<any[]>([])
const [showRating, setShowRating] = useState(false)
  

  useEffect(() => {
    const fetchCourseAndEnrollment = async () => {
      if (!token || !user) return

      try {
        setLoading(true)


        // Fetch course details
        const courseResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/get/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (courseResponse.ok) {
          const courseData = await courseResponse.json()
          setCourse(courseData.course)
          setError(null)
            await fetchCourseRating()


          // Fetch user enrollments
          const enrollmentsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/enrollments/user-enrollments`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            method: "POST",
            body: JSON.stringify({
              userId: user.id,
            }),
          })

          
        if (enrollmentsResponse.ok) {
          const enrollmentsData = await enrollmentsResponse.json()

          // Check if current course is in user's enrollments
          const enrolledCourse = enrollmentsData.enrollments.find(
            (enrollment: any) => enrollment.course.id.toString() === id,
          )

          if (enrolledCourse) {
            setIsEnrolled(true)
            setEnrollmentData(enrolledCourse)

              try {
                if (enrolledCourse.deadline && enrolledCourse.status !== "completed") {
                const expiryDate = new Date(enrolledCourse.deadline)
                const now = new Date()
                console.log(now, expiryDate)

                if (now > expiryDate) {
                  setAccessExpired(true)
                } else {
                  const timeDiff = expiryDate.getTime() - now.getTime()
                  const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24))
                  setDaysRemaining(daysLeft)
                }
              }
                const progressResponse = await fetch(
                  `${process.env.NEXT_PUBLIC_API_URL}/progress/course/${id}/user/${user.id}`,
                  {
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                  },
                )

                if (progressResponse.ok) {
                  const progressData = await progressResponse.json()

                  // Calculate progress based on completed steps
                  const allSteps = generateLearningSteps(courseData.course)
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

                  const calculatedProgress = allSteps.length > 0 ? (completedSteps / allSteps.length) * 100 : 0
                  setCurrentProgress(Math.round(calculatedProgress))
                } else {
                  setCurrentProgress(0)
                }
              } catch (progressError) {
                console.error("Failed to fetch progress:", progressError)
                setCurrentProgress(0)
              }
            } else {
              setIsEnrolled(false)
            }
          }

          // Fetch courses for the instructor
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/courses/instructor/${courseData.course.instructor.id}/courses`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            },
          )
          if (response.ok) {
            const data = await response.json()
            setInsCourses(data.courses.length)
          }
        } else {
          setError("Failed to fetch course details")
        }
      } catch (error) {
        console.error("Failed to fetch course or enrollment:", error)
        setError("An error occurred while fetching course details")
      } finally {
        setLoading(false)
      }
    }

    fetchCourseAndEnrollment()
  }, [token, id, user])

  const fetchCourseRating = async () => {
  if (!token) return
  
  try {
    // Fetch user's rating
    const userRatingRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/course/${id}`, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    })
    if (userRatingRes.ok) {
      const userRatingData = await userRatingRes.json()
      setUserRating(userRatingData.rating)
    }

    // Fetch all reviews for the course
    const reviewsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/course/${id}`, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    })
    if (reviewsRes.ok) {
      const reviewsData = await reviewsRes.json()
      setCourseReviews(reviewsData.reviews || [])
    }
  } catch (error) {
    console.error("Failed to fetch rating data:", error)
  }
}

const handleRatingSubmit = async (rating: number, review: string) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        userId: user?.id,
        courseId: id,
        rating,
        comment: review,
      }),
    })

    if (response.ok) {
      setUserRating({ rating, review })
      await fetchCourseRating()
      setShowRating(false)
      toast({
        title: "Rating submitted",
        description: "Thank you for your review!",
      })
    }
  } catch (error) {
    console.error("Failed to submit rating:", error)
    toast({
      title: "Error",
      description: "Failed to submit rating. Please try again.",
      variant: "destructive",
    })
  }
}

  const handleExtendAccess = async () => {
  if (!token || !user || !enrollmentData) return
  
  setIsExtending(true)
  
  try {
    // Calculate days user has already had access
    const enrolledDate = new Date(enrollmentData.enrolledAt)
    const today = new Date()
    const daysAccessed = Math.ceil((today.getTime() - enrolledDate.getTime()) / (1000 * 3600 * 24))
    
    const maxAllowedDays = 365
    const totalDaysWithExtension = daysAccessed + extendDays
    
    if (totalDaysWithExtension > maxAllowedDays) {
      const maxExtension = maxAllowedDays - daysAccessed
      toast({
        title: "Extension limit exceeded",
        description: `You can only extend up to ${maxExtension} days to stay within the one-year limit.`,
        variant: "destructive",
      })
      setIsExtending(false)
      return
    }
    
    // Call the endpoint to extend access
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/access/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        enrollmentId: enrollmentData.id,
        userId: user.id,
        extensionDays: extendDays,
      }),
    })
    
    if (response.ok) {
      const result = await response.json()
      
      toast({
        title: "Access extended successfully",
        description: `Your course access has been extended by ${extendDays} days.`,
      })
      
      // Update local state
      if (result.newDeadline) {
        const newDeadline = new Date(result.newDeadline)
        const now = new Date()
        const timeDiff = newDeadline.getTime() - now.getTime()
        const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24))
        setDaysRemaining(daysLeft)
        setAccessExpired(false)
      }
      
      setShowExtendModal(false)
    } else {
      const errorData = await response.json()
      toast({
        title: "Failed to extend access",
        description: errorData.message || "An error occurred while extending access.",
        variant: "destructive",
      })
    }
  } catch (error) {
    console.error("Error extending access:", error)
    toast({
      title: "Error",
      description: "An unexpected error occurred.",
      variant: "destructive",
    })
  } finally {
    setIsExtending(false)
  }
}

  const handleEnroll = async () => {
    if (course!.price > 0) {
      setShowPaymentDialog(true)
      return
    }

    setIsEnrolling(true)
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/enrollments/enroll`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: user!.id,
        courseId: course?.id,
      }),
    })

    if (response.ok) {
      setIsEnrolled(true)
      setIsEnrolling(false)
    } else {
      console.error("Enrollment failed")
      setIsEnrolling(false)
    }
  }

  const handlePaymentSuccess = () => {
    setIsEnrolled(true)
    setShowPaymentDialog(false)
    // Optionally refresh the page or show a success message
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "beginner":
        return <Target className="w-4 h-4" />
      case "intermediate":
        return <Trophy className="w-4 h-4" />
      case "advanced":
        return <Crown className="w-4 h-4" />
      default:
        return <Target className="w-4 h-4" />
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

  const generateLearningSteps = (course: Course) => {
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

  if (!user) {
    return null
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-lg">Loading course details...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error || !course) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium">{error || "Course not found"}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button className="mb-8 hover:bg-primary/10" variant="ghost" size="sm" asChild>
          <Link href="/courses/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course Library
          </Link>
        </Button>

        {/* Hero Section - Improved Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
          {/* Left Content - Spans 3 columns */}
          <div className="lg:col-span-3 space-y-6">
            {/* Course Info Card */}
            <Card className="border-2 bg-gradient-to-br from-card to-card/50">
              <CardContent className="p-8">
                {/* Badges Row */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <Badge variant="secondary" className="px-3 py-1">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {course.category?.name || "General"}
                  </Badge>
                  <Badge className={`${getLevelColor(course.level)} text-white flex items-center gap-1`}>
                    {getLevelIcon(course.level)}
                    {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                  </Badge>
                  {course.certificateIncluded && (
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                      <Award className="w-3 h-3 mr-1" />
                      Certificate Course
                    </Badge>
                  )}
                  {course.isPopular && (
                    <Badge className="bg-gradient-to-r from-red-500 to-pink-500">
                      <Flame className="w-3 h-3 mr-1" />
                      Popular Course
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  {course.title}
                </h1>

                {/* Description */}
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{course.description}</p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <div>
                      <div className="font-bold">{course.rating}</div>
                      <div className="text-xs text-muted-foreground">Rating</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                    <Users className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="font-bold">{course.enrollmentCount.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Module(s)</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <div>
                      <div className="font-bold">{course.duration || "0"}h</div>
                      <div className="text-xs text-muted-foreground">Duration</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                    <BookOpen className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="font-bold">{course.lessonsCount}</div>
                      <div className="text-xs text-muted-foreground">Lessons</div>
                    </div>
                  </div>
                </div>

                {/* Instructor Section */}
                <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <Avatar className="w-14 h-14 border-2 border-primary/30">
                    <AvatarImage src={course.instructor?.profilePicUrl || "/placeholder.svg"} />
                    <AvatarFallback className="bg-primary/10">
                      {course.instructor?.firstName?.[0] || "I"}
                      {course.instructor?.lastName?.[0] || "N"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm text-primary">Course Master</span>
                    </div>
                    <h3 className="font-bold text-lg">
                      {course.instructor?.firstName} {course.instructor?.lastName || "Expert Guide"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {course.instructor?.title || "Professional Instructor"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Spans 2 columns */}
          <div className="lg:col-span-2">
            <Card className="sticky top-4 border-2 shadow-xl bg-gradient-to-br from-card to-card/80 pt-0">
              {/* Video Preview */}
              <div className="aspect-video relative overflow-hidden rounded-t-lg">
                <img
                  src={course.thumbnail || "/placeholder.svg"}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-center justify-center">
                  <Button
                    size="lg"
                    className="bg-white/95 text-black hover:bg-white shadow-xl transform hover:scale-105 transition-all"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Preview Course
                  </Button>
                </div>
              </div>

              <CardContent className="p-6">
                {/* Price Section */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-primary">
                      {course.price == 0 || course.price === null || course.price === undefined
                        ? "FREE"
                        : `${course.price} RWF`}
                    </span>
                    {course.originalPrice > course.price && (
                      <span className="text-lg text-muted-foreground line-through">{course.originalPrice} RWF</span>
                    )}
                  </div>
                  {course.originalPrice > course.price && (
                    <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md">
                      <Zap className="w-3 h-3 mr-1" />
                      {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}% OFF
                    </Badge>
                  )}
                </div>

                {isEnrolled && enrollmentData && (
        <div className="mb-6">
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Course Access Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {accessExpired ? (
                <div className="space-y-2">
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Access Expired</AlertTitle>
                    <AlertDescription>
                      Your access to this course has expired. Extend your access to continue learning.
                    </AlertDescription>
                  </Alert>
                  <Button 
                    className="w-full" 
                    onClick={() => setShowExtendModal(true)}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Extend Access
                  </Button>
                </div>
              ) : daysRemaining !== null ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Days Remaining</span>
                      <span className="font-semibold">{daysRemaining} days</span>
                    </div>
                    <Progress 
                      value={Math.max(0, Math.min(100, (daysRemaining / 30) * 100))} 
                      className="h-2" 
                    />
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Enrolled On</span>
                      <span>{new Date(enrollmentData.enrolledAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deadline</span>
                      <span>{new Date(enrollmentData.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {daysRemaining <= 7 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setShowExtendModal(true)}
                    >
                      <Calendar className="mr-2 h-3 w-3" />
                      Extend Access
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No deadline set for this course
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

                {/* Enrollment Section */}
                {isEnrolled ? (
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium">Course Progress</span>
                      </div>
                      <span className="text-sm font-bold text-primary">{currentProgress}% Complete</span>
                    </div>
                    <Progress value={currentProgress} className="h-3" />
                    <Button className="w-full bg-primary hover:bg-primary/70 shadow-md" size="lg" asChild>
                      <Link href={`/courses/${course.id}/learn`}>
                        <Play className="w-4 h-4 mr-2" />
                        {currentProgress === 100 ? "Review Course" : "Continue Learning"}
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 mb-6">
                    <Button
                      className="w-full bg-primary  hover:bg-primary/70 shadow-md transform hover:scale-[1.02] transition-all"
                      size="lg"
                      onClick={handleEnroll}
                      disabled={isEnrolling}
                    >
                      {isEnrolling ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Joining Course...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          {course!.price > 0 ? `Enroll Now - ${course!.price} RWF` : "Enroll Now - Free"}
                        </>
                      )}
                    </Button>
                    <Button variant="outline" className="w-full border-2 hover:bg-muted/50 bg-transparent">
                      <Heart className="w-4 h-4 mr-2" />
                      Add to Wishlist
                    </Button>
                  </div>
                )}

                {/* Course Details */}
                <div className="space-y-3 text-sm border-t pt-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary" />
                    Course Details
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-1">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">{course.duration}h</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-muted-foreground">Lessons</span>
                      <span className="font-medium">{course.lessonsCount}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-muted-foreground">Projects</span>
                      <span className="font-medium">{course.projectsCount || 0}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-muted-foreground">Certificate</span>
                      <div className="flex items-center gap-1">
                        {course.certificateIncluded ? (
                          <>
                            <Award className="w-3 h-3 text-green-500" />
                            <span className="font-medium text-green-500">Included</span>
                          </>
                        ) : (
                          <span className="font-medium text-muted-foreground">Not Included</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-muted-foreground">Language</span>
                      <span className="font-medium">{course.language || "English"}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-6 pt-4 border-t">
                  <Button variant="ghost" size="sm" className="flex-1 hover:bg-primary/10">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Course
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1 hover:bg-primary/10">
                    <Heart className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Course Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-lg">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="curriculum"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Target className="w-4 h-4 mr-2" />
              Curriculum
            </TabsTrigger>
            <TabsTrigger
              value="instructor"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Shield className="w-4 h-4 mr-2" />
              Instructor
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Star className="w-4 h-4 mr-2" />
              Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* About This Course */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  About This Course
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{course.about}</p>
              </CardContent>
            </Card>

            {/* What You'll Learn */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  What you will learn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.whatYouWillLearn?.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  Course Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {course.requirements?.map((requirement, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{requirement}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="curriculum">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Course Roadmap
                </CardTitle>
                <CardDescription className="flex items-center gap-4">
                  <span>{course.modules?.length || 0} modules</span>
                  <span>{course.lessonsCount} lessons</span>
                  <span>{course.duration || 0} hours total</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {course.modules?.map((module, moduleIndex) => (
                    <AccordionItem
                      key={module.id}
                      value={module.id}
                      className="border border-border rounded-lg mb-4 last:mb-0"
                    >
                      <AccordionTrigger className="text-left px-4 hover:bg-muted/50 rounded-t-lg">
                        <div className="flex items-center justify-between w-full mr-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-primary">{moduleIndex + 1}</span>
                            </div>
                            <span className="font-medium text-left">{module.title}</span>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            {module.lessons?.length || 0} lessons • {module.duration}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-3">
                          {module.lessons?.map((lesson, lessonIndex) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between p-4 rounded-lg border bg-card/50"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 flex items-center justify-center">
                                  {lesson.isCompleted ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                  ) : lesson.isFree ? (
                                    <Play className="w-5 h-5 text-primary" />
                                  ) : (
                                    <Lock className="w-5 h-5 text-muted-foreground" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{lesson.title}</p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    <span>{lesson.duration}</span>
                                    {lesson.isFree && (
                                      <Badge variant="outline" className="text-xs">
                                        <Gift className="w-2 h-2 mr-1" />
                                        Free Preview
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {lesson.isFree && (
                                <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                                  <Play className="w-3 h-3 mr-1" />
                                  Preview
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instructor">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Meet Your Course Master
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-start gap-8">
                  <div className="flex-shrink-0">
                    <Avatar className="w-32 h-32 border-4 border-primary/20">
                      <AvatarImage src={course.instructor?.profilePicUrl || "/placeholder.svg"} />
                      <AvatarFallback className="bg-primary/10 text-2xl">
                        {course.instructor?.firstName?.[0] || "I"}
                        {course.instructor?.lastName?.[0] || "N"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm font-medium text-primary">Expert Guide</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">
                      {course.instructor?.firstName} {course.instructor?.lastName || "Expert Guide"}
                    </h3>
                    <p className="text-muted-foreground mb-6">{course.instructor?.title || ""}</p>

                    <div className="grid grid-cols-3 gap-6 mb-6">
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-500">{course.instructor?.rating || 0}</div>
                        <div className="text-sm text-muted-foreground">Rating</div>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-blue-500">
                          {(course.instructor?.students || 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Students</div>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-green-500">{insCourses || 0}</div>
                        <div className="text-sm text-muted-foreground">Courses</div>
                      </div>
                    </div>

                    <p className="text-muted-foreground leading-relaxed">{course.instructor?.bio || ""}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
  <Card>
    <CardHeader>
      <CardTitle>Student Reviews</CardTitle>
      <CardDescription>
        {course.rating} average rating • {course.reviewCount || courseReviews.length} reviews
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        {/* Rating Summary */}
        <div className="flex flex-col md:flex-row items-start gap-8">
          <div className="text-center md:text-left">
            <div className="text-4xl font-bold">{course.rating || 0}</div>
            <div className="flex items-center justify-center md:justify-start gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(course.rating || 0)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground">Course Rating</div>
            
            {/* Add Rating Button - Show only if user is enrolled but hasn't rated yet */}
            {isEnrolled && !userRating && (
              <Button 
                onClick={() => setShowRating(true)} 
                className="mt-4"
                size="sm"
              >
                <Star className="w-4 h-4 mr-2" />
                Add Your Review
              </Button>
            )}
          </div>

          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              // Calculate percentage for each star rating
              const ratingCount = courseReviews.filter(r => Math.round(r.rating) === rating).length
              const percentage = courseReviews.length > 0 ? (ratingCount / courseReviews.length) * 100 : 0
              
              return (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm w-8">{rating}★</span>
                  <Progress value={percentage} className="flex-1" />
                  <span className="text-sm text-muted-foreground w-16">
                    {ratingCount} ({Math.round(percentage)}%)
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Your Rating Section */}
        {userRating && (
          <div className="border rounded-lg p-4 bg-primary/5">
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                <AvatarFallback>{user?.firstName?.[0] || "Y"}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">Your Review</div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= userRating.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-muted-foreground mt-2">{userRating.review}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3"
              onClick={() => setShowRating(true)}
            >
              Edit Review
            </Button>
          </div>
        )}

        {/* Individual Reviews */}
        {courseReviews.length > 0 ? (
          <div className="space-y-6">
            {courseReviews.map((review, index) => (
              <div key={index} className="border-b pb-6 last:border-b-0">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={review.user?.profilePicUrl || "/placeholder.svg"} />
                    <AvatarFallback>
                      {review.user?.firstName?.[0] || "U"}
                      {review.user?.lastName?.[0] || "S"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">
                        {review.user?.firstName} {review.user?.lastName}
                      </span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No reviews yet. Be the first to review this course!</p>
            {isEnrolled && !userRating && (
              <Button onClick={() => setShowRating(true)} className="mt-4">
                <Star className="w-4 h-4 mr-2" />
                Add Review
              </Button>
            )}
          </div>
        )}
      </div>
    </CardContent>
  </Card>
</TabsContent>
        </Tabs>
      </div>

      {course && (
        <CoursePaymentDialog
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          course={course}
          onPaymentSuccess={handlePaymentSuccess}
          token={token!}
          userId={user!.id}
        />
      )}

      {/* Extend Access Modal */}
<Dialog open={showExtendModal} onOpenChange={setShowExtendModal}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Extend Course Access</DialogTitle>
      <DialogDescription>
        Choose how many days you want to extend your access. Maximum total access: 365 days.
      </DialogDescription>
    </DialogHeader>
    
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="days">Days to extend</Label>
        <Input
          id="days"
          type="number"
          min="1"
          max="365"
          value={extendDays}
          onChange={(e) => setExtendDays(Math.min(365, parseInt(e.target.value) || 1))}
        />
      </div>
      
      {enrollmentData && (
        <div className="p-3 bg-muted rounded-lg space-y-2">
          <p className="text-sm font-medium">Current Status:</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Enrolled:</span>
              <span className="ml-2">{new Date(enrollmentData.enrolledAt).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Deadline:</span>
              <span className="ml-2">{new Date(enrollmentData.deadline).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Days Used:</span>
              <span className="ml-2">
                {Math.ceil((new Date().getTime() - new Date(enrollmentData.enrolledAt).getTime()) / (1000 * 3600 * 24))}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Max Days:</span>
              <span className="ml-2">365</span>
            </div>
          </div>
        </div>
      )}
    </div>
    
    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => setShowExtendModal(false)}
        disabled={isExtending}
      >
        Cancel
      </Button>
      <Button
        onClick={handleExtendAccess}
        disabled={isExtending}
      >
        {isExtending ? "Extending..." : `Extend by ${extendDays} days`}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* Rating Dialog */}
<Dialog open={showRating} onOpenChange={setShowRating}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Rate this Course</DialogTitle>
      <DialogDescription>
        Share your experience with this course to help other learners.
      </DialogDescription>
    </DialogHeader>
    
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Your Rating</Label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Button
              key={star}
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                const newRating = star
                // Handle star rating selection
                const tempRating = userRating ? { ...userRating, rating: newRating } : { rating: newRating, review: "" }
                setUserRating(tempRating)
              }}
              className="hover:bg-transparent"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (userRating?.rating || 0)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            </Button>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="review">Your Review</Label>
        <textarea
          id="review"
          className="w-full min-h-[100px] p-3 border rounded-md"
          placeholder="Share your thoughts about the course..."
          value={userRating?.review || ""}
          onChange={(e) => {
            if (userRating) {
              setUserRating({ ...userRating, review: e.target.value })
            } else {
              setUserRating({ rating: 0, review: e.target.value })
            }
          }}
        />
      </div>
    </div>
    
    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => setShowRating(false)}
      >
        Cancel
      </Button>
      <Button
        onClick={() => {
          if (userRating?.rating && userRating.rating > 0) {
            handleRatingSubmit(userRating.rating, userRating.review)
          } else {
            toast({
              title: "Rating required",
              description: "Please select a star rating.",
              variant: "destructive",
            })
          }
        }}
        disabled={!userRating?.rating || userRating.rating === 0}
      >
        Submit Review
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  )
}
