"use client"

import { useAuth } from "@/hooks/use-auth"
import type { CourseComment, CommentReport, ApiResponse, PaginatedResponse } from "@/types"
import useSWR from "swr"
import { fetcher, postFetcher } from "@/lib/fetcher"

export function useCourseComments(courseId: string) {
  const { token } = useAuth()

  // Get course comments
  const {
    data: commentsData,
    mutate: mutateComments,
    isLoading: commentsLoading,
  } = useSWR(
    token && courseId ? [`${process.env.NEXT_PUBLIC_API_URL}/api/comments/course?courseId=${courseId}`, token] : null,
    ([url, t]) => fetcher<PaginatedResponse<CourseComment>>(url, t),
  )

  // Create a comment
  const createComment = async (content: string, parentCommentId?: string) => {
    if (!token) throw new Error("Not authenticated")
    try {
      const response = await postFetcher<ApiResponse<CourseComment>>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/comments/create`,
        {
          arg: { courseId, content, parentCommentId },
        },
        token,
      )
      await mutateComments()
      return response.data
    } catch (error) {
      console.error("Error creating comment:", error)
      throw error
    }
  }

  // Update a comment
  const updateComment = async (commentId: string, content: string) => {
    if (!token) throw new Error("Not authenticated")
    try {
      const response = await postFetcher<ApiResponse<CourseComment>>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/comments/update`,
        {
          arg: { commentId, content },
        },
        token,
      )
      await mutateComments()
      return response.data
    } catch (error) {
      console.error("Error updating comment:", error)
      throw error
    }
  }

  // Delete a comment
  const deleteComment = async (commentId: string) => {
    if (!token) throw new Error("Not authenticated")
    try {
      await postFetcher(`${process.env.NEXT_PUBLIC_API_URL}/api/comments/delete`, { arg: { commentId } }, token)
      await mutateComments()
    } catch (error) {
      console.error("Error deleting comment:", error)
      throw error
    }
  }

  // Report a comment
  const reportComment = async (commentId: string, reason: string, description: string) => {
    if (!token) throw new Error("Not authenticated")
    try {
      const response = await postFetcher<ApiResponse<CommentReport>>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/comments/report`,
        {
          arg: { commentId, reason, description },
        },
        token,
      )
      return response.data
    } catch (error) {
      console.error("Error reporting comment:", error)
      throw error
    }
  }

  return {
    comments: commentsData?.data || [],
    commentsLoading,
    createComment,
    updateComment,
    deleteComment,
    reportComment,
    mutateComments,
  }
}
