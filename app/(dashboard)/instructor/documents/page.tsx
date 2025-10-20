"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useDocuments } from "@/hooks/use-documents"
import type { Document } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileText, Plus, MoreVertical, Trash2, Send, Clock, Grid3x3, ListIcon, Upload, X } from "lucide-react"
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

  useEffect(() => {
    fetchDocuments()
  }, [])

  const files = documents.filter((doc) => doc.fileUrl)

  const getCardColor = (fileType?: string) => {
    if (!fileType) return "bg-background"

    const type = fileType?.toLowerCase() || ""

    if (type.includes("pdf")) return "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800/20"
    if (type.includes("presentation") || type.includes("ppt")) return "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800/20"
    if (type.includes("word") || type.includes("document")) return "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/20"

    return "bg-gray-50 border-gray-200"
  }

  // Function to get file icon based on extension
  const getFileIcon = (fileType?: string) => {
    if (!fileType) {
      return <FileText className="w-8 h-8 text-muted-foreground" />
    }

    const type = fileType?.toLowerCase() || ""

    if (type.includes("pdf")) {
      return (
        <div className="w-8 h-8 flex items-center justify-center bg-red-100 rounded-md">
          <FileText className="w-5 h-5 text-red-600" />
        </div>
      )
    }

    if (type.includes("presentation") || type.includes("ppt")) {
      return (
        <div className="w-8 h-8 flex items-center justify-center bg-orange-100 rounded-md">
          <FileText className="w-5 h-5 text-orange-600" />
        </div>
      )
    }

    if (type.includes("word") || type.includes("document")) {
      return (
        <div className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-md">
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
      )
    }

    // Default file icon
    return (
      <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md">
        <FileText className="w-5 h-5 text-gray-600" />
      </div>
    )
  }

  // Function to get file type for display
  const getFileType = (fileName?: string, fileType?: string) => {
    if (!fileName && !fileType) return "Text"

    const type = fileType?.toLowerCase() || fileName?.toLowerCase() || ""

    if (type.includes("pdf") || fileName?.toLowerCase().endsWith(".pdf")) return "PDF"
    if (type.includes("presentation") || type.includes("ppt") || fileName?.toLowerCase().match(/\.pptx?$/))
      return "PowerPoint"
    if (type.includes("word") || type.includes("document") || fileName?.toLowerCase().match(/\.docx?$/)) return "Word"

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
        console.log(response)
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
        return <Badge variant="secondary">Draft</Badge>
      case "submitted":
        return <Badge className="bg-blue-600">Submitted</Badge>
      case "approved":
        return <Badge className="bg-green-600">Approved</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading documents...</p>
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
              <ListIcon className="w-4 h-4" />
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

      {documents.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No documents yet</h3>
            <p className="text-muted-foreground mb-4">Create your first document to get started</p>
            <div className="flex gap-2">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <Card
              key={doc.id}
              className={`hover:shadow-lg transition-shadow cursor-pointer ${getCardColor(doc.fileType)}`}
              onClick={() => handleCardClick(doc)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between bg-transparent overflow-hidden">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{doc.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(doc.lastEditedAt && new Date(doc.lastEditedAt), { addSuffix: true })}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {(doc.status === "draft" || doc.status === "rejected") && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            submitDocument(doc.id)
                          }}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Submit for Review
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          setDocumentToDelete(doc.id)
                          setDeleteDialogOpen(true)
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  {getStatusBadge(doc.status)}
                  {getFileIcon(doc.fileType)}
                </div>
                {doc.status === "rejected" && doc.reviewNotes && (
                  <p className="text-sm text-destructive mt-2">{doc.reviewNotes}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Last Edited</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow
                  key={doc.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleCardClick(doc)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getFileIcon(doc.fileType)}
                      {doc.title}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(doc.status)}</TableCell>
                  <TableCell>{getFileType(doc.fileUrl || doc.title, doc.fileType)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(new Date(doc.lastEditedAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {doc.status === "draft" ||
                          (doc.status === "rejected" && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                submitDocument(doc.id)
                              }}
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Submit for Review
                            </DropdownMenuItem>
                          ))}
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            setDocumentToDelete(doc.id)
                            setDeleteDialogOpen(true)
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Full Screen Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-background z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              {getFileIcon(previewFile.fileType)}
              <h2 className="text-xl font-semibold">{previewFile.title}</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setPreviewFile(null)} className="h-8 w-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Preview Content */}
          <div className="flex-1 p-4">
            <FilePreview
              fileUrl={previewFile.fileUrl!}
              fileType={previewFile.fileType!}
              fileName={previewFile.title!}
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
                  setUploadModalOpen(false)
                  setSelectedFile(null)
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
                    setUploadModalOpen(false)
                    setSelectedFile(null)
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
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (documentToDelete) {
                  deleteDocument(documentToDelete)
                  setDocumentToDelete(null)
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
