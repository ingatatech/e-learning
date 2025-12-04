"use client"
import { useState, useEffect, useRef } from "react"
import type React from "react"

import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useDocuments } from "@/hooks/use-documents"
import type { Document } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileText, Plus, MoreVertical, Trash2, Send, Clock, Grid3x3, ListIcon, Upload, X, List, Search, Calendar, User, Download } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FilePreview } from "@/components/documents/file-preview"

const SkeletonDocumentCard = () => (
  <Card>
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-8 w-8" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-8 w-8" />
      </div>
    </CardContent>
  </Card>
)

export default function DocumentsPage() {
  const router = useRouter()
  const { user, token } = useAuth()
  const { documents, loading, fetchDocuments, removeDocumentFromCache, updateDocumentInCache, addDocumentToCache } =
    useDocuments()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [previewFile, setPreviewFile] = useState<Document | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])
  const searchParams = useSearchParams()

  const hasCreatedDocument = useRef(false)

  useEffect(() => {
    const prm = searchParams.get("new")
    
    if (prm === "true" && !hasCreatedDocument.current) {
      hasCreatedDocument.current = true
      createNewDocument()
    }
  }, [searchParams])

  useEffect(() => {
    fetchDocuments()
  }, [])

  // Filter documents based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredDocuments(documents)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = documents.filter(doc => 
        doc.title.toLowerCase().includes(query) ||
        doc.status.toLowerCase().includes(query) ||
        (doc.fileType && doc.fileType.toLowerCase().includes(query)) ||
        (doc.reviewNotes && doc.reviewNotes.toLowerCase().includes(query))
      )
      setFilteredDocuments(filtered)
    }
  }, [documents, searchQuery])

  const files = filteredDocuments.filter((doc) => doc.fileUrl)

  const getCardColor = (fileType?: string) => {
    if (!fileType) return "bg-background"

    const type = fileType?.toLowerCase() || ""

    if (type.includes("pdf")) return "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800/20"
    if (type.includes("presentation") || type.includes("ppt"))
      return "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800/20"
    if (type.includes("word") || type.includes("document"))
      return "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/20"

    return "bg-gray-50 border-gray-200"
  }

  // Function to get file icon based on extension
  const getFileIcon = (fileType?: string, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-8 h-8"
    }

    const containerClasses = {
      sm: "w-6 h-6",
      md: "w-8 h-8",
      lg: "w-10 h-10"
    }

    if (!fileType) {
      return (
        <div className={`flex items-center justify-center bg-muted rounded-md ${containerClasses[size]}`}>
          <FileText className={`text-muted-foreground ${sizeClasses[size]}`} />
        </div>
      )
    }

    const type = fileType?.toLowerCase() || ""

    if (type.includes("pdf")) {
      return (
        <div className={`flex items-center justify-center bg-red-100 rounded-md ${containerClasses[size]}`}>
          <FileText className={`text-red-600 ${sizeClasses[size]}`} />
        </div>
      )
    }

    if (type.includes("presentation") || type.includes("ppt")) {
      return (
        <div className={`flex items-center justify-center bg-orange-100 rounded-md ${containerClasses[size]}`}>
          <FileText className={`text-orange-600 ${sizeClasses[size]}`} />
        </div>
      )
    }

    if (type.includes("word") || type.includes("document")) {
      return (
        <div className={`flex items-center justify-center bg-blue-100 rounded-md ${containerClasses[size]}`}>
          <FileText className={`text-blue-600 ${sizeClasses[size]}`} />
        </div>
      )
    }

    // Default file icon
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-md ${containerClasses[size]}`}>
        <FileText className={`text-gray-600 ${sizeClasses[size]}`} />
      </div>
    )
  }

  // Function to get file type for display
  const getFileType = (fileName?: string, fileType?: string) => {
    if (!fileName && !fileType) return "Text Document"

    const type = fileType?.toLowerCase() || fileName?.toLowerCase() || ""

    if (type.includes("pdf") || fileName?.toLowerCase().endsWith(".pdf")) return "PDF Document"
    if (type.includes("presentation") || type.includes("ppt") || fileName?.toLowerCase().match(/\.pptx?$/))
      return "PowerPoint Presentation"
    if (type.includes("word") || type.includes("document") || fileName?.toLowerCase().match(/\.docx?$/)) return "Word Document"

    return "File"
  }

  const createNewDocument = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/docs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: "Untitled Document",
          content: "",
          instructorId: user?.id,
        }),
      })

      if (response.ok) {
        const newDoc = await response.json()
        addDocumentToCache(newDoc)
        router.push(`/instructor/documents/${newDoc.id}`)
      } else {
        toast.error("Failed to create document")
      }
    } catch (error) {
      console.error("Error creating document:", error)
      toast.error("Failed to create document")
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload")
      return
    }

    setUploadLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("title", selectedFile.name)
      formData.append("instructorId", user?.id || "")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/docs/upload-doc`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const uploadedDoc = await response.json()
        addDocumentToCache(uploadedDoc)
        setUploadModalOpen(false)
        setSelectedFile(null)
        toast.success("Document uploaded successfully")
        await fetchDocuments(true)
      } else {
        const errorData = await response.json().catch(() => ({ message: "Failed to upload document" }))
        toast.error(errorData.message || "Failed to upload document")
      }
    } catch (error) {
      console.error("Error uploading document:", error)
      toast.error("Failed to upload document")
    } finally {
      setUploadLoading(false)
    }
  }

  const handleCardClick = (docu: Document) => {
    const isDocWithFile = files.some((doc) => doc.id === docu.id)

    if (!isDocWithFile) {
      router.push(`/instructor/documents/${docu.id}`)
    } else {
      setPreviewFile(docu)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedFile(file)
  }

  const deleteDocument = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/docs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        removeDocumentFromCache(id)
        toast.success("Document deleted")
      } else {
        toast.error("Failed to delete document")
      }
    } catch (error) {
      console.error("Error deleting document:", error instanceof Error ? error.message : error)
      toast.error("Failed to delete document")
    }
  }

  const submitDocument = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/docs/submit/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast.success("Document submitted for review")
        updateDocumentInCache(id, { status: "submitted" })
      } else {
        toast.error("Failed to submit document")
      }
    } catch (error) {
      console.error("Error submitting document:", error)
      toast.error("Failed to submit document")
    }
  }

  const getStatusBadge = (status: Document["status"]) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary" className="flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> Draft</Badge>
      case "submitted":
        return <Badge className="bg-blue-600 flex items-center gap-1 w-fit"><Send className="w-3 h-3" /> Submitted</Badge>
      case "approved":
        return <Badge className="bg-green-600 flex items-center gap-1 w-fit"><FileText className="w-3 h-3" /> Approved</Badge>
      case "rejected":
        return <Badge variant="destructive" className="flex items-center gap-1 w-fit"><X className="w-3 h-3" /> Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const downloadDocument = async (doc: Document) => {
    if (!doc.fileUrl) {
      toast.error("No file available for download")
      return
    }

    try {
      const response = await fetch(doc.fileUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = doc.title || 'document'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success("Document downloaded")
    } catch (error) {
      console.error("Error downloading document:", error)
      toast.error("Failed to download document")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonDocumentCard key={index} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Documents</h1>
          <p className="text-muted-foreground">Create and manage your course documents</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          <Button onClick={() => setUploadModalOpen(true)} className="cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
          <Button onClick={createNewDocument} className="cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            New Document
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Search documents by title, status, or file type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-2"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery("")}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {filteredDocuments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery ? "No documents found" : "No documents yet"}
            </h3>
            <p className="text-muted-foreground mb-4 text-center">
              {searchQuery 
                ? `No documents found for "${searchQuery}". Try adjusting your search terms.`
                : "Create your first document to get started"
              }
            </p>
            <div className="flex gap-2">
              {searchQuery && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </Button>
              )}
              <Button onClick={() => setUploadModalOpen(true)} variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
              <Button onClick={createNewDocument}>
                <Plus className="w-4 h-4 mr-2" />
                Create Document
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <>
          {/* Search Results Info */}
          {searchQuery && (
            <div className="text-sm text-muted-foreground">
              Found {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} for "{searchQuery}"
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredDocuments.map((doc) => (
              <Card
                key={doc.id}
                className={`hover:shadow-lg transition-shadow cursor-pointer ${getCardColor(doc.fileType)} overflow-hidden p-0`}
                onClick={() => handleCardClick(doc)}
              >
                <CardContent className="p-0">
                  {/* Document Preview Area */}
                  <div className="relative border-b bg-muted aspect-[3/2] flex items-start justify-center p-4 rounded">
                    <div className="w-full h-full bg-background shadow-sm rounded border border-border p-3 overflow-hidden">
                      <div className="space-y-2">
                        {getFileIcon(doc.fileType)}
                        <div className="h-2 bg-muted rounded w-3/4"></div>
                        <div className="h-2 bg-muted rounded w-full"></div>
                        <div className="h-2 bg-muted rounded w-5/6"></div>
                        <div className="h-2 bg-muted rounded w-full"></div>
                        <div className="h-2 bg-muted rounded w-2/3"></div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="absolute top-2 right-2 h-8 w-8 p-0 bg-background/80 hover:bg-white"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {(doc.status === "draft" || doc.status === "rejected") && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              submitDocument(doc.id);
                            }}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Submit for Review
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setDocumentToDelete(doc.id);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Document Info */}
                  <div className="p-3">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{doc.title}</h3>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Opened {formatDistanceToNow(doc.lastEditedAt, { addSuffix: true })}</span>
                    </div>
                    <div className="mt-2">
                      {getStatusBadge(doc.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Search Results Info */}
          {searchQuery && (
            <div className="text-sm text-muted-foreground mb-4">
              Found {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} for "{searchQuery}"
            </div>
          )}
          
          {/* Enhanced List View */}
          <div className="space-y-4">
            {filteredDocuments.map((doc) => (
              <Card 
                key={doc.id} 
                className="hover:shadow-md transition-all duration-200 cursor-pointer group border-l-4 border-l-transparent hover:border-l-primary"
                onClick={() => handleCardClick(doc)}
              >
                <CardContent className="">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1 min-w-0">
                      {/* File Icon */}
                      <div className="flex-shrink-0">
                        {getFileIcon(doc.fileType, "lg")}
                      </div>
                      
                      {/* Document Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                              {doc.title}
                            </h3>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            {getStatusBadge(doc.status)}
                          </div>
                        </div>

                        {/* Metadata Row */}
                        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>Edited {formatDistanceToNow(new Date(doc.lastEditedAt), { addSuffix: true })}</span>
                          </div>
                          {doc.fileUrl && (
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4" />
                              <span>{getFileType(doc.title, doc.fileType)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                      {doc.fileUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadDocument(doc);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {(doc.status === "draft" || doc.status === "rejected") && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                submitDocument(doc.id);
                              }}
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Submit for Review
                            </DropdownMenuItem>
                          )}
                          {doc.fileUrl && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadDocument(doc);
                              }}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setDocumentToDelete(doc.id);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Full Screen Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-background z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              {getFileIcon(previewFile.fileType)}
              <h2 className="text-xl font-semibold">{previewFile.title}</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setPreviewFile(null)} className="h-8 w-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex-1 p-4">
            <FilePreview
              fileUrl={previewFile.fileUrl}
              fileType={previewFile.fileType}
              fileName={previewFile.title}
              fileId={previewFile.id}
            />
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Upload Document</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setUploadModalOpen(false);
                  setSelectedFile(null);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="file">Select File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  className="mt-1"
                  accept=".pdf,.doc,.docx,.txt,.md"
                />
                <p className="text-sm text-muted-foreground mt-1">Supported formats: PDF, DOC, DOCX</p>
              </div>

              {selectedFile && (
                <div className="p-3 border rounded-md bg-muted/50">
                  <div className="flex items-center gap-2">
                    {getFileIcon(selectedFile.fileType)}
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setUploadModalOpen(false);
                    setSelectedFile(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleFileUpload} disabled={!selectedFile || uploadLoading}>
                  {uploadLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Are you sure you want to delete this document? This action cannot be undone.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (documentToDelete) {
                  deleteDocument(documentToDelete);
                  setDocumentToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}