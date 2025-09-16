"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Moon, Sun } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"

interface LearningNavigationProps {
  courseTitle: string
  courseId: string
  currentStepTitle: string
  currentStepIndex: number
  totalSteps: number
  canGoNext: boolean
  canGoPrevious: boolean
  onNext: () => void
  onPrevious: () => void
}

export function LearningNavigation({
  courseTitle,
  courseId,
  currentStepTitle,
  currentStepIndex,
  totalSteps,
  canGoNext,
  canGoPrevious,
  onNext,
  onPrevious,
}: LearningNavigationProps) {
  const { theme, setTheme } = useTheme()

  return (
    <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/courses/${courseId}`}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Course
              </Link>
            </Button>
            <div className="border-l pl-4">
              <h1 className="font-semibold text-lg">{courseTitle}</h1>
              <p className="text-sm text-muted-foreground">{currentStepTitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onPrevious} disabled={!canGoPrevious}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <Button size="sm" onClick={onNext} disabled={!canGoNext}>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
