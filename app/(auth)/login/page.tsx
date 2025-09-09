
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoginForm } from "@/components/forms/login-form"
import Link from "next/link"
import { BookOpen } from "lucide-react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../../hooks/use-auth" 

export default function LoginPage() {
    const { user } = useAuth()
    const router = useRouter()
    
    useEffect(() => {
      if (user) {
        router.push(`/${user.role}`) 
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
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>Sign in to your account to continue learning</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  )
}
