"use client"

import { useCallback } from "react"
import { useAuth } from "@/hooks/use-auth"
import useSWR, { mutate } from "swr"
import { fetcher } from "@/lib/fetcher"

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

  const getCacheKey = () => {
    if (!token || !user || !courseId) return null
    return `${process.env.NEXT_PUBLIC_API_URL}/progress/course/${courseId}/user/${user.id}`
  }

  const {
    data: progressData,
    error,
    isLoading,
    mutate: mutateProgress,
  } = useSWR(
    getCacheKey(),
    async (url) => {
      try {
        const response = await fetcher(url, token!)
        return response.progress
      } catch (err) {
        // If no progress exists, return empty progress
        return {
          courseId,
          userId: user!.id,
          overallProgress: 0,
          completedSteps: [],
          currentStepId: "",
          lastAccessedAt: new Date().toISOString(),
        } as ProgressData
      }
    },
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    },
  )

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
      return Number(step.lessonId) === Number(lastStep.lessonId)
    })

    if (lastStepIndex < 0) {
    return allSteps[0] || null
    }

    const lastStepObj = isStepCompletedHelper(allSteps[lastStepIndex], progressData)
      ? allSteps[lastStepIndex + 1]
      : allSteps[lastStepIndex]
      
    return lastStepObj
  }

  // Helper to check if a step is completed
  const isStepCompletedHelper = (step: LearningStep, progressData: ProgressData) => {
    if (step.type === "assessment" && step.assessment) {
      return progressData.completedSteps.some((s) => s.assessmentId === step.assessment.id && s.isCompleted)
    }
    return progressData.completedSteps.some(
      (s) => String(s.lessonId) === String(step.lessonId) && !s.assessmentId && s.isCompleted,
    )
  }

  const markStepComplete = useCallback(
    async (payload: {
      courseId: string
      userId: string
      lessonId?: string
      assessmentId?: string
      score?: number
      status?: "in_progress" | "completed"
      passed?: boolean
      isCompleted?: boolean
    }) => {
      if (!token || !payload.passed) return

      const cacheKey = getCacheKey()
      if (!cacheKey) return

      // Optimistically update the cache
      await mutate(
        cacheKey,
        async (currentData: any) => {
          if (!currentData) return currentData

          const stepId = payload.assessmentId ? `${payload.assessmentId}-assessment` : `${payload.lessonId}-lesson`
          const updatedSteps = [...currentData.completedSteps]
          const existingStepIndex = updatedSteps.findIndex((step: any) => step.id === stepId)

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
            ...currentData,
            completedSteps: updatedSteps,
            lastAccessedAt: new Date().toISOString(),
          }
        },
        { revalidate: false }, // Don't revalidate immediately
      )

      // Then make the API call
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/progress/complete-step`, {
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

        // Revalidate after successful API call
        mutateProgress()
      } catch (err) {
        console.error("Failed to mark step complete:", err)
        // Revert optimistic update on error
        mutateProgress()
      }
    },
    [token, mutateProgress],
  )

  const updateCurrentStep = useCallback(
    async (stepId: string) => {
      if (!token || !user) return

      const cacheKey = getCacheKey()
      if (!cacheKey) return

      // Optimistically update
      await mutate(
        cacheKey,
        (currentData: any) =>
          currentData
            ? {
                ...currentData,
                currentStepId: stepId,
                lastAccessedAt: new Date().toISOString(),
              }
            : null,
        { revalidate: false },
      )

      // Then make API call
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

        mutateProgress()
      } catch (err) {
        console.error("Failed to update current step:", err)
        mutateProgress()
      }
    },
    [token, user, courseId, mutateProgress],
  )

  // Calculate overall progress
  const calculateProgress = useCallback(
    (allSteps: LearningStep[]) => {
      if (!progressData) return 0

      const completedCount = allSteps.filter((step) => {
        if (step.type === "assessment" && step.assessment) {
          return progressData.completedSteps.some((s: { assessmentId: any; isCompleted: any }) => s.assessmentId === step.assessment.id && s.isCompleted)
        }
        return progressData.completedSteps.some(
          (s: { lessonId: any; assessmentId: any; isCompleted: any }) => String(s.lessonId) === String(step.lessonId) && !s.assessmentId && s.isCompleted,
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

      const parts = stepId.split("-")
      const lessonId = parts[0]
      const stepType = parts[1]
      const assessmentId = parts[2]

      if (stepType === "assessment" && assessmentId) {
        return progressData.completedSteps.some(
          (s: { assessmentId: { toString: () => string }; isCompleted: any }) => s.assessmentId && s.assessmentId.toString() === assessmentId && s.isCompleted,
        )
      }

      return progressData.completedSteps.some(
        (s: { lessonId: any; assessmentId: any; isCompleted: any }) => String(s.lessonId) === lessonId && !s.assessmentId && s.isCompleted,
      )
    },
    [progressData],
  )

  // Get step score
  const getStepScore = useCallback((dbId: string) => {
      if (!progressData) return null

      const completedStep = progressData.completedSteps.find((step: { lessonId: string; assessmentId: number }) =>
          (step.lessonId && step.lessonId === dbId) || (step.assessmentId && step.assessmentId === Number(dbId)),
      )

      return completedStep?.score ?? null
    },
    [progressData],
  )

  const markStepPending = useCallback(
    async (payload: { courseId: string; userId: string; lessonId?: string; assessmentId?: string }) => {
      if (!token) return

      const cacheKey = getCacheKey()
      if (!cacheKey) return

      // Optimistically update
      await mutate(
        cacheKey,
        (currentData: any) => {
          if (!currentData) return currentData

          const stepId = payload.assessmentId ? `${payload.assessmentId}-assessment` : `${payload.lessonId}-lesson`
          const updatedSteps = [...currentData.completedSteps]
          const existingIndex = updatedSteps.findIndex((s: any) => s.id === stepId)

          const stepData: LearningStep = {
            id: stepId,
            type: payload.assessmentId ? "assessment" : "content",
            lessonId: payload.lessonId || "",
            assessmentId: payload.assessmentId ? Number(payload.assessmentId) : undefined,
            isCompleted: false,
            status: "pending",
            dbId: "",
          }

          if (existingIndex >= 0) {
            updatedSteps[existingIndex] = { ...updatedSteps[existingIndex], ...stepData }
          } else {
            updatedSteps.push(stepData)
          }

          return { ...currentData, completedSteps: updatedSteps }
        },
        { revalidate: false },
      )

      // Then make API call
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/progress/pending-step`, {
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

        mutateProgress()
      } catch (err) {
        console.error("Failed to mark step pending:", err)
        mutateProgress()
      }
    },
    [token, mutateProgress],
  )

  // Check if step is pending
  const isStepPending = useCallback(
    (stepId: string) => {
      if (!progressData) return false

      const parts = stepId.split("-")
      const assessmentId = parts[2]

      const step = progressData.completedSteps.find((s: { assessmentId: { toString: () => string } }) => s.assessmentId?.toString() === assessmentId)
      return step?.status === "pending"
    },
    [progressData],
  )

  const isStepFailed = useCallback(
    (stepId: string) => {
      if (!progressData) return false

      const parts = stepId.split("-")
      const assessmentId = parts[2]

      const step = progressData.completedSteps.find((s: { assessmentId: { toString: () => string } }) => s.assessmentId?.toString() === assessmentId)
      return step?.status === "failed"
    },
    [progressData],
  )

  return {
    progressData,
    loading: isLoading,
    error,
    markStepComplete,
    getCurrentStep,
    updateCurrentStep,
    calculateProgress,
    isStepCompleted,
    getStepScore,
    refetch: mutateProgress,
    markStepPending,
    isStepPending,
    isStepFailed,
  }
}
