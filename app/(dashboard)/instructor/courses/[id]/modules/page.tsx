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
  const { getCourse, updateCourseInCache, fetchSingleCourse } = useCourses()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { token } = useAuth()
  const { id } = use(params)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseResponse = await fetchSingleCourse(id, "live")
        if (courseResponse) {
          setCourse(courseResponse)
          console.log(courseResponse)
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
  }, [])

const saveCourse = async () => {
  if (!course) return

  setSaving(true)
  try {
    const modulesToSend = course.modules?.map((module) => {
      const moduleData: any = {
        title: module.title,
        description: module.description || "",
        order: module.order || 0,
        duration: module.duration || 0,
        lessons: module.lessons?.map((lesson) => ({
          title: lesson.title,
          content: lesson.content || "",
          duration: lesson.duration || 0,
          order: lesson.order || 0,
          isProject: lesson.isProject || false,
          isExercise: lesson.isExercise || false,
          resources: lesson.resources || [],
          assessments: lesson.assessments?.map((assessment) => {
          const assessmentData: any = {
            title: assessment.title,
            type: assessment.type,
            description: assessment.description || "",
            instructions: assessment.instructions || "",
            passingScore: assessment.passingScore || 0,
            timeLimit: assessment.timeLimit || null,
            fileRequired: assessment.fileRequired || false,
            questions: (assessment.questions || []).map((question) => ({
              question: question.question,
              type: question.type,
              options: question.options || [],
              correctAnswer: question.correctAnswer,
              points: question.points || 1,
              // Only include question ID if it's a numeric database ID
              ...(question.id && String(question.id).match(/^\d+$/) && { id: question.id }),
            })),
          }
              // Only include assessment ID if it's a numeric database ID (not client-generated)
            // Check if it's a valid database ID (numeric)
            const assessmentId = assessment.id;
            if (assessmentId && String(assessmentId).match(/^\d+$/)) {
              assessmentData.id = assessmentId;
            }

            return assessmentData;
          }) || [],
          // Only include numeric database IDs
          ...(lesson.id && String(lesson.id).match(/^\d+$/) && { id: lesson.id }),
        })),
        // Only include numeric database IDs for modules
        ...(module.id && String(module.id).match(/^\d+$/) && { id: module.id }),
      }

      // Add final assessment if it exists
      if (module.finalAssessment) {
        const finalAssessmentData: any = {
          title: module.finalAssessment.title,
          type: module.finalAssessment.type,
          description: module.finalAssessment.description || module.finalAssessment.assessment.description || "",
          instructions: module.finalAssessment.description || module.finalAssessment.assessment.description || "",
          passingScore: module.finalAssessment.passingScore || module.finalAssessment.assessment.passingScore || 0,
          timeLimit: module.finalAssessment.timeLimit || module.finalAssessment.assessment.timeLimit || null,
          fileRequired: module.finalAssessment.fileRequired || false,
        }

        // Only include ID if it's a numeric database ID (not client-generated)
        // Check if it's a valid database ID (numeric)
        const finalAssessmentId = module.finalAssessment.id;
        if (finalAssessmentId && String(finalAssessmentId).match(/^\d+$/)) {
          finalAssessmentData.id = finalAssessmentId;
        }

        // Include assessment data if type is "assessment"
        if (module.finalAssessment.type === "assessment") {
          finalAssessmentData.questions = (module.finalAssessment.questions || []).map((question) => ({
            question: question.question,
            type: question.type,
            options: question.options || [],
            correctAnswer: question.correctAnswer,
            points: question.points || 1,
            // Only include question ID if it's a numeric database ID
            ...(question.id && String(question.id).match(/^\d+$/) && { id: question.id }),
          }));

          // DO NOT send assessmentId - it's causing the issue
          // The assessmentId "1764684787093-b3uo6p4yi" is not a valid database ID
          // Remove this line completely:
          // ...(module.finalAssessment?.id && { assessmentId: module.finalAssessment.id })
        }

        moduleData.finalAssessment = finalAssessmentData;
      }

      return moduleData
    })

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        instructorId: course.instructor?.id || course.instructorId,
        modules: modulesToSend,
      }),
    })

    if (response.ok) {
      const updatedCourse = await fetchSingleCourse(id, "live")
      if (updatedCourse) {
        setCourse(updatedCourse)
        updateCourseInCache(id, updatedCourse, "live")
      }
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
          onNext={saveCourse}
          onPrevious={() => window.history.back()}
          type='update'
          loading={saving}
        />
      )}
    </div>
  )
}
