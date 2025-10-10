"use client"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FilePreviewProps {
  fileUrl: string
  fileType: string
  fileName?: string
}

export function FilePreview({ fileUrl, fileType, fileName }: FilePreviewProps) {
  const isPDF = fileType === "application/pdf"
  const isWord =
    fileType === "application/msword" ||
    fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = fileUrl
    link.download = fileName || "document"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Download Button */}
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>

      {/* Preview Content */}
      <div className="flex-1 border rounded-lg overflow-hidden">
        {isPDF ? (
          <iframe 
            src={fileUrl} 
            className="w-full h-full border-0" 
            title="PDF Preview"
          />
        ) : isWord ? (
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
            className="w-full h-full border-0"
            title="Word Document Preview"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Download className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium mb-2">Preview not available</p>
            <p className="text-sm text-muted-foreground mb-4">
              This file type cannot be previewed in the browser
            </p>
            <Button onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download File
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}