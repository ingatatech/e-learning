"use client"

import useSWR, { mutate } from "swr"
import { useAuth } from "./use-auth"
import { fetcher } from "@/lib/fetcher"
import type { PrivateMessage } from "@/types"
import { API_ENDPOINTS } from "@/lib/constants"

interface Conversation {
  id: string
  otherUser: {
    id: string
    firstName: string
    lastName: string
    profilePicUrl?: string
  }
  courseId: string
  lastMessage?: PrivateMessage
  unreadCount: number
}

export function useMessaging() {
  const { token, user } = useAuth()

 
  // Get messages in a conversation
  const getConversation = (courseId: string, otherUserId: string) => {
    const url = token
      ? `${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.MESSAGES.GET_CONVERSATION}?courseId=${courseId}&otherUserId=${otherUserId}`
      : null

    const {
      data,
      error,
      isLoading,
      mutate: mutateConversation,
    } = useSWR(url, (url: string) => fetcher(url, token!), { revalidateOnFocus: false, dedupingInterval: 1000 })

    return {
      messages: (data?.messages || []) as PrivateMessage[],
      loading: isLoading,
      error,
      mutate: mutateConversation,
    }
  }

  // Send a private message
  const sendMessage = async (recipientId: string, courseId: string, content: string) => {
    if (!token) throw new Error("No token available")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.MESSAGES.SEND_PRIVATE}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientId, courseId, content }),
      })

      if (!response.ok) throw new Error("Failed to send message")
      const data = await response.json()

      // Invalidate both inbox and conversation caches
      await mutate((key) => typeof key === "string" && key.includes("messages"), undefined, { revalidate: true })

      return data.message as PrivateMessage
    } catch (error) {
      console.error("Error sending message:", error)
      throw error
    }
  }

  // Mark messages as read
  const markAsRead = async (messageIds: string[]) => {
    if (!token) throw new Error("No token available")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.MESSAGES.MARK_READ}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messageIds }),
      })

      if (!response.ok) throw new Error("Failed to mark messages as read")
      await mutate((key) => typeof key === "string" && key.includes("messages"), undefined, { revalidate: true })
    } catch (error) {
      console.error("Error marking messages as read:", error)
      throw error
    }
  }

  return {
    getConversation,
    sendMessage,
    markAsRead,
  }
}
