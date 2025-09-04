"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw } from "lucide-react"

interface ChartContainerProps {
  title: string
  children: React.ReactNode
  onExport?: () => void
  onRefresh?: () => void
  loading?: boolean
}

export function ChartContainer({ title, children, onExport, onRefresh, loading = false }: ChartContainerProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex gap-2">
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            )}
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
