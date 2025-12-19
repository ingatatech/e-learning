  "use client"

  import { useState, useEffect } from "react"
  import { Button } from "@/components/ui/button"
  import { ArrowLeft, Save } from "lucide-react"
  import Link from "next/link"
  import type { Course } from "@/types"
  import { useAuth } from "@/hooks/use-auth"
  import { toast } from "sonner"
  import { CourseTreeBuilder } from "@/components/course/tree-builder/course-tree-builder"
import { isTempId } from "@/lib/utils"
import { useRouter } from "next/navigation"

  interface ModulesListComponentProps {
    courseId: string
    backLink: string
    backLabel?: string
    role: "instructor" | "sysAdmin" | "gdv"
  }

  export function ModulesListComponent({
    courseId,
    backLink,
    backLabel = "Back to Course",
    role,
  }: ModulesListComponentProps) {
    const [course, setCourse] = useState<Course | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const { token } = useAuth()

    const router = useRouter()
    useEffect(() => {
      const fetchCourse = async () => {
        try {
          const courseResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/get/${courseId}`, {
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
    }, [courseId, token])

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
              assessments:
                lesson.assessments?.map((assessment) => {
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
                      pairs: question.pairs || [],
                      correctAnswer: question.correctAnswer,
                      points: question.points || 1,
                      ...(question.id && !isTempId(question.id) && { id: question.id }),
                    })),
                  }
                  const assessmentId = assessment.id
                  if (assessmentId && !isTempId(assessmentId)) {
                    assessmentData.id = assessmentId
                  }
                  return assessmentData
                }) || [],
              ...(lesson.id && !isTempId(lesson.id) && { id: lesson.id }),
            })),
            ...(module.id && !isTempId(module.id) && { id: module.id }),
          }

          if (module.finalAssessment) {
            const finalAssessmentData: any = {
              title: module.finalAssessment.title,
              type: "assessment",
              description: module.finalAssessment.description || "",
              passingScore: module.finalAssessment.passingScore || 0,
              timeLimit: module.finalAssessment.timeLimit || null,
              fileRequired: module.finalAssessment.fileRequired || false,
            }

            const finalAssessmentId = module.finalAssessment.id
            if (finalAssessmentId && !isTempId(finalAssessmentId)) {
              finalAssessmentData.id = finalAssessmentId
            }

            if (module.finalAssessment.type === "assessment") {
              finalAssessmentData.questions = (module.finalAssessment.questions || []).map((question) => ({
                question: question.question,
                type: question.type,
                options: question.options || [],
                correctAnswer: question.correctAnswer,
                points: question.points || 1,
                ...(question.id && !isTempId(question.id) && { id: question.id }),
              }))
            }

            moduleData.finalAssessment = finalAssessmentData
          }

          return moduleData
        })

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/update-modules/${courseId}`, {
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
          toast.success("Course updated successfully!")
          router.push(`/${role}/courses/${courseId}`)
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
            <Link href={backLink}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {backLabel}
            </Link>
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href={backLink}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {backLabel}
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

        {course && (
          <CourseTreeBuilder
            modules={course.modules || []}
            setModules={(modules) => setCourse({ ...course, modules })}
            type="update"
            loading={saving}
            onNext={saveCourse}
            onPrevious={() => window.history.back()}
          />
        )}
      </div>
    )
  }
