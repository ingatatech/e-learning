"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface LineChartProps {
  data: Array<{ date: string; value: number }>
  color?: string
  height?: number
}

export function CustomLineChart({ data, color = "#3b82f6", height = 300 }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis
          dataKey="date"
          className="text-gray-600 dark:text-gray-400"
          tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        />
        <YAxis className="text-gray-600 dark:text-gray-400" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
          labelFormatter={(value) => new Date(value).toLocaleDateString()}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={{ fill: color, strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
