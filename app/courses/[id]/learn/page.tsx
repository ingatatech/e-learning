"use client"

import { use, useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useLearningProgress } from "@/hooks/use-learning-progress"
import type { Course } from "@/types"

import { ContentScreen } from "@/components/learning/content-screen"
import { VideoScreen } from "@/components/learning/video-screen"
import { AssessmentScreen } from "@/components/learning/assessment-screen"
import { LearningSidebar } from "@/components/learning/learning-sidebar"
import { LearningNavigation } from "@/components/learning/learning-navigation"
import { CompletionCelebration } from "@/components/learning/completion-celebration"
import { CourseCompletion } from "@/components/learning/course-completion"
import { CourseRating } from "@/components/learning/course-rating"
import { useRouter } from "next/navigation"

interface LearningStep {
  id: string
  dbId: string
  type: "content" | "video" | "assessment"
  title: string
  lessonId: string
  moduleId: string
  lesson: any
  assessment?: any
  duration?: number
}

export default function CourseLearningPage({ params }: { params: Promise<{ id: string }> }) {
  const { token, user } = useAuth()
  const { id } = use(params)
  const [course, setCourse] = useState<Course>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showRating, setShowRating] = useState(false)
  const [userRating, setUserRating] = useState<{ rating: number; review: string } | null>(null)
  const [courseReviews, setCourseReviews] = useState<any[]>([])

  const [allSteps, setAllSteps] = useState<LearningStep[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationData, setCelebrationData] = useState<any>({})
  const [isStepping, setIsStepping] = useState(false)
  const router = useRouter()


  const { progressData, markStepComplete, getCurrentStep, calculateProgress, isStepCompleted, getStepScore } =
    useLearningProgress(id)

  useEffect(() => {
    const fetchCourse = async () => {
      if (!token || !user) return
      setLoading(true)

      try {
        // Fetch user enrollments
        const enrollmentsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/enrollments/user-enrollments`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          method: "POST",
          body: JSON.stringify({
            userId: user.id,
          }),
        })

        if (enrollmentsResponse.ok) {
          const enrollmentsData = await enrollmentsResponse.json()

          // Check if current course is in user's enrollments
          const enrolledCourse = enrollmentsData.enrollments.find(
            (enrollment: any) => enrollment.course.id.toString() === id,
          )
          
          if (!enrolledCourse) {
            router.push("/student/courses")
          }
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/get/${id}`, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setCourse(data.course)
          setAllSteps(generateLearningSteps(data.course))
          setError(null)
          await fetchCourseRating()
        } else {
          setError("Failed to fetch course details")
        }
      } catch (err) {
        console.error(err)
        setError("Error fetching course")
      } finally {
        setLoading(false)
      }
    }

    

    fetchCourse()
  }, [token, user, id])

  const fetchCourseRating = async () => {
    try {
      const userRatingRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${id}/rating/user`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      })
      if (userRatingRes.ok) {
        const userRatingData = await userRatingRes.json()
        setUserRating(userRatingData.rating)
      }

      const reviewsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${id}/reviews`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      })
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json()
        setCourseReviews(reviewsData.reviews || [])
      }
    } catch (error) {
      console.error("Failed to fetch rating data:", error)
    }
  }

  const handleRatingSubmit = async (rating: number, review: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${id}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          userId: user?.id,
          courseId: id,
          rating,
          review,
        }),
      })

      if (response.ok) {
        setUserRating({ rating, review })
        await fetchCourseRating()
        setShowRating(false)
      }
    } catch (error) {
      console.error("Failed to submit rating:", error)
    }
  }

  useEffect(() => {
    if (!allSteps.length || !progressData) return

    const lastStep = getCurrentStep(allSteps, progressData)
    if (!lastStep) return

    const lastIndex = allSteps.findIndex((step) => step.id === lastStep.id)
    const startStepIndex =
      lastIndex >= 0 && isStepCompleted(lastStep.id) && lastIndex + 1 < allSteps.length ? lastIndex + 1 : lastIndex

    setCurrentStepIndex(startStepIndex)
  }, [allSteps, progressData])

  const generateLearningSteps = (course: Course): LearningStep[] => {
    const steps: LearningStep[] = []

    course.modules?.forEach((module) => {
      const sortedLessons = [...module.lessons].sort((a, b) => {
        if (a.isProject && !b.isProject) return 1
        if (!a.isProject && b.isProject) return -1
        return a.order - b.order
      })

      sortedLessons.forEach((lesson) => {
        if (lesson.content && lesson.content.trim()) {
          steps.push({
            id: `${lesson.id}-content`,
            dbId: lesson.id,
            type: "content",
            title: `${lesson.title} - Reading`,
            lessonId: lesson.id.toString(),
            moduleId: module.id.toString(),
            lesson,
            duration: lesson.duration,
          })
        }

        if (lesson.videoUrl && lesson.videoUrl.trim()) {
          steps.push({
            id: `${lesson.id}-video`,
            dbId: lesson.id,
            type: "video",
            title: `${lesson.title} - Video`,
            lessonId: lesson.id.toString(),
            moduleId: module.id.toString(),
            lesson,
            duration: lesson.content ? Math.ceil(lesson.duration / 2) : lesson.duration,
          })
        }

        lesson.assessments?.forEach((assessment, index) => {
          steps.push({
            id: `${lesson.id}-assessment-${assessment.id}`,
            dbId: assessment.id,
            type: "assessment",
            title: assessment.title || `${lesson.title} - Assessment`,
            lessonId: lesson.id.toString(),
            moduleId: module.id.toString(),
            lesson,
            assessment,
            duration: assessment.timeLimit,
          })
        })
      })
    })

    return steps
  }

  const handleStepComplete = async (score?: number, passed?: boolean) => {
    setIsStepping(true)
    const currentStep = allSteps[currentStepIndex]
    if (!currentStep) return
    
    const payload: any = {
      courseId: id,
      userId: user?.id,
    }

    if (currentStep.type === "assessment" && currentStep.assessment) {
      payload.assessmentId = currentStep.assessment.id
      if (score !== undefined) payload.score = score
      payload.isCompleted = true 
    } else {
      payload.lessonId = currentStep.lessonId
    }

    const isLastStep = currentStepIndex === allSteps.length - 1
    payload.status = isLastStep ? "completed" : "in_progress"

    payload.passed = passed
    payload.isCompleted = true 

    if (currentStep.type !== "assessment" || passed) {
      await markStepComplete(payload)
    }

    const isLessonComplete = checkLessonComplete(currentStep.lessonId)
    const isModuleComplete = checkModuleComplete(currentStep.moduleId)
    const isCourseComplete = checkCourseComplete()

    setCelebrationData({
      stepTitle: currentStep.title,
      stepType: currentStep.type,
      score,
      isLessonComplete,
      isModuleComplete,
      isCourseComplete,
      nextStepTitle: allSteps[currentStepIndex + 1]?.title,
      nextStepId: allSteps[currentStepIndex + 1]?.id,
    })

    setIsStepping(false)

    if (currentStep.type !== "assessment" || passed) {
      console.log("Step completed:", { currentStepIndex, allSteps })
      // setShowCelebration(true)
      // setShowCelebration(false)
      if (currentStepIndex < allSteps.length - 1) {
        handleNextStep()
      } else if (isLastStep && isCourseComplete) {
        setShowRating(true)
      }
    }
  }

  const handleNextStep = () => {
    if (currentStepIndex < allSteps.length - 1) {
      const nextIndex = currentStepIndex + 1
      setCurrentStepIndex(nextIndex)
    }
  }

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1
      setCurrentStepIndex(prevIndex)
    }
  }

  const handleStepSelect = (stepId: string) => {
    const stepIndex = allSteps.findIndex((step) => step.id === stepId)
    if (stepIndex >= 0) {
      setCurrentStepIndex(stepIndex)
    }
  }

  const checkAllStepsCompleted = (): boolean => {
    return allSteps.every((step) => isStepCompleted(step.id))
  }

  const handleCourseCompletionSelect = () => {
    setCurrentStepIndex(allSteps.length)
  }

  const checkLessonComplete = (lessonId: string): boolean => {
    const lessonSteps = allSteps.filter((step) => step.lessonId === lessonId)
    return lessonSteps.every((step) => isStepCompleted(step.id))
  }

  const checkModuleComplete = (moduleId: string): boolean => {
    const moduleSteps = allSteps.filter((step) => step.moduleId === moduleId)
    return moduleSteps.every((step) => isStepCompleted(step.id))
  }

  const checkCourseComplete = (): boolean => {
    return allSteps.every((step) => isStepCompleted(step.id))
  }

  const getProgressStats = () => {
    const completedSteps = allSteps.filter((step) => isStepCompleted(step.id))
    const assessmentSteps = allSteps.filter((step) => step.type === "assessment")
    const completedAssessments = assessmentSteps.filter((step) => isStepCompleted(step.id))

    const scores = completedAssessments
      .map((step) => getStepScore(step.id))
      .filter((score) => score !== undefined) as number[]

    return {
      overallProgress: calculateProgress(allSteps),
      completedLessons: completedSteps.filter((step) => step.type !== "assessment").length,
      totalLessons: allSteps.filter((step) => step.type !== "assessment").length,
      completedAssessments: completedAssessments.length,
      totalAssessments: assessmentSteps.length,
      timeSpent: completedSteps.reduce((total, step) => total + (step.duration || 0), 0),
      averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      streak: 7,
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-lg">Loading course...</p>
        </div>
      </div>
    )
  }

  if (error || !course || allSteps.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium">{error || "Course not found"}</p>
        </div>
      </div>
    )
  }

  const currentStep = allSteps[currentStepIndex]
  const progressStats = getProgressStats()
  const allStepsCompleted = checkAllStepsCompleted()
  const isOnCompletionStep = currentStepIndex === allSteps.length

  return (
    <div className="min-h-screen bg-background">
      <LearningNavigation
        courseTitle={course.title}
        courseId={id}
        currentStepTitle={isOnCompletionStep ? "Course Completion" : currentStep.title}
        currentStepIndex={currentStepIndex}
        totalSteps={allSteps.length + 1}
        canGoNext={currentStepIndex < allSteps.length}
        canGoPrevious={currentStepIndex > 0}
        onNext={handleNextStep}
        onPrevious={handlePreviousStep}
      />

      <div className="flex">
        <LearningSidebar
          modules={course.modules || []}
          currentStepId={isOnCompletionStep ? "course-completion" : currentStep.id}
          onStepSelect={handleStepSelect}
          onCourseCompletionSelect={handleCourseCompletionSelect}
          courseProgress={progressStats.overallProgress}
          progressData={progressData}
          isStepCompleted={isStepCompleted}
          allStepsCompleted={allStepsCompleted}
        />

        <div className="flex-1 ml-80 overflow-y-auto">
          <div className="p-8 max-w-5xl mx-auto">
            {isOnCompletionStep ? (
              <div className="space-y-8">
                <CourseCompletion
                  courseId={id}
                  courseTitle={course.title}
                  progressData={progressData}
                  allSteps={allSteps}
                  getStepScore={getStepScore}
                  course={course}
                />
                <CourseRating
                  courseId={id}
                  currentRating={userRating?.rating}
                  currentReview={userRating?.review}
                  onRatingSubmit={handleRatingSubmit}
                  reviews={courseReviews}
                />
              </div>
            ) : (
              <>
                {currentStep.type === "content" && (
                  <ContentScreen
                    lesson={{
                      id: currentStep.lessonId,
                      title: currentStep.lesson.title,
                      content: currentStep.lesson.content,
                      duration: currentStep.duration || 0,
                      resources: currentStep.lesson.resources,
                    }}
                    onComplete={(score, passed) => handleStepComplete(score,passed)}
                    isCompleted={isStepCompleted(currentStep.id)}
                    isStepping={isStepping}
                  />
                )}

                {currentStep.type === "video" && (
                  <VideoScreen
                    lesson={{
                      id: currentStep.lessonId,
                      title: currentStep.lesson.title,
                      videoUrl: currentStep.lesson.videoUrl,
                      duration: currentStep.duration || 0,
                    }}
                    onComplete={() => handleStepComplete()}
                    isCompleted={isStepCompleted(currentStep.id)}
                  />
                )}

                {currentStep.type === "assessment" && currentStep.assessment && (
                  <AssessmentScreen
                    key={`${currentStep.assessment.id}-${currentStepIndex}`}
                    assessment={currentStep.assessment}
                    onComplete={(score, passed) => handleStepComplete(score, passed)}
                    onRetake={() => {}}
                    isCompleted={isStepCompleted(currentStep.id)}
                    previousScore={getStepScore(currentStep.dbId)}
                    previousPassed={isStepCompleted(currentStep.id)}
                    isStepping={isStepping}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <CompletionCelebration
        isVisible={showCelebration}
        onClose={() => setShowCelebration(false)}
        {...celebrationData}
      />
    </div>
  )
}
