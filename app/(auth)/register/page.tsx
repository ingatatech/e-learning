'use client'
import { RegisterForm } from "@/components/forms/register-form"
import Link from "next/link"
import { BookOpen } from "lucide-react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
    const router = useRouter()
  
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
        <p className="text-gray-400 text-xs font-semibold tracking-wider uppercase">Good to have you here!</p>
        <h1 className="text-4xl font-bold text-text">
          Sign Up<span className="text-primary">.</span>
        </h1>
        <p className="text-gray-400 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium">
            Sign In
          </Link>
        </p>
      </div>

      {/* Form */}
      <RegisterForm />
    </div>
  )
}
