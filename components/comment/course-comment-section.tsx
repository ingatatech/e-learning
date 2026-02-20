"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MessageCircle, Flag, MoreVertical, Send } from "lucide-react"
import type { CourseComment, User } from "@/types"
import { formatDistanceToNow } from "date-fns"

interface CourseCommentsSectionProps {
  comments: CourseComment[]
  currentUser: User | null
  isLoading: boolean
  onAddComment: (content: string) => Promise<void>
  onReportComment: (commentId: string, reason: string) => Promise<void>
  onDeleteComment?: (commentId: string) => Promise<void>
}

export function CourseCommentsSection({
  comments,
  currentUser,
  isLoading,
  onAddComment,
  onReportComment,
  onDeleteComment,
}: CourseCommentsSectionProps) {
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reportingId, setReportingId] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      await onAddComment(newComment)
      setNewComment("")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReport = async (commentId: string) => {
    setReportingId(commentId)
    await onReportComment(commentId, "inappropriate")
    setReportingId(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Course Discussion
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Add comment section */}
        {currentUser && (
          <div className="space-y-3 pb-6 border-b">
            <div className="flex gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={currentUser.profilePicUrl || "/placeholder.svg"} />
                <AvatarFallback>
                  {currentUser.firstName?.[0]}
                  {currentUser.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts about this course..."
                  className="min-h-20"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <Button variant="outline" onClick={() => setNewComment("")}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting || !newComment.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Posting..." : "Post Comment"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comments list */}
        <div className="space-y-4">
          {isLoading ? (
            <p className="text-center text-sm text-gray-500 py-8">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-8">
              No comments yet. Be the first to share your thoughts!
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="rounded-lg border p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3 flex-1 min-w-0">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={comment.author?.profilePicUrl || "/placeholder.svg"} />
                      <AvatarFallback>
                        {comment.author?.firstName?.[0]}
                        {comment.author?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">
                        {comment.author?.firstName} {comment.author?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </p>
                      <p className="text-sm text-gray-800 mt-2 break-words">{comment.content}</p>
                      {comment.status === "flagged" && (
                        <Badge variant="destructive" className="mt-2 text-xs">
                          Flagged
                        </Badge>
                      )}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {currentUser?.id === comment.author?.id && onDeleteComment && (
                        <DropdownMenuItem onClick={() => onDeleteComment(comment.id)} className="text-red-600">
                          Delete
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleReport(comment.id)} disabled={reportingId === comment.id}>
                        <Flag className="h-4 w-4 mr-2" />
                        {reportingId === comment.id ? "Reporting..." : "Report"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
