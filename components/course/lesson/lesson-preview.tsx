"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PlayCircle, Clock, FileText, ImageIcon, Video, Download } from "lucide-react"
import type { Lesson } from "@/types"

interface LessonPreviewProps {
  lesson: Lesson
}

export function LessonPreview({ lesson }: LessonPreviewProps) {
  return (
    <div className="h-full overflow-y-auto space-y-6">
      {/* Lesson Header */}
      <div className="text-center pb-6 border-b">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{lesson.title}</h1>
        <div className="flex justify-center gap-4">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {lesson.duration} min
          </Badge>
          {lesson.videoUrl && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Video className="w-4 h-4" />
              Video Lesson
            </Badge>
          )}
        </div>
      </div>

      {/* Video Player */}
      {lesson.videoUrl && (
        <Card>
          <CardContent className="p-0">
            <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
              <Button size="lg" className="rounded-full w-16 h-16">
                <PlayCircle className="w-8 h-8" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lesson Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Lesson Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            {lesson.content ? (
              <div className="whitespace-pre-wrap">{lesson.content}</div>
            ) : (
              <p className="text-gray-500 italic">No content added yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Interactive Elements Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Elements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Quick Check</h4>
              <p className="text-blue-800 dark:text-blue-200 text-sm mb-3">
                What is the main concept covered in this lesson?
              </p>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  A) Option 1
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  B) Option 2
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  C) Option 3
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Lesson Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No resources available for this lesson</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
