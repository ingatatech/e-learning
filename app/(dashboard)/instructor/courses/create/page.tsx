"use client"

import { useState } from "react"
import { CourseCreationWizard } from "@/components/course/course-creation-wizard"
import { CourseSelectionModal } from "@/components/course/course-selection-modal"

export default function CreateCoursePage() {
  const [selectedMode, setSelectedMode] = useState<"course" | "document" | null>(null)

  if (!selectedMode) {
    return <CourseSelectionModal onSelectMode={setSelectedMode} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-900/10 dark:to-gray-800/20 rounded-lg">
      {selectedMode === "course" ? (
        <CourseCreationWizard />
      ) : (
        <div>{typeof window !== "undefined" && window.location.replace("/instructor/documents")}</div>
      )}
    </div>
  )
}
