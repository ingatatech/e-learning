"use client"
import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import type { Document } from "@/types"
import { DocumentEditor } from "@/components/documents/document-editor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Send, Clock } from "lucide-react"
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

export default function DocumentEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const [document, setDocument] = useState<Document | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)

  useEffect(() => {
    fetchDocument()
  }, [id])

  // Auto-save functionality
  useEffect(() => {
    if (!document) return

    const timer = setTimeout(() => {
      saveDocument(false)
    }, 2000) // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timer)
  }, [title, content])

  const fetchDocument = async () => {
    try {
      const token = localStorage.getItem("Etoken")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setDocument(data)
        setTitle(data.title)
        setContent(data.content)
        setLastSaved(new Date(data.lastEditedAt))
      } else {
        toast.error("Failed to load document")
        router.push("/instructor/documents")
      }
    } catch (error) {
      console.error("Error fetching document:", error)
      toast.error("Failed to load document")
    } finally {
      setLoading(false)
    }
  }

  const saveDocument = async (showToast = true) => {
    if (!document || saving) return

    setSaving(true)
    try {
      const token = localStorage.getItem("Etoken")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
        }),
      })

      if (response.ok) {
        const now = new Date()
        setLastSaved(now)
        if (showToast) {
          toast.success("Document saved")
        }
      } else {
        if (showToast) {
          toast.error("Failed to save document")
        }
      }
    } catch (error) {
      console.error("Error saving document:", error)
      if (showToast) {
        toast.error("Failed to save document")
      }
    } finally {
      setSaving(false)
    }
  }

  const submitDocument = async () => {
    try {
      // Save first
      await saveDocument(false)

      const token = localStorage.getItem("Etoken")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/${id}/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast.success("Document submitted for review")
        router.push("/instructor/documents")
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
        return <Badge variant="default">Submitted</Badge>
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
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4 flex-1">
            <Button variant="ghost" size="sm" onClick={() => router.push("/instructor/documents")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-semibold border-none shadow-none focus-visible:ring-0 max-w-md"
              placeholder="Untitled Document"
            />
            {document && getStatusBadge(document.status)}
          </div>
          <div className="flex items-center gap-4">
            {lastSaved && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {saving ? "Saving..." : `Saved ${formatDistanceToNow(lastSaved, { addSuffix: true })}`}
              </div>
            )}
            <Button variant="outline" onClick={() => saveDocument(true)} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            {document.status === "draft" && (
              <Button onClick={() => setSubmitDialogOpen(true)}>
                <Send className="w-4 h-4 mr-2" />
                Submit for Review
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <DocumentEditor content={content} onChange={setContent} />
      </div>

      <AlertDialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit this document for review? You won't be able to edit it until it's
              reviewed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={submitDocument}>Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
