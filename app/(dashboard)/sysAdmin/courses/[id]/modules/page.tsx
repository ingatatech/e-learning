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
  Trophy,
  Clock,
  Briefcase,
  Zap,
  FileDown,
  FileText,
  Target,
} from "lucide-react"
import Link from "next/link"
import { motion, Reorder } from "framer-motion"
import type { Course, Module, Lesson, Assessment, AssessmentQuestion } from "@/types"
import { useAuth } from "@/hooks/use-auth"
import { Checkbox } from "@/components/ui/checkbox"

interface ContentBlock {
  id: string
  type: "text" | "video" | "image"
  content: any
  order: number
}

export default function ModulesManagementPage({ params }: { params: Promise<{ id: string }> }) {
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

  const deleteAssessment = (moduleId: string, lessonId: string, assessmentId: string) => {
    if (!editingLesson) return

    const updatedAssessments = editingLesson.lesson.assessments?.filter((a) => a.id !== assessmentId)
    updateLesson(moduleId, lessonId, { assessments: updatedAssessments })
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
      : question.correctAnswer && typeof question.correctAnswer === "string"
        ? [question.correctAnswer]
        : []

    const toggleCorrectAnswer = (option: string) => {
      if (question.type === "multiple_choice") {
        const newCorrectAnswers = correctAnswers.includes(option)
          ? correctAnswers.filter((a) => a !== option)
          : [...correctAnswers, option]
        updateQuestion(moduleId, lessonId, assessmentId, questionIndex, {
          correctAnswer: newCorrectAnswers.length === 1 ? newCorrectAnswers[0] : newCorrectAnswers,
        })
      }
    }
    // </CHANGE>

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
          correctAnswer:
            newCorrectAnswers.length === 0
              ? ""
              : newCorrectAnswers.length === 1
                ? newCorrectAnswers[0]
                : newCorrectAnswers,
        })
        // </CHANGE>
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

  if (!course) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Course not found</h1>
        <Button asChild>
          <Link href="/sysAdmin/courses">
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
              <Link href={`/sysAdmin/courses/${course.id}`}>
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
          {/* <Button asChild>
            <Link href={`/sysAdmin/courses/${course.id}/preview`}>
              <Play className="w-4 h-4 mr-2" />
              Preview Course
            </Link>
          </Button> */}
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
                            className="rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            {editingLesson?.lesson.id === lesson.id ? (
                              <div className="p-4">
                                <Tabs value={activeTab} onValueChange={setActiveTab}>
                                  <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="content">Content</TabsTrigger>
                                    <TabsTrigger value="settings">Settings</TabsTrigger>
                                    <TabsTrigger value="resources">Resources</TabsTrigger>
                                    <TabsTrigger value="assessments">Assessments</TabsTrigger>
                                  </TabsList>

                                  <TabsContent value="content" className="space-y-4 mt-4">
                                    <div className="space-y-2">
                                      <Label>Lesson Title</Label>
                                      <Input
                                        value={lesson.title}
                                        onChange={(e) => updateLesson(module.id, lesson.id, { title: e.target.value })}
                                        placeholder="Lesson title"
                                      />
                                    </div>

                                    {/* Content Blocks */}
                                    <div className="space-y-4">
                                      {contentBlocks.map((block) => (
                                        <Card key={block.id} className="relative">
                                          <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-2">
                                                <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                                                {getBlockIcon(block.type)}
                                                <Badge variant="outline" className="text-xs">
                                                  {block.type}
                                                </Badge>
                                              </div>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteContentBlock(block.id)}
                                                className="text-red-500 hover:text-red-700"
                                              >
                                                <Trash2 className="w-4 h-4" />
                                              </Button>
                                            </div>
                                          </CardHeader>
                                          <CardContent>{renderContentBlock(block)}</CardContent>
                                        </Card>
                                      ))}
                                    </div>

                                    {/* Add Content Block */}
                                    <Card className="border-dashed border-2 border-gray-300 hover:border-primary-400 transition-colors">
                                      <CardContent className="p-6">
                                        <div className="text-center mb-4">
                                          <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                                            Add Content Block
                                          </h3>
                                          <p className="text-sm text-gray-600 dark:text-gray-300">
                                            Choose the type of content you want to add
                                          </p>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addContentBlock("text")}
                                            className="flex flex-col gap-1 h-auto py-3"
                                          >
                                            <FileText className="w-5 h-5" />
                                            <span className="text-xs">Text</span>
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addContentBlock("video")}
                                            className="flex flex-col gap-1 h-auto py-3"
                                          >
                                            <Video className="w-5 h-5" />
                                            <span className="text-xs">Video</span>
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addContentBlock("image")}
                                            className="flex flex-col gap-1 h-auto py-3"
                                          >
                                            <ImageIcon className="w-5 h-5" />
                                            <span className="text-xs">Image</span>
                                          </Button>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </TabsContent>

                                  <TabsContent value="settings" className="space-y-4 mt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label>Video URL (optional)</Label>
                                        <Input
                                          value={lesson.videoUrl || ""}
                                          onChange={(e) =>
                                            updateLesson(module.id, lesson.id, { videoUrl: e.target.value })
                                          }
                                          placeholder="https://youtube.com/watch?v=..."
                                        />
                                      </div>

                                      <div className="space-y-2">
                                        <Label>Duration (minutes)</Label>
                                        <Input
                                          type="number"
                                          value={lesson.duration}
                                          onChange={(e) =>
                                            updateLesson(module.id, lesson.id, {
                                              duration: Number.parseInt(e.target.value) || 0,
                                            })
                                          }
                                          placeholder="30"
                                        />
                                      </div>
                                    </div>

                                    <div className="space-y-3 pt-2 border-t">
                                      <Label>Lesson Type</Label>
                                      <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                          <Label className="flex items-center gap-2 font-normal">
                                            <Briefcase className="w-4 h-4" />
                                            Project Lesson
                                          </Label>
                                          <p className="text-xs text-muted-foreground">
                                            This lesson contains a hands-on project
                                          </p>
                                        </div>
                                        <Switch
                                          checked={lesson.isProject || false}
                                          onCheckedChange={(checked) =>
                                            updateLesson(module.id, lesson.id, { isProject: checked })
                                          }
                                        />
                                      </div>

                                      <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                          <Label className="flex items-center gap-2 font-normal">
                                            <Zap className="w-4 h-4" />
                                            Exercise Lesson
                                          </Label>
                                          <p className="text-xs text-muted-foreground">
                                            This lesson includes practical exercises
                                          </p>
                                        </div>
                                        <Switch
                                          checked={lesson.isExercise || false}
                                          onCheckedChange={(checked) =>
                                            updateLesson(module.id, lesson.id, { isExercise: checked })
                                          }
                                        />
                                      </div>
                                    </div>
                                  </TabsContent>

                                  <TabsContent value="resources" className="space-y-4 mt-4">
                                    <p className="text-sm text-muted-foreground">
                                      Add links to PDFs, documents, code files, and other resources that complement this
                                      lesson.
                                    </p>

                                    {resourceLinks.map((link, idx) => (
                                      <div key={idx} className="space-y-2 p-4 border rounded-lg">
                                        <div className="flex items-center gap-2">
                                          <Input
                                            value={link.url || ""}
                                            onChange={(e) => handleLinkChange(idx, { ...link, url: e.target.value })}
                                            placeholder="https://example.com/resource.pdf"
                                            className="flex-1"
                                          />
                                          <Button variant="destructive" size="sm" onClick={() => removeLink(idx)}>
                                            Remove
                                          </Button>
                                        </div>
                                        <Input
                                          value={link.title || ""}
                                          onChange={(e) => handleLinkChange(idx, { ...link, title: e.target.value })}
                                          placeholder="Resource title (e.g., 'Course Slides', 'Exercise Files')"
                                          className="text-sm"
                                        />
                                        <Textarea
                                          value={link.description || ""}
                                          onChange={(e) =>
                                            handleLinkChange(idx, { ...link, description: e.target.value })
                                          }
                                          placeholder="Brief description of this resource..."
                                          rows={2}
                                          className="text-sm resize-none"
                                        />
                                      </div>
                                    ))}

                                    <Button
                                      onClick={addNewLink}
                                      variant="outline"
                                      size="sm"
                                      className="w-full bg-transparent"
                                    >
                                      <FileDown className="w-4 h-4 mr-2" />
                                      Add Resource
                                    </Button>
                                  </TabsContent>

                                  <TabsContent value="assessments" className="space-y-4 mt-4">
                                    {lesson.assessments && lesson.assessments.length > 0 ? (
                                      <div className="space-y-6">
                                        {lesson.assessments.map((assessment) => (
                                          <Card key={assessment.id} className="border-2">
                                            <CardHeader>
                                              <div className="flex items-center justify-between">
                                                <div className="flex-1 space-y-2">
                                                  <Input
                                                    value={assessment.title}
                                                    onChange={(e) =>
                                                      updateAssessment(module.id, lesson.id, assessment.id, {
                                                        title: e.target.value,
                                                      })
                                                    }
                                                    placeholder="Assessment title"
                                                    className="font-semibold"
                                                  />
                                                  <Textarea
                                                    value={assessment.description}
                                                    onChange={(e) =>
                                                      updateAssessment(module.id, lesson.id, assessment.id, {
                                                        description: e.target.value,
                                                      })
                                                    }
                                                    placeholder="Assessment instructions..."
                                                    rows={2}
                                                  />
                                                </div>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => deleteAssessment(module.id, lesson.id, assessment.id)}
                                                  className="text-destructive hover:text-destructive ml-2"
                                                >
                                                  <Trash2 className="w-4 h-4" />
                                                </Button>
                                              </div>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                              <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                  <Label>Type</Label>
                                                  <Select
                                                    value={assessment.type}
                                                    onValueChange={(value) =>
                                                      updateAssessment(module.id, lesson.id, assessment.id, {
                                                        type: value as Assessment["type"],
                                                      })
                                                    }
                                                  >
                                                    <SelectTrigger>
                                                      <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      <SelectItem value="quiz">Quiz</SelectItem>
                                                      <SelectItem value="assignment">Assignment</SelectItem>
                                                      <SelectItem value="project">Project</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                </div>
                                                <div className="space-y-2">
                                                  <Label>Passing Score (%)</Label>
                                                  <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={assessment.passingScore || ""}
                                                    onChange={(e) =>
                                                      updateAssessment(module.id, lesson.id, assessment.id, {
                                                        passingScore: Number.parseInt(e.target.value) || undefined,
                                                      })
                                                    }
                                                  />
                                                </div>
                                                <div className="space-y-2">
                                                  <Label>Time Limit (min)</Label>
                                                  <Input
                                                    type="number"
                                                    min="0"
                                                    value={assessment.timeLimit || ""}
                                                    onChange={(e) =>
                                                      updateAssessment(module.id, lesson.id, assessment.id, {
                                                        timeLimit: Number.parseInt(e.target.value) || undefined,
                                                      })
                                                    }
                                                    placeholder="No limit"
                                                  />
                                                </div>
                                              </div>

                                              <div className="space-y-4 pt-4 border-t">
                                                <div className="flex items-center justify-between">
                                                  <h4 className="font-semibold">Questions</h4>
                                                  <Badge variant="outline">
                                                    {assessment.questions.length} question
                                                    {assessment.questions.length !== 1 ? "s" : ""}
                                                  </Badge>
                                                </div>

                                                {assessment.questions.map((question, qIndex) =>
                                                  renderQuestionEditor(
                                                    question,
                                                    qIndex,
                                                    assessment.id,
                                                    module.id,
                                                    lesson.id,
                                                  ),
                                                )}

                                                <Card className="border-dashed border-2 border-gray-300 hover:border-primary-400 transition-colors">
                                                  <CardContent className="p-6 text-center">
                                                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                                                      Add Question
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                                      Create a new question for this assessment
                                                    </p>
                                                    <Button
                                                      onClick={() => addQuestion(module.id, lesson.id, assessment.id)}
                                                    >
                                                      <Plus className="w-4 h-4 mr-2" />
                                                      Add Question
                                                    </Button>
                                                  </CardContent>
                                                </Card>
                                              </div>
                                            </CardContent>
                                          </Card>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="text-center py-12">
                                        <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold mb-2">No assessments yet</h3>
                                        <p className="text-muted-foreground mb-6">
                                          Add quizzes, assignments, or projects to test student knowledge
                                        </p>
                                      </div>
                                    )}

                                    <Button
                                      onClick={() => addAssessment(module.id, lesson.id)}
                                      variant="outline"
                                      className="w-full"
                                    >
                                      <Plus className="w-4 h-4 mr-2" />
                                      Add Assessment
                                    </Button>
                                  </TabsContent>
                                </Tabs>

                                <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deleteLesson(module.id, lesson.id)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Lesson
                                  </Button>
                                  <Button size="sm" onClick={saveLessonChanges}>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Lesson
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between p-3">
                                <div className="flex items-center gap-3 flex-1">
                                  {getContentTypeIcon(lesson)}
                                  <div className="flex-1">
                                    <div className="font-medium text-sm">{lesson.title}</div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap mt-1">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {lesson.duration}min
                                      </span>
                                      {lesson.videoUrl && (
                                        <Badge variant="outline" className="text-xs h-5">
                                          <Video className="w-3 h-3 mr-1" />
                                          Video
                                        </Badge>
                                      )}
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
                                        <Badge variant="outline" className="text-xs h-5">
                                          <Trophy className="w-3 h-3 mr-1" />
                                          {lesson.assessments.length} assessment
                                          {lesson.assessments.length > 1 ? "s" : ""}
                                        </Badge>
                                      )}
                                      {lesson.resources && lesson.resources.length > 0 && (
                                        <Badge variant="outline" className="text-xs h-5">
                                          <FileDown className="w-3 h-3 mr-1" />
                                          {lesson.resources.length} resource{lesson.resources.length > 1 ? "s" : ""}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingLesson({ lesson, moduleId: module.id })}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
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
