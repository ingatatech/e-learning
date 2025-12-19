"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  Play,
  Lock,
  BookOpen,
  Video,
  Award,
  ShieldQuestion,
  Clock,
  FileDown,
  Download,
  Search,
  X,
  Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/hooks/use-auth"

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
  finalAssessment?: {
    id: string
    title: string
    type: "assessment" | "project"
    timeLimit?: number
  }
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
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { user } = useAuth()

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

    // Add assessments
    if (lesson.assessments && lesson.assessments.length > 0) {
      lesson.assessments.forEach((assessment, index) => {
        steps.push({
          id: `${lesson.id}-assessment-${assessment.id}`,
          type: "assessment",
          title: `${assessment.title}`,
          duration: assessment.timeLimit,
          isCompleted: isStepCompleted(`${lesson.id}-${index}-assessment`),
          isLocked: false,
        })
      })
    }

    return steps
  }


  const calculateStepLocks = () => {
    if (user?.role !== "student") return
    const allStepsWithLocks: (LearningStep & { moduleId: string; lessonId: string })[] = []

    modules.forEach((module) => {
      module.lessons.forEach((lesson) => {
        const steps = generateLearningSteps(lesson)
        steps.forEach((step) => {
          allStepsWithLocks.push({
            ...step,
            moduleId: module.id,
            lessonId: lesson.id,
          })
        })
      })

      // Add final assessment step if module has a final assessment
      if (module.finalAssessment) {
        const stepId = `${module.id}-final-assessment`
        allStepsWithLocks.push({
          id: stepId,
          type: "assessment",
          title: `${module.title} - Final ${module.finalAssessment.type === "assessment" ? "Assessment" : "Project"}`,
          duration: module.finalAssessment.timeLimit,
          isCompleted: isStepCompleted(stepId),
          isLocked: false,
          moduleId: module.id,
          lessonId: module.id,
        })
      }
    })

    // Find current step index
    const currentStepIndex = allStepsWithLocks.findIndex((step) => step.id === currentStepId)

    // Enable all steps up to and including current step, plus completed steps
    allStepsWithLocks.forEach((step, index) => {
      const isCompleted = step.isCompleted
      const isCurrentOrBefore = index <= currentStepIndex
      const allPreviousCompleted = index === 0 || allStepsWithLocks.slice(0, index).every((s) => s.isCompleted)

      step.isLocked = !isCompleted && !isCurrentOrBefore && !allPreviousCompleted && user?.role==="student"
    })

    return allStepsWithLocks
  }

  const allStepsWithLocks = calculateStepLocks()

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
        if (typeof lesson.resources === "string") {
          lesson.resources = JSON.parse(lesson.resources)
        }
        if (Array.isArray(lesson.resources) && lesson.resources.length > 0) {
          lesson.resources.forEach((resource: any) => {
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
          const score = getStepScore?.(assessment.id)
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

      // Add final assessment to list
      if (module.finalAssessment) {
        const stepId = `${module.id}-final-assessment`
        const score = getStepScore?.(stepId)
        assessmentsList.push({
          title: module.finalAssessment.title || "Final Assessment",
          lessonTitle: `${module.title} - Final ${module.finalAssessment.type === "assessment" ? "Assessment" : "Project"}`,
          moduleTitle: module.title,
          score: isStepCompleted(stepId) ? score : undefined,
          id: module.finalAssessment.id,
          stepId,
        })
      }
    })
    return assessmentsList
  }

  const allAssessments = getAllAssessments()
  const completedAssessments = allAssessments.filter((a) => a.score !== undefined || a.score !== null)
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

  const SidebarContent = () => (
    <>
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
              const moduleSteps = [
                ...module.lessons.flatMap((lesson) =>
                  generateLearningSteps(lesson).map((step) => ({
                    ...step,
                    lessonId: lesson.id,
                    isProject: lesson.isProject,
                  })),
                ),
                // Add final assessment if it exists
                ...(module.finalAssessment
                  ? [
                      {
                        id: `${module.id}-final-assessment`,
                        type: "assessment" as const,
                        title: `${module.title} - Final ${module.finalAssessment.type === "assessment" ? "Assessment" : "Project"}`,
                        duration: module.finalAssessment.timeLimit,
                        isCompleted: isStepCompleted(`${module.id}-final-assessment`),
                        isLocked: false,
                        lessonId: module.id,
                        isProject: module.finalAssessment.type === "project",
                      },
                    ]
                  : []),
              ]

              const completedSteps = moduleSteps.filter((step) => isStepCompleted(step.id)).length
              const moduleProgress = moduleSteps.length > 0 ? (completedSteps / moduleSteps.length) * 100 : 0

              return (
                <AccordionItem
                  key={module.id}
                  value={module.id}
                  className="border rounded bg-muted/30 hover:bg-muted/50 transition-colors overflow-hidden"
                >
                  <AccordionTrigger
                    className="px-4 py-3 hover:bg-muted/40 rounded-t-lg transition-colors"
                    onClick={() => toggleModule(module.id)}
                  >
                  <div className="grid items-center gap-3 w-full">

                      {/* Module Info */}
                      <div className="min-w-0 overflow-hidden">
                        <p className="font-semibold text-sm truncate">{module.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {completedSteps} of {moduleSteps.length} complete
                        </p>
                      </div>

                      {/* Module Progress Bar */}
                      <div className="w-full h-1.5 bg-primary/10 rounded overflow-hidden">
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
                              const stepWithLock = allStepsWithLocks?.find((s) => s.id === step.id)
                              const isLocked = stepWithLock?.isLocked || false
                              const isActive = currentStepId === step.id
                              const isCompleted = stepWithLock?.isCompleted || false

                              return (
                                <button
                                  key={step.id}
                                  onClick={() => {
                                    if (!isLocked) {
                                      onStepSelect(step.id)
                                      setIsMobileOpen(false)
                                    }
                                  }}
                                  disabled={isLocked}
                                  className={`w-full text-left p-2.5 rounded border transition-all ${
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
                                    <div className="flex-1 min-w-0 ">
                                      <p className={`text-sm font-medium truncate ${step.type === 'assessment' ? "text-chart-5" : ""}`}>{step.title}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge
                                          variant={isActive ? "default" : "outline"}
                                          className={`text-xs font-medium ${isActive && "bg-primary-foreground/20 rounded"} rounded`}
                                        >
                                          {getStepTypeLabel(step.type)}
                                        </Badge>
                                        {step.duration ? (
                                          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                                            <Clock className="w-3 h-3" />
                                            {step.duration}m
                                          </span>
                                        ): <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                                            Self Paced
                                          </span>
                                        }
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        )
                      })}
                      {/* Add Final Assessment after all lessons */}
                      {module.finalAssessment && (
                        <div className="pt-2 mt-2 border-t">
                          <button
                            onClick={() => {
                              const stepId = `${module.id}-final-assessment`
                              const stepWithLock = allStepsWithLocks?.find((s) => s.id === stepId)
                              if (!stepWithLock?.isLocked) {
                                onStepSelect(stepId)
                                setIsMobileOpen(false)
                              }
                            }}
                            disabled={allStepsWithLocks?.find((s) => s.id === `${module.id}-final-assessment`)?.isLocked}
                            className={`w-full text-left p-2.5 rounded-md border transition-all ${
                              currentStepId === `${module.id}-final-assessment`
                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                : allStepsWithLocks?.find((s) => s.id === `${module.id}-final-assessment`)?.isLocked
                                  ? "opacity-50 cursor-not-allowed"
                                  : "hover:bg-muted border-transparent hover:border-primary/20"
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="flex-shrink-0 mt-0.5">
                                {isStepCompleted(`${module.id}-final-assessment`) ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : allStepsWithLocks?.find((s) => s.id === `${module.id}-final-assessment`)
                                    ?.isLocked ? (
                                  <Lock className="w-4 h-4 text-muted-foreground" />
                                ) : (
                                  <ShieldQuestion className="w-4 h-4 text-ring" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate text-chart-2">
                                  {module.finalAssessment.title || "Final Assessment"}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    variant={currentStepId === `${module.id}-final-assessment` ? "default" : "outline"}
                                    className={`text-xs font-medium ${currentStepId === `${module.id}-final-assessment` && "bg-primary-foreground/20 rounded"}`}
                                  >
                                    {module.finalAssessment.type === "assessment" ? "Quiz" : "Project"}
                                  </Badge>
                                  {module.finalAssessment.timeLimit && (
                                    <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                                      <Clock className="w-3 h-3" />
                                      {module.finalAssessment.timeLimit}m
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>

          {/* Course Completion Button */}
          <div className="mt-4">
            <button
              onClick={() => {
                onCourseCompletionSelect()
                setIsMobileOpen(false)
              }}
              disabled={!allStepsCompleted}
              className={`w-full text-left p-3 rounded border-2 transition-all ${
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
                  <p className="text-xs text-muted-foreground">
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
                  className="p-3 border rounded bg-muted/30 hover:bg-muted/50 transition-colors group"
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
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1 mt-2"
                  >
                    <FileDown className="w-3 h-3" />
                    View Resource
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileDown className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No resources available</p>
            </div>
          )}
        </TabsContent>

        {/* Assessments Tab */}
        <TabsContent value="assessments" className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">

            {/* Assessments List */}
            <div className="space-y-2">
              {allAssessments.map((assessment, index) => (
                <div
                  key={assessment.id}
                  className="p-3 border rounded bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => {
                    onStepSelect(assessment.stepId)
                    setIsMobileOpen(false)
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{assessment.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{assessment.lessonTitle}</p>
                      <p className="text-xs text-muted-foreground/70 mt-0.5">{assessment.moduleTitle}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {assessment.score !== undefined ? (
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">{assessment.score}%</div>
                          <Badge
                            variant={
                              assessment.score >= 80 ? "default" : assessment.score >= 60 ? "secondary" : "destructive"
                            }
                            className="text-xs mt-1 rounded"
                          >
                            {assessment.score >= 80 ? "Excellent" : assessment.score >= 60 ? "Passed" : "Review"}
                          </Badge>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-xs rounded">
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </>
  )

  return (
    <>
      <div className="lg:hidden fixed left-4 bottom-4 z-50">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg h-14 w-14">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0 flex flex-col">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden lg:flex fixed left-0 top-[73px] w-85 border-r bg-background h-[calc(100vh-73px)] overflow-hidden z-[5] flex-col">
        <SidebarContent />
      </div>
    </>
  )
}
