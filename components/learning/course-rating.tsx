"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MessageSquare } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface CourseRatingProps {
  courseId: string
  currentRating?: number
  currentReview?: string
  onRatingSubmit: (rating: number, review: string) => void
  reviews?: Array<{
    id: string
    user: {
      firstName: string
      lastName: string
      profilePicUrl?: string
    }
    rating: number
    review: string
    createdAt: string
  }>
}

export function CourseRating({
  courseId,
  currentRating,
  currentReview,
  onRatingSubmit,
  reviews = [],
}: CourseRatingProps) {
  const [rating, setRating] = useState(currentRating || 0)
  const [review, setReview] = useState(currentReview || "")
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()

  const handleSubmit = async () => {
    if (rating === 0) return

    setIsSubmitting(true)
    try {
      await onRatingSubmit(rating, review)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* Rating Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Rate This Course
          </CardTitle>
          <CardDescription>Share your experience to help other students</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && <span className="ml-2 text-sm text-muted-foreground">{rating} out of 5 stars</span>}
            </div>
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Review (Optional)</label>
            <Textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your thoughts about this course..."
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Submit Button */}
          <Button onClick={handleSubmit} disabled={rating === 0 || isSubmitting} className="w-full">
            {isSubmitting ? "Submitting..." : currentRating ? "Update Review" : "Submit Review"}
          </Button>
        </CardContent>
      </Card>

      {/* Reviews List */}
      {reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Student Reviews ({reviews.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {reviews.map((reviewItem) => (
                <div key={reviewItem.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={reviewItem.user.profilePicUrl || "/placeholder.svg"} />
                      <AvatarFallback>
                        {reviewItem.user.firstName[0]}
                        {reviewItem.user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">
                            {reviewItem.user.firstName} {reviewItem.user.lastName}
                          </h4>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= reviewItem.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">{formatDate(reviewItem.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      {reviewItem.review && (
                        <p className="text-sm text-muted-foreground leading-relaxed">{reviewItem.review}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
