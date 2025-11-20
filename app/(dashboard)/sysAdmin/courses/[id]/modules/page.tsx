"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"

import { ArrowLeft, Save, } from 'lucide-react'
import Link from "next/link"
import type { Course, Module, Lesson } from "@/types"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { useCourses } from "@/hooks/use-courses"
import { CourseTreeBuilder } from "@/components/course/tree-builder/course-tree-builder"

interface ContentBlock {
  id: string
  type: "text" | "video" | "image"
  content: any
  order: number
}

export default function EditCourseModulesPage({ params }: { params: Promise<{ id: string }> }) {
  const { getCourse, updateCourseInCache } = useCourses()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingLesson, setEditingLesson] = useState<{ lesson: Lesson; moduleId: string } | null>(null)
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([])
  const [resourceLinks, setResourceLinks] = useState<{ url: string; title: string; description: string }[]>([])
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

  useEffect(() => {
    if (editingLesson?.lesson) {
      const lesson = editingLesson.lesson

      // Parse content blocks
      if (lesson.content) {
        try {
          const parsedContent = JSON.parse(lesson.content)

          if (parsedContent.version && parsedContent.blocks && Array.isArray(parsedContent.blocks)) {
            // New format with version and blocks
            setContentBlocks(
              parsedContent.blocks.map((block: any, index: number) => ({
                id: `block-${Date.now()}-${index}`,
                type: block.type || "text",
                content: block.data || block.content || {},
                order: index + 1,
              })),
            )
          } else if (Array.isArray(parsedContent)) {
            // Legacy array format
            setContentBlocks(
              parsedContent.map((block: any, index: number) => ({
                id: `block-${Date.now()}-${index}`,
                type: block.type || "text",
                content: block.content || block.data || "",
                order: index + 1,
              })),
            )
          } else {
            // Plain text content
            setContentBlocks([
              {
                id: `block-${Date.now()}`,
                type: "text",
                content: { text: lesson.content },
                order: 1,
              },
            ])
          }
        } catch (error) {
          // If parsing fails, treat as plain text
          setContentBlocks([
            {
              id: `block-${Date.now()}`,
              type: "text",
              content: { text: lesson.content },
              order: 1,
            },
          ])
        }
      } else {
        setContentBlocks([])
      }

      // Parse resources
      if (lesson.resources) {
        try {
          const parsedResources = typeof lesson.resources === "string" ? JSON.parse(lesson.resources) : lesson.resources
          setResourceLinks(parsedResources || [])
        } catch (error) {
          setResourceLinks([])
        }
      } else {
        setResourceLinks([])
      }
    }
  }, [editingLesson]) // Fixed dependency to use entire editingLesson object

  const addContentBlock = (type: ContentBlock["type"]) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type,
      content: getDefaultContent(type),
      order: contentBlocks.length + 1,
    }
    setContentBlocks([...contentBlocks, newBlock])
  }

  const getDefaultContent = (type: ContentBlock["type"]) => {
    switch (type) {
      case "text":
        return { text: "" }
      case "video":
        return { url: "", caption: "" }
      case "image":
        return { url: "", alt: "", caption: "" }
      default:
        return {}
    }
  }

  const stripFakeIds = (item: any) => {
  const clone = { ...item };

  // If the ID is not numeric, delete it
  if (clone.id && isNaN(Number(clone.id))) {
    delete clone.id;
  }

  return clone;
};


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

  if (!course && !loading) {
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
              <Link href={`/sysAdmin/courses/${course?.id}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Course
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold">Manage Course Content</h1>
          <p className="text-muted-foreground">{course?.title}</p>
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
          type='update'
          loading={saving}
        />
      )}
    </div>
  )
}
