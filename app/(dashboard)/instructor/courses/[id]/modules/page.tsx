"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save } from 'lucide-react'
import Link from "next/link"
import type { Course } from "@/types"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { useCourses } from "@/hooks/use-courses"
import { CourseTreeBuilder } from "@/components/course/tree-builder/course-tree-builder"

export default function EditCourseModulesPage({ params }: { params: Promise<{ id: string }> }) {
  const { getCourse, updateCourseInCache } = useCourses()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { token } = useAuth()
  const { id } = use(params)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/get/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        
        if (courseResponse.ok) {
          const data = await courseResponse.json()
          setCourse(data.course)
        } else {
          setCourse(null)
        }
      } catch (error) {
        console.error("Failed to fetch course:", error)
        toast.error("Failed to load course")
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [id, getCourse])

  const saveCourse = async () => {
    if (!course) return

    setSaving(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          instructorId: course.instructor?.id || course.instructorId,
          modules: course.modules?.map((module) => ({
            ...module,
            lessons: module.lessons?.map((lesson) => ({
              ...lesson,
              content: lesson.content || "",
              duration: lesson.duration || 0,
              order: lesson.order || 0,
              isProject: lesson.isProject || false,
              isExercise: lesson.isExercise || false,
              resources: lesson.resources || [],
              assessments: lesson.assessments || [],
            })),
          })),
        }),
      })

      if (response.ok) {
        updateCourseInCache(id, course)
        toast.success("Course updated successfully!")
      } else {
        throw new Error("Failed to save course")
      }
    } catch (error) {
      console.error("Failed to save course:", error)
      toast.error("Failed to save course changes")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-8" />
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Course not found</h1>
        <Button asChild>
          <Link href="/instructor/courses">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/instructor/courses/${course.id}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Course
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold">Manage Course Content</h1>
          <p className="text-muted-foreground">{course.title}</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={saveCourse} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Tree Builder for Editing */}
      {course && (
        <CourseTreeBuilder
          modules={course.modules || []}
          setModules={(modules) => setCourse({ ...course, modules })}
          courseData={course}
          onNext={saveCourse}
          onPrevious={() => window.history.back()}
        />
      )}
    </div>
  )
}
