"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  AlertTriangle,
  BookOpen,
  PlayCircle,
  Trophy,
  Users,
  Target,
  Sparkles,
  Rocket,
  Eye,
  Settings,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { CourseCompletionCelebration } from "../gamification/course-completion-celebration"
import type { Course, Module } from "@/types"

interface ReviewPublishStepProps {
  courseData: Partial<Course>
  modules: Module[]
  onPrevious: () => void
  isLastStep: boolean
  onSubmit?: () => Promise<void>
  isSubmitting?: boolean
}

export function ReviewPublishStep({
  courseData,
  modules,
  onPrevious,
  isLastStep,
  onSubmit,
  isSubmitting = false,
}: ReviewPublishStepProps) {
  const [isPublished, setIsPublished] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set())

  const totalLessons = modules.reduce((acc, module) => acc + (module.lessons?.length || 0), 0)
  const totalAssessments = modules.reduce(
    (acc, module) =>
      acc + (module.lessons?.reduce((lessonAcc, lesson) => lessonAcc + (lesson.assessments?.length || 0), 0) || 0),
    0,
  )
  const totalQuestions = modules.reduce(
    (acc, module) =>
      acc +
      (module.lessons?.reduce(
        (lessonAcc, lesson) =>
          lessonAcc +
          (lesson.assessments?.reduce((assessmentAcc, assessment) => assessmentAcc + assessment.questions.length, 0) ||
            0),
        0,
      ) || 0),
    0,
  )

  const completionChecks = [
    {
      label: "Course details completed",
      completed: !!(courseData.title && courseData.description && courseData.level),
      required: true,
    },
    {
      label: "At least one module created",
      completed: modules.length > 0,
      required: true,
    },
    {
      label: "At least one lesson created",
      completed: totalLessons > 0,
      required: true,
    },
    {
      label: "Course thumbnail uploaded",
      completed: !!courseData.thumbnail,
      required: false,
    },
    {
      label: "Assessments added",
      completed: totalAssessments > 0,
      required: false,
    },
    {
      label: "Course tags added",
      completed: (courseData.tags?.length || 0) > 0,
      required: false,
    },
  ]

  const requiredCompleted = completionChecks.filter((check) => check.required && check.completed).length
  const requiredTotal = completionChecks.filter((check) => check.required).length
  const optionalCompleted = completionChecks.filter((check) => !check.required && check.completed).length
  const optionalTotal = completionChecks.filter((check) => !check.required).length

  const canPublish = requiredCompleted === requiredTotal
  const completionPercentage = ((requiredCompleted + optionalCompleted) / completionChecks.length) * 100

  const handlePublish = async () => {
    if (onSubmit) {
      try {
        await onSubmit()
        setIsPublished(true)
        setShowCelebration(true)
      } catch (error) {
        console.error("Error publishing course:", error)
        // Handle error (could show toast notification)
      }
    } else {
      // Fallback for demo purposes
      setIsPublished(true)
      setShowCelebration(true)
    }
  }

  const getQualityScore = () => {
    let score = 0
    if (courseData.title && courseData.description) score += 20
    if (modules.length >= 3) score += 20
    if (totalLessons >= 5) score += 20
    if (totalAssessments >= 2) score += 20
    if (courseData.thumbnail) score += 10
    if ((courseData.tags?.length || 0) >= 3) score += 10
    return Math.min(score, 100)
  }

  const qualityScore = getQualityScore()

  const toggleModule = (moduleIndex: number) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleIndex)) {
      newExpanded.delete(moduleIndex)
    } else {
      newExpanded.add(moduleIndex)
    }
    setExpandedModules(newExpanded)
  }

  return (
    <div className="space-y-6">
      {showCelebration && (
        <CourseCompletionCelebration
          courseTitle={courseData.title || "Your Course"}
          stats={{
            modules: modules.length,
            lessons: totalLessons,
            assessments: totalAssessments,
            qualityScore,
          }}
          onClose={() => setShowCelebration(false)}
        />
      )}

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {isPublished ? "Course Published Successfully!" : "Review & Publish"}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          {isPublished
            ? "Your course is now live and ready for students!"
            : "Final review of your course before making it available to students"}
        </p>
      </div>

      {!isPublished ? (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content">Content Details</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Course Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{modules.length}</div>
                  <div className="text-sm text-gray-600">Modules</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <PlayCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalLessons}</div>
                  <div className="text-sm text-gray-600">Lessons</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Trophy className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalAssessments}</div>
                  <div className="text-sm text-gray-600">Assessments</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Target className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalQuestions}</div>
                  <div className="text-sm text-gray-600">Questions</div>
                </CardContent>
              </Card>
            </div>

            {/* Quality Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  Course Quality Score
                </CardTitle>
                <CardDescription>Based on completeness, content depth, and best practices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Quality</span>
                    <Badge variant={qualityScore >= 80 ? "default" : qualityScore >= 60 ? "secondary" : "outline"}>
                      {qualityScore}/100
                    </Badge>
                  </div>
                  <Progress value={qualityScore} className="h-3" />
                  <div className="text-sm text-gray-600">
                    {qualityScore >= 80 && "Excellent! Your course meets high quality standards."}
                    {qualityScore >= 60 &&
                      qualityScore < 80 &&
                      "Good course structure. Consider adding more content for higher engagement."}
                    {qualityScore < 60 && "Your course needs more content to provide good value to students."}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Course Preview
                </CardTitle>
                <CardDescription>How your course will appear to students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-6 bg-gray-50 dark:bg-gray-800">
                  <div className="flex gap-4 mb-4">
                    <div className="w-24 h-16 bg-gray-300 dark:bg-gray-600 rounded flex items-center justify-center">
                      {courseData.thumbnail ? (
                        <img
                          src={courseData.thumbnail || "/placeholder.svg"}
                          alt="Course thumbnail"
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <BookOpen className="w-8 h-8 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {courseData.title || "Course Title"}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                        {courseData.description || "Course description will appear here..."}
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="outline">{courseData.level || "beginner"}</Badge>
                        <Badge variant="outline">{modules.length} modules</Badge>
                        <Badge variant="outline">{totalLessons} lessons</Badge>
                        {courseData.price && <Badge variant="outline">${courseData.price}</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {courseData.tags?.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Details Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Course Structure</CardTitle>
                <CardDescription>Complete breakdown of all modules, lessons, and assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {modules.map((module, moduleIndex) => (
                    <div key={module.id} className="border rounded-lg overflow-hidden">
                      <div
                        className="flex items-center justify-between p-4 bg-muted/50 cursor-pointer hover:bg-muted"
                        onClick={() => toggleModule(moduleIndex)}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {expandedModules.has(moduleIndex) ? (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          )}
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              Module {moduleIndex + 1}: {module.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">{module.description}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            {module.lessons?.length || 0} lessons
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {module.lessons?.reduce((acc, lesson) => acc + (lesson.assessments?.length || 0), 0) || 0}{" "}
                            assessments
                          </Badge>
                        </div>
                      </div>

                      {expandedModules.has(moduleIndex) && (
                        <div className="p-4 space-y-3 bg-background">
                          {module.lessons && module.lessons.length > 0 ? (
                            module.lessons.map((lesson, lessonIndex) => (
                              <div key={lesson.id} className="border-l-2 border-primary pl-4 py-2">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <PlayCircle className="w-4 h-4 text-primary" />
                                      <h5 className="font-medium text-sm">
                                        Lesson {lessonIndex + 1}: {lesson.title}
                                      </h5>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-2">{lesson.description}</p>

                                    {lesson.assessments && lesson.assessments.length > 0 && (
                                      <div className="mt-2 space-y-2">
                                        {lesson.assessments.map((assessment, assessmentIndex) => (
                                          <div key={assessment.id} className="bg-muted/30 rounded p-2">
                                            <div className="flex items-center gap-2 mb-1">
                                              <Trophy className="w-3 h-3 text-orange-500" />
                                              <span className="text-xs font-medium">
                                                Assessment {assessmentIndex + 1}: {assessment.title}
                                              </span>
                                            </div>
                                            <div className="flex gap-2 text-xs text-muted-foreground">
                                              <span>{assessment.questions.length} questions</span>
                                              <span>•</span>
                                              <span>{assessment.passingScore}% passing score</span>
                                              <span>•</span>
                                              <span>{assessment.timeLimit} min</span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground italic">No lessons added yet</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checklist" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publication Checklist</CardTitle>
                <CardDescription>Complete all required items to publish your course</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium">Progress</span>
                    <Badge variant="outline">
                      {requiredCompleted + optionalCompleted}/{completionChecks.length} completed
                    </Badge>
                  </div>
                  <Progress value={completionPercentage} className="h-2 mb-6" />

                  <div className="space-y-3">
                    {completionChecks.map((check, index) => (
                      <div key={index} className="flex items-center gap-3">
                        {check.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : check.required ? (
                          <AlertTriangle className="w-5 h-5 text-orange-500" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                        )}
                        <span
                          className={`flex-1 ${check.completed ? "text-gray-900 dark:text-white" : "text-gray-500"}`}
                        >
                          {check.label}
                        </span>
                        <div className="flex gap-1">
                          {check.required && (
                            <Badge variant="outline" className="text-xs">
                              Required
                            </Badge>
                          )}
                          {check.completed && (
                            <Badge variant="secondary" className="text-xs">
                              Done
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        /* Published State */
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
            <Rocket className="w-12 h-12 text-green-600" />
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">🎉 Congratulations!</h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              Your course "{courseData.title}" has been successfully published and is now available to students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <Eye className="w-4 h-4" />
              View Course
            </Button>
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <Users className="w-4 h-4" />
              Manage Students
            </Button>
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <Settings className="w-4 h-4" />
              Course Settings
            </Button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onPrevious} disabled={isSubmitting}>
          Previous Step
        </Button>

        {!isPublished && (
          <div className="flex gap-2">
            <Button onClick={handlePublish} disabled={!canPublish || isSubmitting} size="lg" className="px-8">
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Publishing...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  Publish Course
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
