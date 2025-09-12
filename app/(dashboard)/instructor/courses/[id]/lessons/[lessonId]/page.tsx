"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InteractiveQuizPlayer } from "../../../../../../../components/course/interactive-quiz-player"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  Trophy,
  Star,
  MessageSquare,
  FileText,
  Download,
  Eye,
  Edit,
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import type { Lesson, Course, Module, Assessment } from "@/types"

export default function LessonPlayerPage({ params }: { params: { id: string; lessonId: string } }) {
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [currentModule, setCurrentModule] = useState<Module | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [videoProgress, setVideoProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [activeTab, setActiveTab] = useState("content")
  const [showQuiz, setShowQuiz] = useState(false)
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)

  // Mock data - replace with real API calls
  useEffect(() => {
    const mockCourse: Course = {
      id: params.id,
      title: "Complete React Development Bootcamp",
      description: "Master React from basics to advanced concepts",
      thumbnail: "/react-development-course.png",
      level: "intermediate",
      price: 99.99,
      isPublished: true,
      duration: 2400,
      enrollmentCount: 324,
      rating: 4.9,
      tags: ["React", "JavaScript"],
      instructorId: "instructor-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      modules: [
        {
          id: "m1",
          title: "React Fundamentals",
          description: "Learn the core concepts of React",
          order: 1,
          courseId: params.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          lessons: [
            {
              id: "l1",
              title: "Introduction to React",
              content: `Welcome to React! 

React is a powerful JavaScript library for building user interfaces, particularly web applications. It was created by Facebook and has become one of the most popular frontend frameworks in the world.

## What makes React special?

1. **Component-Based Architecture**: React allows you to build encapsulated components that manage their own state, then compose them to make complex UIs.

2. **Virtual DOM**: React creates an in-memory virtual representation of the real DOM, which makes updates faster and more efficient.

3. **Declarative**: You describe what the UI should look like for any given state, and React takes care of updating the DOM when your data changes.

## Key Concepts

- **JSX**: A syntax extension that allows you to write HTML-like code in JavaScript
- **Components**: Reusable pieces of UI that can accept inputs (props) and return React elements
- **State**: Data that can change over time and affects what gets rendered
- **Props**: Short for properties, these are how you pass data from parent to child components

Let's start building amazing applications with React!`,
              videoUrl: "https://example.com/react-intro.mp4",
              duration: 15,
              order: 1,
              moduleId: "m1",
              createdAt: new Date(),
              updatedAt: new Date(),
              assessments: [
                {
                  id: "a1",
                  title: "React Basics Quiz",
                  description: "Test your understanding of React fundamentals",
                  type: "quiz",
                  questions: [
                    {
                      id: "q1",
                      question: "What is React?",
                      type: "multiple_choice",
                      options: [
                        "A JavaScript library for building UIs",
                        "A database",
                        "A web server",
                        "A CSS framework",
                      ],
                      correctAnswer: "A JavaScript library for building UIs",
                      points: 10,
                    },
                    {
                      id: "q2",
                      question: "What does JSX stand for?",
                      type: "multiple_choice",
                      options: ["JavaScript XML", "Java Syntax Extension", "JSON XML", "JavaScript Extension"],
                      correctAnswer: "JavaScript XML",
                      points: 10,
                    },
                  ],
                  passingScore: 70,
                  timeLimit: 10,
                  lessonId: "l1",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              ],
            },
            {
              id: "l2",
              title: "Setting up Development Environment",
              content: "Learn how to set up your React development environment with all necessary tools.",
              duration: 20,
              order: 2,
              moduleId: "m1",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        },
      ],
    }

    const mockLesson = mockCourse.modules?.[0]?.lessons?.find((l) => l.id === params.lessonId)
    const mockModule = mockCourse.modules?.[0]

    setTimeout(() => {
      setCourse(mockCourse)
      setLesson(mockLesson || null)
      setCurrentModule(mockModule || null)
      setLoading(false)
    }, 1000)
  }, [params.id, params.lessonId])

  const handleMarkAsComplete = () => {
    setIsCompleted(true)
    setShowCelebration(true)
    setTimeout(() => setShowCelebration(false), 3000)
  }

  const handleQuizComplete = (score: number, passed: boolean, answers: Record<string, string>) => {
    console.log("Quiz completed:", { score, passed, answers })
    // Handle quiz completion logic here
    if (passed) {
      setIsCompleted(true)
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 3000)
    }
    setShowQuiz(false)
  }

  const getNextLesson = () => {
    if (!course || !currentModule || !lesson) return null
    const currentLessonIndex = currentModule.lessons?.findIndex((l) => l.id === lesson.id) ?? -1
    if (currentLessonIndex < (currentModule.lessons?.length ?? 0) - 1) {
      return currentModule.lessons?.[currentLessonIndex + 1] || null
    }
    return null
  }

  const getPreviousLesson = () => {
    if (!course || !currentModule || !lesson) return null
    const currentLessonIndex = currentModule.lessons?.findIndex((l) => l.id === lesson.id) ?? -1
    if (currentLessonIndex > 0) {
      return currentModule.lessons?.[currentLessonIndex - 1] || null
    }
    return null
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
      </div>
    )
  }

  if (!lesson || !course) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Lesson not found</h1>
        <Button asChild>
          <Link href={`/instructor/courses/${params.id}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center max-w-md mx-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: 2 }}
                className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Trophy className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">Lesson Complete!</h2>
              <p className="text-muted-foreground mb-4">Great job! You've completed "{lesson.title}"</p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>+50 XP earned</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/instructor/courses/${params.id}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Course
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{lesson.title}</h1>
              <p className="text-muted-foreground">
                {currentModule?.title} • {course.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(lesson.duration)}
            </Badge>
            {isCompleted ? (
              <Badge className="bg-green-500 hover:bg-green-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            ) : (
              <Button onClick={handleMarkAsComplete} size="sm">
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Done
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Video Player */}
            {lesson.videoUrl && (
              <Card>
                <CardContent className="p-0">
                  <div className="aspect-video bg-gray-900 rounded-lg relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button
                        size="lg"
                        className="rounded-full w-16 h-16 bg-white/90 text-gray-900 hover:bg-white"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                      </Button>
                    </div>

                    {/* Video Controls */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20"
                          onClick={() => setIsPlaying(!isPlaying)}
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>

                        <div className="flex-1">
                          <Progress value={videoProgress} className="h-1" />
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20"
                          onClick={() => setIsMuted(!isMuted)}
                        >
                          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </Button>

                        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                          <Settings className="w-4 h-4" />
                        </Button>

                        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                          <Maximize className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lesson Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="discussion">Discussion</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Lesson Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap leading-relaxed">{lesson.content}</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quiz Section */}
                {lesson.assessments && lesson.assessments.length > 0 && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        Knowledge Check
                      </CardTitle>
                      <CardDescription>Test your understanding of this lesson</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!showQuiz ? (
                        <div className="space-y-4">
                          {lesson.assessments.map((assessment, index) => (
                            <div key={assessment.id} className="p-4 border rounded-lg">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <h4 className="font-medium">{assessment.title}</h4>
                                  <p className="text-sm text-muted-foreground">{assessment.description}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{assessment.questions.length} questions</Badge>
                                  <Badge variant="outline">{assessment.passingScore}% to pass</Badge>
                                </div>
                              </div>
                              <Button
                                onClick={() => {
                                  setSelectedAssessment(assessment)
                                  setShowQuiz(true)
                                }}
                                className="w-full"
                              >
                                <Trophy className="w-4 h-4 mr-2" />
                                Start {assessment.type === "quiz" ? "Quiz" : "Assessment"}
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : selectedAssessment ? (
                        <InteractiveQuizPlayer
                          assessment={selectedAssessment}
                          onComplete={handleQuizComplete}
                          onClose={() => setShowQuiz(false)}
                        />
                      ) : null}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="resources" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="w-5 h-5" />
                      Lesson Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      <Download className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No downloadable resources for this lesson</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      My Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <textarea
                      className="w-full h-40 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Take notes about this lesson..."
                    />
                    <Button className="mt-3">Save Notes</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="discussion" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Discussion
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No discussions yet. Be the first to ask a question!</p>
                      <Button className="mt-4">Start Discussion</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-6 border-t">
              <div>
                {getPreviousLesson() ? (
                  <Button variant="outline" asChild>
                    <Link href={`/instructor/courses/${params.id}/lessons/${getPreviousLesson()?.id}`}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous Lesson
                    </Link>
                  </Button>
                ) : (
                  <div />
                )}
              </div>

              <div>
                {getNextLesson() ? (
                  <Button asChild>
                    <Link href={`/instructor/courses/${params.id}/lessons/${getNextLesson()?.id}`}>
                      Next Lesson
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild>
                    <Link href={`/instructor/courses/${params.id}`}>
                      Back to Course
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Course Progress</CardTitle>
                <CardDescription>Track your learning journey</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress Stats */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>25%</span>
                  </div>
                  <Progress value={25} />

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">1</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-muted-foreground">3</div>
                      <div className="text-xs text-muted-foreground">Remaining</div>
                    </div>
                  </div>
                </div>

                {/* Module Lessons */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">{currentModule?.title}</h4>
                  {currentModule?.lessons?.map((moduleLesson, index) => (
                    <Link
                      key={moduleLesson.id}
                      href={`/instructor/courses/${params.id}/lessons/${moduleLesson.id}`}
                      className={`flex items-center gap-3 p-2 rounded-lg text-sm transition-colors ${
                        moduleLesson.id === lesson.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                          moduleLesson.id === lesson.id
                            ? "bg-primary-foreground text-primary"
                            : index === 0
                              ? "bg-green-500 text-white"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {index === 0 ? <CheckCircle className="w-3 h-3" /> : index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{moduleLesson.title}</div>
                        <div className="text-xs opacity-70">{formatDuration(moduleLesson.duration)}</div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="space-y-2 pt-4 border-t">
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent" asChild>
                    <Link href={`/instructor/courses/${params.id}/lessons/${lesson.id}/edit`}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Lesson
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview as Student
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
