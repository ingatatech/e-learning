"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, Clock, CheckCircle, BookOpen, Award } from "lucide-react"

interface ProgressStats {
  overallProgress: number
  completedLessons: number
  totalLessons: number
  completedAssessments: number
  totalAssessments: number
  timeSpent: number
  averageScore: number
  streak: number
}

interface ProgressTrackerProps {
  stats: ProgressStats
  courseTitle: string
}

export function ProgressTracker({ stats, courseTitle }: ProgressTrackerProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-green-600"
    if (progress >= 60) return "text-blue-600"
    if (progress >= 40) return "text-yellow-600"
    return "text-orange-600"
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Learning Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className={`text-sm font-bold ${getProgressColor(stats.overallProgress)}`}>
                {Math.round(stats.overallProgress)}%
              </span>
            </div>
            <Progress value={stats.overallProgress} className="h-3" />
            <p className="text-xs text-muted-foreground">Keep going! You're making great progress in {courseTitle}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-lg font-bold">
                {stats.completedLessons}/{stats.totalLessons}
              </div>
              <div className="text-xs text-muted-foreground">Lessons</div>
            </div>

            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Award className="w-4 h-4 text-orange-500" />
              </div>
              <div className="text-lg font-bold">
                {stats.completedAssessments}/{stats.totalAssessments}
              </div>
              <div className="text-xs text-muted-foreground">Assessments</div>
            </div>

            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-lg font-bold">{formatTime(stats.timeSpent)}</div>
              <div className="text-xs text-muted-foreground">Time Spent</div>
            </div>

            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Target className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-lg font-bold">{stats.averageScore}%</div>
              <div className="text-xs text-muted-foreground">Avg Score</div>
            </div>
          </div>

          {/* Achievements */}
          <div className="flex items-center gap-2 flex-wrap">
            {stats.streak >= 7 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                🔥 {stats.streak} day streak
              </Badge>
            )}
            {stats.overallProgress >= 50 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                Halfway there!
              </Badge>
            )}
            {stats.averageScore >= 90 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                High achiever
              </Badge>
            )}
            {stats.completedAssessments > 0 && stats.completedAssessments === stats.totalAssessments && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                All assessments complete
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
