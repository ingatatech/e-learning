"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { LessonImageUpload } from "./lesson-image-upload"
import { LessonVideoUpload } from "./lesson-video-upload"
import { FileText, Video, ImageIcon, FileDown, Trash2, GripVertical, Clock, Briefcase, Zap, Check } from "lucide-react"
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
  const [resourceLinks, setResourceLinks] = useState<{ url: string; title: string; description: string }[]>([])

  useEffect(() => {
    if (lesson.resources) {
      try {
        const parsedResources = typeof lesson.resources === "string" ? JSON.parse(lesson.resources) : lesson.resources
        setResourceLinks(parsedResources || [])
      } catch (error) {
        setResourceLinks([])
      }
    }
  }, [lesson.id])

  const handleLinkChange = (idx: number, value: { url: string; title: string; description: string }) => {
    const newLinks = [...resourceLinks]
    newLinks[idx] = value
    setResourceLinks(newLinks)
    setHasUnsavedChanges(true)
  }

  const addNewLink = () => {
    setResourceLinks([...resourceLinks, { url: "", title: "", description: "" }])
    setHasUnsavedChanges(true)
  }

  const removeLink = (idx: number) => {
    setResourceLinks(resourceLinks.filter((_, i) => i !== idx))
    setHasUnsavedChanges(true)
  }

  const handleImageUploadComplete = (blockId: string, imageUrl: string) => {
    updateContentBlock(blockId, {
      ...contentBlocks.find((b) => b.id === blockId)?.content,
      uploadedUrl: imageUrl,
    })
  }

  const handleImageUploadStart = () => {
    // Optional: Show loading state
  }

  const handleImageUploadError = (error: string) => {
    alert(`Image upload failed: ${error}`)
  }

  const handleVideoUploadComplete = (blockId: string, videoUrl: string) => {
    updateContentBlock(blockId, {
      ...contentBlocks.find((b) => b.id === blockId)?.content,
      uploadedUrl: videoUrl,
    })
  }

  const handleVideoUploadStart = () => {
    // Optional: Show loading state
  }

  const handleVideoUploadError = (error: string) => {
    alert(`Video upload failed: ${error}`)
  }

  useEffect(() => {
    if (lesson.content) {
      try {
        const parsedContent = JSON.parse(lesson.content)

        if (Array.isArray(parsedContent)) {
          setContentBlocks(
            parsedContent.map((block: any, index: number) => ({
              id: `block-${Date.now()}-${index}`,
              type: block.type || "text",
              content: block.content || block.data || "",
              order: index + 1,
            })),
          )
        } else if (parsedContent.blocks && Array.isArray(parsedContent.blocks)) {
          setContentBlocks(
            parsedContent.blocks.map((block: any, index: number) => ({
              id: `block-${Date.now()}-${index}`,
              type: "text",
              content: block.text || "",
              order: index + 1,
            })),
          )
        } else {
          setContentBlocks([
            {
              id: `block-${Date.now()}`,
              type: "text",
              content: lesson.content,
              order: 1,
            },
          ])
        }
      } catch (error) {
        setContentBlocks([
          {
            id: `block-${Date.now()}`,
            type: "text",
            content: lesson.content,
            order: 1,
          },
        ])
      }
    } else {
      setContentBlocks([])
    }
  }, [lesson.id, lesson.content])

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
        return { url: "", title: "", description: "", uploadedUrl: "" }
      case "image":
        return { url: "", alt: "", caption: "", uploadedUrl: "" }
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
    setHasUnsavedChanges(true)
  }

  const deleteContentBlock = (id: string) => {
    setContentBlocks((blocks) => blocks.filter((block) => block.id !== id))
  }

  const handleSave = () => {
    const contentToSave = contentBlocks.map((block, index) => {
      if (block.type === "text") {
        if (typeof block.content === "string") {
          return block.content
        }
        return block.content?.text || ""
      }
      return {
        type: block.type,
        content: block.content,
      }
    })

    let finalContent
    if (contentBlocks.length === 1 && contentBlocks[0].type === "text") {
      finalContent = contentToSave[0]
    } else {
      finalContent = JSON.stringify(contentToSave)
    }

    onUpdate({
      content: finalContent,
      duration: lesson.duration,
      isProject: lesson.isProject,
      isExercise: lesson.isExercise,
      resources: resourceLinks.filter((link) => link.url.trim() !== ""),
    })
    setHasUnsavedChanges(false)
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
              onChange={(value) => updateContentBlock(block.id, value)}
              className="min-h-[300px]"
            />
          </div>
        )

      case "video":
        return (
          <div className="space-y-4">
            <Tabs defaultValue={block.content.uploadedUrl ? "upload" : "url"} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="url">Video URL</TabsTrigger>
                <TabsTrigger value="upload">Upload Video</TabsTrigger>
              </TabsList>

              <TabsContent value="url" className="space-y-4">
                <div className="space-y-2">
                  <Label>Video URL</Label>
                  <Input
                    value={block.content.url || ""}
                    onChange={(e) => updateContentBlock(block.id, { ...block.content, url: e.target.value })}
                    placeholder="https://youtube.com/watch?v=... or any video URL"
                  />
                </div>
              </TabsContent>

              <TabsContent value="upload" className="space-y-4">
                <LessonVideoUpload
                  onUploadComplete={(url) => handleVideoUploadComplete(block.id, url)}
                  onUploadStart={handleVideoUploadStart}
                  onUploadError={handleVideoUploadError}
                  currentVideoUrl={block.content.uploadedUrl}
                />
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <Label>Video Title</Label>
              <Input
                value={block.content.title || ""}
                onChange={(e) => updateContentBlock(block.id, { ...block.content, title: e.target.value })}
                placeholder="Video title"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={block.content.description || ""}
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
            <Tabs defaultValue={block.content.uploadedUrl ? "upload" : "url"} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="url">Image URL</TabsTrigger>
                <TabsTrigger value="upload">Upload Image</TabsTrigger>
              </TabsList>

              <TabsContent value="url" className="space-y-4">
                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input
                    value={block.content.url || ""}
                    onChange={(e) => updateContentBlock(block.id, { ...block.content, url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </TabsContent>

              <TabsContent value="upload" className="space-y-4">
                <Label>Lesson Image</Label>
                <LessonImageUpload
                  onUploadComplete={(url) => {
                    updateContentBlock(block.id, {
                      ...block.content,
                      uploadedUrl: url,
                    })
                  }}
                  onUploadStart={handleImageUploadStart}
                  onUploadError={handleImageUploadError}
                  currentImageUrl={block.content.uploadedUrl}
                />
              </TabsContent>
            </Tabs>

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
            <div className="space-y-2">
              <Label>Lesson Title</Label>
              <Input
                value={lesson.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Enter lesson title"
                className="text-lg font-medium"
              />
            </div>

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

            <Card className="border-dashed border-2 border-gray-300 hover:border-primary-400 transition-colors">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Add Content Block</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Choose the type of content you want to add</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
              <CardDescription>Add downloadable resources and materials for students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Add links to PDFs, documents, code files, and other resources that complement this lesson.
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
                      onChange={(e) => handleLinkChange(idx, { ...link, description: e.target.value })}
                      placeholder="Brief description of this resource..."
                      rows={2}
                      className="text-sm resize-none"
                    />
                  </div>
                ))}

                <Button onClick={addNewLink} variant="outline" size="sm" className="w-full bg-transparent">
                  <FileDown className="w-4 h-4 mr-2" />
                  Add Resource
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
