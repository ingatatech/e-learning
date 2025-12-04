"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Play, Lock, BookOpen, Video, Award, Clock, FileDown, Download, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
  resources?: Array<{
    url: string
    title: string
    description?: string
  }>
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
  onCourseCompletionSelect: () => void
  courseProgress: number
  progressData: any
  isStepCompleted: (stepId: string) => boolean
  allStepsCompleted: boolean
  getStepScore?: (stepId: string) => number | undefined
}

export function LearningSidebar({
  modules,
  currentStepId,
  onStepSelect,
  onCourseCompletionSelect,
  courseProgress,
  progressData,
  isStepCompleted,
  allStepsCompleted,
  getStepScore,
}: LearningSidebarProps) {
  const [expandedModules, setExpandedModules] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")

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

  const getAllResources = () => {
    const allResources: Array<{ url: string; title: string; description?: string; lessonTitle: string }> = []
    modules.forEach((module) => {
      module.lessons.forEach((lesson) => {
        if (lesson.resources && lesson.resources.length > 0) {
          lesson.resources.forEach((resource) => {
            allResources.push({
              ...resource,
              lessonTitle: lesson.title,
            })
          })
        }
      })
    })
    return allResources
  }

  const allResources = getAllResources()

  const getAllAssessments = () => {
    const assessmentsList: Array<{
      title: string
      lessonTitle: string
      moduleTitle: string
      score?: number
      id: string
      stepId: string
    }> = []
    modules.forEach((module) => {
      module.lessons.forEach((lesson) => {
        lesson.assessments?.forEach((assessment) => {
          const stepId = `${lesson.id}-assessment-${assessment.id}`
          const score = getStepScore?.(stepId)
          assessmentsList.push({
            title: assessment.title || "Assessment",
            lessonTitle: lesson.title,
            moduleTitle: module.title,
            score: isStepCompleted(stepId) ? score : undefined,
            id: assessment.id,
            stepId,
          })
        })
      })
    })
    return assessmentsList
  }

  const allAssessments = getAllAssessments()
  const completedAssessments = allAssessments.filter((a) => a.score !== undefined)
  const overallScore =
    completedAssessments.length > 0
      ? Math.round(completedAssessments.reduce((sum, a) => sum + (a.score || 0), 0) / completedAssessments.length)
      : 0

  const filteredModules = modules
    .map((module) => ({
      ...module,
      lessons: module.lessons.filter((lesson) => lesson.title.toLowerCase().includes(searchQuery.toLowerCase())),
    }))
    .filter((module) => module.lessons.length > 0 || !searchQuery)

  return (
    <div className="fixed left-0 top-[85px] w-80 border-r bg-background h-[calc(100vh-73px)] overflow-hidden z-10 flex flex-col">
      {/* Header with Progress */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 border-b p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-foreground">Course Progress</h3>
          <span className="text-lg font-bold text-primary">{Math.round(courseProgress)}%</span>
        </div>
        <Progress value={courseProgress} className="h-2.5" />
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="outline" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid w-full grid-cols-3 bg-background px-4 pt-4">
          <TabsTrigger value="outline" className="flex items-center gap-1.5 text-xs font-medium rounded">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Outline</span>
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-1.5 text-xs font-medium rounded">
            <FileDown className="w-4 h-4" />
            <span className="hidden sm:inline">Resources</span>
          </TabsTrigger>
          <TabsTrigger value="assessments" className="flex items-center gap-1.5 text-xs font-medium rounded">
            <Award className="w-4 h-4" />
            <span className="hidden sm:inline">Grades</span>
          </TabsTrigger>
        </TabsList>

        {/* Course Outline Tab */}
        <TabsContent value="outline" className="flex-1 overflow-y-auto py-2 px-4 space-y-3">
          {/* Search Bar */}
          <div className="mb-4 sticky top-0 bg-background z-10">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search lessons..."
              className="pl-9 pr-8 h-9 bg-muted/50 border-primary/20 focus:border-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Modules and Lessons */}
          <Accordion type="multiple" value={expandedModules} className="space-y-2">
            {filteredModules.map((module, moduleIndex) => {
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
                <AccordionItem
                  key={module.id}
                  value={module.id}
                  className="border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors overflow-hidden"
                >
                  <AccordionTrigger
                    className="px-4 py-3 hover:bg-muted/40 rounded-t-lg transition-colors"
                    onClick={() => toggleModule(module.id)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      {/* Module Number Badge */}
                      <div className="w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {moduleIndex + 1}
                      </div>

                      {/* Module Info */}
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-semibold text-sm truncate">{module.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {completedSteps} of {moduleSteps.length} complete
                        </p>
                      </div>

                      {/* Module Progress Bar */}
                      <div className="w-10 h-1.5 bg-muted rounded-full overflow-hidden flex-shrink-0">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${moduleProgress}%` }}
                        />
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="px-4 pb-3 pt-2 bg-background">
                    <div className="space-y-1.5">
                      {module.lessons.map((lesson) => {
                        const lessonSteps = generateLearningSteps(lesson)

                        return (
                          <div key={lesson.id} className="space-y-1">
                            {lessonSteps.map((step) => {
                              const stepWithLock = allStepsWithLocks.find((s) => s.id === step.id)
                              const isLocked = stepWithLock?.isLocked || false
                              const isActive = currentStepId === step.id
                              const isCompleted = stepWithLock?.isCompleted || false

                              return (
                                <button
                                  key={step.id}
                                  onClick={() => !isLocked && onStepSelect(step.id)}
                                  disabled={isLocked}
                                  className={`w-full text-left p-2.5 rounded-md border transition-all ${
                                    isActive
                                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                      : isLocked
                                        ? "opacity-50 cursor-not-allowed hover:bg-muted/30"
                                        : "hover:bg-muted border-transparent hover:border-primary/20"
                                  }`}
                                >
                                  <div className="flex items-start gap-2.5">
                                    {/* Icon */}
                                    <div className="flex-shrink-0 mt-0.5">
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
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{step.title}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge
                                          variant={isActive ? "default" : "outline"}
                                          className={`text-xs font-medium ${isActive && "bg-primary-foreground/20"}`}
                                        >
                                          {getStepTypeLabel(step.type)}
                                        </Badge>
                                        {step.duration && (
                                          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                                            <Clock className="w-3 h-3" />
                                            {step.duration}m
                                          </span>
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

          {/* Course Completion Button */}
          <div className="mt-4">
            <button
              onClick={onCourseCompletionSelect}
              disabled={!allStepsCompleted}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                currentStepId === "course-completion"
                  ? "bg-primary text-primary-foreground border-primary"
                  : allStepsCompleted
                    ? "hover:bg-green-50 dark:hover:bg-green-950/20 border-green-200 dark:border-green-800"
                    : "opacity-50 cursor-not-allowed border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                {allStepsCompleted ? (
                  <Award className="w-5 h-5 text-green-600" />
                ) : (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-sm">Course Completion</p>
                  <p className="text-xs text-muted0">
                    {allStepsCompleted ? "View achievements" : "Complete all lessons"}
                  </p>
                </div>
              </div>
            </button>
          </div>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="flex-1 overflow-y-auto p-4">
          {allResources.length > 0 ? (
            <div className="space-y-3">
              {allResources.map((resource, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <Download className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate text-foreground">{resource.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{resource.lessonTitle}</p>
                      {resource.description && (
                        <p className="text-xs text-muted-foreground/70 mt-1.5 line-clamp-2">{resource.description}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs h-8 opacity-0 group-hover:opacity-100 transition-opacity bg-transparent"
                    asChild
                  >
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileDown className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No resources available</p>
              <p className="text-xs mt-1">Resources will appear here as they're added to lessons</p>
            </div>
          )}
        </TabsContent>

        {/* Assessments & Grades Tab */}
        <TabsContent value="assessments" className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {/* Overall Score Card */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="text-center">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Overall Score
                </p>
                <p className="text-3xl font-bold text-primary">{overallScore}%</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {completedAssessments.length} of {allAssessments.length} completed
                </p>
              </div>
            </div>

            {/* Assessments List */}
            {allAssessments.length > 0 ? (
              <div className="space-y-2">
                {allAssessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{assessment.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{assessment.lessonTitle}</p>
                      </div>
                      {assessment.score !== undefined ? (
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-lg text-primary">{assessment.score}%</p>
                        </div>
                      ) : (
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-muted-foreground font-medium">Not attempted</p>
                        </div>
                      )}
                    </div>
                    {assessment.score !== undefined && (
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            assessment.score >= 80
                              ? "bg-green-600"
                              : assessment.score >= 60
                                ? "bg-yellow-600"
                                : "bg-red-600"
                          }`}
                          style={{ width: `${assessment.score}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Award className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No assessments yet</p>
                <p className="text-xs mt-1">Complete assessments to see your grades</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
