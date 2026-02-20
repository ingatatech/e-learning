"use client"

import useSWR, { mutate } from "swr"
import { useAuth } from "./use-auth"
import { fetcher } from "@/lib/fetcher"
import type { User, PrivateMessage, CommentReport, InstructorActivity } from "@/types"
import { API_ENDPOINTS } from "@/lib/constants"

interface RegistrarDashboard {
  instructors: User[]
  pendingReports: CommentReport[]
  recentActivity: InstructorActivity[]
}

export function useRegistrar() {
  const { token, user } = useAuth()

  const {
    data: dashboardData,
    error: dashboardError,
    isLoading: dashboardLoading,
    mutate: mutateDashboard,
  } = useSWR(
    token && user?.role === "registrar"
      ? `${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.REGISTRAR.DASHBOARD}`
      : null,
    (url: string) => fetcher(url, token!),
    { revalidateOnFocus: true, dedupingInterval: 5000 },
  )

  const {
    data: instructorsData,
    error: instructorsError,
    isLoading: instructorsLoading,
  } = useSWR(
    token && user?.role === "registrar"
      ? `${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.REGISTRAR.GET_INSTRUCTORS}`
      : null,
    (url: string) => fetcher(url, token!),
    { revalidateOnFocus: false, dedupingInterval: 5000 },
  )

  const {
    data: messagesData,
    error: messagesError,
    isLoading: messagesLoading,
  } = useSWR(null, (url: string) => fetcher(url, token!), { revalidateOnFocus: false, dedupingInterval: 3000 })

  const {
    data: activitiesData,
    error: activitiesError,
    isLoading: activitiesLoading,
  } = useSWR(null, (url: string) => fetcher(url, token!), { revalidateOnFocus: false, dedupingInterval: 5000 })

  const {
    data: reportsData,
    error: reportsError,
    isLoading: reportsLoading,
    mutate: mutateReports,
  } = useSWR(
    token && user?.role === "registrar"
      ? `${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.REGISTRAR.REVIEW_COMMENT_REPORT}`
      : null,
    (url: string) => fetcher(url, token!),
    { revalidateOnFocus: true, dedupingInterval: 3000 },
  )

  // Get instructor's messages
  const getInstructorMessages = (instructorId: string) => {
    const url =
      token && user?.role === "registrar"
        ? `${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.REGISTRAR.GET_INSTRUCTOR_MESSAGES}?instructorId=${instructorId}`
        : null

    messagesData.mutate(url)
  }

  // Get instructor's activity
  const getInstructorActivity = (instructorId: string) => {
    const url =
      token && user?.role === "registrar"
        ? `${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.REGISTRAR.GET_INSTRUCTOR_ACTIVITY}?instructorId=${instructorId}`
        : null

    activitiesData.mutate(url)
  }

  // Review a comment report
  const reviewReport = async (reportId: string, status: "resolved" | "reviewed", resolutionNotes?: string) => {
    if (!token) throw new Error("No token available")

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.REGISTRAR.REVIEW_COMMENT_REPORT}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reportId, status, resolutionNotes }),
        },
      )

      if (!response.ok) throw new Error("Failed to review report")
      const data = await response.json()

      await mutate((key) => typeof key === "string" && key.includes("registrar"), undefined, { revalidate: true })

      return data.report as CommentReport
    } catch (error) {
      console.error("Error reviewing report:", error)
      throw error
    }
  }

  return {
    dashboard: dashboardData?.dashboard as RegistrarDashboard | undefined,
    dashboardLoading,
    dashboardError,
    mutateDashboard,
    instructors: (instructorsData?.instructors || []) as User[],
    instructorsLoading,
    instructorsError,
    getInstructorMessages,
    messages: (messagesData?.messages || []) as PrivateMessage[],
    messagesLoading,
    messagesError,
    getInstructorActivity,
    activities: (activitiesData?.activities || []) as InstructorActivity[],
    activitiesLoading,
    activitiesError,
    pendingReports: (reportsData?.reports || []) as CommentReport[],
    reportsLoading,
    reportsError,
    mutateReports,
    reviewReport,
  }
}
