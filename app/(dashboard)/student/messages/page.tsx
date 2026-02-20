"use client"

import { useAuth } from "@/hooks/use-auth"
import { MessageInbox } from "@/components/message-inbox"
import { useCourses } from "@/hooks/use-courses"
import { Card } from "@/components/ui/card"
import { useState } from "react"

export default function StudentMessagesPage() {
  const { user, token } = useAuth()
  const { useCoursesByType } = useCourses()
  const { courses: enrolledCourses, loading } = useCoursesByType("enrolled")

  if (!user || !token) return null

  return (
    <div className="bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {loading ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Loading your courses...</p>
          </Card>
        ) : enrolledCourses.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No enrolled courses yet</p>
          </Card>
        ) : (
          <MessageInbox 
            enrolledCourses={enrolledCourses} 
            isStudent={true} 
          />
        )}
      </div>
    </div>
  )
}