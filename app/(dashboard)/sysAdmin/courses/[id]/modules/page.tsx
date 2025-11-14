"use client"

import { useState, useEffect, use } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { BookOpen, Plus, Edit, Trash2, Video, ImageIcon, ArrowLeft, Save, X, GripVertical, Trophy, Clock, Briefcase, Zap, FileDown, FileText, Target } from 'lucide-react'
import Link from "next/link"
import { motion, Reorder } from "framer-motion"
import type { Course, Module, Lesson, Assessment, AssessmentQuestion } from "@/types"
import { useAuth } from "@/hooks/use-auth"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { useCourses } from "@/hooks/use-courses"
import { CourseTreeBuilder } from "@/components/course/tree-builder/course-tree-builder"

interface ContentBlock {
  id: string
  type: "text" | "video" | "image"
  content: any
  order: number
}

export default function EditCourseModulesPage({ params }: { params: Promise<{ id: string }> }) {
  const { getCourse, updateCourseInCache } = useCourses()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [editingLesson, setEditingLesson] = useState<{ lesson: Lesson; moduleId: string } | null>(null)
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([])
  const [resourceLinks, setResourceLinks] = useState<{ url: string; title: string; description: string }[]>([])
  const [newModuleDialog, setNewModuleDialog] = useState(false)
  const [newLessonDialog, setNewLessonDialog] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("content")
  const { token } = useAuth()
  const { id } = use(params)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/get/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        
        if (courseResponse.ok) {
          const data = await courseResponse.json()
          setCourse(data.course)
        } else {
          setCourse(null)
        }
      } catch (error) {
        console.error("Failed to fetch course:", error)
        toast.error("Failed to load course")
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [id, getCourse])

  useEffect(() => {
    if (editingLesson?.lesson) {
      const lesson = editingLesson.lesson

      // Parse content blocks
      if (lesson.content) {
        try {
          const parsedContent = JSON.parse(lesson.content)

          if (parsedContent.version && parsedContent.blocks && Array.isArray(parsedContent.blocks)) {
            // New format with version and blocks
            setContentBlocks(
              parsedContent.blocks.map((block: any, index: number) => ({
                id: `block-${Date.now()}-${index}`,
                type: block.type || "text",
                content: block.data || block.content || {},
                order: index + 1,
              })),
            )
          } else if (Array.isArray(parsedContent)) {
            // Legacy array format
            setContentBlocks(
              parsedContent.map((block: any, index: number) => ({
                id: `block-${Date.now()}-${index}`,
                type: block.type || "text",
                content: block.content || block.data || "",
                order: index + 1,
              })),
            )
          } else {
            // Plain text content
            setContentBlocks([
              {
                id: `block-${Date.now()}`,
                type: "text",
                content: { text: lesson.content },
                order: 1,
              },
            ])
          }
        } catch (error) {
          // If parsing fails, treat as plain text
          setContentBlocks([
            {
              id: `block-${Date.now()}`,
              type: "text",
              content: { text: lesson.content },
              order: 1,
            },
          ])
        }
      } else {
        setContentBlocks([])
      }

      // Parse resources
      if (lesson.resources) {
        try {
          const parsedResources = typeof lesson.resources === "string" ? JSON.parse(lesson.resources) : lesson.resources
          setResourceLinks(parsedResources || [])
        } catch (error) {
          setResourceLinks([])
        }
      } else {
        setResourceLinks([])
      }
    }
  }, [editingLesson]) // Fixed dependency to use entire editingLesson object

  const addContentBlock = (type: ContentBlock["type"]) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type,
      content: getDefaultContent(type),
      order: contentBlocks.length + 1,
    }
    setContentBlocks([...contentBlocks, newBlock])
  }

  const getDefaultContent = (type: ContentBlock["type"]) => {
    switch (type) {
      case "text":
        return { text: "" }
      case "video":
        return { url: "", caption: "" }
      case "image":
        return { url: "", alt: "", caption: "" }
      default:
        return {}
    }
  }

  const updateContentBlock = (id: string, content: any) => {
    setContentBlocks((blocks) => blocks.map((block) => (block.id === id ? { ...block, content } : block)))
  }

  const deleteContentBlock = (id: string) => {
    setContentBlocks((blocks) => blocks.filter((block) => block.id !== id))
  }

  const getBlockIcon = (type: ContentBlock["type"]) => {
    switch (type) {
      case "text":
        return <FileText className="w-4 h-4" />
      case "video":
        return <Video className="w-4 h-4" />
      case "image":
        return <ImageIcon className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const handleLinkChange = (idx: number, value: { url: string; title: string; description: string }) => {
    const newLinks = [...resourceLinks]
    newLinks[idx] = value
    setResourceLinks(newLinks)
  }

  const addNewLink = () => {
    setResourceLinks([...resourceLinks, { url: "", title: "", description: "" }])
  }

  const removeLink = (idx: number) => {
    setResourceLinks(resourceLinks.filter((_, i) => i !== idx))
  }

  const addAssessment = (moduleId: string, lessonId: string) => {
    if (!course || !editingLesson) return

    const newAssessment: Assessment = {
      id: `assessment-${Date.now()}`,
      title: "New Assessment",
      description: "",
      type: "quiz",
      questions: [],
      passingScore: 70,
      lessonId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    updateLesson(moduleId, lessonId, {
      assessments: [...(editingLesson.lesson.assessments || []), newAssessment],
    })
  }

  const updateAssessment = (moduleId: string, lessonId: string, assessmentId: string, updates: Partial<Assessment>) => {
    if (!editingLesson) return

    const updatedAssessments = editingLesson.lesson.assessments?.map((a) =>
      a.id === assessmentId ? { ...a, ...updates } : a,
    )

    updateLesson(moduleId, lessonId, { assessments: updatedAssessments })
  }

  const deleteAssessment = async (moduleId: string, lessonId: string, assessmentId: string) => {
    if (!editingLesson) return

    // Confirm deletion
    if (!confirm("Are you sure you want to delete this assessment? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assessments/${assessmentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const updatedAssessments = editingLesson.lesson.assessments?.filter((a) => a.id !== assessmentId)
        updateLesson(moduleId, lessonId, { assessments: updatedAssessments })
        toast.success("Assessment deleted successfully!")
      } else {
        throw new Error("Failed to delete assessment")
      }
    } catch (error) {
      console.error("Failed to delete assessment:", error)
      toast.error("Failed to delete assessment")
    }
  }

  const addQuestion = (moduleId: string, lessonId: string, assessmentId: string) => {
    if (!editingLesson) return

    const newQuestion: Partial<AssessmentQuestion> = {
      question: "",
      type: "multiple_choice",
      options: ["", "", "", ""],
      correctAnswer: "",
      points: 1,
    }

    const updatedAssessments = editingLesson.lesson.assessments?.map((assessment) =>
      assessment.id === assessmentId
        ? { ...assessment, questions: [...assessment.questions, newQuestion] }
        : assessment,
    )

    updateLesson(moduleId, lessonId, { assessments: updatedAssessments })
  }

  const updateQuestion = (
    moduleId: string,
    lessonId: string,
    assessmentId: string,
    questionIndex: number,
    updates: Partial<AssessmentQuestion>,
  ) => {
    if (!editingLesson) return

    const updatedAssessments = editingLesson.lesson.assessments?.map((assessment) =>
      assessment.id === assessmentId
        ? {
            ...assessment,
            questions: assessment.questions.map((q, i) => (i === questionIndex ? { ...q, ...updates } : q)),
          }
        : assessment,
    )

    updateLesson(moduleId, lessonId, { assessments: updatedAssessments })
  }

  const deleteQuestion = (moduleId: string, lessonId: string, assessmentId: string, questionIndex: number) => {
    if (!editingLesson) return

    const updatedAssessments = editingLesson.lesson.assessments?.map((assessment) =>
      assessment.id === assessmentId
        ? {
            ...assessment,
            questions: assessment.questions.filter((_, i) => i !== questionIndex),
          }
        : assessment,
    )

    updateLesson(moduleId, lessonId, { assessments: updatedAssessments })
  }

  const saveLessonChanges = () => {
    if (!editingLesson) return

    // Serialize content blocks to JSON
    const contentToSave = {
      version: "1.0",
      blocks: contentBlocks.map((block) => ({
        type: block.type,
        data: block.content,
        id: block.id,
        order: block.order,
      })),
    }

    updateLesson(editingLesson.moduleId, editingLesson.lesson.id, {
      content: JSON.stringify(contentToSave),
      resources: resourceLinks.filter((link) => link.url.trim() !== ""),
    })

    setEditingLesson(null)
    setActiveTab("content")
  }

  const saveCourse = async () => {
    if (!course) return

    setSaving(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          instructorId: course.instructor?.id || course.instructorId,
          modules: course.modules?.map((module) => ({
            ...module,
            lessons: module.lessons?.map((lesson) => ({
              ...lesson,
              content: lesson.content || "",
              videoUrl: lesson.videoUrl || "",
              duration: lesson.duration || 0,
              order: lesson.order || 0,
              isProject: lesson.isProject || false,
              isExercise: lesson.isExercise || false,
              resources: lesson.resources || [],
              assessments: lesson.assessments || [],
            })),
          })),
        }),
      })

      if (response.ok) {
        updateCourseInCache(id, course)
        toast.success("Course updated successfully!")
      } else {
        throw new Error("Failed to save course")
      }
    } catch (error) {
      console.error("Failed to save course:", error)
      toast.error("Failed to save course changes")
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
      title: "New Lesson",
      content: "",
      videoUrl: "",
      duration: 0,
      order: 0,
      isProject: false,
      isExercise: false,
      resources: [],
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

    // Update editingLesson state if it's the current lesson
    if (editingLesson?.lesson.id === lessonId) {
      setEditingLesson({
        ...editingLesson,
        lesson: { ...editingLesson.lesson, ...updates },
      })
    }
  }

  const deleteLesson = async (moduleId: string, lessonId: string) => {
    if (!course) return

    // Confirm deletion
    if (!confirm("Are you sure you want to delete this lesson? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lessons/${lessonId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        // Remove from local state
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
        toast.success("Lesson deleted successfully!")
      } else {
        throw new Error("Failed to delete lesson")
      }
    } catch (error) {
      console.error("Failed to delete lesson:", error)
      toast.error("Failed to delete lesson")
    }
  }

  const getContentTypeIcon = (lesson: Lesson) => {
    if (lesson.videoUrl) return <Video className="w-4 h-4 text-blue-500" />
    if (lesson.assessments && lesson.assessments.length > 0) return <Trophy className="w-4 h-4 text-yellow-500" />
    return <ImageIcon className="w-4 h-4 text-gray-500" />
  }

  const renderContentBlock = (block: ContentBlock) => {
    switch (block.type) {
      case "text":
        const textValue = typeof block.content === "string" ? block.content : block.content?.text || ""

        return (
          <div className="space-y-2">
            <Label>Text Content</Label>
            <RichTextEditor
              value={textValue}
              onChange={(value) => updateContentBlock(block.id, { text: value })}
              className="min-h-[300px]"
            />
          </div>
        )

      case "video":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Video URL</Label>
              <Input
                value={block.content.url || ""}
                onChange={(e) => updateContentBlock(block.id, { ...block.content, url: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            <div className="space-y-2">
              <Label>Caption (Optional)</Label>
              <Input
                value={block.content.caption || ""}
                onChange={(e) => updateContentBlock(block.id, { ...block.content, caption: e.target.value })}
                placeholder="Video caption"
              />
            </div>
          </div>
        )

      case "image":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={block.content.url || ""}
                onChange={(e) => updateContentBlock(block.id, { ...block.content, url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label>Alt Text</Label>
              <Input
                value={block.content.alt || ""}
                onChange={(e) => updateContentBlock(block.id, { ...block.content, alt: e.target.value })}
                placeholder="Describe the image for accessibility"
              />
            </div>
            <div className="space-y-2">
              <Label>Caption (Optional)</Label>
              <Input
                value={block.content.caption || ""}
                onChange={(e) => updateContentBlock(block.id, { ...block.content, caption: e.target.value })}
                placeholder="Image caption"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const renderQuestionEditor = (
    question: AssessmentQuestion,
    questionIndex: number,
    assessmentId: string,
    moduleId: string,
    lessonId: string,
  ) => {
    const correctAnswers = Array.isArray(question.correctAnswer)
      ? question.correctAnswer
      : question.correctAnswer
        ? [question.correctAnswer]
        : []

    const toggleCorrectAnswer = (option: string) => {
      if (question.type === "multiple_choice") {
        const newCorrectAnswers = correctAnswers.includes(option)
          ? correctAnswers.filter((a) => a !== option)
          : [...correctAnswers, option]
        updateQuestion(moduleId, lessonId, assessmentId, questionIndex, {
          correctAnswer: newCorrectAnswers.length > 0 ? newCorrectAnswers : "",
        })
      }
    }

    const addOption = () => {
      const newOptions = [...(question.options || []), ""]
      updateQuestion(moduleId, lessonId, assessmentId, questionIndex, { options: newOptions })
    }

    const removeOption = (optionIndex: number) => {
      const newOptions = question.options?.filter((_, i) => i !== optionIndex) || []
      // Remove from correct answers if it was selected
      const optionToRemove = question.options?.[optionIndex]
      if (optionToRemove && correctAnswers.includes(optionToRemove)) {
        const newCorrectAnswers = correctAnswers.filter((a) => a !== optionToRemove)
        updateQuestion(moduleId, lessonId, assessmentId, questionIndex, {
          options: newOptions,
          correctAnswer: newCorrectAnswers.length > 0 ? newCorrectAnswers : "",
        })
      } else {
        updateQuestion(moduleId, lessonId, assessmentId, questionIndex, { options: newOptions })
      }
    }

    return (
      <Card key={question.id} className="relative">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
              <Badge variant="outline" className="text-xs">
                Question {questionIndex + 1}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {question.points} pt{question.points !== 1 ? "s" : ""}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteQuestion(moduleId, lessonId, assessmentId, questionIndex)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3 space-y-2">
              <Label>Question</Label>
              <Textarea
                value={question.question}
                onChange={(e) =>
                  updateQuestion(moduleId, lessonId, assessmentId, questionIndex, { question: e.target.value })
                }
                placeholder="Enter your question..."
                rows={2}
              />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={question.type}
                  onValueChange={(value) =>
                    updateQuestion(moduleId, lessonId, assessmentId, questionIndex, {
                      type: value as AssessmentQuestion["type"],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="true_false">True/False</SelectItem>
                    <SelectItem value="short_answer">Short Answer</SelectItem>
                    <SelectItem value="essay">Essay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Points</Label>
                <Input
                  type="number"
                  min="1"
                  value={question.points}
                  onChange={(e) =>
                    updateQuestion(moduleId, lessonId, assessmentId, questionIndex, {
                      points: Number.parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {question.type === "multiple_choice" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Answer Options</Label>
                <span className="text-xs text-muted-foreground">Select one or more correct answers</span>
              </div>
              {question.options?.map((option, optionIndex) => (
                <div key={optionIndex} className="flex gap-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(question.options || [])]
                      newOptions[optionIndex] = e.target.value
                      updateQuestion(moduleId, lessonId, assessmentId, questionIndex, { options: newOptions })
                    }}
                    placeholder={`Option ${optionIndex + 1}`}
                  />
                  <div className="flex items-center gap-2 px-3 border rounded-md">
                    <Checkbox
                      id={`correct-${question.id}-${optionIndex}`}
                      checked={correctAnswers.includes(option)}
                      onCheckedChange={() => toggleCorrectAnswer(option)}
                    />
                    <Label htmlFor={`correct-${question.id}-${optionIndex}`} className="text-sm cursor-pointer">
                      Correct
                    </Label>
                  </div>
                  {(question.options?.length || 0) > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(optionIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addOption} className="w-full bg-transparent">
                <Plus className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            </div>
          )}

          {question.type === "true_false" && (
            <div className="space-y-2">
              <Label>Correct Answer</Label>
              <div className="flex gap-2">
                <Button
                  variant={question.correctAnswer === "true" ? "default" : "outline"}
                  onClick={() =>
                    updateQuestion(moduleId, lessonId, assessmentId, questionIndex, { correctAnswer: "true" })
                  }
                >
                  True
                </Button>
                <Button
                  variant={question.correctAnswer === "false" ? "default" : "outline"}
                  onClick={() =>
                    updateQuestion(moduleId, lessonId, assessmentId, questionIndex, { correctAnswer: "false" })
                  }
                >
                  False
                </Button>
              </div>
            </div>
          )}

          {(question.type === "short_answer" || question.type === "essay") && (
            <div className="space-y-2">
              <Label>Sample Answer / Grading Notes</Label>
              <Textarea
                value={
                  Array.isArray(question.correctAnswer) ? question.correctAnswer.join(", ") : question.correctAnswer
                }
                onChange={(e) =>
                  updateQuestion(moduleId, lessonId, assessmentId, questionIndex, { correctAnswer: e.target.value })
                }
                placeholder="Provide a sample answer or grading guidelines..."
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>
    )
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

  if (!course && !loading) {
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
        </div>
      </div>

      {/* Tree Builder for Editing */}
      {course && (
        <CourseTreeBuilder
          modules={course.modules || []}
          setModules={(modules) => setCourse({ ...course, modules })}
          courseData={course}
          onNext={saveCourse}
          onPrevious={() => window.history.back()}
          type='update'
          loading={saving}
        />
      )}
    </div>
  )
}
