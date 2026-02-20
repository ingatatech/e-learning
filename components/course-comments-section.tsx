"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useComments } from "@/hooks/use-comments"
import { useAuth } from "@/hooks/use-auth"
import type { CourseComment } from "@/types"
import { MessageCircle, Flag, Trash2, Reply } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CourseCommentsSectionProps {
  courseId: string
  courseName: string
}

const REPORT_REASONS = [
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "spam", label: "Spam" },
  { value: "offensive", label: "Offensive language" },
  { value: "plagiarism", label: "Plagiarism" },
  { value: "other", label: "Other" },
]

export function CourseCommentsSection({ courseId, courseName }: CourseCommentsSectionProps) {
  const { user, token } = useAuth()
  const { getCourseComments, createComment, deleteComment, reportComment } = useComments()
  const { comments, loading, mutate } = getCourseComments(courseId)

  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [reportingComment, setReportingComment] = useState<string | null>(null)
  const [reportReason, setReportReason] = useState("")
  const [reportDescription, setReportDescription] = useState("")

  const handleCreateComment = async () => {
    if (!newComment.trim() || !token) return

    setIsSubmitting(true)
    try {
      await createComment(courseId, newComment, replyingTo || undefined)
      setNewComment("")
      setReplyingTo(null)
      await mutate()
    } catch (error) {
      console.error("Error creating comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return

    try {
      await deleteComment(commentId)
      await mutate()
    } catch (error) {
      console.error("Error deleting comment:", error)
    }
  }

  const handleReportComment = async () => {
    if (!reportingComment || !reportReason.trim() || !token) return

    try {
      await reportComment(reportingComment, reportReason, reportDescription)
      alert("Comment reported successfully. Our moderation team will review it.")
      setReportingComment(null)
      setReportReason("")
      setReportDescription("")
    } catch (error) {
      console.error("Error reporting comment:", error)
      alert("Failed to report comment. Please try again.")
    }
  }

  const renderCommentThread = (comment: CourseComment, depth = 0) => {
    const isOwner = user?.id === comment.authorId
    const isHidden = comment.status === "hidden"

    return (
      <div
        key={comment.id}
        style={{ marginLeft: depth > 0 ? "2rem" : "0" }}
        className="border-l-2 border-gray-200 pl-4 py-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">
                {comment.author?.firstName} {comment.author?.lastName}
              </span>
              {comment.status === "flagged" && (
                <Badge variant="destructive" className="text-xs">
                  Flagged
                </Badge>
              )}
              {isHidden && (
                <Badge variant="secondary" className="text-xs">
                  Hidden
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-2">{new Date(comment.createdAt).toLocaleDateString()}</p>
            {!isHidden ? (
              <p className="text-sm text-foreground">{comment.content}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">This comment has been hidden by moderation.</p>
            )}
          </div>

          {!isHidden && (
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="h-8 w-8 p-0"
              >
                <Reply className="w-4 h-4" />
              </Button>

              {isOwner && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteComment(comment.id)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}

              <Dialog
                open={reportingComment === comment.id}
                onOpenChange={(open) => !open && setReportingComment(null)}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReportingComment(comment.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Flag className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Report Comment</DialogTitle>
                    <DialogDescription>
                      Help us keep the course community safe by reporting inappropriate content.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Reason</label>
                      <Select value={reportReason} onValueChange={setReportReason}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                        <SelectContent>
                          {REPORT_REASONS.map((reason) => (
                            <SelectItem key={reason.value} value={reason.value}>
                              {reason.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description (optional)</label>
                      <Textarea
                        placeholder="Provide additional details..."
                        value={reportDescription}
                        onChange={(e) => setReportDescription(e.target.value)}
                        className="mt-1 h-20"
                      />
                    </div>
                    <Button onClick={handleReportComment} className="w-full">
                      Submit Report
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4">{comment.replies.map((reply) => renderCommentThread(reply, depth + 1))}</div>
        )}

        {/* Reply input */}
        {replyingTo === comment.id && (
          <div className="mt-4 pt-4 border-t-2 border-gray-200 space-y-3">
            <Textarea
              placeholder="Write a reply..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="h-20"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleCreateComment}
                disabled={isSubmitting || !newComment.trim()}
                className="flex-1"
                size="sm"
              >
                {isSubmitting ? "Posting..." : "Post Reply"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setReplyingTo(null)
                  setNewComment("")
                }}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Discussion
        </CardTitle>
        <CardDescription>Share your thoughts and questions about {courseName}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* New Comment Form */}
        <div className="space-y-3">
          <Textarea
            placeholder="Share your thoughts, questions, or insights..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={replyingTo !== null}
            className="h-24"
          />
          <Button
            onClick={handleCreateComment}
            disabled={isSubmitting || !newComment.trim() || replyingTo !== null}
            className="w-full"
          >
            {isSubmitting ? "Posting..." : "Post Comment"}
          </Button>
        </div>

        {/* Comments List */}
        <div className="space-y-4 border-t pt-6">
          {loading ? (
            <p className="text-center text-muted-foreground">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-center text-muted-foreground">No comments yet. Be the first to share!</p>
          ) : (
            comments.filter((c) => !c.parentCommentId).map((comment) => renderCommentThread(comment))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
