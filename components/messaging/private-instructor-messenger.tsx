"use client"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, AlertCircle, Check, Clock } from "lucide-react"
import type { PrivateMessage, User } from "@/types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatMessageTime } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"

interface PrivateInstructorMessengerProps {
  instructor: User
  courseTitle: string
  messages: PrivateMessage[]
  isLoading: boolean
  onSendMessage: (content: string) => Promise<PrivateMessage> // Now returns the saved message
  onOpenFullConversation: () => void
}

// Extend the message type to include local status
interface MessageWithStatus extends PrivateMessage {
  localStatus?: 'sending' | 'sent' | 'error'
}

export function PrivateInstructorMessenger({
  instructor,
  courseTitle,
  messages: serverMessages,
  isLoading,
  onSendMessage,
  onOpenFullConversation,
}: PrivateInstructorMessengerProps) {
  const [input, setInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [localMessages, setLocalMessages] = useState<MessageWithStatus[]>([])
  const messageEndRef = useRef<HTMLDivElement>(null)
  const { user: currentUser } = useAuth()

  // Combine server messages with local status
  const allMessages: MessageWithStatus[] = [
    // Server messages (already saved)
    ...serverMessages.map(msg => ({ ...msg, localStatus: 'sent' as const })),
    // Local messages that haven't been saved yet or are in progress
    ...localMessages.filter(local => 
      !serverMessages.some(server => server.id === local.id)
    )
  ].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView()
    }
  }, [allMessages])

  const handleSend = async () => {
    if (!input.trim()) return

    const content = input.trim()
    setInput("")
    setError(null)

    // Create a temporary ID
    const tempId = `temp-${Date.now()}-${Math.random()}`
    const now = new Date().toISOString()

    // Create message with sending status
    const newMessage: MessageWithStatus = {
      id: tempId,
      content,
      senderId: currentUser! .id,
      receiverId: instructor.id,
      conversationId: serverMessages[0]?.conversationId || 'temp',
      createdAt: now,
      readAt: null,
      localStatus: 'sending'
    }

    // Add to local messages
    setLocalMessages(prev => [...prev, newMessage])

    try {
      // Send to server
      const savedMessage = await onSendMessage(content)
      
      // Update the local message with the real ID and remove localStatus
      setLocalMessages(prev => 
        prev.map(msg => 
          msg.id === tempId 
            ? { 
                ...savedMessage, 
                localStatus: 'sent' 
              } 
            : msg
        )
      )

      // After a short delay, remove the local status (message will be in serverMessages)
      setTimeout(() => {
        setLocalMessages(prev => 
          prev.filter(msg => msg.id !== tempId)
        )
      }, 1000)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message")
      
      // Mark as error
      setLocalMessages(prev =>
        prev.map(msg =>
          msg.id === tempId 
            ? { ...msg, localStatus: 'error' } 
            : msg
        )
      )
    }
  }

  const handleRetry = async (failedMessage: MessageWithStatus) => {
    // Remove the failed message
    setLocalMessages(prev => prev.filter(msg => msg.id !== failedMessage.id))
    
    // Retry sending
    setInput(failedMessage.content)
    setTimeout(() => handleSend(), 100)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const instructorInitials = `${instructor.firstName?.[0] || ""}${instructor.lastName?.[0] || ""}`.toUpperCase()

  const getStatusIcon = (status?: 'sending' | 'sent' | 'error') => {
    switch (status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-gray-400 animate-pulse" />
      case 'sent':
        return <Check className="h-3 w-3 text-green-500" />
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />
      default:
        return <Check className="h-3 w-3 text-green-500" />
    }
  }

  return (
    <Card className="h-full flex flex-col border-0 shadow-lg p-0 rounded">
      <CardHeader className="py-2 bg-gradient-to-r from-green-500/5 to-cyan-500/5 dark:from-green-900/20 dark:to-cyan-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-green-200 dark:border-green-800">
              <AvatarImage src={instructor.profilePicUrl} />
              <AvatarFallback className="bg-gradient-to-br from-green-500 to-primary/60 text-white font-semibold">{instructorInitials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <CardTitle className="text-sm truncate font-semibold">
                {instructor.firstName} {instructor.lastName}
              </CardTitle>
              <p className="text-xs text-gray-500 dark:text-gray-400">{courseTitle}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onOpenFullConversation}
            className="text-xs cursor-pointer"
          >
            View All
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col overflow-hidden p-3">
        {error && (
          <Alert variant="destructive" className="mb-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        <ScrollArea className="flex-1 mb-3 pr-2">
          <div className="space-y-2">
            {isLoading && serverMessages.length === 0 ? (
              <div className="text-xs text-gray-500 text-center py-4">Loading messages...</div>
            ) : allMessages.length === 0 ? (
              <div className="text-xs text-gray-500 text-center py-4">
                No messages yet. Send your first message!
              </div>
            ) : (
              <>
                {allMessages.map((msg) => {
                  const isFromInstructor = msg.senderId === instructor.id
                  const isSending = msg.localStatus === 'sending'
                  const isError = msg.localStatus === 'error'
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isFromInstructor ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`relative text-xs p-3 rounded-lg max-w-[85%] shadow-sm ${
                          isFromInstructor
                            ? "bg-muted rounded-tl-none"
                            : `bg-gradient-to-br from-green-500 to-green-600 text-white rounded-tr-none ${
                                isError ? 'opacity-70' : ''
                              }`
                        }`}
                      >
                        <p className="break-words leading-tight">{msg.content}</p>
                        
                        <div className="flex items-center gap-1 mt-1.5">
                          <span className={`text-[10px] ${
                            isFromInstructor 
                              ? "text-gray-500 dark:text-gray-400"
                              : "text-green-100"
                          }`}>
                            {isSending 
                              ? 'Sending...' 
                              : isError
                              ? 'Failed to send'
                              : formatMessageTime(msg.createdAt)
                            }
                          </span>
                          {!isFromInstructor && (
                            <span className="flex items-center">
                              {getStatusIcon(msg.localStatus)}
                            </span>
                          )}
                        </div>
                        
                        {/* Retry button for failed messages */}
                        {!isFromInstructor && isError && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute -bottom-2 -right-2 h-5 w-5 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                            onClick={() => handleRetry(msg)}
                            title="Retry sending"
                          >
                            <span className="text-[10px]">↻</span>
                          </Button>
                        )}
                        
                        {/* Sending overlay */}
                        {!isFromInstructor && isSending && (
                          <div className="absolute inset-0 bg-white/10 rounded-lg animate-pulse" />
                        )}
                      </div>
                    </div>
                  )
                })}
                <div ref={messageEndRef} />
              </>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2 bg-accent/20 p-2 rounded-lg">
          <Input
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={localMessages.some(m => m.localStatus === 'sending')}
            className="text-xs h-9 bg-white dark:bg-accent/40 border-gray-200 dark:border-gray-600 focus:border-green-400 dark:focus:border-green-400"
          />
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!input.trim() || localMessages.some(m => m.localStatus === 'sending')}
            className="h-9 w-9 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white cursor-pointer"
          >
            {localMessages.some(m => m.localStatus === 'sending') ? (
              <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="h-3 w-3" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}