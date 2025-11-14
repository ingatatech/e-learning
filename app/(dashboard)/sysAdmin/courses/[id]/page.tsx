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
  ChevronDown,
  ChevronUp,
  Briefcase,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import type { Course, Lesson, User } from "@/types"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { LessonDetailModal } from "@/components/course/lesson/lesson-detail-modal"
import { CourseBasicInfoModal } from "@/components/course/course-basic-info-modal"

export default function InstructorCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const { token } = useAuth()
  const { id } = use(params)
  const [students, setStudents] = useState<User[]>([])
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false)
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false)

  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch course data
        const courseResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/get/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        
        if (!isMounted) return
        
        if (courseResponse.ok) {
          const data = await courseResponse.json()
          setCourse(data.course)
        } else {
          setCourse(null)
        }

        // Fetch students data
        const studentsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/get/${id}/students`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        
        if (!isMounted) return
        
        if (studentsResponse.ok) {
          const data = await studentsResponse.json()
          setStudents(data.students)
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
        if (isMounted) {
          setCourse(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [id, token])

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

  const handleViewLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson)
    setIsLessonModalOpen(true)
  }

  const handleSaveCourseInfo = async (updates: Partial<Course>) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...updates,
          instructorId: course?.instructor?.id || course?.instructorId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setCourse(data.course)
      }
    } catch (error) {
      console.error("Failed to update course:", error)
      throw error
    }
  }

  const handleDelete = async () => {
    setIsDeleteOpen(true)
  }

  const confirmDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/delete/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        router.push("/sysAdmin/courses")
      }
    } catch (error) {
      console.error("Failed to delete course:", error)
    } finally {
      setIsDeleting(false)
      setIsDeleteOpen(false)
    }
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



  return (
    <>
    {!course ? (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Course not found</h1>
        <Button asChild>
          <Link href="/sysAdmin/courses">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Link>
        </Button>
      </div>
      
    ) : (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/sysAdmin/courses/">
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
            <Button variant="outline" size="sm" onClick={() => setIsEditCourseOpen(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Content
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
            {/* Course Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Course Tags</CardTitle>
                <CardDescription>Topics and skills covered in this course</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {course?.tags.map((tag, index) => (
                    <Badge key={index} className="text-sm rounded bg-primary">
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
                    <Link href={`/sysAdmin/courses/${course.id}/modules`}>Add Content</Link>
                  </Button>
                </CardContent>
              </Card>
  
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <BarChart3 className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">View Analytics</h3>
                  <p className="text-sm text-muted-foreground mb-4">Track student progress and engagement</p>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/sysAdmin/courses/${course.id}/analytics`}>View Analytics</Link>
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
                    <Link href={`/sysAdmin/courses/${course.id}/modules`}>
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
                              <div className="flex items-center gap-3 flex-1">
                                {getContentTypeIcon(lesson)}
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{lesson.title}</div>
                                  <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap mt-1">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {formatDuration(lesson.duration)}
                                    </span>
                                    {lesson.videoUrl && <span>• Video</span>}
                                    {lesson.isProject && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs h-5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                                      >
                                        <Briefcase className="w-3 h-3 mr-1" />
                                        Project
                                      </Badge>
                                    )}
                                    {lesson.isExercise && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs h-5 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800"
                                      >
                                        <Zap className="w-3 h-3 mr-1" />
                                        Exercise
                                      </Badge>
                                    )}
                                    {lesson.assessments && lesson.assessments.length > 0 && (
                                      <span className="flex items-center gap-1">
                                        • <Trophy className="w-3 h-3" />
                                        {lesson.assessments.length} assessment{lesson.assessments.length > 1 ? "s" : ""}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleViewLesson(lesson)}>
                                  <Eye className="w-4 h-4" />
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
                      <Link href={`/sysAdmin/courses/${course.id}/modules`}>
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
                  <div className="space-y-3">
                    <h4 className="font-medium">Enrolled Students</h4>
                    {students.length === 0 ?
                     <span className="text-muted-foreground">No students enrolled yet.</span>
                     :
                    students.map((student, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">{student.firstName[0]}</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">{student.email}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full bg-transparent"
                    variant="outline"
                    onClick={() => router.push(`/sysAdmin/courses/${course.id}/students`)}
                  >
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
                  <Button variant="destructive" className="w-full" onClick={handleDelete}>
                    Delete Course
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
  
        <LessonDetailModal lesson={selectedLesson} open={isLessonModalOpen} onOpenChange={setIsLessonModalOpen} />
        <CourseBasicInfoModal
          course={course}
          open={isEditCourseOpen}
          onOpenChange={setIsEditCourseOpen}
          onSave={handleSaveCourseInfo}
        />
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Course</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this course? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-red-600 text-white hover:bg-red-700" onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )}
    </>
  )
}
