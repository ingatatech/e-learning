"use client"

import { AlertCircle, Clock, Lock, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import type { Enrollment } from "@/types"
import { getAccessStatus } from "@/lib/access-utils"

interface AccessStatusBannerProps {
  enrollment: Enrollment
  onExtendClick?: () => void
}

export function AccessStatusBanner({ enrollment, onExtendClick }: AccessStatusBannerProps) {
  const status = getAccessStatus(enrollment)

  if (status.status === "active") {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <Clock className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900">{status.message}</AlertDescription>
      </Alert>
    )
  }

  if (status.status === "expiring_soon") {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-900">
          <div className="flex items-center justify-between">
            <span>{status.message}</span>
            <Button size="sm" onClick={onExtendClick} variant="outline">
              Extend Access
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (status.status === "expired") {
    return (
      <Alert className="border-red-200 bg-red-50">
        <Lock className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-900">
          <div className="flex items-center justify-between">
            <span>{status.message}</span>
            <Button size="sm" onClick={onExtendClick} variant="outline">
              Renew Access
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="border-red-300 bg-red-50">
      <AlertCircle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-900">{status.message}</AlertDescription>
    </Alert>
  )
}
