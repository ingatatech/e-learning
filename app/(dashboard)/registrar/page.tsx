"use client"

import { useAuth } from "@/hooks/use-auth"
import { RegistrarDashboard } from "@/components/registrar-dashboard"

export default function RegistrarPage() {
  const { user } = useAuth()

  if (!user || user.role !== "registrar") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return <RegistrarDashboard />
}
