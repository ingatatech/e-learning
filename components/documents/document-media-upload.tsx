"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ImageIcon, Video, Loader2, X } from 'lucide-react'
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"

interface DocumentMediaUploadProps {
  documentId: string
  mediaType: "image" | "video"
  token: string
  onMediaUploaded: (mediaData: { id: string; documentId: string; type: string; url: string }) => void
  onUploadStart?: () => void
  onUploadEnd?: () => void
}

export function DocumentMediaUpload({
  documentId,
  mediaType,
  token,
  onMediaUploaded,
  onUploadStart,
  onUploadEnd,
}: DocumentMediaUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = mediaType === "image" ? ["image/jpeg", "image/png", "image/gif", "image/webp"] : ["video/mp4", "video/webm", "video/quicktime"]
    if (!validTypes.includes(file.type)) {
      toast.error(`Invalid ${mediaType} format`)
      return
    }

    // Validate file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      toast.error("File size must be less than 100MB")
      return
    }

    await uploadMedia(file)
  }

  const uploadMedia = async (file: File) => {
    setUploading(true)
    onUploadStart?.()

    try {
      const formData = new FormData()
      formData.append("id", documentId)
      formData.append("type", mediaType)
      formData.append("file", file)

      const xhr = new XMLHttpRequest()

      // Track upload progress
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100
          setUploadProgress(percentComplete)
        }
      })

      xhr.addEventListener("load", () => {
        if (xhr.status === 200 || xhr.status === 201) {
          try {
            const response = JSON.parse(xhr.responseText)
            const mediaData = response.media
            toast.success(`${mediaType === "image" ? "Image" : "Video"} uploaded successfully`)
            onMediaUploaded(mediaData)
          } catch {
            toast.error("Failed to parse upload response")
          }
        } else {
          toast.error("Failed to upload media")
        }
      })

      xhr.addEventListener("error", () => {
        toast.error("Upload failed")
      })

      xhr.open("POST", `${process.env.NEXT_PUBLIC_API_URL}/docs/upload-media`)
      xhr.setRequestHeader("Authorization", `Bearer ${token}`)
      xhr.send(formData)
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload media")
    } finally {
      setUploading(false)
      onUploadEnd?.()
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept={mediaType === "image" ? "image/*" : "video/*"}
        className="hidden"
        disabled={uploading}
      />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        title={`Upload ${mediaType}`}
      >
        {uploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : mediaType === "image" ? (
          <ImageIcon className="w-4 h-4" />
        ) : (
          <Video className="w-4 h-4" />
        )}
      </Button>

      {uploading && (
        <div className="absolute bottom-full left-0 mb-2 w-48 bg-popover border rounded-lg p-3 shadow-lg z-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {mediaType === "image" ? "Uploading image" : "Uploading video"}
            </span>
            <span className="text-xs text-muted-foreground">{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="h-1" />
        </div>
      )}
    </div>
  )
}
