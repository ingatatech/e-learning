"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Clock, Video, Briefcase, Zap, FileDown, Trophy, Target } from "lucide-react"
import type { Lesson } from "@/types"

interface LessonDetailModalProps {
  lesson: Lesson | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LessonDetailModal({ lesson, open, onOpenChange }: LessonDetailModalProps) {
  if (!lesson) return null

  const renderContent = (content: string) => {
    try {
      const parsed = JSON.parse(content)
      if (Array.isArray(parsed)) {
        return parsed.map((item, index) => {
          if (typeof item === "string") {
            return (
              <div
                key={index}
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: item }}
              />
            )
          }
          return null
        })
      }
      return <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
    } catch {
      return <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{lesson.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Lesson Metadata */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {lesson.duration} min
            </Badge>
            {lesson.videoUrl && (
              <Badge
                variant="outline"
                className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
              >
                <Video className="w-3 h-3" />
                Video Lesson
              </Badge>
            )}
            {lesson.isProject && (
              <Badge className="flex items-center gap-1 bg-purple-500 hover:bg-purple-600">
                <Briefcase className="w-3 h-3" />
                Project
              </Badge>
            )}
            {lesson.isExercise && (
              <Badge className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600">
                <Zap className="w-3 h-3" />
                Exercise
              </Badge>
            )}
            {lesson.assessments && lesson.assessments.length > 0 && (
              <Badge
                variant="outline"
                className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300"
              >
                <Trophy className="w-3 h-3" />
                {lesson.assessments.length} Assessment{lesson.assessments.length > 1 ? "s" : ""}
              </Badge>
            )}
          </div>

          <Separator />

          {/* Video URL */}
          {lesson.videoUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Video Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm opacity-75">Video Player</p>
                    <p className="text-xs opacity-50 mt-1 max-w-md break-all">{lesson.videoUrl}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lesson Content */}
          {lesson.content && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lesson Content</CardTitle>
              </CardHeader>
              <CardContent>{renderContent(lesson.content)}</CardContent>
            </Card>
          )}

          {/* Assessments */}
          {lesson.assessments && lesson.assessments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Assessments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lesson.assessments.map((assessment, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{assessment.title}</h4>
                          {assessment.description && (
                            <p className="text-sm text-muted-foreground mt-1">{assessment.description}</p>
                          )}
                        </div>
                        <Badge variant="secondary">{assessment.type}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="outline" className="text-xs">
                          <Target className="w-3 h-3 mr-1" />
                          {assessment.questions?.length || 0} Questions
                        </Badge>
                        {assessment.passingScore && (
                          <Badge variant="outline" className="text-xs">
                            {assessment.passingScore}% to pass
                          </Badge>
                        )}
                        {assessment.timeLimit && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {assessment.timeLimit} min
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resources */}
          {lesson.resources && lesson.resources.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileDown className="w-5 h-5" />
                  Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lesson.resources.map((resource, index) => (
                    <div key={index} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{resource.title}</h4>
                          {resource.description && (
                            <p className="text-xs text-muted-foreground mt-1">{resource.description}</p>
                          )}
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline mt-1 inline-block"
                          >
                            {resource.url}
                          </a>
                        </div>
                        <FileDown className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
