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

    const { user, isLoading, token } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || !token) {
    return null // Middleware will redirect to login
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Full height */}
      <Sidebar userRole={user.role as "admin" | "sysAdmin" | "instructor" | "student"} />

      <div className="flex-1 flex flex-col min-h-screen">
      <Header user={user} />
        <main className="flex-1 p-6 overflow-auto min-h-screen">{children}</main>
      </div>
    </div>
  )
}
