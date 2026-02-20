"use client"
import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useDocuments } from "@/hooks/use-documents"
import type { Document } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Check, X, User, Clock, Eye } from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
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
import { FilePreview } from "@/components/documents/file-preview"

export default function DocumentReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { token } = useAuth()
  const { useDocument, updateDocumentInCache } = useDocuments()
  const [reviewNotes, setReviewNotes] = useState("")
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const { document, loading } = useDocument(id)


  const approveDocument = async () => {
    setIsApproving(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/docs/change-status/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "approved",
          reviewNotes,
        }),
      })

      if (response.ok) {
        toast.success("Document approved")
        updateDocumentInCache(id, { status: "approved", reviewNotes })
        router.push("/sysAdmin/documents")
      } else {
        toast.error("Failed to approve document")
      }
    } catch (error) {
      console.error("Error approving document:", error)
      toast.error("Failed to approve document")
    } finally {
      setIsApproving(false)
    }
  }

  const rejectDocument = async () => {
    if (!reviewNotes.trim()) {
      toast.error("Please provide review notes")
      return
    }

    setIsRejecting(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/docs/change-status/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "rejected",
          reviewNotes,
        }),
      })

      if (response.ok) {
        toast.success("Document rejected")
        updateDocumentInCache(id, { status: "rejected", reviewNotes })
        router.push("/sysAdmin/documents")
      } else {
        toast.error("Failed to reject document")
      }
    } catch (error) {
      console.error("Error rejecting document:", error)
      toast.error("Failed to reject document")
    } finally {
      setIsRejecting(false)
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
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <Skeleton className="h-9 w-9" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-8 w-96" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[600px] w-full" />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[200px] w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!document) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/sysAdmin/documents")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{document.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {document.instructor?.firstName} {document.instructor?.lastName}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {formatDistanceToNow(new Date(document.lastEditedAt), { addSuffix: true })}
              </div>
              {getStatusBadge(document.status)}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {document.fileUrl && (
            <Button variant="outline" onClick={() => setShowPreview(true)}>
              <Eye className="w-4 h-4 mr-2" />
              Preview File
            </Button>
          )}
          {document.status !== "rejected" && (
            <Button variant="outline" onClick={() => setRejectDialogOpen(true)} disabled={isRejecting || isApproving}>
              {isRejecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Rejecting...
                </>
              ) : (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </>
              )}
            </Button>
          )}
          {document.status !== "approved" && (
            <Button onClick={() => setApproveDialogOpen(true)} disabled={isApproving || isRejecting}>
              {isApproving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Approving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Document Content</CardTitle>
            </CardHeader>
            <CardContent>
              {document.fileUrl ? (
                <div className="h-[600px]">
                  <FilePreview
                    fileUrl={document.fileUrl}
                    fileType={document.fileType!}
                    fileName={document.title}
                    fileId={document.id}
                  />
                </div>
              ) : (
                <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: document.content }} />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add your review notes here..."
                className="min-h-[200px]"
                disabled={document.status === "rejected"}
              />
            </CardContent>
          </Card>

          {document.status !== "submitted" && document.reviewNotes && (
            <Card>
              <CardHeader>
                <CardTitle>Previous Review</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{document.reviewNotes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {showPreview && document.fileUrl && (
        <div className="fixed inset-0 bg-background z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold">{document.title}</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)} className="h-8 w-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex-1 p-4">
            <FilePreview
              fileUrl={document.fileUrl}
              fileType={document.fileType!}
              fileName={document.title}
              fileId={document.id}
            />
          </div>
        </div>
      )}

      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this document? The instructor will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isApproving}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={approveDocument} disabled={isApproving}>
              {isApproving ? "Approving..." : "Approve"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this document? Please make sure you've added review notes explaining why.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRejecting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={rejectDocument}
              disabled={isRejecting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRejecting ? "Rejecting..." : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
