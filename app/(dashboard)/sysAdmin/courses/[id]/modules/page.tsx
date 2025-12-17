"use client"

import { use } from "react"
import { ModulesListComponent } from "@/components/course/modules-list-component"

export default function EditCourseModulesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <ModulesListComponent
      courseId={id}
      backLink={`/sysAdmin/courses/${id}`}
      backLabel="Back to Course"
      role="sysAdmin"
    />
  )
}
