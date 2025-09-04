"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  isEmailVerified: boolean
  isActive: boolean
  totalPoints: number
  level: number
  streakDays: number
  organizationId?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: string
  organizationId?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Login failed")
    }

    setUser(data.user)
    router.push(`/${data.user.role}`)
  }

  const register = async (registerData: RegisterData) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registerData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Registration failed")
    }

    // Don't auto-login after registration, redirect to login
    router.push("/login?message=Please check your email to verify your account")
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
      router.push("/login")
    }
  }

  const refreshToken = async () => {
    try {
      const response = await fetch("/api/auth/refresh", { method: "POST" })
      if (!response.ok) {
        throw new Error("Token refresh failed")
      }
    } catch (error) {
      console.error("Token refresh failed:", error)
      logout()
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
