"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/types"

interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message?: any } | undefined>
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; message?: any } | undefined>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  updateUser: (updates: Partial<User>) => void
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
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem("Euser")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      setToken(JSON.parse(localStorage.getItem("Etoken") || ""))
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, message: data.message || "Login failed" }
      }
      setUser(data.user)
      router.push(`/verify-otp?email=${email}`)
    } catch (error) {
      return { success: false, message: "Something went wrong. Try again." }
    } finally {
      setIsLoading(false)
    }
  }

  const verifyOtp = async (email: string, otp: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, message: data.message || "verification failed" }
      }
      setUser(data.user)
      localStorage.setItem("Euser", JSON.stringify(data.user))
      localStorage.setItem("Etoken", JSON.stringify(data.token))
      if (data.user.firstLogin) {
        router.push("/change-password")
      } else {
        router.push(`/${data.user.role}`)
      }
    } catch (error) {
      return { success: false, message: "Something went wrong. Try again." }
    } finally {
      setIsLoading(false)
    }
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
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, { method: "POST", credentials: "include" })
      setUser(null)
      localStorage.removeItem("Etoken")
      localStorage.removeItem("Euser")
      router.push("/login")
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

  const updateUser = (updates: Partial<User>) => {
    if (!user) return

    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    localStorage.setItem("Euser", JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        isLoading,
        login,
        verifyOtp,
        register,
        logout,
        refreshToken,
        updateUser,
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
