"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface BarChartProps {
  data: Array<{ name: string; completed: number; total: number }>
  height?: number
}

export function CustomBarChart({ data, height = 300 }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis dataKey="name" className="text-gray-600 dark:text-gray-400" angle={-45} textAnchor="end" height={80} />
        <YAxis className="text-gray-600 dark:text-gray-400" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
          formatter={(value, name) => [
            `${value}${name === "completed" ? " completed" : " total"}`,
            name === "completed" ? "Completed" : "Total",
          ]}
        />
        <Bar dataKey="total" fill="#e5e7eb" name="total" />
        <Bar dataKey="completed" fill="#3b82f6" name="completed" />
      </BarChart>
    </ResponsiveContainer>
  )
}
