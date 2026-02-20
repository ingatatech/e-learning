"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Clock, Calendar, AlertTriangle } from "lucide-react"
import { useAccessManagement } from "@/hooks/use-access-management"
import type { Enrollment } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface AccessStatusCardProps {
  enrollment: Enrollment
  courseTitle: string
}

export function AccessStatusCard({ enrollment, courseTitle }: AccessStatusCardProps) {
  const { checkAccessStatus, requestExtension } = useAccessManagement()
  const [isLoading, setIsLoading] = useState(false)
  const [daysToExtend, setDaysToExtend] = useState<number>(30)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const handleRequestExtension = async () => {
    if (!daysToExtend || daysToExtend <= 0) {
      alert("Please enter a valid number of days")
      return
    }

    // Check if total access won't exceed 365 days
    const totalAccessDays = (enrollment.totalAccessDays || 0) + daysToExtend
    if (totalAccessDays > 365) {
      alert(
        `You can only extend up to 365 total days. Current: ${enrollment.totalAccessDays}, Requested: ${daysToExtend}. Max allowed: ${365 - (enrollment.totalAccessDays || 0)}`,
      )
      return
    }

    setStatus("loading")
    try {
      await requestExtension(enrollment.id, daysToExtend)
      setStatus("success")
      setTimeout(() => setStatus("idle"), 2000)
      setDaysToExtend(30)
    } catch (error) {
      setStatus("error")
      setTimeout(() => setStatus("idle"), 2000)
      console.error(error)
    }
  }

  const isAboutToExpire =
    enrollment.accessExpiresAt &&
    !enrollment.isAccessRevoked &&
    new Date(enrollment.accessExpiresAt) > new Date() &&
    new Date(enrollment.accessExpiresAt).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000

  const isExpired =
    enrollment.accessExpiresAt && new Date(enrollment.accessExpiresAt) <= new Date() && !enrollment.isAccessRevoked

  const isRevoked = enrollment.isAccessRevoked

  if (!isAboutToExpire && !isExpired && !isRevoked) {
    return null
  }

  const daysRemaining = enrollment.accessExpiresAt
    ? Math.ceil((new Date(enrollment.accessExpiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <Card
      className={`border-l-4 ${
        isRevoked
          ? "border-l-red-600 bg-red-50"
          : isExpired
            ? "border-l-red-500 bg-red-50"
            : "border-l-yellow-500 bg-yellow-50"
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {isRevoked ? (
              <AlertCircle className="w-5 h-5 text-red-600" />
            ) : isExpired ? (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            ) : (
              <Clock className="w-5 h-5 text-yellow-600" />
            )}
            <div>
              <CardTitle className="text-base">
                {isRevoked ? "Access Revoked" : isExpired ? "Access Expired" : "Access Expiring Soon"}
              </CardTitle>
              <CardDescription className="text-xs mt-1">{courseTitle}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isRevoked ? (
          <div className="text-sm text-red-700">
            <p className="font-medium mb-2">Your access to this course has been revoked.</p>
            <p className="text-xs">
              You have used the maximum allowed access period (365 days). If you need continued access, please contact
              the instructor.
            </p>
          </div>
        ) : isExpired ? (
          <div className="text-sm text-red-700">
            <p className="font-medium mb-2">Your access to this course has expired.</p>
            <p className="text-xs mb-4">
              Your enrollment ended on {new Date(enrollment.accessExpiresAt!).toLocaleDateString()}.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="w-full bg-transparent">
                  <Calendar className="w-4 h-4 mr-2" />
                  Request Extension
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Access Extension</DialogTitle>
                  <DialogDescription>
                    You can extend your access to this course. Maximum total access period is 365 days.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Days to Extend</label>
                    <Input
                      type="number"
                      min="1"
                      max={365 - (enrollment.totalAccessDays || 0)}
                      value={daysToExtend}
                      onChange={(e) => setDaysToExtend(Number.parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {enrollment.totalAccessDays
                        ? `Total access will be: ${enrollment.totalAccessDays + daysToExtend}/365 days`
                        : `You can extend up to 365 days`}
                    </p>
                  </div>
                  <Button onClick={handleRequestExtension} disabled={status === "loading"} className="w-full">
                    {status === "loading" ? "Requesting..." : "Request Extension"}
                  </Button>
                  {status === "success" && <p className="text-xs text-green-600">Extension requested successfully!</p>}
                  {status === "error" && (
                    <p className="text-xs text-red-600">Failed to request extension. Please try again.</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="text-sm text-yellow-700">
            <p className="font-medium mb-2">Your access expires in {daysRemaining} days</p>
            <p className="text-xs mb-4">Expires on {new Date(enrollment.accessExpiresAt!).toLocaleDateString()}</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="w-full bg-transparent">
                  <Calendar className="w-4 h-4 mr-2" />
                  Extend Access
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Extend Access to Course</DialogTitle>
                  <DialogDescription>
                    Request an extension to continue accessing this course. Maximum total access period is 365 days.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Days to Extend</label>
                    <Input
                      type="number"
                      min="1"
                      max={365 - (enrollment.totalAccessDays || 0)}
                      value={daysToExtend}
                      onChange={(e) => setDaysToExtend(Number.parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {enrollment.totalAccessDays
                        ? `Total access will be: ${enrollment.totalAccessDays + daysToExtend}/365 days`
                        : `You can extend up to 365 days`}
                    </p>
                  </div>
                  <Button onClick={handleRequestExtension} disabled={status === "loading"} className="w-full">
                    {status === "loading" ? "Requesting..." : "Request Extension"}
                  </Button>use-access-managment
                  {status === "success" && <p className="text-xs text-green-600">Extension requested successfully!</p>}
                  {status === "error" && (
                    <p className="text-xs text-red-600">Failed to request extension. Please try again.</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
