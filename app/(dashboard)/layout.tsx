"use client"

import type React from "react"

import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null // Middleware will redirect to login
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <div className="flex">
        <Sidebar userRole={user.role as "admin" | "instructor" | "student"} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
