import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RegisterForm } from "@/components/forms/register-form"
import Link from "next/link"
import { BookOpen } from "lucide-react"

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-primary">EduFlow</span>
        </div>
        <CardTitle>Create Your Account</CardTitle>
        <CardDescription>Join thousands of learners and start your educational journey</CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
