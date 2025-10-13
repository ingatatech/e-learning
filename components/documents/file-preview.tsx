"use client"
import { Download, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface FilePreviewProps {
  fileUrl: string
  fileType: string
  fileName?: string
}

export function FilePreview({ fileUrl, fileType, fileName }: FilePreviewProps) {
  const [previewError, setPreviewError] = useState(false)

  const isPDF = fileType === "application/pdf"
  const isWord =
    fileType === "application/msword" ||
    fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = fileUrl
    link.download = fileName || "document"
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleOpenInNewTab = () => {
    window.open(fileUrl, "_blank")
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Download Button */}
      <div className="flex justify-end gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={handleOpenInNewTab}>
          <ExternalLink className="w-4 h-4 mr-2" />
          Open in New Tab
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>

      {/* Preview Content */}
      <div className="flex-1 border rounded-lg overflow-hidden bg-muted/30">
        {isPDF && !previewError ? (
          <iframe
            src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=1`}
            className="w-full h-full border-0"
            title="PDF Preview"
            onError={() => setPreviewError(true)}
          />
        ) : isWord && !previewError ? (
          <iframe
            src={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`}
            className="w-full h-full border-0"
            title="Word Document Preview"
            onError={() => setPreviewError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Download className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium mb-2">
              {previewError ? "Preview failed to load" : "Preview not available"}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {previewError
                ? "The file could not be previewed. Please download it to view."
                : "This file type cannot be previewed in the browser"}
            </p>
            <div className="flex gap-2">
              <Button onClick={handleOpenInNewTab} variant="outline">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </Button>
              <Button onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download File
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
