"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/hooks/use-auth"
import { progress } from "framer-motion"

interface LearningStep {
  id: string
  type: "content" | "video" | "assessment"
  lessonId: string
  isCompleted: boolean
  completedAt?: string
  score?: number
  assessment?: any
  assessmentId?: number
}

interface ProgressData {
  courseId: string
  userId: string
  overallProgress: number
  completedSteps: LearningStep[]
  currentStepId: string
  lastAccessedAt: string
}

export function useLearningProgress(courseId: string) {
  const { token, user } = useAuth()
  const [progressData, setProgressData] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch progress data from backend
  const fetchProgress = useCallback(async () => {
    if (!token || !user || !courseId) return

    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/progress/course/${courseId}/user/${user.id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProgressData(data.progress)
        setError(null)
      } else {
        // If no progress exists, initialize with empty progress
        setProgressData({
          courseId,
          userId: user.id,
          overallProgress: 0,
          completedSteps: [],
          currentStepId: "",
          lastAccessedAt: new Date().toISOString(),
        })
      }
    } catch (err) {
      console.error("Failed to fetch progress:", err)
      setError("Failed to load progress data")
    } finally {
      setLoading(false)
    }
  }, [token, user, courseId])

  // Mark a step as completed
  const markStepComplete = useCallback(
  async (payload: { courseId: string; userId: string; lessonId?: string; assessmentId?: string; score?: number }) => {
    if (!token) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/progress/complete-step`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...payload,
          completedAt: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Optimistically update local state if needed
        setProgressData((prev) => {
          if (!prev) return prev

          const stepId = payload.assessmentId ? `${payload.assessmentId}-assessment` : `${payload.lessonId}-lesson`
          const updatedSteps = [...prev.completedSteps]
          const existingStepIndex = updatedSteps.findIndex((step) => step.id === stepId)

          const stepData = {
            id: stepId,
            type: payload.assessmentId ? "assessment" : "lesson",
            lessonId: payload.lessonId,
            assessmentId: payload.assessmentId,
            isCompleted: true,
            completedAt: new Date().toISOString(),
            score: payload.score,
          }

          if (existingStepIndex >= 0) {
            updatedSteps[existingStepIndex] = stepData
          } else {
            updatedSteps.push(stepData)
          }

          return {
            ...prev,
            completedSteps: updatedSteps,
            lastAccessedAt: new Date().toISOString(),
          }
        })
      }
    } catch (err) {
      console.error("Failed to mark step complete:", err)
    }
  },
  [token]
)



  // Update current step
  const updateCurrentStep = useCallback(
    async (stepId: string) => {
      if (!token || !user) return

      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/progress/update-current-step`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            courseId,
            userId: user.id,
            currentStepId: stepId,
            lastAccessedAt: new Date().toISOString(),
          }),
        })

        // Update local state
        setProgressData((prev) =>
          prev
            ? {
                ...prev,
                currentStepId: stepId,
                lastAccessedAt: new Date().toISOString(),
              }
            : null,
        )
      } catch (err) {
        console.error("Failed to update current step:", err)
      }
    },
    [token, user, courseId],
  )

  // Calculate overall progress
  const calculateProgress = useCallback(
    (allSteps: LearningStep[]) => {
      if (!progressData) return 0

      const completedCount = allSteps.filter((step) => {
        if (step.type === "assessment" && step.assessment) {
          return progressData.completedSteps.some(
            (s) => s.assessmentId === step.assessment.id && s.isCompleted
          )
        }
        // For content/video steps
        return progressData.completedSteps.some(
        s => String(s.lessonId) === String(step.lessonId) && !s.assessmentId && s.isCompleted
      )
      }).length

      return allSteps.length > 0 ? (completedCount / allSteps.length) * 100 : 0
    },
    [progressData]
  )


  // Check if a step is completed
  const isStepCompleted = useCallback(
    (step: { lessonId?: string; assessmentId?: string }) => {
      if (!progressData) return false

      if (step.assessmentId) {
        return progressData.completedSteps.some(
          (s) => s.assessmentId === step.assessmentId && s.isCompleted
        )
      }

      if (step.lessonId) {
        return progressData.completedSteps.some(
          (s) => String(s.lessonId) === String(step.lessonId) && !s.assessmentId && s.isCompleted
        )
      }

      return false
    },
    [progressData]
  )


  // Get step score
  const getStepScore = useCallback(
    (stepId: string) => {
      return progressData?.completedSteps.find((step) => step.id === stepId)?.score
    },
    [progressData],
  )

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  return {
    progressData,
    loading,
    error,
    markStepComplete,
    updateCurrentStep,
    calculateProgress,
    isStepCompleted,
    getStepScore,
    refetch: fetchProgress,
  }
}
