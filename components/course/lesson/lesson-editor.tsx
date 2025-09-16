"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  FileText,
  Video,
  Upload,
  ImageIcon,
  FileDown,
  Trash2,
  GripVertical,
  Clock,
  Save,
  Briefcase,
  Zap,
  Check,
} from "lucide-react"
import type { Lesson } from "@/types"

interface ContentBlock {
  id: string
  type: "text" | "video" | "image" | "file" | "quiz"
  content: any
  order: number
}

interface LessonEditorProps {
  lesson: Lesson
  onUpdate: (updates: Partial<Lesson>) => void
  onDelete: () => void
}

export function LessonEditor({ lesson, onUpdate, onDelete }: LessonEditorProps) {
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([])
  const [activeTab, setActiveTab] = useState("content")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(true)

  // Initialize content blocks from lesson content
  useEffect(() => {
    if (lesson.content) {
      try {
        const parsedContent = JSON.parse(lesson.content)
        setContentBlocks(
          parsedContent.map((block: any, index: number) => ({
            id: `block-${Date.now()}-${index}`,
            type: block.type,
            content: block.data,
            order: index + 1,
          })),
        )
      } catch (error) {
        // If content is not JSON, treat it as text
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
      // Default empty text block
      setContentBlocks([
        {
          id: `block-${Date.now()}`,
          type: "text",
          content: { text: "" },
          order: 1,
        },
      ])
    }
  }, [lesson.id]) // Only run when lesson id changes

  const addContentBlock = (type: ContentBlock["type"]) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type,
      content: getDefaultContent(type),
      order: contentBlocks.length + 1,
    }
    setContentBlocks([...contentBlocks, newBlock])
    setHasUnsavedChanges(true)
  }

  const getDefaultContent = (type: ContentBlock["type"]) => {
    switch (type) {
      case "text":
        return { text: "" }
      case "video":
        return { url: "", title: "", description: "" }
      case "image":
        return { url: "", alt: "", caption: "" }
      case "file":
        return { url: "", name: "", description: "" }
      case "quiz":
        return { question: "", options: ["", "", "", ""], correctAnswer: 0 }
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

  // Save handler
  const handleSave = () => {
  const content = {
    version: '1.0',
    blocks: contentBlocks.map((block) => ({
      type: block.type,
      data: block.content,
      id: block.id, // preserve the ID for React keys
      order: block.order,
    }))
  };

  onUpdate({
    content: JSON.stringify(content),
    duration: lesson.duration,
    videoUrl: lesson.videoUrl,
    isProject: lesson.isProject,
    isExercise: lesson.isExercise,
  })
  setHasUnsavedChanges(false)
}

  const renderContentBlock = (block: ContentBlock) => {
    switch (block.type) {
      case "text":
        return (
          <div className="space-y-2">
            <Label>Text Content</Label>
            <Textarea
              value={block.content.text}
              onChange={(e) => updateContentBlock(block.id, { text: e.target.value })}
              placeholder="Enter your lesson content..."
              rows={6}
              className="resize-none"
            />
          </div>
        )

      case "video":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Video URL</Label>
              <Input
                value={block.content.url}
                onChange={(e) => updateContentBlock(block.id, { ...block.content, url: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            <div className="space-y-2">
              <Label>Video Title</Label>
              <Input
                value={block.content.title}
                onChange={(e) => updateContentBlock(block.id, { ...block.content, title: e.target.value })}
                placeholder="Video title"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={block.content.description}
                onChange={(e) => updateContentBlock(block.id, { ...block.content, description: e.target.value })}
                placeholder="Brief description of the video content"
                rows={2}
              />
            </div>
          </div>
        )

      case "image":
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-300">Click to upload or drag and drop an image</p>
              <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Alt Text</Label>
              <Input
                value={block.content.alt}
                onChange={(e) => updateContentBlock(block.id, { ...block.content, alt: e.target.value })}
                placeholder="Describe the image for accessibility"
              />
            </div>
            <div className="space-y-2">
              <Label>Caption (Optional)</Label>
              <Input
                value={block.content.caption}
                onChange={(e) => updateContentBlock(block.id, { ...block.content, caption: e.target.value })}
                placeholder="Image caption"
              />
            </div>
          </div>
        )

      case "quiz":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Question</Label>
              <Textarea
                value={block.content.question}
                onChange={(e) => updateContentBlock(block.id, { ...block.content, question: e.target.value })}
                placeholder="Enter your quiz question..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Answer Options</Label>
              {block.content.options.map((option: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...block.content.options]
                      newOptions[index] = e.target.value
                      updateContentBlock(block.id, { ...block.content, options: newOptions })
                    }}
                    placeholder={`Option ${index + 1}`}
                  />
                  <Button
                    variant={block.content.correctAnswer === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateContentBlock(block.id, { ...block.content, correctAnswer: index })}
                  >
                    Correct
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const getBlockIcon = (type: ContentBlock["type"]) => {
    switch (type) {
      case "text":
        return <FileText className="w-4 h-4" />
      case "video":
        return <Video className="w-4 h-4" />
      case "image":
        return <ImageIcon className="w-4 h-4" />
      case "file":
        return <FileDown className="w-4 h-4" />
      case "quiz":
        return <Badge className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="flex-1 overflow-y-auto">
          <div className="space-y-4">
            {/* Lesson Title */}
            <div className="space-y-2">
              <Label>Lesson Title</Label>
              <Input
                value={lesson.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Enter lesson title"
                className="text-lg font-medium"
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
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Add Content Block</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Choose the type of content you want to add</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addContentBlock("file")}
                    className="flex flex-col gap-1 h-auto py-3"
                  >
                    <FileDown className="w-5 h-5" />
                    <span className="text-xs">File</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addContentBlock("quiz")}
                    className="flex flex-col gap-1 h-auto py-3"
                  >
                    <Badge className="w-5 h-5" />
                    <span className="text-xs">Quiz</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="flex-1">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lesson Settings</CardTitle>
                <CardDescription>Configure lesson properties and behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Estimated Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={lesson.duration}
                    onChange={(e) => onUpdate({ duration: Number.parseInt(e.target.value) || 0 })}
                    placeholder="15"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Video URL (Optional)</Label>
                  <Input
                    value={lesson.videoUrl || ""}
                    onChange={(e) => onUpdate({ videoUrl: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Lesson Type</h4>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          Project Lesson
                        </Label>
                        <p className="text-sm text-gray-500">This lesson contains a hands-on project</p>
                      </div>
                      <Switch
                        checked={lesson.isProject || false}
                        onCheckedChange={(checked) => onUpdate({ isProject: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Exercise Lesson
                        </Label>
                        <p className="text-sm text-gray-500">This lesson includes practical exercises</p>
                      </div>
                      <Switch
                        checked={lesson.isExercise || false}
                        onCheckedChange={(checked) => onUpdate({ isExercise: checked })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lesson Resources</CardTitle>
              <CardDescription>Add downloadable files and additional materials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <FileDown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 mb-2">Upload resources for students</p>
                <p className="text-sm text-gray-500 mb-4">PDFs, documents, code files, etc.</p>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Actions */}
      <div className="flex justify-between items-center pt-4 border-t">
        <Button variant="outline" onClick={onDelete} className="text-red-600 hover:text-red-700 bg-transparent">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Lesson
        </Button>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={!hasUnsavedChanges}>
            {hasUnsavedChanges ? <Clock className="w-4 h-4 mr-2" /> : <Check className="w-4 h-4 mr-2" />}
            {hasUnsavedChanges ? "Save Changes" : "Saved"}
          </Button>
        </div>
      </div>
    </div>
  )
}
