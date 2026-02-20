"use client"

import { useEffect, useState } from "react"
import { CourseSpacePanel } from "@/components/messaging/course-space-panel"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"
import { Course, CourseSpaceMessage, PrivateMessage } from "@/types"
import { createPortal } from "react-dom"

interface Instructor {
  id: string
  name: string
  email?: string
  avatar?: string
}

interface LearningMessagingPanelProps {
  course: Course
  instructor: Instructor
  userId: string
  onClose?: () => void
}

export function LearningMessagingPanel({
  course,
  instructor,
  userId,
  onClose,
}: LearningMessagingPanelProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { token, user } = useAuth()
  const [messages, setMessages] = useState<PrivateMessage[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [conversation, setConversation] = useState<any>(null)
  const [space, setSpace] = useState<any>(null)
  const [spaceMessages, setSpaceMessages] = useState<CourseSpaceMessage[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    getConvo(course.id)
    getSpace(course.id)
  }, [])

  // Lock/unlock body scroll when fullscreen
  useEffect(() => {
    document.body.style.overflow = isFullscreen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isFullscreen])

  const getConvo = async (courseId: string) => {
    try {
      setLoadingMessages(true)
      if (!token) return
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/conversations/${courseId}`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(data.conversations[0].messages)
        setConversation(data.conversations[0])
      }
    } catch (err) {
      console.error("Failed to get messages", err)
    } finally {
      setLoadingMessages(false)
    }
  }

  const getSpace = async (courseId: string) => {
    try {
      if (!token) return
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/space/course/${courseId}`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setSpaceMessages(data[0].messages)
        setSpace(data[0])
      }
    } catch (err) {
      console.error("Failed to get space", err)
    }
  }

  const handleSendPrivateMessage = async (content: string, conversationId = conversation?.id) => {
    try {
      setIsLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ conversationId, content }),
      })
      if (!res.ok) throw new Error()
      const message = await res.json()
      setMessages((prev) => [...prev, message.data])
    } catch {
      setError("Failed to send message. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendSpaceMessage = async (content: string, spaceId = space?.id) => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/space/send-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ spaceId, content }),
      })
      if (!res.ok) throw new Error()
      const message = await res.json()
      setSpaceMessages((prev) => [...prev, message.data])
    } catch {
      setError("Failed to post message. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateSpace = async (courseId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/space`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ courseId }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setError("Failed to create space. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFullscreen(true)
  }

  const handleCloseFullscreen = () => {
    setIsFullscreen(false)
  }

  const errorBanner = error ? (
    <div className="flex-shrink-0 px-6 pt-3">
      <Alert variant="destructive" className="border-red-200 bg-red-50 py-2">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-red-800 text-xs">{error}</AlertDescription>
      </Alert>
    </div>
  ) : null

  return (
    <>
      {/* Sidebar panel view */}
      {!isFullscreen && (
        <div className="h-full w-full flex flex-col bg-primary/20">
          <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                {course.title}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Chat with instructor or course community
              </p>
            </div>
          </div>

          {errorBanner}

          <div className="flex-1 min-h-0 overflow-hidden">
            <CourseSpacePanel
              instructor={instructor}
              course={course}
              privateMessages={messages}
              spaceMessages={spaceMessages}
              isLoading={isLoading}
              loadingMessages={loadingMessages}
              onSendPrivateMessage={handleSendPrivateMessage}
              onSendSpaceMessage={handleSendSpaceMessage}
              onCreateSpace={handleCreateSpace}
              isCreatingSpace={isLoading}
              isFullscreen={false}
            />
          </div>
        </div>
      )}
    </>
  )
}
