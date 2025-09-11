"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { ThumbnailUpload } from "../thumbnail-upload"
import type { Course, CourseLevel } from "@/types"

interface CourseDetailsStepProps {
  courseData: Partial<Course>
  setCourseData: (data: Partial<Course>) => void
  onNext: () => void
  isFirstStep: boolean
  thumbnailUrl?: string
  onThumbnailUploadStart: () => void
  onThumbnailUploadComplete: (url: string) => void
  onThumbnailUploadError: (error: string) => void
  isThumbnailUploading: boolean
}

export function CourseDetailsStep({
  courseData,
  setCourseData,
  onNext,
  isFirstStep,
  thumbnailUrl,
  onThumbnailUploadStart,
  onThumbnailUploadComplete,
  onThumbnailUploadError,
  isThumbnailUploading,
}: CourseDetailsStepProps) {
  const [tags, setTags] = useState<string[]>(courseData.tags || [])
  const [newTag, setNewTag] = useState("")

  const handleInputChange = (field: keyof Course, value: any) => {
    setCourseData({ ...courseData, [field]: value })
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()]
      setTags(updatedTags)
      handleInputChange("tags", updatedTags)
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove)
    setTags(updatedTags)
    handleInputChange("tags", updatedTags)
  }

  const isValid = courseData.title && courseData.description && courseData.level && !isThumbnailUploading

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Let's start with the basics</h2>
        <p className="text-gray-600 dark:text-gray-300">Tell us about your course and what students will learn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
            <CardDescription>
              The essential details that will help students find and understand your course
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                value={courseData.title || ""}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Complete React Development Bootcamp"
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Course Description *</Label>
              <Textarea
                id="description"
                value={courseData.description || ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe what students will learn and achieve..."
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level">Difficulty Level *</Label>
                <Select
                  value={courseData.level}
                  onValueChange={(value) => handleInputChange("level", value as CourseLevel)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={courseData.price || ""}
                  onChange={(e) => handleInputChange("price", Number.parseFloat(e.target.value))}
                  placeholder="99.99"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Thumbnail */}
        <Card>
          <CardHeader>
            <CardTitle>Course Thumbnail</CardTitle>
            <CardDescription>Upload an eye-catching image that represents your course</CardDescription>
          </CardHeader>
          <CardContent>
            <ThumbnailUpload
              onUploadStart={onThumbnailUploadStart}
              onUploadComplete={onThumbnailUploadComplete}
              onUploadError={onThumbnailUploadError}
              currentThumbnail={thumbnailUrl}
            />
          </CardContent>
        </Card>
      </div>

      {/* Tags Section */}
      <Card>
        <CardHeader>
          <CardTitle>Course Tags</CardTitle>
          <CardDescription>Add relevant tags to help students discover your course</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag (e.g., JavaScript, Web Development)"
                onKeyPress={(e) => e.key === "Enter" && addTag()}
              />
              <Button onClick={addTag} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="ml-1 hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Validation Message */}
      {!isValid && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            {isThumbnailUploading
              ? "Please wait for the thumbnail to finish uploading before continuing."
              : "Please fill in all required fields (*) to continue to the next step."}
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!isValid} size="lg" className="px-8">
          Continue to Course Structure
        </Button>
      </div>
    </div>
  )
}
