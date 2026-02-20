"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { PrivateMessage } from "@/types"
import { Check, CheckCheck } from "lucide-react"
import { formatMessageTime } from "@/lib/utils"

interface MessageItemProps {
  message: PrivateMessage
  isCurrentUserSender: boolean
  onClick?: () => void
}

export function MessageItem({ message, isCurrentUserSender, onClick }: MessageItemProps) {
  const otherUser = isCurrentUserSender ? message.recipient : message.sender
  const initials = `${otherUser?.firstName?.[0] || ""}${otherUser?.lastName?.[0] || ""}`.toUpperCase()

  return (
    <div
      onClick={onClick}
      className="flex items-start gap-3 rounded-lg border p-3 hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarImage src={otherUser?.profilePicUrl || "/placeholder.svg"} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium text-sm">
            {otherUser?.firstName} {otherUser?.lastName}
          </p>
          <span className="text-xs text-gray-500 flex-shrink-0">
            {formatMessageTime(message.createdAt)}
          </span>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2 break-words">{message.content}</p>
        <div className="flex items-center gap-2 mt-1">
          {message.course && (
            <Badge variant="secondary" className="text-xs">
              {message.course.title}
            </Badge>
          )}
          {isCurrentUserSender && (
            <>
              {message.status === "read" ? (
                <CheckCheck className="h-3 w-3 text-blue-600" />
              ) : (
                <Check className="h-3 w-3 text-gray-400" />
              )}
            </>
          )}
          {!isCurrentUserSender && message.status !== "read" && <Badge className="bg-blue-600 text-xs">New</Badge>}
        </div>
      </div>
    </div>
  )
}
