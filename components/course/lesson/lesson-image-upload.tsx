"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface LessonImageUploadProps {
  onUploadComplete: (url: string) => void
  onUploadStart: () => void
  onUploadError: (error: string) => void
  currentImageUrl?: string
  className?: string
}

export function LessonImageUpload({
  onUploadComplete,
  onUploadStart,
  onUploadError,
  currentImageUrl,
  className,
}: LessonImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      onUploadError("Please select an image file")
      setUploadStatus("error")
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      onUploadError("File size must be less than 5MB")
      setUploadStatus("error")
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Start upload
    setIsUploading(true)
    setUploadStatus("uploading")
    setUploadProgress(0)
    onUploadStart()

    try {
      const formData = new FormData()
      formData.append("lessonImg", file)

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/upload-lesson-img`, {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()

      setTimeout(() => {
        setUploadStatus("success")
        onUploadComplete(data.imageUrl)
        setIsUploading(false)
      }, 500)
    } catch (error) {
      setUploadStatus("error")
      setIsUploading(false)
      onUploadError("Failed to upload image. Please try again.")
      setPreviewUrl(null)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const removeImage = () => {
    setPreviewUrl(null)
    setUploadStatus("idle")
    onUploadComplete("") // Clear the image URL
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg transition-colors",
          uploadStatus === "error"
            ? "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20"
            : uploadStatus === "success"
              ? "border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/20"
              : "border-gray-300 dark:border-gray-600 hover:border-primary-400",
        )}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl || "/placeholder.svg"}
              alt="Lesson image preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            {!isUploading && (
              <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={removeImage}>
                <X className="w-4 h-4" />
              </Button>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Uploading... {uploadProgress}%</p>
                  <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
            {uploadStatus === "success" && (
              <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1">
                <CheckCircle className="w-4 h-4" />
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center">
            {uploadStatus === "error" ? (
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            ) : (
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            )}
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              {uploadStatus === "error" ? "Upload failed" : "Click to upload or drag and drop"}
            </p>
            <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
            <Button
              variant="outline"
              className="mt-4 bg-transparent"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Choose File"
              )}
            </Button>
          </div>
        )}
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInputChange} className="hidden" />
    </div>
  )
}
