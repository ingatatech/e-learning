"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Settings,
  Maximize,
  CheckCircle,
  Video,
  Clock,
} from "lucide-react"

interface VideoScreenProps {
  lesson: {
    id: string
    title: string
    videoUrl: string
    duration: number
  }
  onComplete: () => void
  isCompleted: boolean
}

export function VideoScreen({ lesson, onComplete, isCompleted }: VideoScreenProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Video className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="text-2xl">{lesson.title}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Clock className="w-4 h-4" />
                  <span>{lesson.duration} minutes</span>
                </div>
              </div>
            </div>
            {!isCompleted && (
              <Button onClick={onComplete} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Mark Complete
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {lesson.videoUrl ? (
            <div className="space-y-4">
              {/* Video Player */}
              <div className="bg-black aspect-video relative rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                      {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                    </div>
                    <p className="text-lg font-medium">{lesson.title}</p>
                    <p className="text-sm opacity-70">{lesson.duration} minutes</p>
                  </div>
                </div>

                {/* Video Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <Progress value={videoProgress} className="flex-1" />
                    <span className="text-white text-sm">
                      {Math.floor((videoProgress / 100) * lesson.duration)}:
                      {String(Math.floor(((videoProgress / 100) * lesson.duration * 60) % 60)).padStart(2, "0")} /{" "}
                      {lesson.duration}:00
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
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
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
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
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No video available for this lesson yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
