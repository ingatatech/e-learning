"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Settings, Maximize } from "lucide-react"

interface VideoPlayerProps {
  videoUrl: string
  title: string
  onProgress?: (progress: number) => void
  onComplete?: () => void
}

export function VideoPlayer({ videoUrl, title, onProgress, onComplete }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(100)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const handleProgressChange = (newProgress: number) => {
    setProgress(newProgress)
    onProgress?.(newProgress)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="bg-black aspect-video relative group">
      {/* Video Element Placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </div>
          <p className="text-lg font-medium">{title}</p>
        </div>
      </div>

      {/* Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Progress Bar */}
        <div className="flex items-center gap-4 mb-4">
          <Progress value={progress} className="flex-1" />
          <span className="text-white text-sm">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={togglePlay}>
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => setCurrentTime(Math.min(duration, currentTime + 10))}
            >
              <SkipForward className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={toggleMute}>
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>
          <div className="flex items-center gap-2">
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
  )
}
