"use client"

import { useState, useEffect, use } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Video,
  ImageIcon,
  ArrowLeft,
  Save,
  X,
  GripVertical,
  Play,
  Trophy,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { motion, Reorder } from "framer-motion"
import type { Course, Module, Lesson } from "@/types"
import { useAuth } from "@/hooks/use-auth"

export default function ModulesManagementPage({ params }: { params: Promise<{ id: string }> }) {
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [editingLesson, setEditingLesson] = useState<{ lesson: Lesson; moduleId: string } | null>(null)
  const [newModuleDialog, setNewModuleDialog] = useState(false)
  const [newLessonDialog, setNewLessonDialog] = useState<string | null>(null)
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
          setCourse(data.course)
        }
      } catch (error) {
        console.error("Failed to fetch course:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [id, token])

  const saveCourse = async () => {
    if (!course) return

    setSaving(true)
    try {
      // console.log(courses)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          instructorId: course.instructor?.id || course.instructorId, // Ensure instructorId is included
          modules: course.modules?.map((module) => ({
            ...module,
            lessons: module.lessons?.map((lesson) => ({
              ...lesson,
              // Ensure all required fields are present
              content: lesson.content || "",
              videoUrl: lesson.videoUrl || "",
              duration: lesson.duration || 0,
              order: lesson.order || 0,
            })),
          })),
        }),
      })

      if (response.ok) {
        // Show success message
        console.log("Course updated successfully")
      }
    } catch (error) {
      console.error("Failed to save course:", error)
    } finally {
      setSaving(false)
    }
  }

  const addModule = () => {
    if (!course) return

    const newModule: Module = {
      title: "New Module",
      description: "Module description",
      order: course.modules?.length || 0,
      lessons: [],
      courseId: course.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setCourse({
      ...course,
      modules: [...(course.modules || []), newModule],
    })
    setEditingModule(newModule)
    setNewModuleDialog(false)
  }

  const updateModule = (moduleId: string, updates: Partial<Module>) => {
    if (!course) return

    setCourse({
      ...course,
      modules: course.modules?.map((module) => (module.id === moduleId ? { ...module, ...updates } : module)) || [],
    })
  }

  const deleteModule = (moduleId: string) => {
    if (!course) return

    setCourse({
      ...course,
      modules: course.modules?.filter((module) => module.id !== moduleId) || [],
    })
  }

  const addLesson = (moduleId: string) => {
    if (!course) return

    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: "New Lesson",
      content: "",
      videoUrl: "",
      duration: 0,
      order: 0,
      assessments: [],
      moduleId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setCourse({
      ...course,
      modules:
        course.modules?.map((module) =>
          module.id === moduleId
            ? {
                ...module,
                lessons: [...(module.lessons || []), newLesson],
              }
            : module,
        ) || [],
    })

    setEditingLesson({ lesson: newLesson, moduleId })
    setNewLessonDialog(null)
  }

  const updateLesson = (moduleId: string, lessonId: string, updates: Partial<Lesson>) => {
    if (!course) return

    setCourse({
      ...course,
      modules:
        course.modules?.map((module) =>
          module.id === moduleId
            ? {
                ...module,
                lessons:
                  module.lessons?.map((lesson) => (lesson.id === lessonId ? { ...lesson, ...updates } : lesson)) || [],
              }
            : module,
        ) || [],
    })
  }

  const deleteLesson = (moduleId: string, lessonId: string) => {
    if (!course) return

    setCourse({
      ...course,
      modules:
        course.modules?.map((module) =>
          module.id === moduleId
            ? {
                ...module,
                lessons: module.lessons?.filter((lesson) => lesson.id !== lessonId) || [],
              }
            : module,
        ) || [],
    })
  }

  const getContentTypeIcon = (lesson: Lesson) => {
    if (lesson.videoUrl) return <Video className="w-4 h-4 text-blue-500" />
    if (lesson.assessments && lesson.assessments.length > 0) return <Trophy className="w-4 h-4 text-yellow-500" />
    return <ImageIcon className="w-4 h-4 text-gray-500" />
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-8" />
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
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/instructor/courses/${course.id}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Course
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold">Manage Course Content</h1>
          <p className="text-muted-foreground">{course.title}</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={saveCourse} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <Button asChild>
            <Link href={`/instructor/courses/${course.id}/preview`}>
              <Play className="w-4 h-4 mr-2" />
              Preview Course
            </Link>
          </Button>
        </div>
      </div>

      {/* Course Modules */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Course Modules</CardTitle>
              <CardDescription>Organize your course content into modules and lessons</CardDescription>
            </div>
            <Dialog open={newModuleDialog} onOpenChange={setNewModuleDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Module
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Module</DialogTitle>
                  <DialogDescription>Create a new module to organize your lessons</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setNewModuleDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addModule}>Add Module</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {course.modules && course.modules.length > 0 ? (
            <Reorder.Group
              axis="y"
              values={course.modules}
              onReorder={(newOrder) => setCourse({ ...course, modules: newOrder })}
              className="space-y-4"
            >
              {course.modules.map((module, moduleIndex) => (
                <Reorder.Item key={module.id} value={module} className="space-y-4">
                  <Card className="border-2 hover:border-primary/20 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                          <Badge variant="outline" className="text-xs">
                            Module {moduleIndex + 1}
                          </Badge>
                          {editingModule?.id === module.id ? (
                            <div className="flex-1 space-y-2">
                              <Input
                                value={module.title}
                                onChange={(e) => updateModule(module.id, { title: e.target.value })}
                                className="font-semibold"
                                placeholder="Module title"
                              />
                              <Textarea
                                value={module.description}
                                onChange={(e) => updateModule(module.id, { description: e.target.value })}
                                placeholder="Module description"
                                rows={2}
                              />
                            </div>
                          ) : (
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{module.title}</h3>
                              <p className="text-sm text-muted-foreground">{module.description}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {module.lessons?.length || 0} lessons
                          </Badge>
                          {editingModule?.id === module.id ? (
                            <Button size="sm" variant="ghost" onClick={() => setEditingModule(null)}>
                              <X className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => setEditingModule(module)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteModule(module.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      {/* Lessons */}
                      <div className="space-y-2">
                        {module.lessons?.map((lesson, lessonIndex) => (
                          <motion.div
                            key={lesson.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              {getContentTypeIcon(lesson)}
                              {editingLesson?.lesson.id === lesson.id ? (
                                <div className="flex-1 space-y-2">
                                  <Input
                                    value={lesson.title}
                                    onChange={(e) => updateLesson(module.id, lesson.id, { title: e.target.value })}
                                    placeholder="Lesson title"
                                  />
                                  <Textarea
                                    value={lesson.content}
                                    onChange={(e) => updateLesson(module.id, lesson.id, { content: e.target.value })}
                                    placeholder="Lesson content"
                                    rows={3}
                                  />
                                  <Input
                                    value={lesson.videoUrl || ""}
                                    onChange={(e) => updateLesson(module.id, lesson.id, { videoUrl: e.target.value })}
                                    placeholder="Video URL (optional)"
                                  />
                                  <Input
                                    type="number"
                                    value={lesson.duration}
                                    onChange={(e) =>
                                      updateLesson(module.id, lesson.id, {
                                        duration: Number.parseInt(e.target.value) || 0,
                                      })
                                    }
                                    placeholder="Duration (minutes)"
                                  />
                                </div>
                              ) : (
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{lesson.title}</div>
                                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                                    <Clock className="w-3 h-3" />
                                    <span>{lesson.duration}min</span>
                                    {lesson.videoUrl && <span>• Video</span>}
                                    {lesson.assessments && lesson.assessments.length > 0 && (
                                      <span>
                                        • {lesson.assessments.length} assessment
                                        {lesson.assessments.length > 1 ? "s" : ""}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {editingLesson?.lesson.id === lesson.id ? (
                                <Button size="sm" variant="ghost" onClick={() => setEditingLesson(null)}>
                                  <X className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingLesson({ lesson, moduleId: module.id })}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteLesson(module.id, lesson.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}

                        {/* Add Lesson Button */}
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-primary hover:text-primary hover:bg-primary/10 border-2 border-dashed border-primary/20 hover:border-primary/40"
                          onClick={() => addLesson(module.id)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Lesson to {module.title}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No modules yet</h3>
              <p className="text-muted-foreground mb-6">Start building your course by adding your first module</p>
              <Button onClick={() => setNewModuleDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Module
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
