"use client"
import { Download, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"

interface FilePreviewProps {
  fileUrl: string
  fileType: string
  fileName?: string
  fileId?: string
}

export function FilePreview({ fileUrl, fileType, fileName, fileId }: FilePreviewProps) {
  const [previewError, setPreviewError] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const { token } = useAuth()

  useEffect(() => {
    generatePreviewUrl({ path: fileUrl, mimeType: fileType, id: fileId })
  }, [fileUrl, fileType])
  

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const isPDF = fileType === "application/pdf"
  const isWord =
    fileType === "application/msword" ||
    fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  
  const getGoogleDocsViewerUrl = (file: any) => {
    // Use Cloudinary URL if available
    const fileUrl = file.path 
      ? encodeURIComponent(file.path)
      : encodeURIComponent(`${window.location.origin}/api/files/${file.id}/download`)
    
    return `https://docs.google.com/gview?url=${fileUrl}&embedded=true`
  }

  
  const generatePreviewUrl = async (fileData: any) => {
    try {
      setPreviewError(false);

      // Skip preview generation for XLSX files
      if (fileData.mimeType.includes('spreadsheet') || fileData.mimeType.includes('excel')) {
        setPreviewError(true);
        return;
      }

      if (fileData.mimeType?.startsWith("image/")) {
        setPreviewUrl(fileData.path || `/api/files/${fileData.id}/download`);
      } else if (isPDF) {
        // For PDFs, create a blob URL to display in iframe
        const blob = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/docs/download-doc/${fileData.id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        )
        const resu = await blob.blob()
        const blobUrl = URL.createObjectURL(resu);
        setPreviewUrl(blobUrl);
      } else if (
        fileData.mimeType?.includes("text/") ||
        fileData.mimeType?.includes("application/json") ||
        fileData.mimeType?.includes("application/xml")
      ) {
        const blob = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/docs/download-doc/${fileData.id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        )
        const resu = await blob.blob()
        const text = await resu.text();

        setPreviewUrl(`data:text/plain;charset=utf-8,${encodeURIComponent(text)}`);
      } else if (isWord) {
        setPreviewUrl(getGoogleDocsViewerUrl(fileData));
      } else {
        setPreviewError(true);
      }
    } catch (error) {
      console.error("Error generating preview:", error);
      setPreviewError(true);
    } finally {
    }
  };

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
        {!previewError ? (
          <iframe
            src={`${previewUrl}`}
            className="w-full h-full border-0"
            title="PDF Preview"
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
