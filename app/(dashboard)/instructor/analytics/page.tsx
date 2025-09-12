"use client"

import { InstructorProgressAnalytics } from "../../../../components/progress/instructor-progress-analytics"

export default function InstructorAnalyticsPage() {
  // In a real app, get instructor ID from auth context
  const instructorId = "current-instructor-id"

  return (
    <div className="container mx-auto px-4 py-6">
      <InstructorProgressAnalytics instructorId={instructorId} />
    </div>
  )
}
