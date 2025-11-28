"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BookOpen,
  PlayCircle,
  Trophy,
  Target,
  Rocket,
  Eye,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Edit,
  Save,
  X,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import type { Course, Module } from "@/types"

export default function CourseReviewPage() {
  const params = useParams()
  const router = useRouter()
  const { token } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set())
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editedCourse, setEditedCourse] = useState<Partial<Course>>({})

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const [courseRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/get/${params.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        if (courseRes.ok) {
          const courseData = await courseRes.json()
          setCourse(courseData.course)
          setModules(courseData.course.modules || [])
          setEditedCourse({
            title: courseData.course.title,
            description: courseData.course.description,
            level: courseData.course.level,
            price: courseData.course.price,
            tags: courseData.course.tags,
          })
          console.log(courseData.course.modules)
        }
      } catch (error) {
        console.error("Failed to fetch course data:", error)
        toast.error("Failed to load course data")
      } finally {
        setLoading(false)
      }
    }

    if (params.id && token) {
      fetchCourseData()
    }
  }, [params.id, token])

  const toggleModule = (moduleIndex: number) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleIndex)) {
      newExpanded.delete(moduleIndex)
    } else {
      newExpanded.add(moduleIndex)
    }
    setExpandedModules(newExpanded)
  }

  const handlePublish = async () => {
    setPublishing(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${params.id}/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPublished: true }),
      })

      if (response.ok) {
        toast.success("Course published successfully!")
        router.push("/sysAdmin/courses/draft")
      } else {
        toast.error("Failed to publish course")
      }
    } catch (error) {
      console.error("Error publishing course:", error)
      toast.error("An error occurred while publishing")
    } finally {
      setPublishing(false)
    }
  }

  const handleSaveCourse = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/update/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          instructorId: course?.instructor?.id || course?.instructorId,
          title: editedCourse.title,
          description: editedCourse.description,
          level: editedCourse.level,
          price: editedCourse.price,
          tags: editedCourse.tags,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setCourse(data.course)
        toast.success("Course updated successfully!")
        setIsEditing(false)
      } else {
        toast.error("Failed to update course")
      }
    } catch (error) {
      console.error("Error updating course:", error)
      toast.error("An error occurred while updating")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCourseChange = (field: keyof Course, value: any) => {
    setEditedCourse((prev) => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading course details...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Course Not Found</CardTitle>
            <CardDescription>The course you're looking for doesn't exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/sysAdmin/courses/draft")}>Back to Draft Courses</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalLessons = modules.reduce((acc, module) => acc + (module.lessons?.length || 0), 0)
  const totalAssessments = modules.reduce(
    (acc, module) =>
      acc + (module.lessons?.reduce((lessonAcc, lesson) => lessonAcc + (lesson.assessments?.length || 0), 0) || 0),
    0,
  )
  const totalQuestions = modules.reduce(
    (acc, module) =>
      acc +
      (module.lessons?.reduce(
        (lessonAcc, lesson) =>
          lessonAcc +
          (lesson.assessments?.reduce((assessmentAcc, assessment) => assessmentAcc + assessment.questions.length, 0) ||
            0),
        0,
      ) || 0),
    0,
  )

  const readinessChecks = [
    { label: "Course has title and description", completed: !!(course.title && course.description) },
    { label: "At least one module created", completed: modules.length > 0 },
    { label: "At least one lesson created", completed: totalLessons > 0 },
    { label: "Course thumbnail uploaded", completed: !!course.thumbnail },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/sysAdmin/courses/draft")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Review Course</h1>
            <p className="text-muted-foreground">Review and publish this course</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveCourse} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Course
              </Button>
              <Button onClick={handlePublish} disabled={publishing} size="lg">
                {publishing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 mr-2" />
                    Publish Course
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content Details</TabsTrigger>
          <TabsTrigger value="readiness">Readiness Check</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Course Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{modules.length}</div>
                <div className="text-sm text-muted-foreground">Modules</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <PlayCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{totalLessons}</div>
                <div className="text-sm text-muted-foreground">Lessons</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Trophy className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{totalAssessments}</div>
                <div className="text-sm text-muted-foreground">Assessments</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Target className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{totalQuestions}</div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </CardContent>
            </Card>
          </div>

          {/* Course Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Course Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Course Title</Label>
                    <Input
                      id="title"
                      value={editedCourse.title || ""}
                      onChange={(e) => handleCourseChange("title", e.target.value)}
                      placeholder="Course title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={editedCourse.description || ""}
                      onChange={(e) => handleCourseChange("description", e.target.value)}
                      placeholder="Course description"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="level">Level</Label>
                      <Select
                        value={editedCourse.level || ""}
                        onValueChange={(value) => handleCourseChange("level", value)}
                      >
                        <SelectTrigger id="level">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (RWF)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={editedCourse.price || 0}
                        onChange={(e) => handleCourseChange("price", Number.parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={editedCourse.tags?.join(", ") || ""}
                      onChange={(e) =>
                        handleCourseChange(
                          "tags",
                          e.target.value.split(",").map((tag) => tag.trim()),
                        )
                      }
                      placeholder="web development, javascript, react"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-32 h-20 bg-muted rounded flex items-center justify-center flex-shrink-0">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail || "/placeholder.svg"}
                          alt="Course thumbnail"
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <BookOpen className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">{course.title}</h3>
                      <p className="text-muted-foreground text-sm mb-2">{course.description}</p>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline">{course.level}</Badge>
                        <Badge variant="outline">{course.price === 0 ? "Free" : `${course.price} RWF`}</Badge>
                        {course.tags?.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Course Structure</CardTitle>
              <CardDescription>Complete breakdown of all modules, lessons, and assessments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {modules.length > 0 ? (
                  modules.map((module, moduleIndex) => (
                    <div key={module.id} className="border rounded-lg overflow-hidden">
                      <div
                        className="flex items-center justify-between p-4 bg-muted/50 cursor-pointer hover:bg-muted"
                        onClick={() => toggleModule(moduleIndex)}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {expandedModules.has(moduleIndex) ? (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          )}
                          <div>
                            <h4 className="font-medium">
                              Module {moduleIndex + 1}: {module.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">{module.description}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            {module.lessons?.length || 0} lessons
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {module.lessons?.reduce((acc, lesson) => acc + (lesson.assessments?.length || 0), 0) || 0}{" "}
                            assessments
                          </Badge>
                        </div>
                      </div>

                      {expandedModules.has(moduleIndex) && (
                        <div className="p-4 space-y-3 bg-background">
                          {module.lessons && module.lessons.length > 0 ? (
                            module.lessons.map((lesson, lessonIndex) => (
                              <div key={lesson.id} className="border-l-2 border-primary pl-4 py-2">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <PlayCircle className="w-4 h-4 text-primary" />
                                      <h5 className="font-medium text-sm">
                                        Lesson {lessonIndex + 1}: {lesson.title}
                                      </h5>
                                    </div>

                                    {lesson.assessments && lesson.assessments.length > 0 && (
                                      <div className="mt-2 space-y-2">
                                        {lesson.assessments.map((assessment, assessmentIndex) => (
                                          <div key={assessment.id} className="bg-muted/30 rounded p-2">
                                            <div className="flex items-center gap-2 mb-1">
                                              <Trophy className="w-3 h-3 text-orange-500" />
                                              <span className="text-xs font-medium">
                                                Assessment {assessmentIndex + 1}: {assessment.title}
                                              </span>
                                            </div>
                                            <div className="flex gap-2 text-xs text-muted-foreground">
                                              <span>{assessment.questions.length} questions</span>
                                              <span>•</span>
                                              <span>{assessment.passingScore}% passing score</span>
                                              <span>•</span>
                                              <span>{assessment.timeLimit} min</span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground italic">No lessons added yet</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No modules created yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="readiness" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publication Readiness</CardTitle>
              <CardDescription>Ensure all requirements are met before publishing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {readinessChecks.map((check, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {check.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                    )}
                    <span className={check.completed ? "text-foreground" : "text-muted-foreground"}>{check.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
