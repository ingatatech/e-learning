"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useAuth } from "./use-auth"
import type { Course } from "@/types"
import useSWR, { mutate } from "swr"
import { fetcher, postFetcher } from "@/lib/fetcher"

interface CoursesContextType {
  // Fetch courses by type
  useCoursesByType: (type: "live" | "draft" | "all" | "org" | "enrolled") => {
    courses: Course[]
    loading: boolean
    error: any
    mutate: () => void
  }
  // Get single course
  useCourse: (id: string) => {
    course: Course | undefined
    loading: boolean
    error: any
    mutate: () => void
  }
  // Update course in cache
  updateCourseInCache: (id: string, updates: Partial<Course>, type?: string) => Promise<void>
  // Invalidate all course caches
  invalidateAllCaches: () => Promise<void>
}

const CoursesContext = createContext<CoursesContextType | undefined>(undefined)

export function CoursesProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth()

  const useCoursesByType = (type: "live" | "draft" | "all" | "org" | "enrolled") => {
    // Generate cache key based on type and user
    const getCacheKey = () => {
      if (!user || !token) return null

      const baseUrl = process.env.NEXT_PUBLIC_API_URL

      switch (type) {
        case "live":
          return `${baseUrl}/courses/instructor/${user.id}/live/courses`
        case "all":
          return `${baseUrl}/courses/instructor/${user.id}/courses`
        case "org":
          return `${baseUrl}/courses/organization/${user.organization?.id}/courses`
        case "draft":
          return `${baseUrl}/courses/organization/${user.organization?.id}/draft/courses`
        case "enrolled":
          return `${baseUrl}/enrollments/user-enrollments`
        default:
          return null
      }
    }

    const { data, error, isLoading, mutate } = useSWR(
      getCacheKey(), 
      (url: string) => {
        if (type === 'enrolled') {
        return postFetcher(url, { arg: { userId: user!.id } }, token!)
        } else {
          return fetcher(url, token!)
        }
      }, {
      // Revalidate on focus (when user switches back to tab)
      revalidateOnFocus: true,
      // Revalidate on reconnect
      revalidateOnReconnect: true,
      // Dedupe requests within 2 seconds
      dedupingInterval: 2000,
      // Cache data for 5 minutes
      focusThrottleInterval: 5 * 60 * 1000,
      // Retry on error
      shouldRetryOnError: true,
      errorRetryCount: 3,
    })

    return {
      courses: data?.courses || data?.enrollments || [],
      loading: isLoading,
      error,
      mutate,
    }
  }

  const useCourse = (id: string) => {
    const getCacheKey = () => {
      if (!token || !id) return null
      return `${process.env.NEXT_PUBLIC_API_URL}/courses/get/${id}`
    }

    const {
      data,
      error,
      isLoading,
      mutate: mutateCourse,
    } = useSWR(getCacheKey(), (url: string) => fetcher(url, token!), {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    })

    return {
      course: data?.course,
      loading: isLoading,
      error,
      mutate: mutateCourse,
    }
  }

  const updateCourseInCache = async (id: string, updates: Partial<Course>, type = "org") => {
    // Get all possible cache keys for this course
    const cacheKeys = [
      `${process.env.NEXT_PUBLIC_API_URL}/courses/get/${id}`,
      `${process.env.NEXT_PUBLIC_API_URL}/courses/instructor/${user?.id}/live/courses`,
      `${process.env.NEXT_PUBLIC_API_URL}/courses/instructor/${user?.id}/courses`,
      `${process.env.NEXT_PUBLIC_API_URL}/courses/organization/${user?.organization?.id}/courses`,
      `${process.env.NEXT_PUBLIC_API_URL}/courses/organization/${user?.organization?.id}/draft/courses`,
    ]

    // Optimistically update all caches
    await Promise.all(
      cacheKeys.map((key) =>
        mutate(
          key,
          (data: any) => {
            if (!data) return data

            // Update single course
            if (data.course) {
              return {
                ...data,
                course: { ...data.course, ...updates },
              }
            }

            // Update course in list
            if (data.courses) {
              return {
                ...data,
                courses: data.courses.map((course: Course) => (course.id === id ? { ...course, ...updates } : course)),
              }
            }

            return data
          },
          { revalidate: false }, // Don't revalidate immediately
        ),
      ),
    )
  }

  const invalidateAllCaches = async () => {
    const cacheKeys = [
      `${process.env.NEXT_PUBLIC_API_URL}/courses/instructor/${user?.id}/live/courses`,
      `${process.env.NEXT_PUBLIC_API_URL}/courses/instructor/${user?.id}/courses`,
      `${process.env.NEXT_PUBLIC_API_URL}/courses/organization/${user?.organization?.id}/courses`,
      `${process.env.NEXT_PUBLIC_API_URL}/courses/organization/${user?.organization?.id}/draft/courses`,
      `${process.env.NEXT_PUBLIC_API_URL}/enrollments/user-enrollments`,
    ]

    // Invalidate all caches
    await Promise.all(cacheKeys.map((key) => mutate(key)))
  }

  return (
    <CoursesContext.Provider
      value={{
        useCoursesByType,
        useCourse,
        updateCourseInCache,
        invalidateAllCaches,
      }}
    >
      {children}
    </CoursesContext.Provider>
  )
}

export function useCourses() {
  const context = useContext(CoursesContext)
  if (context === undefined) {
    throw new Error("useCourses must be used within a CoursesProvider")
  }
  return context
}
