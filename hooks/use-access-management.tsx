"use client"

import useSWR, { mutate } from "swr"
import { useAuth } from "./use-auth"
import { fetcher } from "@/lib/fetcher"
import type { Enrollment, AccessExtension } from "@/types"
import { API_ENDPOINTS } from "@/lib/constants"

interface AccessStatus {
  enrollment: Enrollment
  daysRemaining: number
  isAboutToExpire: boolean
  isExpired: boolean
  totalAccessDays: number
  canExtend: boolean
}

export function useAccessManagement() {
  const { token, user } = useAuth()

  const {
    data: extensionHistory,
    error: extensionError,
    isLoading: isExtensionLoading,
  } = useSWR(
    token ? `${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.ACCESS.GET_EXTENSIONS}` : null,
    (url: string) => fetcher(url, token!),
    { revalidateOnFocus: false, dedupingInterval: 2000 },
  )

  // Check access status for a specific enrollment
  const checkAccessStatus = async (enrollmentId: string): Promise<AccessStatus | null> => {
    if (!token) return null

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.ACCESS.CHECK_STATUS}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enrollmentId }),
      })

      if (!response.ok) throw new Error("Failed to check access status")
      const data = await response.json()
      return data.accessStatus
    } catch (error) {
      console.error("Error checking access status:", error)
      return null
    }
  }

  // Request access extension
  const requestExtension = async (enrollmentId: string, daysRequested: number) => {
    if (!token) throw new Error("No token available")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.ACCESS.REQUEST_EXTENSION}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enrollmentId, daysRequested }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to request extension")
      }

      const data = await response.json()
      // Invalidate cache after successful extension request
      await mutate((key) => typeof key === "string" && key.includes("enrollments"), undefined, { revalidate: true })
      return data.extension
    } catch (error) {
      console.error("Error requesting extension:", error)
      throw error
    }
  }

  // Get extension history for an enrollment
  const getExtensionHistory = (enrollmentId: string) => {
    return {
      extensions: (extensionHistory?.extensions || []).filter(
        (ext) => ext.enrollmentId === enrollmentId,
      ) as AccessExtension[],
      loading: isExtensionLoading,
      error: extensionError,
    }
  }

  // Revoke access (called after 1 year)
  const revokeAccess = async (enrollmentId: string) => {
    if (!token) throw new Error("No token available")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.ACCESS.REVOKE_ACCESS}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enrollmentId }),
      })

      if (!response.ok) throw new Error("Failed to revoke access")
      const data = await response.json()
      await mutate((key) => typeof key === "string" && key.includes("enrollments"), undefined, { revalidate: true })
      return data
    } catch (error) {
      console.error("Error revoking access:", error)
      throw error
    }
  }

  return {
    checkAccessStatus,
    requestExtension,
    getExtensionHistory,
    revokeAccess,
  }
}
