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

interface LearningStep {
  id: string
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

  const [allSteps, setAllSteps] = useState<LearningStep[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationData, setCelebrationData] = useState<any>({})

  const { progressData, markStepComplete, calculateProgress, isStepCompleted, getStepScore } =
    useLearningProgress(id)

  useEffect(() => {
    const fetchCourseAndEnrollment = async () => {
      if (!token || !user) return

      try {
        setLoading(true)

        const courseResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/get/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (courseResponse.ok) {
          const courseData = await courseResponse.json()
          setCourse(courseData.course)

          const steps = generateLearningSteps(courseData.course)
          setAllSteps(steps)

          // Set initial step based on progress or start from beginning
          const currentStep = progressData?.currentStepId
            ? steps.findIndex((step) => step.id === progressData.currentStepId)
            : 0
          setCurrentStepIndex(Math.max(0, currentStep))

          setError(null)
        } else {
          setError("Failed to fetch course details")
        }
      } catch (error) {
        console.error("Failed to fetch course or enrollment:", error)
        setError("An error occurred while fetching course details")
      } finally {
        setLoading(false)
      }
    }

    fetchCourseAndEnrollment()
  }, [token, id, user, progressData?.currentStepId])

  const generateLearningSteps = (course: Course): LearningStep[] => {
    const steps: LearningStep[] = []

    course.modules?.forEach((module) => {
      // Sort lessons by order, then handle projects last
      const sortedLessons = [...module.lessons].sort((a, b) => {
        if (a.isProject && !b.isProject) return 1
        if (!a.isProject && b.isProject) return -1
        return a.order - b.order
      })

      sortedLessons.forEach((lesson) => {
        // Add content step if lesson has content
        if (lesson.content && lesson.content.trim()) {
          steps.push({
            id: `${lesson.id}-content`,
            type: "content",
            title: `${lesson.title} - Reading`,
            lessonId: lesson.id.toString(),
            moduleId: module.id.toString(),
            lesson,
            duration: lesson.duration ,
          })
        }

        // Add video step if lesson has video
        if (lesson.videoUrl && lesson.videoUrl.trim()) {
          steps.push({
            id: `${lesson.id}-video`,
            type: "video",
            title: `${lesson.title} - Video`,
            lessonId: lesson.id.toString(),
            moduleId: module.id.toString(),
            lesson,
            duration: lesson.content ? Math.ceil(lesson.duration / 2) : lesson.duration,
          })
        }

        // Add assessment steps if lesson has assessments
        lesson.assessments?.forEach((assessment, index) => {
          steps.push({
            id: `${lesson.id}-assessment-${assessment.id}`,
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

  const handleStepComplete = async (score?: number) => {
    const currentStep = allSteps[currentStepIndex]
    if (!currentStep) return

    // Map step to the correct payload for backend
    const payload: any = {
      courseId: id,
      userId: user?.id,
    }

    if (currentStep.type === "assessment" && currentStep.assessment) {
      payload.assessmentId = currentStep.assessment.id
      if (score !== undefined) payload.score = score
    } else {
      payload.lessonId = currentStep.lessonId
    }

    await markStepComplete(payload)

    // Check if lesson/module/course is complete
    const isLessonComplete = checkLessonComplete(currentStep.lessonId)
    const isModuleComplete = checkModuleComplete(currentStep.moduleId)
    const isCourseComplete = checkCourseComplete()

    // Show celebration
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
    setShowCelebration(true)

    // Auto-advance to next step after a delay
    setTimeout(() => {
      handleNextStep()
    }, 2000)
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
      streak: 7, // This would come from backend
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

  return (
    <div className="min-h-screen bg-background">
      <LearningNavigation
        courseTitle={course.title}
        courseId={id}
        currentStepTitle={currentStep.title}
        currentStepIndex={currentStepIndex}
        totalSteps={allSteps.length}
        canGoNext={currentStepIndex < allSteps.length - 1}
        canGoPrevious={currentStepIndex > 0}
        onNext={handleNextStep}
        onPrevious={handlePreviousStep}
      />

      <div className="flex">
        <LearningSidebar
          modules={course.modules || []}
          currentStepId={currentStep.id}
          onStepSelect={handleStepSelect}
          courseProgress={progressStats.overallProgress}
        />

        <div className="flex-1 ml-80 overflow-y-auto">
          <div className="p-8 max-w-5xl mx-auto">
            {/* Current Step Content */}
            {currentStep.type === "content" && (
              <ContentScreen
                lesson={{
                  id: currentStep.lessonId,
                  title: currentStep.lesson.title,
                  content: currentStep.lesson.content,
                  duration: currentStep.duration || 0,
                }}
                onComplete={() => handleStepComplete()}
                isCompleted={isStepCompleted(currentStep.id)}
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
                assessment={currentStep.assessment}
                onComplete={(score) => handleStepComplete(score)}
                isCompleted={isStepCompleted(currentStep.id)}
              />
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
