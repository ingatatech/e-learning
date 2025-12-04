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
  updateCourseInCache: (id: string, updates: Partial<Course>, type?: string) => void
}
const CACHE_KEYS = {
  live: "LIS_courses_live",
  draft: "LIS_courses_draft",
  enrolled: "LIS_courses_enrolled",
  instructor: "LIS_courses_instructor",
  org: "LIS_courses_org",
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

        if (type === "live") {
          url = `${process.env.NEXT_PUBLIC_API_URL}/courses/instructor/${user.id}/live/courses`
        } else if (type === "all") {
          url = `${process.env.NEXT_PUBLIC_API_URL}/courses/instructor/${user?.id}/courses`
        } else if (type === "org") {
          url = `${process.env.NEXT_PUBLIC_API_URL}/courses/organization/${user.organization?.id}/courses`
        } else if (type === "draft") {
          url = `${process.env.NEXT_PUBLIC_API_URL}/courses/organization/${user?.organization?.id}/draft/courses`
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/get/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const course = await response.json()
        // Add to cache
        saveToLocal(cacheKey, [
          ...loadFromLocal(cacheKey),
          course.course,
        ])

        return course.course

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

  const updateCourseInCache = (id: string, updates: Partial<Course>, type="org") => {
    setCourses(prev => {
      const updated = prev.map(c => (c.id === id ? { ...c, ...updates } : c))
      saveToLocal(type, updated)
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
