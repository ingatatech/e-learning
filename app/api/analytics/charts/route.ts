import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || "users"
  const period = searchParams.get("period") || "30d"

  // Generate mock chart data
  const generateTimeSeriesData = (days: number, baseValue: number, variance: number) => {
    const data = []
    for (let i = days; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const value = baseValue + Math.random() * variance - variance / 2
      data.push({
        date: date.toISOString().split("T")[0],
        value: Math.max(0, Math.round(value)),
      })
    }
    return data
  }

  const chartData = {
    users: {
      title: "User Growth",
      data: generateTimeSeriesData(30, 500, 100),
    },
    revenue: {
      title: "Revenue Trend",
      data: generateTimeSeriesData(30, 5000, 1000),
    },
    enrollments: {
      title: "Course Enrollments",
      data: generateTimeSeriesData(30, 150, 50),
    },
    engagement: {
      title: "User Engagement",
      data: generateTimeSeriesData(30, 75, 15),
    },
    courseCompletion: {
      title: "Course Completion Rate",
      data: [
        { name: "React Development", completed: 85, total: 120 },
        { name: "Python Data Science", completed: 92, total: 150 },
        { name: "JavaScript Advanced", completed: 67, total: 95 },
        { name: "UI/UX Design", completed: 78, total: 110 },
        { name: "Machine Learning", completed: 45, total: 80 },
      ],
    },
    categoryDistribution: {
      title: "Course Categories",
      data: [
        { name: "Programming", value: 45, color: "#3b82f6" },
        { name: "Design", value: 25, color: "#10b981" },
        { name: "Business", value: 15, color: "#f59e0b" },
        { name: "Marketing", value: 10, color: "#ef4444" },
        { name: "Other", value: 5, color: "#8b5cf6" },
      ],
    },
  }

  return NextResponse.json(chartData[type as keyof typeof chartData] || chartData.users)
}
