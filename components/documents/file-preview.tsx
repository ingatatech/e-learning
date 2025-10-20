"use client"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { renderAsync } from 'docx-preview';
import { set } from "date-fns"

interface FilePreviewProps {
  fileUrl: string
  fileType: string
  fileName?: string
  fileId?: string
}

export function FilePreview({ fileUrl, fileType, fileName, fileId }: FilePreviewProps) {
  const [previewError, setPreviewError] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const { token } = useAuth()

  useEffect(() => {
    generatePreviewUrl()
  }, [fileUrl, fileType, fileId, token])

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

  const getAuthenticatedFileUrl = async (): Promise<string> => {
    if (!fileId) return fileUrl

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/docs/download-doc/${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch file')
      }
      
      const blob = await response.blob()
      return URL.createObjectURL(blob)
    } catch (error) {
      console.error("Error fetching authenticated file:", error)
      return fileUrl
    }
  }

  const previewWordWithEnhancedMammoth = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    // Dynamically import mammoth to avoid bundle size issues
    const mammoth = await import('mammoth');
    
    const result = await mammoth.default.convertToHtml(
      { arrayBuffer },
      {
        styleMap: [
          "p[style-name='Title'] => h1.title:fresh",
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Heading 3'] => h3:fresh",
          "p[style-name='Heading 4'] => h4:fresh",
          "p[style-name='Heading 5'] => h5:fresh",
          "p[style-name='Heading 6'] => h6:fresh",
          "r[style-name='Strong'] => strong",
          "r[style-name='Bold'] => strong",
          "r[style-name='Emphasis'] => em",
          "r[style-name='Italic'] => em",
          "p[style-name='Quote'] => blockquote > p:fresh",
          "p[style-name='Intense Quote'] => blockquote.intense > p:fresh",
          "p[style-name='List Paragraph'] => li > p:fresh",
          "p:unordered-list(1) => ul > li:fresh",
          "p:ordered-list(1) => ol > li:fresh",
          "r[style-name='Hyperlink'] => a",
          "p[style-name='Normal'] => p.normal",
        ],
        includeEmbeddedStyleMap: true,
        includeDefaultStyleMap: true,
      }
    );

    // Enhanced HTML template with better styling
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            
            body {
              margin: 0;
              padding: 40px;
              font-family: 'Times New Roman', Times, serif;
              line-height: 1.6;
              background: #f5f5f5;
              color: #000000;
              font-size: 12pt;
            }
            
            .document-wrapper {
              background: white;
              max-width: 8.5in;
              min-height: 11in;
              margin: 0 auto;
              padding: 1in;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
              position: relative;
            }
            
            /* Headings */
            h1, h2, h3, h4, h5, h6 {
              font-family: 'Arial', sans-serif;
              margin: 24px 0 12px 0;
              font-weight: bold;
              color: #000000;
            }
            
            h1 { 
              font-size: 18pt; 
              border-bottom: 2px solid #2c3e50;
              padding-bottom: 8px;
            }
            
            h1.title {
              font-size: 20pt;
              text-align: center;
              border-bottom: none;
              margin-bottom: 32px;
            }
            
            h2 { font-size: 16pt; color: #2c3e50; }
            h3 { font-size: 14pt; color: #34495e; }
            h4 { font-size: 13pt; color: #7f8c8d; }
            h5 { font-size: 12pt; color: #95a5a6; }
            h6 { font-size: 11pt; color: #bdc3c7; }
            
            /* Paragraphs */
            p {
              margin: 12px 0;
              text-align: left;
              line-height: 1.6;
            }
            
            p.normal {
              margin: 12px 0;
            }
            
            /* Text formatting */
            strong, b {
              font-weight: bold;
              color: #000000;
            }
            
            em, i {
              font-style: italic;
              color: #000000;
            }
            
            u {
              text-decoration: underline;
            }
            
            /* Lists */
            ul, ol {
              margin: 12px 0;
              padding-left: 2em;
            }
            
            li {
              margin: 6px 0;
              padding-left: 0.5em;
            }
            
            ul li {
              list-style-type: disc;
            }
            
            ol li {
              list-style-type: decimal;
            }
            
            /* Blockquotes */
            blockquote {
              border-left: 4px solid #3498db;
              margin: 16px 0;
              padding: 16px 24px;
              background: #f8f9fa;
              font-style: italic;
              color: #2c3e50;
            }
            
            blockquote.intense {
              border-left-color: #e74c3c;
              background: #fff5f5;
            }
            
            /* Tables */
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 16px 0;
              border: 1px solid #bdc3c7;
            }
            
            th, td {
              border: 1px solid #bdc3c7;
              padding: 8px 12px;
              text-align: left;
              vertical-align: top;
            }
            
            th {
              background: #34495e;
              color: white;
              font-weight: bold;
              text-align: center;
            }
            
            /* Links */
            a {
              color: #2980b9;
              text-decoration: underline;
            }
            
            a:hover {
              color: #3498db;
            }
            
            /* Code and preformatted text */
            code {
              background: #f8f9fa;
              padding: 2px 4px;
              border-radius: 3px;
              font-family: 'Courier New', monospace;
              font-size: 11pt;
            }
            
            pre {
              background: #f8f9fa;
              padding: 12px;
              border-radius: 4px;
              overflow-x: auto;
              font-family: 'Courier New', monospace;
              font-size: 11pt;
              margin: 16px 0;
            }
            
            /* Page breaks */
            .page-break {
              page-break-after: always;
            }
            
            /* Images */
            img {
              max-width: 100%;
              height: auto;
              margin: 12px 0;
            }
            
            /* Alignment classes */
            .align-center {
              text-align: center;
            }
            
            .align-right {
              text-align: right;
            }
            
            .align-left {
              text-align: left;
            }
            
            .align-justify {
              text-align: justify;
            }
            
            /* Print styles */
            @media print {
              body {
                background: white;
                padding: 0;
              }
              
              .document-wrapper {
                box-shadow: none;
                margin: 0;
                padding: 0.5in;
                max-width: none;
                min-height: auto;
              }
            }
          </style>
        </head>
        <body>
          <div class="document-wrapper">
            ${result.value}
          </div>
        </body>
      </html>
    `;
    
    return htmlContent;
  };

  const previewWordWithDocxPreview = async (): Promise<boolean> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/docs/download-doc/${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch Word document');
      
      const arrayBuffer = await response.arrayBuffer();
      
      const container = document.createElement('div');
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.overflow = 'auto';
      
      await renderAsync(arrayBuffer, container, container, {
        className: "docx",
        inWrapper: true,
        ignoreWidth: false,
        ignoreHeight: false,
        ignoreFonts: false,
        breakPages: true,
        debug: false,
        experimental: false,
      });
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { 
                margin: 0; 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: #f9f9f9;
              }
              .docx-container {
                background: white;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                margin: 20px auto;
                padding: 40px;
                max-width: 8.5in;
                min-height: 11in;
              }
            </style>
          </head>
          <body>
            <div class="docx-container">${container.innerHTML}</div>
          </body>
        </html>
      `;
      
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const blobUrl = URL.createObjectURL(blob);
      setPreviewUrl(blobUrl);
      return true;
      
    } catch (error) {
      console.error('docx-preview failed, falling back to mammoth:', error);
      return false;
    }
  };

  const previewWordWithFallback = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/docs/download-doc/${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch Word document');
      
      const arrayBuffer = await response.arrayBuffer();
      
      // Try docx-preview first
      const docxPreviewSuccess = await previewWordWithDocxPreview();
      if (docxPreviewSuccess) return;
      
      // Fallback to enhanced mammoth
      const htmlContent = await previewWordWithEnhancedMammoth(arrayBuffer);
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const blobUrl = URL.createObjectURL(blob);
      setPreviewUrl(blobUrl);
      
    } catch (error) {
      console.error('All Word preview methods failed:', error);
      throw error;
    }
  };

  const generatePreviewUrl = async () => {
    try {
      setIsLoading(true);
      setPreviewError(false);

      if (isPDF) {
        const blobUrl = await getAuthenticatedFileUrl();
        setPreviewUrl(blobUrl);
      } else if (isWord) {
        await previewWordWithFallback();
      } else if (
        fileType?.includes("text/") ||
        fileType?.includes("application/json") ||
        fileType?.includes("application/xml")
      ) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/docs/download-doc/${fileId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        
        if (!response.ok) throw new Error('Failed to fetch text file')
        
        const blob = await response.blob()
        const text = await blob.text()
        setPreviewUrl(`data:text/plain;charset=utf-8,${encodeURIComponent(text)}`)
      } else {
        setPreviewError(true)
      }
    } catch (error) {
      console.error("Error generating preview:", error)
      setPreviewError(true)
    } finally {
      setIsLoading(false);
    }
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      if (fileId) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/docs/download-doc/${fileId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        
        if (!response.ok) throw new Error('Download failed')
        
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = fileName || "document"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } else {
        const link = document.createElement("a")
        link.href = fileUrl
        link.download = fileName || "document"
        link.target = "_blank"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error("Download error:", error)
      const link = document.createElement("a")
      link.href = fileUrl
      link.download = fileName || "document"
      link.target = "_blank"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Download Button */}
      <div className="flex justify-end gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={handleDownload} disabled={isLoading || isDownloading}>
          <Download className="w-4 h-4 mr-2" />
          {isLoading || isDownloading ? "Loading..." : "Download"}
        </Button>
      </div>

      {/* Preview Content */}
      <div className="flex-1 border rounded-lg overflow-hidden bg-muted/30">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Loading preview...</p>
            </div>
          </div>
        ) : !previewError && previewUrl ? (
          <iframe
            src={previewUrl}
            className="w-full h-full border-0"
            title={`Preview - ${fileName || 'Document'}`}
            onError={() => setPreviewError(true)}
            onLoad={(e) => {
              const iframe = e.target as HTMLIFrameElement
              try {
                if (iframe.contentDocument?.body?.innerText.includes('error')) {
                  setPreviewError(true)
                }
              } catch (error) {
                // Cross-origin error is normal for blob URLs
              }
            }}
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
              <Button onClick={handleDownload} disabled={isLoading || isDownloading}>
                <Download className="w-4 h-4 mr-2" />
                {isDownloading ? "Loading..." : "Download"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}