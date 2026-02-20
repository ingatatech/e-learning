"use client"

import useSWR from "swr"
import { useAuth } from "./use-auth"
import { fetcher } from "@/lib/fetcher"
import type { CourseComment, CommentReport } from "@/types"
import { API_ENDPOINTS } from "@/lib/constants"

export function useComments() {
  const { token, user } = useAuth()
  const {
    data,
    error,
    isLoading,
    mutate: mutateComments,
  } = useSWR(
    token ? `${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.COMMENTS.GET_COURSE_COMMENTS}` : null,
    (url: string) => fetcher(url, token!),
    { revalidateOnFocus: false, dedupingInterval: 2000 },
  )

  // Get all comments for a course
  const getCourseComments = (courseId: string) => {
    return {
      comments: (data?.comments || []).filter((comment) => comment.courseId === courseId) as CourseComment[],
      loading: isLoading,
      error,
      mutate: mutateComments,
    }
  }

  // Create a new comment
  const createComment = async (courseId: string, content: string, parentCommentId?: string) => {
    if (!token) throw new Error("No token available")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.COMMENTS.CREATE_COMMENT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId, content, parentCommentId }),
      })

      if (!response.ok) throw new Error("Failed to create comment")
      const data = await response.json()

      // Invalidate comments cache
      await mutateComments()

      return data.comment as CourseComment
    } catch (error) {
      console.error("Error creating comment:", error)
      throw error
    }
  }

  // Update a comment
  const updateComment = async (commentId: string, content: string) => {
    if (!token) throw new Error("No token available")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.COMMENTS.UPDATE_COMMENT}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ commentId, content }),
      })

      if (!response.ok) throw new Error("Failed to update comment")
      const data = await response.json()

      await mutateComments()

      return data.comment as CourseComment
    } catch (error) {
      console.error("Error updating comment:", error)
      throw error
    }
  }

  // Delete a comment
  const deleteComment = async (commentId: string) => {
    if (!token) throw new Error("No token available")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.COMMENTS.DELETE_COMMENT}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ commentId }),
      })

      if (!response.ok) throw new Error("Failed to delete comment")

      await mutateComments()
    } catch (error) {
      console.error("Error deleting comment:", error)
      throw error
    }
  }

  // Report a comment
  const reportComment = async (commentId: string, reason: string, description: string) => {
    if (!token) throw new Error("No token available")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.COMMENTS.REPORT_COMMENT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ commentId, reason, description }),
      })

      if (!response.ok) throw new Error("Failed to report comment")
      const data = await response.json()
      return data.report as CommentReport
    } catch (error) {
      console.error("Error reporting comment:", error)
      throw error
    }
  }

  return {
    getCourseComments,
    createComment,
    updateComment,
    deleteComment,
    reportComment,
  }
}
