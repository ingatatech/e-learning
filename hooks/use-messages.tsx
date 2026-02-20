"use client"

import { useAuth } from "@/hooks/use-auth"
import type { PrivateMessage, ApiResponse, PaginatedResponse } from "@/types"
import useSWR from "swr"
import { fetcher, postFetcher } from "@/lib/fetcher"

export function useMessages(courseId?: string) {
  const { token } = useAuth()

  // Get inbox messages
  const {
    data: inboxData,
    mutate: mutateInbox,
    isLoading: inboxLoading,
  } = useSWR(token ? [`${process.env.NEXT_PUBLIC_API_URL}/messages/inbox`, token] : null, ([url, t]) =>
    fetcher<PaginatedResponse<PrivateMessage>>(url, t),
  )

  // Get conversation with specific user
  const getConversation = async (recipientId: string) => {
    if (!token) return null
    try {
      const response = await fetcher<PrivateMessage[]>(
        `${process.env.NEXT_PUBLIC_API_URL}/messages/conversation?recipientId=${recipientId}`,
        token,
      )
      return response
    } catch (error) {
      console.error("Error fetching conversation:", error)
      return null
    }
  }

  // Send a message
  const sendMessage = async (recipientId: string, courseId: string, content: string) => {
    if (!token) throw new Error("Not authenticated")
    try {
      const response = await postFetcher<ApiResponse<PrivateMessage>>(
        `${process.env.NEXT_PUBLIC_API_URL}/messages/private/send`,
        {
          arg: { recipientId, courseId, content },
        },
        token,
      )
      await mutateInbox()
      return response.data
    } catch (error) {
      console.error("Error sending message:", error)
      throw error
    }
  }

  // Mark message as read
  const markAsRead = async (messageId: string) => {
    if (!token) throw new Error("Not authenticated")
    try {
      await postFetcher(`${process.env.NEXT_PUBLIC_API_URL}/messages/mark-read`, { arg: { messageId } }, token)
      await mutateInbox()
    } catch (error) {
      console.error("Error marking message as read:", error)
      throw error
    }
  }

  // Get unread count
  const { data: unreadCount } = useSWR(
    token ? [`${process.env.NEXT_PUBLIC_API_URL}/messages/unread-count`, token] : null,
    ([url, t]) => fetcher<{ count: number }>(url, t),
  )

  return {
    inbox: inboxData?.data || [],
    inboxLoading,
    sendMessage,
    getConversation,
    markAsRead,
    unreadCount: unreadCount?.count || 0,
    mutateInbox,
  }
}
