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
import { ArrowLeft, Check, X, User, Clock } from "lucide-react"
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

export default function DocumentReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { token } = useAuth()
  const { getDocument, updateDocumentInCache } = useDocuments()
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [reviewNotes, setReviewNotes] = useState("")
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)

  useEffect(() => {
    fetchDocument()
  }, [id])

  const fetchDocument = async () => {
    try {
      const cachedDoc = getDocument(id)
      if (cachedDoc) {
        console.log("[v0] Using cached document")
        setDocument(cachedDoc)
        setReviewNotes(cachedDoc.reviewNotes || "")
        setLoading(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/docs/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setDocument(data)
        setReviewNotes(data.reviewNotes || "")
      } else {
        toast.error("Failed to load document")
        router.push("/sysAdmin/documents")
      }
    } catch (error) {
      console.error("Error fetching document:", error)
      toast.error("Failed to load document")
    } finally {
      setLoading(false)
    }
  }

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
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading document...</p>
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
              <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: document.content }} />
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
