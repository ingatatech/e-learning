"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MetricCard } from "@/components/analytics/metric-card"
import { ChartContainer } from "@/components/analytics/chart-container"
import { CustomLineChart } from "@/components/analytics/line-chart"
import { CustomBarChart } from "@/components/analytics/bar-chart"
import { CustomPieChart } from "@/components/analytics/pie-chart"
import { Users, BookOpen, DollarSign, TrendingUp, Award, Clock, Target, Star } from "lucide-react"

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("30d")
  const [role] = useState("admin") // This would come from auth context
  const [overviewData, setOverviewData] = useState<any>(null)
  const [chartData, setChartData] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [period, role])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      // Fetch overview data
      const overviewResponse = await fetch(`/api/analytics/overview?period=${period}&role=${role}`)
      const overview = await overviewResponse.json()
      setOverviewData(overview.data)

      // Fetch chart data
      const chartTypes = ["users", "revenue", "enrollments", "courseCompletion", "categoryDistribution"]
      const chartPromises = chartTypes.map((type) =>
        fetch(`/api/analytics/charts?type=${type}&period=${period}`).then((res) => res.json()),
      )

      const charts = await Promise.all(chartPromises)
      const chartDataMap = chartTypes.reduce((acc, type, index) => {
        acc[type] = charts[index]
        return acc
      }, {} as any)

      setChartData(chartDataMap)
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !overviewData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Comprehensive insights and performance metrics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Comprehensive insights and performance metrics</p>
        </div>

        <div className="flex gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={fetchAnalytics} variant="outline">
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {role === "admin" && (
          <>
            <MetricCard
              title="Total Users"
              value={overviewData.totalUsers}
              change={overviewData.userGrowth}
              changeLabel="vs last period"
              icon={<Users className="w-8 h-8" />}
            />
            <MetricCard
              title="Total Courses"
              value={overviewData.totalCourses}
              icon={<BookOpen className="w-8 h-8" />}
            />
            <MetricCard
              title="Total Revenue"
              value={overviewData.totalRevenue}
              change={overviewData.revenueGrowth}
              changeLabel="vs last period"
              format="currency"
              icon={<DollarSign className="w-8 h-8" />}
            />
            <MetricCard
              title="Engagement Rate"
              value={overviewData.engagementRate}
              format="percentage"
              icon={<TrendingUp className="w-8 h-8" />}
            />
          </>
        )}

        {role === "instructor" && (
          <>
            <MetricCard
              title="Total Students"
              value={overviewData.totalStudents}
              icon={<Users className="w-8 h-8" />}
            />
            <MetricCard title="Course Rating" value={overviewData.averageRating} icon={<Star className="w-8 h-8" />} />
            <MetricCard
              title="Monthly Earnings"
              value={overviewData.monthlyEarnings}
              format="currency"
              icon={<DollarSign className="w-8 h-8" />}
            />
            <MetricCard
              title="Completion Rate"
              value={overviewData.completionRate}
              format="percentage"
              icon={<Target className="w-8 h-8" />}
            />
          </>
        )}

        {role === "student" && (
          <>
            <MetricCard
              title="Courses Enrolled"
              value={overviewData.coursesEnrolled}
              icon={<BookOpen className="w-8 h-8" />}
            />
            <MetricCard title="Total Points" value={overviewData.totalPoints} icon={<Award className="w-8 h-8" />} />
            <MetricCard title="Study Time" value={`${overviewData.studyTime}h`} icon={<Clock className="w-8 h-8" />} />
            <MetricCard
              title="Average Score"
              value={overviewData.averageScore}
              format="percentage"
              icon={<Target className="w-8 h-8" />}
            />
          </>
        )}
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer title={chartData.users?.title || "User Growth"} onRefresh={() => fetchAnalytics()}>
              <CustomLineChart data={chartData.users?.data || []} color="#3b82f6" />
            </ChartContainer>

            <ChartContainer title={chartData.revenue?.title || "Revenue Trend"} onRefresh={() => fetchAnalytics()}>
              <CustomLineChart data={chartData.revenue?.data || []} color="#10b981" />
            </ChartContainer>
          </div>

          <ChartContainer
            title={chartData.categoryDistribution?.title || "Course Categories"}
            onRefresh={() => fetchAnalytics()}
          >
            <CustomPieChart data={chartData.categoryDistribution?.data || []} />
          </ChartContainer>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <ChartContainer
            title={chartData.courseCompletion?.title || "Course Completion Rates"}
            onRefresh={() => fetchAnalytics()}
          >
            <CustomBarChart data={chartData.courseCompletion?.data || []} />
          </ChartContainer>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer title="Enrollment Trends" onRefresh={() => fetchAnalytics()}>
              <CustomLineChart data={chartData.enrollments?.data || []} color="#f59e0b" />
            </ChartContainer>

            <ChartContainer title="User Engagement" onRefresh={() => fetchAnalytics()}>
              <CustomLineChart data={chartData.engagement?.data || []} color="#8b5cf6" />
            </ChartContainer>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Active Users"
              value={overviewData.activeUsers || 0}
              change={12.5}
              changeLabel="vs last month"
            />
            <MetricCard
              title="Course Completions"
              value={overviewData.courseCompletions || 0}
              change={8.3}
              changeLabel="vs last month"
            />
            <MetricCard
              title="Average Rating"
              value={overviewData.averageRating || 0}
              change={2.1}
              changeLabel="vs last month"
            />
          </div>

          <ChartContainer title="Daily Active Users" onRefresh={() => fetchAnalytics()}>
            <CustomLineChart data={chartData.users?.data || []} color="#ef4444" />
          </ChartContainer>
        </TabsContent>
      </Tabs>
    </div>
  )
}
