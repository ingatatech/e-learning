"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDocuments } from "@/hooks/use-documents"
import type { Document } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Clock, User, Grid3x3, ListIcon, Search, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"

const SkeletonDocumentCard = () => (
  <Card>
    <CardContent className="p-0">
      <div className="border-b bg-muted aspect-[3/2] flex items-start justify-center p-4 rounded">
        <div className="w-full h-full bg-background shadow-sm rounded border border-border p-3 overflow-hidden">
          <div className="space-y-2">
            <Skeleton className="w-8 h-8 rounded-md" />
            <Skeleton className="h-2 w-3/4" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-2 w-5/6" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-2 w-2/3" />
          </div>
        </div>
      </div>
      <div className="p-3">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </CardContent>
  </Card>
)

export default function SysAdminDocumentsPage() {
  const router = useRouter()
  const { documents, loading, fetchDocuments } = useDocuments()
  const [activeTab, setActiveTab] = useState("submitted")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])

  useEffect(() => {
    fetchDocuments()
  }, [])

  // Filter documents based on active tab and search query
  useEffect(() => {
    let filtered = documents.filter((doc) => {
      if (activeTab === "submitted") return true
      return doc.status === activeTab
    })

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(query) ||
        doc.status.toLowerCase().includes(query) ||
        (doc.fileType && doc.fileType.toLowerCase().includes(query)) ||
        (doc.instructor?.firstName?.toLowerCase().includes(query)) ||
        (doc.instructor?.lastName?.toLowerCase().includes(query))
      )
    }

    setFilteredDocuments(filtered)
  }, [documents, activeTab, searchQuery])

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

  const getStatusBadge = (status: Document["status"]) => {
    switch (status) {
      case "draft":
        return (
          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3" /> Draft
          </Badge>
        )
      case "submitted":
        return (
          <Badge className="bg-blue-600 flex items-center gap-1 w-fit">
            <FileText className="w-3 h-3" /> Submitted
          </Badge>
        )
      case "approved":
        return (
          <Badge className="bg-green-600 flex items-center gap-1 w-fit">
            <FileText className="w-3 h-3" /> Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive" className="flex items-center gap-1 w-fit">
            <X className="w-3 h-3" /> Rejected
          </Badge>
        )
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
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-10 w-96" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonDocumentCard key={index} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Document Review</h1>
          <p className="text-muted-foreground">Review and approve instructor documents</p>
        </div>
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
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Search documents by title, status, instructor, or file type..."
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="submitted">Submitted</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredDocuments.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {searchQuery ? "No documents found" : `No ${activeTab} documents found`}
                </h3>
                <p className="text-muted-foreground text-center">
                  {searchQuery 
                    ? `No documents found for "${searchQuery}". Try adjusting your search terms.`
                    : `There are no ${activeTab} documents at the moment`
                  }
                </p>
                {searchQuery && (
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchQuery("")}
                    className="mt-4"
                  >
                    Clear Search
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : viewMode === "grid" ? (
            <>
              {/* Search Results Info */}
              {searchQuery && (
                <div className="text-sm text-muted-foreground mb-4">
                  Found {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} for "{searchQuery}"
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredDocuments.map((doc) => (
                  <Card
                    key={doc.id}
                    className={`hover:shadow-lg transition-shadow cursor-pointer ${getCardColor(doc.fileType)} overflow-hidden p-0`}
                    onClick={() => router.push(`/sysAdmin/documents/${doc.id}`)}
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
                      </div>

                      {/* Document Info */}
                      <div className="p-3">
                        <div className="flex items-start gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">{doc.title}</h3>
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                              <User className="w-3 h-3" />
                              <span className="truncate">
                                {doc.instructor?.firstName} {doc.instructor?.lastName}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Edited {formatDistanceToNow(new Date(doc.lastEditedAt), { addSuffix: true })}</span>
                          </div>
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
              
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Edited</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc) => (
                      <TableRow
                        key={doc.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => router.push(`/sysAdmin/documents/${doc.id}`)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getFileIcon(doc.fileType, "sm")}
                            {doc.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          {doc.instructor?.firstName} {doc.instructor?.lastName}
                        </TableCell>
                        <TableCell>{getStatusBadge(doc.status)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDistanceToNow(new Date(doc.lastEditedAt), { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}