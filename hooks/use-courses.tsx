"use client"

import { useState, createContext, useContext, type ReactNode } from "react"
import { useAuth } from "./use-auth"
import type { Course } from "@/types"

interface CoursesContextType {
  courses: Course[]
  loading: boolean
  error: string | null
  fetchCourses: (forceRefresh?: boolean, type?: string) => Promise<void>
  getCourse: (id: string) => Course | undefined
  fetchSingleCourse: (id: string, type?: string) => Promise<Course | null>
  invalidateCache: () => void
  updateCourseInCache: (id: string, updates: Partial<Course>) => void
}
const CACHE_KEYS = {
  live: "courses_live",
  draft: "courses_draft",
  enrolled: "courses_enrolled",
  instructor: "courses_instructor",
  org: "courses_org",
};

const loadFromLocal = (key: string): Course[] => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const saveToLocal = (key: string, data: Course[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    console.error("Could not save to local")
  }
}

const CoursesContext = createContext<CoursesContextType | undefined>(undefined)

export function CoursesProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasFetched, setHasFetched] = useState(false)
  const { user, token } = useAuth()

  const fetchCourses = async (forceRefresh = false, type="live") => {

    if (!user || !token)return

    const cacheKey = CACHE_KEYS[type] || CACHE_KEYS.org;

    if (!forceRefresh) {
      const local = loadFromLocal(cacheKey)
      if (local.length > 0) {
        setCourses(local)
        return
      }
    }

    setLoading(true)
    setError(null)

    try {
      let url = ""

      if (user.role === "instructor") {
        url = `${process.env.NEXT_PUBLIC_API_URL}/courses/instructor/${user.id}/live/courses`
      } else if (user.role === "sysAdmin" && type === "draft") {
        url = `${process.env.NEXT_PUBLIC_API_URL}/courses/organization/${user?.organization?.id}/draft/courses`
      }else if (user.role === "sysAdmin") {
        url = `${process.env.NEXT_PUBLIC_API_URL}/courses/organization/${user.organization?.id}/courses`
      } else if (user.role === "student") {
        url = `${process.env.NEXT_PUBLIC_API_URL}/courses/student/${user.id}/enrolled`
      } else {
        // Default to public courses
        url = `${process.env.NEXT_PUBLIC_API_URL}/courses`
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = (await response.json()).courses || []
        saveToLocal(cacheKey, data)
        setCourses(data)
      } else {
        throw new Error("Failed to fetch courses")
      }
    } catch (err) {
      console.error(" Error fetching courses:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch courses")
    } finally {
      setLoading(false)
    }
  }

  const getCourse = (id: string, cacheKey = CACHE_KEYS.org) => {
    const store = loadFromLocal(cacheKey)
    const course = store.find((course) => Number(course.id) === Number(id))
    return course
  }

  const fetchSingleCourse = async (id: string, type="org"): Promise<Course | null> => {
    // First check cache
    const cacheKey = CACHE_KEYS[type] || CACHE_KEYS.org;

    const cachedCourse = getCourse(id, cacheKey)
    if (cachedCourse) return cachedCourse

    // If not in cache, fetch it
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const course = await response.json()
        // Add to cache
        saveToLocal(cacheKey, [
          ...loadFromLocal(cacheKey),
          course
        ])

        return course

      }
      return null
    } catch (err) {
      console.error(" Error fetching single course:", err)
      return null
    }
  }

  const invalidateCache = () => {
    setCourses([])
    setHasFetched(false)
    localStorage.removeItem(LS_KEY)
  }

  const updateCourseInCache = (id: string, updates: Partial<Course>) => {
    setCourses(prev => {
      const updated = prev.map(c => (c.id === id ? { ...c, ...updates } : c))
      saveToLocal(updated)
      return updated
    })
  }

  return (
    <CoursesContext.Provider
      value={{
        courses,
        loading,
        error,
        fetchCourses,
        getCourse,
        fetchSingleCourse,
        invalidateCache,
        updateCourseInCache,
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
