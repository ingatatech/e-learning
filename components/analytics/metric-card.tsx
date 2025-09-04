import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  format?: "number" | "currency" | "percentage"
}

export function MetricCard({ title, value, change, changeLabel, icon, format = "number" }: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === "string") return val

    switch (format) {
      case "currency":
        return `$${val.toLocaleString()}`
      case "percentage":
        return `${val}%`
      default:
        return val.toLocaleString()
    }
  }

  const getTrendIcon = () => {
    if (change === undefined) return null
    if (change > 0) return <TrendingUp className="w-3 h-3" />
    if (change < 0) return <TrendingDown className="w-3 h-3" />
    return <Minus className="w-3 h-3" />
  }

  const getTrendColor = () => {
    if (change === undefined) return "text-gray-500"
    if (change > 0) return "text-green-600"
    if (change < 0) return "text-red-600"
    return "text-gray-500"
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-primary-600">{formatValue(value)}</p>
            {change !== undefined && (
              <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
                {getTrendIcon()}
                <span>{Math.abs(change)}%</span>
                {changeLabel && <span className="text-gray-500">{changeLabel}</span>}
              </div>
            )}
          </div>
          {icon && <div className="text-gray-400">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  )
}
