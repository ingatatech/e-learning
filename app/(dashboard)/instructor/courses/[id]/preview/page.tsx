"use client"

import { useState, useEffect, use } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Settings,
  Maximize,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Video,
  FileText,
  Trophy,
} from "lucide-react"
import Link from "next/link"
import type { Course, Lesson } from "@/types"
import { useCourses } from "@/hooks/use-courses"

export default function CoursePreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ lesson?: string }>
}) {
  const { getCourse } = useCourses()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(25)
  const [videoProgress, setVideoProgress] = useState(45)
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())
  const { id } = use(params)
  const { lesson: lessonId } = use(searchParams)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await getCourse(id)
        if (data) {
          setCourse(data)

          // Set first lesson as default if no lesson ID provided
          if (data.modules && data.modules.length > 0) {
            let targetLesson = null

            if (lessonId) {
              // Find specific lesson if ID provided
              for (const module of data.modules) {
                const lesson = module.lessons?.find((l) => l.id === lessonId)
                if (lesson) {
                  targetLesson = lesson
                  break
                }
              }
            }

            // Default to first lesson if no specific lesson found
            if (!targetLesson && data.modules[0]?.lessons?.[0]) {
              targetLesson = data.modules[0].lessons[0]
            }

            setCurrentLesson(targetLesson)
          }
        }
      } catch (error) {
        console.error("Failed to fetch course:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [id, lessonId, getCourse])

  const getAllLessons = () => {
    const lessons: Array<{ lesson: Lesson; moduleTitle: string }> = []
    course?.modules?.forEach((module) => {
      module.lessons?.forEach((lesson) => {
        lessons.push({ lesson, moduleTitle: module.title })
      })
    })
    return lessons
  }

  const getCurrentLessonIndex = () => {
    if (!currentLesson) return -1
    const allLessons = getAllLessons()
    return allLessons.findIndex((item) => item.lesson.id === currentLesson.id)
  }

  const handlePreviousLesson = () => {
    const allLessons = getAllLessons()
    const currentIndex = getCurrentLessonIndex()
    if (currentIndex > 0) {
      setCurrentLesson(allLessons[currentIndex - 1].lesson)
    }
  }

  const handleNextLesson = () => {
    const allLessons = getAllLessons()
    const currentIndex = getCurrentLessonIndex()
    if (currentIndex < allLessons.length - 1) {
      setCurrentLesson(allLessons[currentIndex + 1].lesson)
    }
  }

  const handleMarkComplete = () => {
    if (currentLesson) {
      setCompletedLessons((prev) => new Set([...prev, currentLesson.id]))
      handleNextLesson()
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-8" />
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Course not found</h1>
        <Button asChild>
          <Link href="/instructor/courses">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Link>
        </Button>
      </div>
    )
  }

  const allLessons = getAllLessons()
  const currentLessonIndex = getCurrentLessonIndex()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/instructor/courses/${course.id}`}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Course
                </Link>
              </Button>
              <div>
                <h1 className="font-semibold">{course.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {currentLesson ? `Lesson ${currentLessonIndex + 1} of ${allLessons.length}` : "Course Preview"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">Progress: {progress}%</div>
              <Progress value={progress} className="w-32" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - Course Content */}
        <div className="w-80 border-r bg-muted/30 h-[calc(100vh-73px)] overflow-y-auto">
          <div className="p-4">
            <h2 className="font-semibold mb-4">Course Content</h2>
            <Accordion type="single" collapsible defaultValue="1">
              {course.modules?.map((module, moduleIndex) => (
                <AccordionItem key={module.id} value={module.id}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center justify-between w-full mr-4">
                      <span className="font-medium text-sm">{module.title}</span>
                      <span className="text-xs text-muted-foreground">{module.lessons?.length || 0} lessons</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-1 pl-4">
                      {module.lessons?.map((lesson) => (
                        <button
                          key={lesson.id}
                          onClick={() => setCurrentLesson(lesson)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            lesson.id === currentLesson?.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {completedLessons.has(lesson.id) ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : lesson.videoUrl ? (
                              <Video className="w-4 h-4" />
                            ) : (
                              <FileText className="w-4 h-4" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{lesson.title}</p>
                              <p className="text-xs opacity-70">{lesson.duration}min</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {currentLesson ? (
            <>
              {currentLesson.videoUrl && (
                <div className="bg-black aspect-video relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                        {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                      </div>
                      <p className="text-lg font-medium">{currentLesson.title}</p>
                      <p className="text-sm opacity-70">{currentLesson.duration}min</p>
                    </div>
                  </div>

                  {/* Video Controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center gap-4 mb-4">
                      <Progress value={videoProgress} className="flex-1" />
                      <span className="text-white text-sm">
                        {Math.floor((videoProgress / 100) * currentLesson.duration)}:30 / {currentLesson.duration}:00
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20"
                          onClick={handlePreviousLesson}
                          disabled={currentLessonIndex === 0}
                        >
                          <SkipBack className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20"
                          onClick={() => setIsPlaying(!isPlaying)}
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20"
                          onClick={handleNextLesson}
                          disabled={currentLessonIndex === allLessons.length - 1}
                        >
                          <SkipForward className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                          <Volume2 className="w-4 h-4" />
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
                </div>
              )}

              {/* Lesson Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">{currentLesson.title}</h1>
                    {currentLesson.content && (
                      <div className="prose max-w-none mb-4">
                        <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                          {currentLesson.content}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!completedLessons.has(currentLesson.id) && (
                      <Button onClick={handleMarkComplete}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Complete
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={handleNextLesson}
                      disabled={currentLessonIndex === allLessons.length - 1}
                    >
                      Next Lesson
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>

                <Tabs defaultValue="overview" className="space-y-6">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="resources">Resources</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                    <TabsTrigger value="discussion">Discussion</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview">
                    <Card>
                      <CardHeader>
                        <CardTitle>Lesson Overview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {currentLesson.content ? (
                          <div className="prose max-w-none">
                            <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                              {currentLesson.content}
                            </div>
                          </div>
                        ) : (
                          <p className="text-muted-foreground leading-relaxed">
                            This lesson covers important concepts. Watch the video above to learn more.
                          </p>
                        )}

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 border rounded-lg">
                            <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
                            <div className="font-medium">{currentLesson.duration}min</div>
                            <div className="text-sm text-muted-foreground">Duration</div>
                          </div>
                          <div className="text-center p-4 border rounded-lg">
                            {currentLesson.videoUrl ? (
                              <Video className="w-6 h-6 mx-auto mb-2 text-primary" />
                            ) : (
                              <FileText className="w-6 h-6 mx-auto mb-2 text-primary" />
                            )}
                            <div className="font-medium">{currentLesson.videoUrl ? "Video" : "Text"}</div>
                            <div className="text-sm text-muted-foreground">Content Type</div>
                          </div>
                          <div className="text-center p-4 border rounded-lg">
                            <Trophy className="w-6 h-6 mx-auto mb-2 text-primary" />
                            <div className="font-medium">{currentLesson.assessments?.length || 0}</div>
                            <div className="text-sm text-muted-foreground">Assessments</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="resources">
                    <Card>
                      <CardHeader>
                        <CardTitle>Resources</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">Additional resources for this lesson.</p>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="notes">
                    <Card>
                      <CardHeader>
                        <CardTitle>Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">Notes for this lesson.</p>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="discussion">
                    <Card>
                      <CardHeader>
                        <CardTitle>Discussion</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">Discussion board for this lesson.</p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          ) : (
            /* Course Overview when no lesson selected */
            <div className="p-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Preview</CardTitle>
                  <CardDescription>This is how your course will appear to students</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="aspect-video relative overflow-hidden rounded-lg bg-muted">
                    <img
                      src={course.thumbnail || "/placeholder.svg?height=400&width=600"}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Button
                        size="lg"
                        className="bg-white/90 text-black hover:bg-white"
                        onClick={() => {
                          if (allLessons.length > 0) {
                            setCurrentLesson(allLessons[0].lesson)
                          }
                        }}
                      >
                        <Play className="w-5 h-5 mr-2" />
                        Start Course
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold">{course.title}</h2>
                    <p className="text-muted-foreground">{course.description}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
