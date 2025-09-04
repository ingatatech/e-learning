"use client"

import { useState } from "react"
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
  BookOpen,
  MessageSquare,
  Download,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"

export default function CourseLearningPage({ params }: { params: { id: string } }) {
  const [currentLessonId, setCurrentLessonId] = useState("1")
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(25)
  const [videoProgress, setVideoProgress] = useState(45)

  // Mock course data
  const course = {
    id: params.id,
    title: "Complete React Development Course",
    modules: [
      {
        id: "1",
        title: "Getting Started with React",
        duration: "2 hours",
        lessons: [
          {
            id: "1",
            title: "Introduction to React",
            duration: "15 min",
            isCompleted: true,
            videoUrl: "/placeholder-video.mp4",
            description: "Learn what React is and why it's so popular for building user interfaces.",
            resources: [
              { name: "Lesson Notes", type: "pdf", url: "#" },
              { name: "Code Examples", type: "zip", url: "#" },
            ],
          },
          {
            id: "2",
            title: "Setting up Development Environment",
            duration: "20 min",
            isCompleted: true,
            videoUrl: "/placeholder-video.mp4",
            description: "Set up your development environment with Node.js, npm, and create-react-app.",
            resources: [
              { name: "Setup Guide", type: "pdf", url: "#" },
              { name: "VS Code Extensions", type: "link", url: "#" },
            ],
          },
          {
            id: "3",
            title: "Your First React Component",
            duration: "25 min",
            isCompleted: false,
            videoUrl: "/placeholder-video.mp4",
            description: "Create your first React component and understand the component structure.",
            resources: [
              { name: "Component Template", type: "js", url: "#" },
              { name: "Exercise Files", type: "zip", url: "#" },
            ],
          },
        ],
      },
      {
        id: "2",
        title: "React Components and Props",
        duration: "3 hours",
        lessons: [
          {
            id: "4",
            title: "Functional vs Class Components",
            duration: "20 min",
            isCompleted: false,
            videoUrl: "/placeholder-video.mp4",
            description: "Understand the differences between functional and class components.",
            resources: [],
          },
          {
            id: "5",
            title: "Props and PropTypes",
            duration: "25 min",
            isCompleted: false,
            videoUrl: "/placeholder-video.mp4",
            description: "Learn how to pass data between components using props.",
            resources: [],
          },
        ],
      },
    ],
  }

  const currentLesson = course.modules
    .flatMap((module) => module.lessons)
    .find((lesson) => lesson.id === currentLessonId)

  const allLessons = course.modules.flatMap((module) => module.lessons)
  const currentLessonIndex = allLessons.findIndex((lesson) => lesson.id === currentLessonId)

  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonId(allLessons[currentLessonIndex - 1].id)
    }
  }

  const handleNextLesson = () => {
    if (currentLessonIndex < allLessons.length - 1) {
      setCurrentLessonId(allLessons[currentLessonIndex + 1].id)
    }
  }

  const handleMarkComplete = () => {
    // TODO: Mark lesson as complete
    if (currentLesson) {
      currentLesson.isCompleted = true
      handleNextLesson()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/courses/${params.id}`}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Course
                </Link>
              </Button>
              <div>
                <h1 className="font-semibold">{course.title}</h1>
                <p className="text-sm text-muted-foreground">
                  Lesson {currentLessonIndex + 1} of {allLessons.length}
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
              {course.modules.map((module) => (
                <AccordionItem key={module.id} value={module.id}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center justify-between w-full mr-4">
                      <span className="font-medium text-sm">{module.title}</span>
                      <span className="text-xs text-muted-foreground">{module.duration}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-1 pl-4">
                      {module.lessons.map((lesson) => (
                        <button
                          key={lesson.id}
                          onClick={() => setCurrentLessonId(lesson.id)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            lesson.id === currentLessonId ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {lesson.isCompleted ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{lesson.title}</p>
                              <p className="text-xs opacity-70">{lesson.duration}</p>
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
          {/* Video Player */}
          <div className="bg-black aspect-video relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </div>
                <p className="text-lg font-medium">{currentLesson?.title}</p>
                <p className="text-sm opacity-70">{currentLesson?.duration}</p>
              </div>
            </div>

            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center gap-4 mb-4">
                <Progress value={videoProgress} className="flex-1" />
                <span className="text-white text-sm">{Math.floor((videoProgress / 100) * 15)}:30 / 15:00</span>
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

          {/* Lesson Content */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold mb-2">{currentLesson?.title}</h1>
                <p className="text-muted-foreground">{currentLesson?.description}</p>
              </div>
              <div className="flex items-center gap-2">
                {!currentLesson?.isCompleted && (
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
                    <p className="text-muted-foreground leading-relaxed">{currentLesson?.description}</p>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
                        <div className="font-medium">{currentLesson?.duration}</div>
                        <div className="text-sm text-muted-foreground">Duration</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <BookOpen className="w-6 h-6 mx-auto mb-2 text-primary" />
                        <div className="font-medium">{currentLesson?.resources?.length || 0}</div>
                        <div className="text-sm text-muted-foreground">Resources</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <MessageSquare className="w-6 h-6 mx-auto mb-2 text-primary" />
                        <div className="font-medium">12</div>
                        <div className="text-sm text-muted-foreground">Comments</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="resources">
                <Card>
                  <CardHeader>
                    <CardTitle>Lesson Resources</CardTitle>
                    <CardDescription>Download materials and additional resources for this lesson</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {currentLesson?.resources && currentLesson.resources.length > 0 ? (
                      <div className="space-y-3">
                        {currentLesson.resources.map((resource, index) => (
                          <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Download className="w-5 h-5 text-primary" />
                              <div>
                                <p className="font-medium">{resource.name}</p>
                                <p className="text-sm text-muted-foreground">{resource.type.toUpperCase()}</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No resources available for this lesson.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes">
                <Card>
                  <CardHeader>
                    <CardTitle>My Notes</CardTitle>
                    <CardDescription>Take notes while watching the lesson</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <textarea
                        className="w-full h-32 p-3 border rounded-lg resize-none"
                        placeholder="Add your notes here..."
                      />
                      <Button>Save Notes</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="discussion">
                <Card>
                  <CardHeader>
                    <CardTitle>Discussion</CardTitle>
                    <CardDescription>Ask questions and discuss with other students</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <textarea
                          className="w-full h-24 p-3 border rounded-lg resize-none"
                          placeholder="Ask a question or share your thoughts..."
                        />
                        <Button>Post Comment</Button>
                      </div>

                      <div className="space-y-4">
                        {/* Mock comments */}
                        {[
                          {
                            user: "John Smith",
                            time: "2 hours ago",
                            comment: "Great explanation! The examples really helped me understand the concept.",
                          },
                          {
                            user: "Sarah Wilson",
                            time: "1 day ago",
                            comment: "I'm having trouble with the setup. Can someone help?",
                          },
                        ].map((comment, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{comment.user}</span>
                              <span className="text-sm text-muted-foreground">{comment.time}</span>
                            </div>
                            <p className="text-muted-foreground">{comment.comment}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
