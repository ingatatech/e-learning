"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, X, Loader2, CheckCircle, LinkIcon } from 'lucide-react'
import { cn } from "@/lib/utils"

interface LessonVideoUploadProps {
  onUpdate?: (updates: { videoUrl?: string }) => void
  currentVideoUrl?: string
  className?: string
}

export function LessonVideoUpload({
  onUpdate,
  currentVideoUrl,
  className,
}: LessonVideoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [urlInput, setUrlInput] = useState(currentVideoUrl || "")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (!file) return

    if (!file.type.startsWith("video/")) {
      setUploadStatus("error")
      return
    }

    if (file.size > 100 * 1024 * 1024) {
      setUploadStatus("error")
      return
    }

    setIsUploading(true)
    setUploadStatus("uploading")
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("lessonVid", file)

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/upload-lesson-vid`, {
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
        setUrlInput(data.videoUrl)
        onUpdate?.({ videoUrl: data.videoUrl })
        setIsUploading(false)
      }, 500)
    } catch (error) {
      setUploadStatus("error")
      setIsUploading(false)
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

  const removeVideo = () => {
    setUploadStatus("idle")
    setUploadProgress(0)
    setUrlInput("")
    onUpdate?.({ videoUrl: "" })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUrlSave = () => {
    if (urlInput.trim()) {
      onUpdate?.({ videoUrl: urlInput })
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="url">URL</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div
            className={cn(
              "relative border-2 border-dashed rounded-lg transition-colors p-8",
              uploadStatus === "error"
                ? "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20"
                : uploadStatus === "success"
                  ? "border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-primary-400",
            )}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {urlInput && !isUploading ? (
              <div className="relative">
                <video 
                  src={urlInput} 
                  className="w-full h-48 object-cover rounded-lg bg-black" 
                  controls 
                />
                {!isUploading && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="absolute top-2 right-2" 
                    onClick={removeVideo}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
                {uploadStatus === "success" && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 mb-2">Drag and drop or click to upload</p>
                <p className="text-sm text-gray-500 mb-4">MP4, WebM, OGG up to 100MB</p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading... {uploadProgress}%
                    </>
                  ) : (
                    "Choose File"
                  )}
                </Button>
              </div>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm">{uploadProgress}%</p>
                </div>
              </div>
            )}
          </div>
          <input 
            ref={fileInputRef} 
            type="file" 
            accept="video/*" 
            onChange={handleFileInputChange} 
            className="hidden" 
          />
        </TabsContent>

        <TabsContent value="url" className="space-y-4 pt-4">
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Enter video URL (YouTube, Vimeo, etc.)..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleUrlSave} variant="outline">
                <LinkIcon className="w-4 h-4 mr-2" />
                Apply
              </Button>
            </div>
            {urlInput && !isUploading && (
              <video
                src={urlInput}
                className="w-full h-48 object-cover rounded-lg bg-black"
                controls
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
