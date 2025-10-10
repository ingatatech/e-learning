"use client"
import { useCallback, useState } from "react"
import type React from "react"

import { Upload, File, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  currentFile?: { url: string; type: string; name: string }
  onRemove?: () => void
  accept?: string
}

export function FileUpload({ onFileSelect, currentFile, onRemove, accept }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        const file = files[0]
        validateAndSelectFile(file)
      }
    },
    [onFileSelect],
  )

  const validateAndSelectFile = (file: File) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF or Word document")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB")
      return
    }

    onFileSelect(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      validateAndSelectFile(files[0])
    }
  }

  if (currentFile) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <File className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">{currentFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {currentFile.type === "application/pdf"
                  ? "PDF Document"
                  : currentFile.type === "application/msword"
                    ? "Word Document (.doc)"
                    : "Word Document (.docx)"}
              </p>
            </div>
          </div>
          {onRemove && (
            <Button variant="ghost" size="sm" onClick={onRemove}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </Card>
    )
  }

  return (
    <Card
      className={`p-8 border-2 border-dashed transition-colors ${
        isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 bg-primary/10 rounded-full">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        <div>
          <p className="text-lg font-medium">Drop your document here</p>
          <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
        </div>
        <div className="text-xs text-muted-foreground">
          <p>Supported formats: PDF, DOC, DOCX</p>
          <p>Maximum file size: 10MB</p>
        </div>
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept={accept || ".pdf,.doc,.docx"}
          onChange={handleFileInput}
        />
        <Button asChild variant="outline">
          <label htmlFor="file-upload" className="cursor-pointer">
            Browse Files
          </label>
        </Button>
      </div>
    </Card>
  )
}
