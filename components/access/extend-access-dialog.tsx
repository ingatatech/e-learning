"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Enrollment } from "@/types"
import { getRemainingAccessDays } from "@/lib/access-utils"

interface ExtendAccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  enrollment: Enrollment
  onExtend: (days: number) => Promise<void>
}

export function ExtendAccessDialog({ open, onOpenChange, enrollment, onExtend }: ExtendAccessDialogProps) {
  const [selectedDays, setSelectedDays] = useState("30")
  const [isLoading, setIsLoading] = useState(false)
  const remainingDays = getRemainingAccessDays(enrollment)

  const handleExtend = async () => {
    setIsLoading(true)
    try {
      await onExtend(Number.parseInt(selectedDays))
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Extend Course Access</DialogTitle>
          <DialogDescription>
            You can extend your access to this course for additional days. You have{" "}
            <strong>{remainingDays} days</strong> of access remaining in your 1-year limit.
          </DialogDescription>
        </DialogHeader>

        {remainingDays <= 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-900">
              You have reached your 1-year access limit. No further extensions are available.
            </AlertDescription>
          </Alert>
        )}

        {remainingDays > 0 && (
          <div className="space-y-4">
            <div>
              <Label className="mb-3 block text-base font-medium">Select extension period</Label>
              <RadioGroup value={selectedDays} onValueChange={setSelectedDays}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="7" id="days-7" disabled={remainingDays < 7} />
                  <Label htmlFor="days-7" className="font-normal cursor-pointer">
                    7 days
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="14" id="days-14" disabled={remainingDays < 14} />
                  <Label htmlFor="days-14" className="font-normal cursor-pointer">
                    14 days
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="30" id="days-30" disabled={remainingDays < 30} />
                  <Label htmlFor="days-30" className="font-normal cursor-pointer">
                    30 days
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="60" id="days-60" disabled={remainingDays < 60} />
                  <Label htmlFor="days-60" className="font-normal cursor-pointer">
                    60 days
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Alert>
              <AlertDescription>
                After extension, you will have access until the new expiration date. Total days used:{" "}
                <strong>{enrollment.totalAccessDays + Number.parseInt(selectedDays)} / 365</strong>
              </AlertDescription>
            </Alert>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleExtend} disabled={isLoading}>
                {isLoading ? "Extending..." : "Extend Access"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
