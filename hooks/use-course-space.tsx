import { useState, useCallback, useEffect } from "react"
import type { CourseSpaceMessage, PrivateMessage, Course, User } from "@/types"
import useSWR from "swr"
import { useAuth } from "./use-auth"

interface UseCourseSpaceProps {
  courseId: string
  conversationId?: string
}

export function useCourseSpace({ courseId, conversationId }: UseCourseSpaceProps) {
  const [error, setError] = useState<string | null>(null)
  const { token, user: currentUser } = useAuth()

  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  // Fetch course space messages
  const {
    data: spaceMessages,
    isLoading: isLoadingSpace,
    mutate: mutateSpace,
  } = useSWR<CourseSpaceMessage[]>(
    token && courseId ? `${apiUrl}/course-spaces/${courseId}/messages` : null,
    async (url) => {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Failed to fetch space messages")
      return response.json()
    },
    { revalidateOnFocus: false, dedupingInterval: 5000 }
  )

  // Fetch private messages with instructor
  const {
    data: privateMessages,
    isLoading: isLoadingPrivate,
    mutate: mutatePrivate,
  } = useSWR<PrivateMessage[]>(
    token && courseId ? `${apiUrl}/messages/${conversationId}/convo` : null,
    async (url) => {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Failed to fetch private messages")
      return response.json()
    },
    { revalidateOnFocus: false, dedupingInterval: 5000 }
  )

  // Fetch enrolled student count
  const {
    data: enrollmentData,
  } = useSWR<{ count: number }>(
    token && courseId ? `${apiUrl}/courses/${courseId}/enrollments-count` : null,
    async (url) => {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) return { count: 0 }
      return response.json()
    },
    { revalidateOnFocus: false }
  )

  // Send message to course space
  const sendSpaceMessage = useCallback(
    async (content: string) => {
      if (!token || !currentUser) throw new Error("Not authenticated")

      try {
        const response = await fetch(`${apiUrl}/course-spaces/${courseId}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content }),
        })

        if (!response.ok) throw new Error("Failed to send message")

        const newMessage = await response.json()
        mutateSpace((prev) => (prev ? [...prev, newMessage] : [newMessage]))
        setError(null)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to send message"
        setError(message)
        throw err
      }
    },
    [token, currentUser, courseId, mutateSpace, apiUrl]
  )

  // Send private message to instructor
  const sendPrivateMessage = useCallback(
    async (content: string, convoId: string) => {
      if (!token || !currentUser) throw new Error("Not authenticated")

      try {
        const response = await fetch(`${apiUrl}/messages/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content,
            conversationId: convoId,
          }),
        })

        if (!response.ok) throw new Error("Failed to send message")
          console.log(response)

        const newMessage = await response.json()
        mutatePrivate((prev) => (prev ? [...prev, newMessage] : [newMessage]))
        setError(null)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to send message"
        setError(message)
        throw err
      }
    },
    [token, currentUser, courseId, mutatePrivate, apiUrl]
  )

  // Mark space message as read
  const markSpaceMessageAsRead = useCallback(
    async (messageId: string) => {
      if (!token) return

      try {
        await fetch(`${apiUrl}/course-spaces/${courseId}/messages/${messageId}/mark-read`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      } catch (err) {
        console.error("Failed to mark message as read", err)
      }
    },
    [token, courseId, apiUrl]
  )

  return {
    spaceMessages: spaceMessages || [],
    privateMessages: privateMessages || [],
    enrolledStudentCount: enrollmentData?.count || 0,
    isLoadingSpace,
    isLoadingPrivate,
    error,
    sendSpaceMessage,
    sendPrivateMessage,
    markSpaceMessageAsRead,
    refetchSpace: mutateSpace,
    refetchPrivate: mutatePrivate,
  }
}
