"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/hooks/use-auth"

interface LearningStep {
  id: string
  dbId: string
  type: "content" | "video" | "assessment"
  lessonId: string
  isCompleted: boolean
  completedAt?: string
  score?: number
  assessment?: any
  assessmentId?: number
  status?: "pending" | "completed" | "failed"
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

  const getCurrentStep = (allSteps: LearningStep[], progressData: ProgressData | null): LearningStep | null => {
  if (!progressData || !allSteps.length) return allSteps[0] || null

  // Sort completed steps by completedAt
  const sortedCompleted = [...progressData.completedSteps]
    .filter((s) => s.isCompleted)
    .sort((a, b) => new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime())

  const lastStep = sortedCompleted[sortedCompleted.length - 1]
  if (!lastStep) return allSteps[0] || null

  const lastStepIndex = allSteps.findIndex((step) => {
    if (lastStep.assessmentId) return step.assessment?.id === lastStep.assessmentId
    return step.lessonId === lastStep.lessonId
  })

  if (lastStepIndex < 0) return allSteps[0] || null

  const lastStepObj = allSteps[lastStepIndex]

  // If the last step is marked completed, move to next, else stay on it
  if (isStepCompletedHelper(lastStepObj, progressData)) {
    const nextIndex = lastStepIndex + 1 < allSteps.length ? lastStepIndex + 1 : lastStepIndex
    return allSteps[nextIndex]
  }

  return lastStepObj
}

// Helper to check if a step is completed
const isStepCompletedHelper = (step: LearningStep, progressData: ProgressData) => {
  if (step.type === "assessment" && step.assessment) {
    return progressData.completedSteps.some(
      (s) => s.assessmentId === step.assessment.id && s.isCompleted
    )
  }
  return progressData.completedSteps.some(
    (s) => String(s.lessonId) === String(step.lessonId) && !s.assessmentId && s.isCompleted
  )
}


  // Mark a step as completed
  const markStepComplete = useCallback(
    async (payload: { courseId: string; userId: string; lessonId?: string; assessmentId?: string; score?: number, status?: "in_progress" | "completed", passed?: boolean, isCompleted?: boolean }) => {
      if (!token) return
      if (!payload.passed) return

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
              isCompleted: !!payload.isCompleted,
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
    [token],
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
          return progressData.completedSteps.some((s) => s.assessmentId === step.assessment.id && s.isCompleted)
        }
        // For content/video steps
        return progressData.completedSteps.some(
          (s) => String(s.lessonId) === String(step.lessonId) && !s.assessmentId && s.isCompleted,
        )
      }).length

      return allSteps.length > 0 ? (completedCount / allSteps.length) * 100 : 0
    },
    [progressData],
  )

  // Check if a step is completed
  const isStepCompleted = useCallback(
    (stepId: string) => {
      if (!progressData) return false

      // Parse step ID to get lesson/assessment info
      const parts = stepId.split("-")
      const lessonId = parts[0]
      const stepType = parts[1] // content, video, assessment
      const assessmentId = parts[2] // only for assessments

      if (stepType === "assessment" && assessmentId) {
        return progressData.completedSteps.some(
          (s) => s.assessmentId && s.assessmentId.toString() === assessmentId && s.isCompleted,
        )
      }

      // For content/video steps, check by lessonId and step type
      return progressData.completedSteps.some(
        (s) => String(s.lessonId) === lessonId && !s.assessmentId && s.isCompleted,
      )
    },
    [progressData],
  )

  // Get step score
  const getStepScore = useCallback(
    (dbId: string) => {
       if (!progressData) return null;

    const completedStep = progressData.completedSteps.find(
      (step) =>
        (step.lessonId && step.lessonId === dbId) ||
        (step.assessmentId && step.assessmentId === Number(dbId))
    );

    return completedStep?.score ?? null;
    },
    [progressData],
  )

  // Mark a step as pending
const markStepPending = useCallback(
  async (payload: { courseId: string; userId: string; lessonId?: string; assessmentId?: string }) => {
    if (!token) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/progress/pending-step`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...payload,
          status: "pending",
          lastAccessedAt: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        // update local state optimistically
        setProgressData((prev) => {
          if (!prev) return prev

          const stepId = payload.assessmentId
            ? `${payload.assessmentId}-assessment`
            : `${payload.lessonId}-lesson`

          const updatedSteps = [...prev.completedSteps]
          const existingIndex = updatedSteps.findIndex((s) => s.id === stepId)

          const stepData: LearningStep = {
            id: stepId,
            type: payload.assessmentId ? "assessment" : "content",
            lessonId: payload.lessonId || "",
            assessmentId: payload.assessmentId ? Number(payload.assessmentId) : undefined,
            isCompleted: false,
            status: "pending",
          }

          if (existingIndex >= 0) {
            updatedSteps[existingIndex] = { ...updatedSteps[existingIndex], ...stepData }
          } else {
            updatedSteps.push(stepData)
          }

          return { ...prev, completedSteps: updatedSteps }
        })
      }
    } catch (err) {
      console.error("Failed to mark step pending:", err)
    }
  },
  [token],
)

// Check if step is pending
const isStepPending = useCallback(
  (stepId: string) => {
    if (!progressData) return false

    // Parse step ID to get lesson/assessment info
      const parts = stepId.split("-")
      const assessmentId = parts[2] // only for assessments

    const step = progressData.completedSteps.find((s) => s.assessmentId?.toString() === assessmentId)
    return step?.status === "pending"
  },
  [progressData],
)

const isStepFailed = useCallback(
  (stepId: string) => {
    if (!progressData) return false

    // Parse step ID to get lesson/assessment info
      const parts = stepId.split("-")
      const assessmentId = parts[2] // only for assessments

    const step = progressData.completedSteps.find((s) => s.assessmentId?.toString() === assessmentId)
    return step?.status === "failed"
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
    getCurrentStep,
    updateCurrentStep,
    calculateProgress,
    isStepCompleted,
    getStepScore,
    refetch: fetchProgress,
    markStepPending,
    isStepPending,
    isStepFailed
  }
}
