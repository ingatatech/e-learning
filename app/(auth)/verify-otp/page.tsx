
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen } from "lucide-react"
import { OTPVerificationForm } from "@/components/forms/verify-otp"
import { useRouter } from "next/navigation"
import { useAuth } from "../../../hooks/use-auth" 
import { useEffect } from "react"

export default function LoginPage() {
    const { user } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (user) {
      router.push(`/${user.role}`) // redirect to dashboard based on role
    } else {
      // stay on login/verify page
    }
  }, [user, router])

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-primary">Ingata E-learning</span>
        </div>
        <CardTitle>Verify your account</CardTitle>
        <CardDescription>Enter the OTP code sent to your email</CardDescription>
      </CardHeader>
      <CardContent>
        <OTPVerificationForm />
      </CardContent>
    </Card>
  )
}
