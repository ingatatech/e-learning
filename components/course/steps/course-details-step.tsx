"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Plus, X, ImageIcon, Clock, DollarSign, Tag, Award, BookOpen, Target, CheckSquare, Loader2 } from 'lucide-react'
import { ThumbnailUpload } from "../thumbnail-upload"
import type { Course } from "@/types"

interface CourseDetailsStepProps {
  courseData: Partial<Course>
  setCourseData: (data: Partial<Course>) => void
  onNext: () => void
  isFirstStep: boolean
  thumbnailUrl: string
  onThumbnailUploadStart: () => void
  onThumbnailUploadComplete: (url: string) => void
  onThumbnailUploadError: (error: string) => void
  isThumbnailUploading: boolean
  instructors: any
  user: any
  loading: any
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
  instructors,
  user,
  loading,
}: CourseDetailsStepProps) {
  const [currentTag, setCurrentTag] = useState("")
  const [currentLearningObjective, setCurrentLearningObjective] = useState("")
  const [currentRequirement, setCurrentRequirement] = useState("")

  const addTag = () => {
    if (currentTag.trim() && !courseData.tags?.includes(currentTag.trim())) {
      setCourseData({
        ...courseData,
        tags: [...(courseData.tags || []), currentTag.trim()],
      })
      setCurrentTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setCourseData({
      ...courseData,
      tags: courseData.tags?.filter((tag) => tag !== tagToRemove) || [],
    })
  }

  const addLearningObjective = () => {
    if (currentLearningObjective.trim()) {
      setCourseData({
        ...courseData,
        whatYouWillLearn: [...(courseData.whatYouWillLearn || []), currentLearningObjective.trim()],
      })
      setCurrentLearningObjective("")
    }
  }

  const removeLearningObjective = (index: number) => {
    setCourseData({
      ...courseData,
      whatYouWillLearn: courseData.whatYouWillLearn?.filter((_, i) => i !== index) || [],
    })
  }

  const addRequirement = () => {
    if (currentRequirement.trim()) {
      setCourseData({
        ...courseData,
        requirements: [...(courseData.requirements || []), currentRequirement.trim()],
      })
      setCurrentRequirement("")
    }
  }

  const removeRequirement = (index: number) => {
    setCourseData({
      ...courseData,
      requirements: courseData.requirements?.filter((_, i) => i !== index) || [],
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    if (isThumbnailUploading) {
      e.preventDefault()
      return
    }
    e.preventDefault()
    onNext()
  }

  const isFormValid = () => {
    return (
      courseData.title?.trim() &&
      courseData.description?.trim() &&
      courseData.level &&
      courseData.language?.trim() &&
      user.role === "sysAdmin" ? courseData.instructorId : true
    )
  }

  if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Course Details</h2>
        <p className="text-gray-600 dark:text-gray-300">Set up the foundation of your course</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Basic Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Basic Information
              </CardTitle>
              <CardDescription>Essential course details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Complete React Development Course"
                  value={courseData.title || ""}
                  onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Brief overview of your course (2-3 sentences)"
                  value={courseData.description || ""}
                  onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="about">Talk More About Your Course</Label>
                <Textarea
                  id="about"
                  placeholder="Comprehensive description of what this course covers, who it's for, and what makes it unique..."
                  value={courseData.about || ""}
                  onChange={(e) => setCourseData({ ...courseData, about: e.target.value })}
                  rows={5}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level">Difficulty Level *</Label>
                  <Select
                    value={courseData.level || ""}
                    onValueChange={(value) => setCourseData({ ...courseData, level: value })}
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
                  <Label htmlFor="language">Language *</Label>
                  <Select
                    value={courseData.language || ""}
                    onValueChange={(value) => setCourseData({ ...courseData, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                      <SelectItem value="Portuguese">Portuguese</SelectItem>
                      <SelectItem value="Chinese">Chinese</SelectItem>
                      <SelectItem value="Japanese">Japanese</SelectItem>
                      <SelectItem value="Korean">Korean</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Price (USD)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={courseData.price || ""}
                    onChange={(e) => setCourseData({ ...courseData, price: Number.parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Duration (hours)
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    placeholder="12"
                    value={courseData.duration || ""}
                    onChange={(e) => setCourseData({ ...courseData, duration: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={courseData.category || ""}
                    onValueChange={(value) => setCourseData({ ...courseData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Programming">Programming</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Data Science">Data Science</SelectItem>
                      <SelectItem value="Photography">Photography</SelectItem>
                      <SelectItem value="Music">Music</SelectItem>
                      <SelectItem value="Health & Fitness">Health & Fitness</SelectItem>
                      <SelectItem value="Language">Language</SelectItem>
                      <SelectItem value="Personal Development">Personal Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {user?.role !== "instructor" && (
                  <div className="space-y-2">
                    <Label htmlFor="instructor">Instructor *</Label>
                    <Select
                      value={courseData.instructorId || ""}
                      onValueChange={(value) => setCourseData({ ...courseData, instructorId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Instructor" />
                      </SelectTrigger>
                      <SelectContent>
                        {instructors.map((instructor: any) => (
                          <SelectItem key={instructor.id} value={instructor.id.toString()}>
                            {instructor.firstName} {instructor.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Certificate Included
                  </Label>
                  <p className="text-sm text-gray-500">Students will receive a certificate upon completion</p>
                </div>
                <Switch
                  checked={courseData.certificateIncluded || false}
                  onCheckedChange={(checked) => setCourseData({ ...courseData, certificateIncluded: checked })}
                />
              </div>
            </CardContent>
          </Card>
          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Tags
              </CardTitle>
              <CardDescription>Help students find your course</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {courseData.tags?.map((tag) => (
                  <Badge key={tag} className="flex items-center gap-1 rounded bg-primary">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Additional Details */}
        <div className="space-y-6">
          {/* Thumbnail Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Course Thumbnail
              </CardTitle>
              <CardDescription>Upload an eye-catching course image</CardDescription>
            </CardHeader>
            <CardContent>
              <ThumbnailUpload
                currentUrl={thumbnailUrl}
                onUploadStart={onThumbnailUploadStart}
                onUploadComplete={onThumbnailUploadComplete}
                onUploadError={onThumbnailUploadError}
                isUploading={isThumbnailUploading}
              />
            </CardContent>
          </Card>

          {/* Learning Objectives */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                What You Will Learn
              </CardTitle>
              <CardDescription>Key learning outcomes for students</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a learning objective..."
                  value={currentLearningObjective}
                  onChange={(e) => setCurrentLearningObjective(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addLearningObjective())}
                />
                <Button type="button" onClick={addLearningObjective} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {courseData.whatYouWillLearn?.map((objective, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <CheckSquare className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="flex-1 text-sm">{objective}</span>
                    <button
                      type="button"
                      onClick={() => removeLearningObjective(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5" />
                Requirements
              </CardTitle>
              <CardDescription>Prerequisites for taking this course</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a requirement..."
                  value={currentRequirement}
                  onChange={(e) => setCurrentRequirement(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRequirement())}
                />
                <Button type="button" onClick={addRequirement} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {courseData.requirements?.map((requirement, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                    <span className="flex-1 text-sm">{requirement}</span>
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6">
        <div className="text-sm text-gray-500">Step 1 of 5 • Course Details</div>

        <Button type="submit" disabled={!isFormValid() || isThumbnailUploading} size="lg" className="px-8">
          {isThumbnailUploading ? "Uploading thumbnail..." : "Continue to Structure"}
        </Button>
      </div>
    </form>
  )
}
