"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { BookOpen, FileText, Trophy, Trash2, AlertCircle } from "lucide-react"
import { ContentBlockBuilder } from "../lesson/content-block-builder"
import { AssessmentEditor } from "../assessment/assessment-editor"
import type { Module, Lesson, Assessment, ContentBlock } from "@/types"

interface ContentEditorProps {
  item: {
    id: string
    type: "module" | "lesson" | "assignment" | "final-assessment"
    title: string
    moduleId?: string
    lessonId?: string
    data: Module | Lesson | Assessment
  }
  modules: Module[]
  onUpdate: (updates: any) => void
  onDelete: () => void
}

export function ContentEditor({ item, modules, onUpdate, onDelete }: ContentEditorProps) {
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([])
  const [currentData, setCurrentData] = useState<Module | Lesson | Assessment>(item.data)

  // Sync when the item prop changes
  useEffect(() => {
    setCurrentData(item.data)

    // Also update contentBlocks for lessons
    if (item.type === "lesson") {
      const lesson = item.data as Lesson
      try {
        if (lesson.content && typeof lesson.content === "string" && lesson.content.startsWith("{")) {
          const parsed = JSON.parse(lesson.content)
          setContentBlocks(parsed.blocks || [])
        } else {
          setContentBlocks([])
        }
      } catch (e) {
        setContentBlocks([])
      }
    }
  }, [item])

  // For final-assessment type selection
  const [showTypeSelection, setShowTypeSelection] = useState(() => {
    if (item.type === "final-assessment") {
      const assessment = item.data as Assessment
      return assessment.type === undefined
    }
    return false
  })

  // Update showTypeSelection when item changes
  useEffect(() => {
    if (item.type === "final-assessment") {
      const assessment = item.data as Assessment
      setShowTypeSelection(assessment.type === undefined)
    }
  }, [item])

  // Handle update with type change
  const handleUpdateWithType = (updates: any) => {
    // If we're updating the type for final-assessment, also update local state
    if (item.type === "final-assessment" && updates.type) {
      setShowTypeSelection(false)
    }
    onUpdate(updates)
  }

  // Handle type selection for final assessment
  const handleTypeSelection = (type: "assessment" | "project") => {
    // Create a new item object with the updated type
    const updatedData = {
      ...item.data,
      type: type,
      // Set default values based on type
      ...(type === "project" ? { fileRequired: true } : {}),
    }

    // Update the item locally first for immediate feedback
    setCurrentData(updatedData)

    // Call the parent update
    onUpdate({ type: type, ...(type === "project" ? { fileRequired: true } : {}) })

    // Hide type selection
    setShowTypeSelection(false)
  }

  if (item.type === "module") {
    const module = currentData as Module
    return (
      <Card className="h-full overflow-y-auto">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                {module.title || "Untitled Module"}
              </CardTitle>
              <CardDescription>Edit module details</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (deleteConfirm ? onDelete() : setDeleteConfirm(true))}
              className={deleteConfirm ? "text-red-600 bg-red-50 dark:bg-red-950" : "text-red-600"}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleteConfirm ? "Confirm Delete" : "Delete"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pb-6">
          <div className="space-y-2">
            <Label>Module Title</Label>
            <Input
              value={module.title}
              onChange={(e) => {
                setCurrentData({ ...module, title: e.target.value })
                onUpdate({ title: e.target.value })
              }}
              placeholder="e.g., Introduction to React"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={module.description}
              onChange={(e) => {
                setCurrentData({ ...module, description: e.target.value })
                onUpdate({ description: e.target.value })
              }}
              placeholder="Describe what students will learn in this module..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Duration (minutes)</Label>
            <Input
              type="number"
              value={module.duration}
              onChange={(e) => {
                setCurrentData({ ...module, duration: Number(e.target.value) })
                onUpdate({ duration: Number(e.target.value) })
              }}
              placeholder="Estimated duration"
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Module Statistics</p>
                <p>
                  {module.lessons?.length || 0} lessons •{" "}
                  {module.lessons?.reduce((acc, l) => acc + (l.assessments?.length || 0), 0) || 0} assessments
                  {module.finalAssessment && " • Final Assessment ✓"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (item.type === "lesson") {
    const lesson = currentData as Lesson
    const module = modules.find((m) => m.id === item.moduleId)

    const handleBlocksChange = (blocks: ContentBlock[]) => {
      setContentBlocks(blocks)
      const contentJson = {
        version: "1.0",
        blocks: blocks,
      }
      onUpdate({ content: JSON.stringify(contentJson) })
    }

    return (
      <Card className="h-full overflow-y-auto">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {lesson.title || "Untitled Lesson"}
              </CardTitle>
              <CardDescription>{module?.title}</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (deleteConfirm ? onDelete() : setDeleteConfirm(true))}
              className={deleteConfirm ? "text-red-600 bg-red-50 dark:bg-red-950" : "text-red-600"}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleteConfirm ? "Confirm Delete" : "Delete"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pb-6">
          <div className="space-y-2">
            <Label>Lesson Title</Label>
            <Input
              value={lesson.title}
              onChange={(e) => {
                setCurrentData({ ...lesson, title: e.target.value })
                onUpdate({ title: e.target.value })
              }}
              placeholder="e.g., React Hooks Basics"
            />
          </div>

          <div className="space-y-2">
            <Label>Duration (minutes)</Label>
            <Input
              type="number"
              value={lesson.duration}
              onChange={(e) => {
                setCurrentData({ ...lesson, duration: Number(e.target.value) })
                onUpdate({ duration: Number(e.target.value) })
              }}
              placeholder="5"
            />
          </div>

          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Content Blocks</Label>
                <p className="text-xs text-gray-500">
                  Add multiple content blocks (text, images, videos) to build rich lessons
                </p>
              </div>
              <ContentBlockBuilder blocks={contentBlocks} onBlocksChange={handleBlocksChange} />
            </TabsContent>

            <TabsContent value="settings" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label className="text-sm">Mark as Project</Label>
                    <p className="text-xs text-gray-500">Students create a real project</p>
                  </div>
                  <Switch
                    checked={lesson.isProject}
                    onCheckedChange={(checked) => {
                      setCurrentData({ ...lesson, isProject: checked })
                      onUpdate({ isProject: checked })
                    }}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label className="text-sm">Mark as Exercise</Label>
                    <p className="text-xs text-gray-500">Practice problems for students</p>
                  </div>
                  <Switch
                    checked={lesson.isExercise}
                    onCheckedChange={(checked) => {
                      setCurrentData({ ...lesson, isExercise: checked })
                      onUpdate({ isExercise: checked })
                    }}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    )
  }

  if (item.type === "assignment") {
    const assessment = currentData as Assessment
    const module = modules.find((m) => m.id === item.moduleId)
    const lesson = module?.lessons?.find((l) => l.id === item.lessonId)

    return (
      <Card className="h-full overflow-y-auto">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                {assessment.title || "Untitled Assessment"}
              </CardTitle>
              <CardDescription>
                {module?.title} • {lesson?.title}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (deleteConfirm ? onDelete() : setDeleteConfirm(true))}
              className={deleteConfirm ? "text-red-600 bg-red-50 dark:bg-red-950" : "text-red-600"}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleteConfirm ? "Confirm Delete" : "Delete"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pb-6">
          <AssessmentEditor
            assessment={assessment}
            onUpdate={(updates) => {
              setCurrentData({ ...assessment, ...updates })
              onUpdate(updates)
            }}
            onDelete={() => onDelete()}
          />
        </CardContent>
      </Card>
    )
  }

  if (item.type === "final-assessment") {
    const assessment = currentData as Assessment
    const module = modules.find((m) => m.id === item.moduleId)

    // If type is not set, show type selection
    if (showTypeSelection) {
      return (
        <Card className="h-full overflow-y-auto">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Final Assessment
                </CardTitle>
                <CardDescription>{module?.title}</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => (deleteConfirm ? onDelete() : setDeleteConfirm(true))}
                className={deleteConfirm ? "text-red-600 bg-red-50 dark:bg-red-950" : "text-red-600"}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {deleteConfirm ? "Confirm Delete" : "Delete"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pb-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold mb-4">Choose Assessment Type</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Select how you want students to complete the final assessment
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                {/* Assessment Option */}
                <button
                  onClick={() => handleTypeSelection("assessment")}
                  className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all text-left"
                >
                  <Trophy className="w-8 h-8 text-blue-600 mb-3" />
                  <h4 className="font-semibold mb-2">Assessment</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Create questions for students to answer. Supports multiple choice, true/false, and more.
                  </p>
                </button>

                {/* Project Option */}
                <button
                  onClick={() => handleTypeSelection("project")}
                  className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950 transition-all text-left"
                >
                  <FileText className="w-8 h-8 text-green-600 mb-3" />
                  <h4 className="font-semibold mb-2">Project</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Students submit project files. Perfect for portfolio pieces or hands-on work.
                  </p>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    // If type is assessment, show assessment editor
    if (assessment.type === "assessment") {
      return (
        <Card className="h-full overflow-y-auto">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  {assessment.title || "Untitled Final Assessment"}
                </CardTitle>
                <CardDescription>{module?.title}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowTypeSelection(true)} className="text-xs">
                  Change Type
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => (deleteConfirm ? onDelete() : setDeleteConfirm(true))}
                  className={deleteConfirm ? "text-red-600 bg-red-50 dark:bg-red-950" : "text-red-600"}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleteConfirm ? "Confirm Delete" : "Delete"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pb-6">
            <AssessmentEditor
              assessment={assessment}
              onUpdate={(updates) => {
                const updatedAssessment = { ...assessment, ...updates }
                setCurrentData(updatedAssessment)
                handleUpdateWithType(updates)
              }}
              onDelete={() => onDelete()}
            />
          </CardContent>
        </Card>
      )
    }

    // If type is project, show project form
    if (assessment.type === "project") {
      return (
        <Card className="h-full overflow-y-auto">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {assessment.title || "Untitled Final Project"}
                </CardTitle>
                <CardDescription>{module?.title}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowTypeSelection(true)} className="text-xs">
                  Change Type
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => (deleteConfirm ? onDelete() : setDeleteConfirm(true))}
                  className={deleteConfirm ? "text-red-600 bg-red-50 dark:bg-red-950" : "text-red-600"}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleteConfirm ? "Confirm Delete" : "Delete"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pb-6">
            <div className="space-y-2">
              <Label>Project Title</Label>
              <Input
                value={assessment.title}
                onChange={(e) => {
                  setCurrentData({ ...assessment, title: e.target.value })
                  onUpdate({ title: e.target.value })
                }}
                placeholder="e.g., Module Project: Edit a 1-minute Film"
              />
            </div>

            <div className="space-y-2">
              <Label>Instructions</Label>
              <Textarea
                value={assessment.description}
                onChange={(e) => {
                  setCurrentData({ ...assessment, description: e.target.value })
                  onUpdate({ description: e.target.value })
                }}
                placeholder="Provide detailed instructions for the project..."
                rows={6}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <div>
                <Label className="text-sm font-medium text-green-900 dark:text-green-100">
                  File Submission Required
                </Label>
                <p className="text-xs text-green-800 dark:text-green-200">Students must upload their project files</p>
              </div>
              <Switch
                checked={assessment.fileRequired || true}
                onCheckedChange={(checked) => {
                  setCurrentData({ ...assessment, fileRequired: checked })
                  onUpdate({ fileRequired: checked })
                }}
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">Project Configuration</p>
                  <p>Students will submit their project files as deliverables for this module.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }
  }

  return null
}
