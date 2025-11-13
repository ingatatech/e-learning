"use client"

import { LoginForm } from "@/components/forms/login-form"
import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { BookOpen } from "lucide-react"

export default function LoginPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !user.firstLogin) {
      router.push(`/${user.role}`)
    }
  }, [user, router])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        {/* Logo and brand */}
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-primary" />
          <span className="text-primary font-semibold text-lg cursor-pointer" onClick={() => router.push('/')}>Ingata E-learning</span>
        </div>
      </div>

      {/* Main content */}
      <div className="space-y-4">
        <p className="text-gray-400 text-xs font-semibold tracking-wider">WELCOME BACK</p>
        <h1 className="text-4xl font-bold text-text">
          Sign In<span className="text-primary">.</span>
        </h1>
        <p className="text-gray-400 text-sm">
          Don't have an account?{" "}
          <Link href="/register" className="text-primary font-medium">
            Create one
          </Link>
        </p>
      </div>

      {/* Form */}
      <LoginForm />
    </div>
  )
}
