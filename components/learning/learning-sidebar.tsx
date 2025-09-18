"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle, Play, Lock, BookOpen, Video, Award, Target, Clock } from "lucide-react"

interface LearningStep {
  id: string
  type: "content" | "video" | "assessment"
  title: string
  duration?: number
  isCompleted: boolean
  isLocked: boolean
}

interface Lesson {
  id: string
  title: string
  content: string
  videoUrl: string
  duration: number
  order: number
  isProject: boolean
  isExercise: boolean
  assessments: any[]
  isCompleted?: boolean
}

interface Module {
  id: string
  title: string
  description: string
  order: number
  lessons: Lesson[]
}

interface LearningSidebarProps {
  modules: Module[]
  currentStepId: string
  onStepSelect: (stepId: string) => void
  courseProgress: number
  progressData: any
  isStepCompleted: (stepId: string) => boolean
}

export function LearningSidebar({
  modules,
  currentStepId,
  onStepSelect,
  courseProgress,
  progressData,
  isStepCompleted,
}: LearningSidebarProps) {
  const [expandedModules, setExpandedModules] = useState<string[]>([])

  // Generate learning steps from lessons
  const generateLearningSteps = (lesson: Lesson): LearningStep[] => {
    const steps: LearningStep[] = []

    // Add content step if lesson has content
    if (lesson.content && lesson.content.trim()) {
      const stepId = `${lesson.id}-content`
      steps.push({
        id: stepId,
        type: "content",
        title: `${lesson.title} - Content`,
        duration: lesson.duration,
        isCompleted: isStepCompleted(stepId),
        isLocked: false, // Will be calculated based on previous steps
      })
    }

    // Add video step if lesson has video
    if (lesson.videoUrl && lesson.videoUrl.trim()) {
      const stepId = `${lesson.id}-video`
      steps.push({
        id: stepId,
        type: "video",
        title: `${lesson.title} - Video`,
        duration: lesson.content ? Math.ceil(lesson.duration / 2) : lesson.duration,
        isCompleted: isStepCompleted(stepId),
        isLocked: false,
      })
    }

    // Add assessment steps if lesson has assessments
    lesson.assessments?.forEach((assessment, index) => {
      const stepId = `${lesson.id}-assessment-${assessment.id}`
      steps.push({
        id: stepId,
        type: "assessment",
        title: assessment.title || `Assessment ${index + 1}`,
        duration: assessment.timeLimit,
        isCompleted: isStepCompleted(stepId),
        isLocked: false,
      })
    })

    return steps
  }

  const calculateStepLocks = () => {
    const allSteps: (LearningStep & { moduleId: string; lessonId: string })[] = []

    modules.forEach((module) => {
      module.lessons.forEach((lesson) => {
        const steps = generateLearningSteps(lesson)
        steps.forEach((step) => {
          allSteps.push({
            ...step,
            moduleId: module.id,
            lessonId: lesson.id,
          })
        })
      })
    })

    // Find current step index
    const currentStepIndex = allSteps.findIndex((step) => step.id === currentStepId)

    // Enable all steps up to and including current step, plus completed steps
    allSteps.forEach((step, index) => {
      // Step is unlocked if:
      // 1. It's completed
      // 2. It's at or before the current step index
      // 3. All previous steps are completed
      const isCompleted = step.isCompleted
      const isCurrentOrBefore = index <= currentStepIndex
      const allPreviousCompleted = index === 0 || allSteps.slice(0, index).every((s) => s.isCompleted)

      step.isLocked = !isCompleted && !isCurrentOrBefore && !allPreviousCompleted
    })

    return allSteps
  }

  const allStepsWithLocks = calculateStepLocks()

  const getStepIcon = (step: LearningStep) => {
    if (step.isCompleted) {
      return <CheckCircle className="w-4 h-4 text-green-600" />
    }
    if (step.isLocked) {
      return <Lock className="w-4 h-4 text-muted-foreground" />
    }

    switch (step.type) {
      case "content":
        return <BookOpen className="w-4 h-4 text-blue-500" />
      case "video":
        return <Video className="w-4 h-4 text-purple-500" />
      case "assessment":
        return <Award className="w-4 h-4 text-orange-500" />
      default:
        return <Play className="w-4 h-4" />
    }
  }

  const getStepTypeLabel = (type: string) => {
    switch (type) {
      case "content":
        return "Reading"
      case "video":
        return "Video"
      case "assessment":
        return "Quiz"
      default:
        return "Lesson"
    }
  }

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => (prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]))
  }

  return (
    <div className="fixed left-0 top-[73px] w-80 border-r bg-muted/30 h-[calc(100vh-73px)] overflow-y-auto z-10">
      <div className="p-4">
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Course Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Overall Progress</span>
                <span className="font-medium">{Math.round(courseProgress)}%</span>
              </div>
              <Progress value={courseProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <h2 className="font-semibold mb-4">Course Content</h2>

        <Accordion type="multiple" value={expandedModules} className="space-y-2">
          {modules.map((module, moduleIndex) => {
            const moduleSteps = module.lessons.flatMap((lesson) =>
              generateLearningSteps(lesson).map((step) => ({
                ...step,
                lessonId: lesson.id,
                isProject: lesson.isProject,
              })),
            )

            const completedSteps = moduleSteps.filter((step) => isStepCompleted(step.id)).length
            const moduleProgress = moduleSteps.length > 0 ? (completedSteps / moduleSteps.length) * 100 : 0

            return (
              <AccordionItem key={module.id} value={module.id} className="border rounded-lg">
                <AccordionTrigger
                  className="text-left px-4 hover:bg-muted/50 rounded-t-lg"
                  onClick={() => toggleModule(module.id)}
                >
                  <div className="flex items-center justify-between w-full mr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{moduleIndex + 1}</span>
                      </div>
                      <div className="text-left">
                        <span className="font-medium text-sm">{module.title}</span>
                        <div className="text-xs text-muted-foreground">
                          {completedSteps}/{moduleSteps.length} completed
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${moduleProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-1">
                    {module.lessons.map((lesson) => {
                      const lessonSteps = generateLearningSteps(lesson)

                      return (
                        <div key={lesson.id} className="space-y-1">
                          {lessonSteps.map((step, stepIndex) => {
                            const stepWithLock = allStepsWithLocks.find((s) => s.id === step.id)
                            const isLocked = stepWithLock?.isLocked || false
                            const isActive = currentStepId === step.id
                            const isCompleted = stepWithLock?.isCompleted || false

                            return (
                              <button
                                key={step.id}
                                onClick={() => !isLocked && onStepSelect(step.id)}
                                disabled={isLocked}
                                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                                  isActive
                                    ? "bg-primary text-primary-foreground"
                                    : isLocked
                                      ? "opacity-50 cursor-not-allowed hover:bg-muted/30"
                                      : "hover:bg-muted"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  {isCompleted ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  ) : isLocked ? (
                                    <Lock className="w-4 h-4 text-muted-foreground" />
                                  ) : step.type === "content" ? (
                                    <BookOpen className="w-4 h-4 text-blue-500" />
                                  ) : step.type === "video" ? (
                                    <Video className="w-4 h-4 text-purple-500" />
                                  ) : (
                                    <Award className="w-4 h-4 text-orange-500" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="font-medium text-sm truncate">{step.title}</p>
                                      {lesson.isProject && (
                                        <Badge variant="secondary" className="text-xs">
                                          <Target className="w-2 h-2 mr-1" />
                                          Project
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs opacity-70">
                                      <Badge variant="outline" className="text-xs">
                                        {getStepTypeLabel(step.type)}
                                      </Badge>
                                      {step.duration && (
                                        <div className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          <span>{step.duration} min</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </div>
    </div>
  )
}
