"use client"

import { useState, useEffect, use } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  BookOpen,
  Users,
  Star,
  Clock,
  Play,
  Edit,
  Eye,
  Settings,
  BarChart3,
  Plus,
  Trophy,
  Target,
  Zap,
  Award,
  Calendar,
  Video,
  ImageIcon,
  ArrowLeft,
  Share2,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import type { Course, Lesson } from "@/types"
import { useAuth } from "@/hooks/use-auth"

export default function InstructorCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const { token } = useAuth()
  const { id } = use(params)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/get/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          console.log(data.course)
          setCourse(data.course)
        }
      } catch (error) {
        console.error("Failed to fetch users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [])

  const getTotalLessons = () => {
    return course?.modules?.reduce((acc, module) => acc + (module.lessons?.length || 0), 0) || 0
  }

  const getTotalAssessments = () => {
    return (
      course?.modules?.reduce(
        (acc, module) =>
          acc + (module.lessons?.reduce((lessonAcc, lesson) => lessonAcc + (lesson.assessments?.length || 0), 0) || 0),
        0,
      ) || 0
    )
  }

  const getContentTypeIcon = (lesson: Lesson) => {
    if (lesson.videoUrl) return <Video className="w-4 h-4 text-blue-500" />
    if (lesson.assessments && lesson.assessments.length > 0) return <Trophy className="w-4 h-4 text-yellow-500" />
    return <ImageIcon className="w-4 h-4 text-gray-500" />
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const shouldShowExpandButton = (description: string) => {
    return description && description.length > 150
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Course not found</h1>
        <Button asChild>
          <Link href="/instructor/courses">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/instructor/courses/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Courses
              </Link>
            </Button>
            <div className="flex gap-2">
              {course.isPublished ? (
                <Badge className="bg-green-500 hover:bg-green-600">
                  <Zap className="w-3 h-3 mr-1" />
                  Published
                </Badge>
              ) : (
                <Badge variant="secondary">Draft</Badge>
              )}
              {course.rating >= 4.8 && (
                <Badge className="bg-yellow-500 hover:bg-yellow-600">
                  <Trophy className="w-3 h-3 mr-1" />
                  Top Rated
                </Badge>
              )}
              {course.enrollmentCount > 200 && (
                <Badge className="bg-purple-500 hover:bg-purple-600">
                  <Award className="w-3 h-3 mr-1" />
                  Popular
                </Badge>
              )}
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-2">{course.title}</h1>

          <div className="mb-4">
            <p className={`text-muted-foreground text-lg ${!isDescriptionExpanded ? "line-clamp-3" : ""}`}>
              {course.description}
            </p>
            {shouldShowExpandButton(course.description) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="mt-2 p-0 h-auto text-primary hover:text-primary/80"
              >
                {isDescriptionExpanded ? (
                  <>
                    Show less <ChevronUp className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  <>
                    Show more <ChevronDown className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{course.enrollmentCount} students</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{course.rating} rating</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(course.duration)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Updated {new Date(course.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/instructor/courses/${course.id}/modules`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Content
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/instructor/courses/${course.id}/preview`}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/instructor/courses/${course.id}/analytics`}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{course.modules?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Modules</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Play className="w-8 h-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{getTotalLessons()}</div>
                <div className="text-sm text-muted-foreground">Lessons</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{getTotalAssessments()}</div>
                <div className="text-sm text-muted-foreground">Assessments</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-8 h-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">${(course.price * course.enrollmentCount).toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Revenue</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Course Thumbnail */}
          <Card>
            <CardHeader>
              <CardTitle>Course Preview</CardTitle>
              <CardDescription>How your course appears to students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video relative overflow-hidden rounded-lg bg-muted">
                <img
                  src={course.thumbnail || "/placeholder.svg"}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Button size="lg" className="bg-white/90 text-black hover:bg-white" asChild>
                    <Link href={`/instructor/courses/${course.id}/preview`}>
                      <Play className="w-5 h-5 mr-2" />
                      Preview Course
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Course Tags</CardTitle>
              <CardDescription>Topics and skills covered in this course</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Plus className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Add Content</h3>
                <p className="text-sm text-muted-foreground mb-4">Create new lessons and modules</p>
                <Button size="sm" asChild>
                  <Link href={`/instructor/courses/${course.id}/modules`}>Add Content</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <BarChart3 className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">View Analytics</h3>
                <p className="text-sm text-muted-foreground mb-4">Track student progress and engagement</p>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/instructor/courses/${course.id}/analytics`}>View Analytics</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Manage Students</h3>
                <p className="text-sm text-muted-foreground mb-4">View enrolled students and their progress</p>
                <Button size="sm" variant="outline" onClick={() => setActiveTab("students")}>
                  View Students
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="curriculum">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Course Curriculum</CardTitle>
                  <CardDescription>
                    {course.modules?.length || 0} modules • {getTotalLessons()} lessons •{" "}
                    {formatDuration(course.duration)}
                  </CardDescription>
                </div>
                <Button asChild>
                  <Link href={`/instructor/courses/${course.id}/modules`}>
                    <Plus className="w-4 h-4 mr-2" />
                    Manage Content
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {course.modules?.map((module, moduleIndex) => (
                  <AccordionItem key={module.id} value={module.id}>
                    <AccordionTrigger className="text-left hover:no-underline">
                      <div className="flex items-center justify-between w-full mr-4">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">
                            {moduleIndex + 1}
                          </Badge>
                          <div>
                            <div className="font-medium text-left">{module.title}</div>
                            <div className="text-sm text-muted-foreground text-left">{module.description}</div>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">{module.lessons?.length || 0} lessons</div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pl-4">
                        {module.lessons?.map((lesson, lessonIndex) => (
                          <motion.div
                            key={lesson.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: lessonIndex * 0.1 }}
                            className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {getContentTypeIcon(lesson)}
                              <div>
                                <div className="font-medium text-sm">{lesson.title}</div>
                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                  <span>{formatDuration(lesson.duration)}</span>
                                  {lesson.videoUrl && <span>• Video</span>}
                                  {lesson.assessments && lesson.assessments.length > 0 && (
                                    <span>
                                      • {lesson.assessments.length} assessment{lesson.assessments.length > 1 ? "s" : ""}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/instructor/courses/${course.id}/preview?lesson=${lesson.id}`}>
                                  <Eye className="w-4 h-4" />
                                </Link>
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {(!course.modules || course.modules.length === 0) && (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No content yet</h3>
                  <p className="text-muted-foreground mb-6">Start building your course by adding modules and lessons</p>
                  <Button asChild>
                    <Link href={`/instructor/courses/${course.id}/modules`}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Module
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Students</CardTitle>
              <CardDescription>
                {course.enrollmentCount} students enrolled • Track their progress and engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Student Progress Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">89%</div>
                      <div className="text-sm text-muted-foreground">Completion Rate</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">4.2h</div>
                      <div className="text-sm text-muted-foreground">Avg. Time Spent</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">92%</div>
                      <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Student Activity */}
                <div className="space-y-3">
                  <h4 className="font-medium">Recent Activity</h4>
                  {[
                    {
                      name: "Sarah Johnson",
                      action: "Completed lesson",
                      lesson: "React Fundamentals",
                      time: "2 hours ago",
                    },
                    { name: "Mike Chen", action: "Started module", lesson: "State Management", time: "4 hours ago" },
                    { name: "Emily Davis", action: "Passed quiz", lesson: "React Basics Quiz", time: "6 hours ago" },
                    { name: "John Smith", action: "Enrolled in course", lesson: "", time: "1 day ago" },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">{activity.name[0]}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {activity.name} {activity.action}
                          </div>
                          {activity.lesson && <div className="text-xs text-muted-foreground">{activity.lesson}</div>}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {activity.time}
                      </Badge>
                    </div>
                  ))}
                </div>

                <Button className="w-full bg-transparent" variant="outline">
                  View All Students
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Settings</CardTitle>
                <CardDescription>Manage your course visibility and access settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Course Status</div>
                    <div className="text-sm text-muted-foreground">Control whether students can enroll</div>
                  </div>
                  <Badge className={course.isPublished ? "bg-green-500" : "bg-gray-500"}>
                    {course.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Course Price</div>
                    <div className="text-sm text-muted-foreground">Set your course pricing</div>
                  </div>
                  <div className="text-lg font-bold text-primary">${course.price}</div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Advanced Settings
                  </Button>
                  <Button variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview as Student
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Danger Zone</CardTitle>
                <CardDescription>Irreversible actions for this course</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" className="w-full">
                  Delete Course
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
