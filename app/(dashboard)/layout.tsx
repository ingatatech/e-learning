"use client"

import type React from "react"

import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { useAuth } from "@/hooks/use-auth"
import { CoursesProvider } from "@/hooks/use-courses"
import { DocumentsProvider } from "@/hooks/use-documents"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  return (
    <CoursesProvider>
      <DocumentsProvider>
        <div className="min-h-screen bg-background flex">
          {/* Sidebar - Full height */}
          <Sidebar userRole={user.role as "admin" | "sysAdmin" | "instructor" | "student"} />

          <div className="flex-1 flex flex-col min-h-screen">
            <Header user={user} />
            <main className="flex-1 p-6 overflow-auto min-h-screen">{children}</main>
          </div>
        </div>
      </DocumentsProvider>
    </CoursesProvider>
  )
}
