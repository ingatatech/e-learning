"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { getUserFromToken } from "@/lib/auth-guard"
import { Loader2 } from "lucide-react"

const protectedRoutes = ["/admin", "/instructor", "/student", "/sysAdmin", "/profile", "/settings"]
const authRoutes = ["/login", "/verify-otp", "/forgot-password", "/reset-password", "/change-password"]

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const user = getUserFromToken()

      const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
      const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

      if (isAuthRoute && user) {
        router.replace(`/${user.role}`)
        return
      }

      if (isProtectedRoute && !user) {
        router.replace("/login")
        return
      }

      if (isProtectedRoute && user) {
        // Allow access to profile and settings for all authenticated users
        if (pathname.startsWith("/profile") || pathname.startsWith("/settings")) {
          setIsChecking(false)
          return
        }

        // Check if user is accessing their role-specific routes
        if (!pathname.startsWith(`/${user.role}`)) {
          router.replace(`/${user.role}`)
          return
        }
      }

      setIsChecking(false)
    }

    checkAuth()
  }, [pathname, router])

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return <>{children}</>
}
