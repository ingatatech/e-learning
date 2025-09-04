import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock } from "lucide-react"

interface ProgressBarProps {
  progress: number
  completedLessons: number
  totalLessons: number
  timeSpent?: number
  estimatedTime?: number
  showDetails?: boolean
}

export function ProgressBar({
  progress,
  completedLessons,
  totalLessons,
  timeSpent,
  estimatedTime,
  showDetails = true,
}: ProgressBarProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Course Progress</span>
        <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
      </div>

      <Progress value={progress} className="h-2" />

      {showDetails && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>
                {completedLessons}/{totalLessons} lessons
              </span>
            </div>
            {timeSpent && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatTime(timeSpent)} spent</span>
              </div>
            )}
          </div>
          {estimatedTime && <Badge variant="secondary">~{formatTime(estimatedTime)} remaining</Badge>}
        </div>
      )}
    </div>
  )
}
