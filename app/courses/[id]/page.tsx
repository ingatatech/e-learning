"use client"

import { use, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Play, Clock, Users, Star, Share2, Heart, CheckCircle, Lock, ArrowLeft, Trophy, Target, Crown, Zap, Award, BookOpen, Flame, Shield, Gift } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { useAuth } from "@/hooks/use-auth"
import { Course } from "@/types"

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [currentProgress, setCurrentProgress] = useState(0)
  const { token, user } = useAuth()
  const { id } = use(params)
  const [course, setCourse] = useState<Course>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [insCourses, setInsCourses] = useState(0)

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
          
          // Fetch user enrollments
          const enrollmentsResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/enrollments/user-enrollments`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              method: "POST",
              body: JSON.stringify({
                userId: user.id,
              }),
            }
          )
          
          if (enrollmentsResponse.ok) {
            const enrollmentsData = await enrollmentsResponse.json()
            
            // Check if current course is in user's enrollments
            const enrolledCourse = enrollmentsData.enrollments.find(
              (enrollment: any) => enrollment.courseId.toString() === id
            )
            
            if (enrolledCourse) {
              setIsEnrolled(true)
              setCurrentProgress(enrolledCourse.progress || 0)
            } else {
              setIsEnrolled(false)
            }
          }

          // Fetch courses for the instructor
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/instructor/${courseData.course.instructor.id}/courses`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          })
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

  const handleEnroll = async () => {
    if (course!.price > 0) {
      console.log("Payment required")
      return
    }
    setIsEnrolling(true)
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/enrollments/enroll`, {
      method: 'POST',
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
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  {course.description}
                </p>

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
                      {course.instructor?.firstName?.[0] || 'I'}{course.instructor?.lastName?.[0] || 'N'}
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
            <Card className="sticky top-4 border-2 shadow-xl bg-gradient-to-br from-card to-card/80">
              {/* Video Preview */}
              <div className="aspect-video relative overflow-hidden rounded-t-lg">
                <img
                  src={course.thumbnail || "/placeholder.svg"}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-center justify-center">
                  <Button size="lg" className="bg-white/95 text-black hover:bg-white shadow-xl transform hover:scale-105 transition-all">
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
                      {course.price == 0 || course.price === null || course.price === undefined ? "FREE" : `${course.price} RWF`}
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
                        Continue Learning
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
                          Enroll Now
                        </>
                      )}
                    </Button>
                    <Button variant="outline" className="w-full border-2 hover:bg-muted/50">
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
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BookOpen className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="curriculum" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Target className="w-4 h-4 mr-2" />
              Curriculum
            </TabsTrigger>
            <TabsTrigger value="instructor" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Shield className="w-4 h-4 mr-2" />
              Instructor
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
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
                    <AccordionItem key={module.id} value={module.id} className="border border-border rounded-lg mb-4 last:mb-0">
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
                            <div key={lesson.id} className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
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
                        {course.instructor?.firstName?.[0] || 'I'}{course.instructor?.lastName?.[0] || 'N'}
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
                        <div className="text-2xl font-bold text-blue-500">{(course.instructor?.students || 0).toLocaleString()}</div>
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
                  {course.rating} average rating • {course.reviewCount} reviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Rating Summary */}
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="text-4xl font-bold">{course.rating}</div>
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground">Course Rating</div>
                    </div>

                    <div className="flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center gap-2">
                          <span className="text-sm w-8">{rating}★</span>
                          <Progress value={rating === 5 ? 80 : rating === 4 ? 15 : 3} className="flex-1" />
                          <span className="text-sm text-muted-foreground w-12">
                            {rating === 5 ? "80%" : rating === 4 ? "15%" : "3%"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Individual Reviews */}
                  <div className="space-y-6">
                    {[
                      {
                        name: "John Smith",
                        avatar: "/placeholder.svg?height=40&width=40",
                        rating: 5,
                        date: "2 weeks ago",
                        review:
                          "Excellent course! Sarah explains everything clearly and the projects are really helpful for understanding the concepts.",
                      },
                      {
                        name: "Emily Davis",
                        avatar: "/placeholder.svg?height=40&width=40",
                        rating: 5,
                        date: "1 month ago",
                        review:
                          "This course transformed my understanding of React. The hands-on approach and real-world examples made all the difference.",
                      },
                      {
                        name: "Michael Chen",
                        avatar: "/placeholder.svg?height=40&width=40",
                        rating: 4,
                        date: "2 months ago",
                        review:
                          "Great content and well-structured. Would love to see more advanced topics covered in future updates.",
                      },
                    ].map((review, index) => (
                      <div key={index} className="border-b pb-6 last:border-b-0">
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarImage src={review.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{review.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">{review.name}</span>
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
                              <span className="text-sm text-muted-foreground">{review.date}</span>
                            </div>
                            <p className="text-muted-foreground">{review.review}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}