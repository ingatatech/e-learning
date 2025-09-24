"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Users, PlayCircle, Trophy, CheckCircle } from "lucide-react"
import { CourseDetailsStep } from "./steps/course-details-step"
import { ModuleManagementStep } from "./steps/module-management-step"
import { LessonBuilderStep } from "./steps/lesson-builder-step"
import { AssessmentBuilderStep } from "./steps/assessment-builder-step"
import { ReviewPublishStep } from "./steps/review-publish-step"
import type { Course, Module } from "@/types"
import { useAuth } from "@/hooks/use-auth"

interface WizardStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  component: React.ComponentType<any>
  isCompleted: boolean
  points: number
}

export function CourseCreationWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [courseData, setCourseData] = useState<Partial<Course>>({})
  const [modules, setModules] = useState<Module[]>([])
  const [totalPoints, setTotalPoints] = useState(0)
  const [streak, setStreak] = useState(1)
  const [showPointsAnimation, setShowPointsAnimation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { token, user } = useAuth()
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("")
  const [isThumbnailUploading, setIsThumbnailUploading] = useState(false)
  const [thumbnailUploadError, setThumbnailUploadError] = useState<string>("")

  const steps: WizardStep[] = [
    {
      id: "details",
      title: "Course Details",
      description: "Set up your course foundation",
      icon: <BookOpen className="w-5 h-5" />,
      component: CourseDetailsStep,
      isCompleted: false,
      points: 50,
    },
    {
      id: "modules",
      title: "Course Structure",
      description: "Organize your content into modules",
      icon: <Users className="w-5 h-5" />,
      component: ModuleManagementStep,
      isCompleted: false,
      points: 75,
    },
    {
      id: "lessons",
      title: "Create Lessons",
      description: "Build engaging lesson content",
      icon: <PlayCircle className="w-5 h-5" />,
      component: LessonBuilderStep,
      isCompleted: false,
      points: 100,
    },
    {
      id: "assessments",
      title: "Add Assessments",
      description: "Create quizzes and assignments",
      icon: <Trophy className="w-5 h-5" />,
      component: AssessmentBuilderStep,
      isCompleted: false,
      points: 75,
    },
    {
      id: "review",
      title: "Review & Publish",
      description: "Final review and course launch",
      icon: <CheckCircle className="w-5 h-5" />,
      component: ReviewPublishStep,
      isCompleted: false,
      points: 100,
    },
  ]

  const CurrentStepComponent = steps[currentStep].component

  const handleThumbnailUploadStart = () => {
    setIsThumbnailUploading(true)
    setThumbnailUploadError("")
  }

  const handleThumbnailUploadComplete = (url: string) => {
    setThumbnailUrl(url)
    setIsThumbnailUploading(false)
    setCourseData((prev) => ({ ...prev, thumbnail: url }))
  }

  const handleThumbnailUploadError = (error: string) => {
    setThumbnailUploadError(error)
    setIsThumbnailUploading(false)
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      // Award points for completing step
      const stepPoints = steps[currentStep].points
      const bonusPoints = Math.floor(stepPoints * (streak * 0.1)) // Streak bonus
      const totalEarned = stepPoints + bonusPoints

      setTotalPoints((prev) => prev + totalEarned)
      setStreak((prev) => prev + 1)
      setShowPointsAnimation(true)

      // Mark current step as completed
      steps[currentStep].isCompleted = true

      setCurrentStep((prev) => prev + 1)

      // Hide points animation after 2 seconds
      setTimeout(() => setShowPointsAnimation(false), 2000)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex)
    }
  }

  const getLevel = (points: number) => {
    return Math.floor(points / 100) + 1
  }

  const getPointsToNextLevel = (points: number) => {
    const currentLevel = getLevel(points)
    const pointsForNextLevel = currentLevel * 100
    return pointsForNextLevel - points
  }

  const formatCourseDataForAPI = () => {
    return {
      title: courseData.title || "",
      description: courseData.description || "",
      thumbnail: thumbnailUrl || courseData.thumbnail || "",
      level: courseData.level || "beginner",
      price: courseData.price || 0,
      isPublished: false,
      duration: courseData.duration || 0,
      tags: courseData.tags || [],
      instructorId: user!.id,
      organizationId: user!.organization.id,
      certificateIncluded: courseData.certificateIncluded || false,
      language: courseData.language || "English",
      about: courseData.about || "",
      whatYouWillLearn: courseData.whatYouWillLearn || [],
      requirements: courseData.requirements || [],
      categoryName: courseData.category || "",
      modules: modules.map((module, moduleIndex) => ({
        title: module.title,
        description: module.description || "",
        order: moduleIndex + 1,
        lessons: (module.lessons || []).map((lesson, lessonIndex) => ({
          title: lesson.title,
          content: lesson.content || "",
          videoUrl: lesson.videoUrl || "",
          duration: lesson.duration || 0,
          order: lessonIndex + 1,
          isProject: lesson.isProject || false,
          isExercise: lesson.isExercise || false,
          assessments: (lesson.assessments || []).map((assessment) => ({
            title: assessment.title,
            description: assessment.description || "",
            type: assessment.type,
            questions: assessment.questions || [],
            passingScore: assessment.passingScore || 70,
            timeLimit: assessment.timeLimit || 30,
          })),
          resources: Array.isArray(lesson.resources)
            ? lesson.resources.map((resource) => ({
                title: resource.title,
                url: resource.url,
                description: resource.description || "",
              }))
            : [],
        })),
      })),
    }
  }

  const handleCourseSubmission = async () => {
    setIsSubmitting(true)
    try {
      const formattedData = formatCourseDataForAPI()

      console.log(formattedData)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formattedData),
      })

      if (!response.ok) {
        throw new Error("Failed to create course")
      }

      await response.json()
    } catch (error) {
      console.log(error)
      // Handle error (show error message, etc.)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Step Navigation */}
      <div className="mb-8">
        <div className="flex items-center justify-between overflow-x-auto pb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center min-w-0 flex-1 relative">
              <button
                onClick={() => handleStepClick(index)}
                disabled={index > currentStep}
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all relative
                  ${
                    index === currentStep
                      ? "bg-primary-500 text-gray-900 dark:text-white shadow-lg scale-110"
                      : index < currentStep
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-400 dark:bg-gray-700"
                  }
                  ${index <= currentStep ? "cursor-pointer hover:scale-105" : "cursor-not-allowed"}
                `}
              >
                {step.isCompleted ? <CheckCircle className="w-6 h-6" /> : step.icon}

                {/* Points Badge */}
                {step.isCompleted && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
                  >
                    {step.points}
                  </motion.div>
                )}
              </button>
              <div className="text-center">
                <p
                  className={`text-sm font-medium ${
                    index <= currentStep ? "text-gray-900 dark:text-white" : "text-gray-400"
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`
                  hidden md:block absolute top-6 left-1/2 w-full h-0.5 -z-10
                  ${index < currentStep ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"}
                `}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="min-h-[600px]">
        <CardContent className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CurrentStepComponent
                courseData={courseData}
                setCourseData={setCourseData}
                modules={modules}
                setModules={setModules}
                onNext={handleNext}
                onPrevious={handlePrevious}
                isFirstStep={currentStep === 0}
                isLastStep={currentStep === steps.length - 1}
                onSubmit={handleCourseSubmission}
                isSubmitting={isSubmitting}
                thumbnailUrl={thumbnailUrl}
                onThumbnailUploadStart={handleThumbnailUploadStart}
                onThumbnailUploadComplete={handleThumbnailUploadComplete}
                onThumbnailUploadError={handleThumbnailUploadError}
                isThumbnailUploading={isThumbnailUploading}
              />
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}
