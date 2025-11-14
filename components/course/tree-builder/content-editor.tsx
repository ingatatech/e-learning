"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { BookOpen, FileText, Trophy, Trash2, Clock, AlertCircle } from 'lucide-react'
import { ContentBlockBuilder } from "../lesson/content-block-builder"
import { AssessmentEditor } from "../assessment/assessment-editor"
import type { Module, Lesson, Assessment, ContentBlock } from "@/types"

interface ContentEditorProps {
  item: {
    id: string
    type: "module" | "lesson" | "assignment"
    title: string
    moduleId?: string
    lessonId?: string
    data: Module | Lesson | Assessment
  }
  modules: Module[]
  onUpdate: (updates: any) => void
  onDelete: () => void
}

export function ContentEditor({
  item,
  modules,
  onUpdate,
  onDelete,
}: ContentEditorProps) {
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  if (item.type === "module") {
    const module = item.data as Module
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
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="e.g., Introduction to React"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={module.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Describe what students will learn in this module..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Duration (minutes)</Label>
            <Input
              type="number"
              value={module.duration}
              onChange={(e) => onUpdate({ duration: Number(e.target.value) })}
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
                  {module.lessons?.reduce((acc, l) => acc + (l.assessments?.length || 0), 0) || 0}{" "}
                  assessments
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (item.type === "lesson") {
    const lesson = item.data as Lesson
    const module = modules.find((m) => m.id === item.moduleId)
    
    const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>(() => {
      try {
        if (lesson.content && typeof lesson.content === 'string' && lesson.content.startsWith('{')) {
          const parsed = JSON.parse(lesson.content);
          return parsed.blocks || [];
        }
      } catch (e) {
        console.log("[v0] Failed to parse content blocks, initializing empty")
      }
      return [];
    })

    const handleBlocksChange = (blocks: ContentBlock[]) => {
      setContentBlocks(blocks)
      const contentJson = {
        version: "1.0",
        blocks: blocks
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
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="e.g., React Hooks Basics"
            />
          </div>

          <div className="space-y-2">
            <Label>Duration (minutes)</Label>
            <Input
              type="number"
              value={lesson.duration}
              onChange={(e) => onUpdate({ duration: Number(e.target.value) })}
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
                <p className="text-xs text-gray-500">Add multiple content blocks (text, images, videos) to build rich lessons</p>
              </div>
              <ContentBlockBuilder 
                blocks={contentBlocks}
                onBlocksChange={handleBlocksChange}
              />
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
                    onCheckedChange={(checked) => onUpdate({ isProject: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label className="text-sm">Mark as Exercise</Label>
                    <p className="text-xs text-gray-500">Practice problems for students</p>
                  </div>
                  <Switch
                    checked={lesson.isExercise}
                    onCheckedChange={(checked) => onUpdate({ isExercise: checked })}
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
    const assessment = item.data as Assessment
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
            onUpdate={(updates) => onUpdate(updates)}
            onDelete={() => onDelete()}
          />
        </CardContent>
      </Card>
    )
  }

  return null
}
