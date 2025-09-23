"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trophy, Target, Clock } from "lucide-react"
import { AssessmentEditor } from "../assessment/assessment-editor"
import { AssessmentPreview } from "../assessment/assessment-preview"
import type { Module, Assessment } from "@/types"

interface AssessmentBuilderStepProps {
  modules: Module[]
  setModules: (modules: Module[]) => void
  onNext: () => void
  onPrevious: () => void
}

export function AssessmentBuilderStep({ modules, setModules, onNext, onPrevious }: AssessmentBuilderStepProps) {
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState(false)

  const allAssessments = modules.flatMap((module) =>
    (module.lessons || []).flatMap((lesson) => lesson.assessments || []),
  )

  const currentAssessment = allAssessments.find((a) => a.id === selectedAssessment)

  const addAssessment = (lessonId: string, moduleId: string) => {
    const newAssessment: Assessment = {
      id: `assessment-${Date.now()}`,
      title: "New Assessment",
      description: "",
      type: "quiz",
      questions: [],
      passingScore: 70,
      timeLimit: 30,
      lessonId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setModules(
      modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              lessons: module.lessons?.map((lesson) =>
                lesson.id === lessonId
                  ? { ...lesson, assessments: [...(lesson.assessments || []), newAssessment] }
                  : lesson,
              ),
            }
          : module,
      ),
    )

    setSelectedAssessment(newAssessment.id)
  }

  const updateAssessment = (assessmentId: string, updates: Partial<Assessment>) => {
    setModules(
      modules.map((module) => ({
        ...module,
        lessons: module.lessons?.map((lesson) => ({
          ...lesson,
          assessments: lesson.assessments?.map((assessment) =>
            assessment.id === assessmentId ? { ...assessment, ...updates } : assessment,
          ),
        })),
      })),
    )
  }

  const deleteAssessment = (assessmentId: string) => {
    setModules(
      modules.map((module) => ({
        ...module,
        lessons: module.lessons?.map((lesson) => ({
          ...lesson,
          assessments: lesson.assessments?.filter((assessment) => assessment.id !== assessmentId),
        })),
      })),
    )
    setSelectedAssessment(null)
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create Assessments</h2>
        <p className="text-gray-600 dark:text-gray-300">Build quizzes and assignments to test student understanding</p>
        <div className="flex justify-center gap-4 mt-4">
          <Badge variant="outline" className="flex items-center gap-1">
            <Trophy className="w-4 h-4" />
            {allAssessments.length} Assessments
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            {allAssessments.reduce((acc, a) => acc + a.questions.length, 0)} Questions
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[600px]">
        {/* Course Structure & Assessments */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Assessments</CardTitle>
              <CardDescription>Manage quizzes and assignments</CardDescription>
            </CardHeader>
            <CardContent className="h-[500px] overflow-y-auto">
              <div className="space-y-4">
                {modules.map((module) => (
                  <div key={module.id} className="space-y-2">
                    <div className="font-medium text-sm text-gray-700 dark:text-gray-300 truncate" title={module.title}>
                      {module.title}
                    </div>
                    {module.lessons?.map((lesson) => (
                      <div key={lesson.id} className="ml-2 space-y-1">
                        <div className="text-sm text-gray-600 dark:text-gray-400 truncate" title={lesson.title}>
                          {lesson.title}
                        </div>
                        {lesson.assessments?.map((assessment) => (
                          <Button
                            key={assessment.id}
                            variant={selectedAssessment === assessment.id ? "secondary" : "ghost"}
                            size="sm"
                            className="w-full justify-start text-left ml-4 min-h-[32px]"
                            onClick={() => setSelectedAssessment(assessment.id)}
                          >
                            <Trophy className="w-3 h-3 mr-2 flex-shrink-0" />
                            <span className="truncate" title={assessment.title}>
                              {assessment.title}
                            </span>
                          </Button>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-primary-600 ml-4 min-h-[32px]"
                          onClick={() => addAssessment(lesson.id, module.id)}
                        >
                          <Plus className="w-3 h-3 mr-2 flex-shrink-0" />
                          <span className="truncate">Add Assessment</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assessment Editor/Preview */}
        <div className="lg:col-span-3">
          {selectedAssessment && currentAssessment ? (
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="flex items-center gap-2 truncate">
                      <Trophy className="w-5 h-5 flex-shrink-0" />
                      <span className="truncate">{currentAssessment.title}</span>
                    </CardTitle>
                    <CardDescription className="truncate">
                      {currentAssessment.type === "quiz" ? "Quiz" : "Assignment"} • {currentAssessment.questions.length}{" "}
                      questions
                    </CardDescription>
                  </div>
                  {/* <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant={previewMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPreviewMode(!previewMode)}
                    >
                      {previewMode ? "Edit" : "Preview"}
                    </Button>
                  </div> */}
                </div>
              </CardHeader>
              <CardContent className="h-[500px] overflow-y-auto">
                {previewMode ? (
                  <AssessmentPreview assessment={currentAssessment} />
                ) : (
                  <AssessmentEditor
                    assessment={currentAssessment}
                    onUpdate={(updates) => updateAssessment(currentAssessment.id, updates)}
                    onDelete={() => deleteAssessment(currentAssessment.id)}
                  />
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center">
                <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Ready to Add Assessments?</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Create quizzes and assignments to test student knowledge and track progress
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md mx-auto">
                  <Card className="p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                    <Trophy className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <h4 className="font-medium text-sm">Quiz</h4>
                    <p className="text-xs text-gray-500">Multiple choice questions</p>
                  </Card>
                  <Card className="p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                    <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <h4 className="font-medium text-sm">Assignment</h4>
                    <p className="text-xs text-gray-500">Project-based tasks</p>
                  </Card>
                  <Card className="p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                    <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                    <h4 className="font-medium text-sm">Timed Test</h4>
                    <p className="text-xs text-gray-500">Time-limited assessments</p>
                  </Card>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Progress & Navigation */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onPrevious}>
          Previous Step
        </Button>

        <div className="text-center">
          {allAssessments.length > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-4 py-2">
              <p className="text-green-800 dark:text-green-200 text-sm">
                Excellent! You've created {allAssessments.length} assessment{allAssessments.length !== 1 ? "s" : ""}{" "}
                with {allAssessments.reduce((acc, a) => acc + a.questions.length, 0)} total questions.
              </p>
            </div>
          )}
        </div>

        <Button onClick={onNext} size="lg" className="px-8">
          Final Review
        </Button>
      </div>
    </div>
  )
}
