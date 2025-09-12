"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MetricCard } from "@/components/analytics/metric-card"
import { ChartContainer } from "@/components/analytics/chart-container"
import { CustomLineChart } from "@/components/analytics/line-chart"
import { CustomBarChart } from "@/components/analytics/bar-chart"
import { ProgressBar } from "@/components/course/progress-bar"
import { Users, BookOpen, TrendingUp, Target, Star, AlertCircle, CheckCircle, PlayCircle } from "lucide-react"
import { motion } from "framer-motion"

interface InstructorProgressAnalyticsProps {
  instructorId: string
}

export function InstructorProgressAnalytics({ instructorId }: InstructorProgressAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [selectedPeriod, setSelectedPeriod] = useState("30d")
  const [selectedCourse, setSelectedCourse] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalyticsData()
  }, [instructorId, selectedPeriod, selectedCourse])

  const fetchAnalyticsData = async () => {
    setLoading(true)
    try {
      // Mock data - replace with real API calls
      const mockData = {
        overview: {
          totalStudents: 1247,
          activeStudents: 892,
          averageProgress: 68,
          completionRate: 73,
          averageRating: 4.7,
          totalRevenue: 45680,
          engagementRate: 85,
          retentionRate: 78,
        },
        courses: [
          {
            id: "1",
            title: "Complete React Development Bootcamp",
            students: 456,
            averageProgress: 72,
            completionRate: 68,
            rating: 4.8,
            revenue: 22800,
            lastWeekEnrollments: 23,
            strugglingStudents: 12,
            topPerformers: 45,
          },
          {
            id: "2",
            title: "JavaScript Fundamentals",
            students: 324,
            averageProgress: 85,
            completionRate: 89,
            rating: 4.9,
            revenue: 12960,
            lastWeekEnrollments: 18,
            strugglingStudents: 5,
            topPerformers: 67,
          },
          {
            id: "3",
            title: "Node.js Backend Development",
            students: 467,
            averageProgress: 58,
            completionRate: 62,
            rating: 4.6,
            revenue: 18680,
            lastWeekEnrollments: 31,
            strugglingStudents: 28,
            topPerformers: 34,
          },
        ],
        studentProgress: [
          { name: "Week 1", enrolled: 45, active: 42, completed: 8 },
          { name: "Week 2", enrolled: 52, active: 48, completed: 12 },
          { name: "Week 3", enrolled: 38, active: 35, completed: 15 },
          { name: "Week 4", enrolled: 61, active: 58, completed: 18 },
        ],
        engagementTrends: [
          { name: "Jan", engagement: 78, completion: 65 },
          { name: "Feb", engagement: 82, completion: 71 },
          { name: "Mar", engagement: 85, completion: 73 },
          { name: "Apr", engagement: 88, completion: 76 },
        ],
        strugglingStudents: [
          {
            id: "1",
            name: "Alice Johnson",
            course: "React Bootcamp",
            progress: 25,
            lastActive: "3 days ago",
            timeSpent: 45,
            averageScore: 62,
            needsHelp: true,
          },
          {
            id: "2",
            name: "Bob Smith",
            course: "Node.js Development",
            progress: 18,
            lastActive: "1 week ago",
            timeSpent: 23,
            averageScore: 45,
            needsHelp: true,
          },
        ],
      }

      setTimeout(() => {
        setAnalyticsData(mockData)
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Failed to fetch analytics data:", error)
      setLoading(false)
    }
  }

  if (loading || !analyticsData) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Student Progress Analytics</h1>
          <p className="text-muted-foreground">Monitor student engagement and course performance</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {analyticsData.courses.map((course: any) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Students"
          value={analyticsData.overview.totalStudents}
          change={12.5}
          changeLabel="vs last month"
          icon={<Users className="w-8 h-8 text-blue-500" />}
        />
        <MetricCard
          title="Average Progress"
          value={analyticsData.overview.averageProgress}
          format="percentage"
          change={5.2}
          changeLabel="vs last month"
          icon={<TrendingUp className="w-8 h-8 text-green-500" />}
        />
        <MetricCard
          title="Completion Rate"
          value={analyticsData.overview.completionRate}
          format="percentage"
          change={3.1}
          changeLabel="vs last month"
          icon={<Target className="w-8 h-8 text-purple-500" />}
        />
        <MetricCard
          title="Average Rating"
          value={analyticsData.overview.averageRating}
          change={2.3}
          changeLabel="vs last month"
          icon={<Star className="w-8 h-8 text-yellow-500" />}
        />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Course Performance</TabsTrigger>
          <TabsTrigger value="students">Student Insights</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer title="Student Progress Trends" onRefresh={fetchAnalyticsData}>
              <CustomLineChart data={analyticsData.studentProgress} color="#3b82f6" />
            </ChartContainer>
            <ChartContainer title="Engagement & Completion" onRefresh={fetchAnalyticsData}>
              <CustomBarChart data={analyticsData.engagementTrends} />
            </ChartContainer>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  Students Need Help
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {analyticsData.courses.reduce((acc: number, course: any) => acc + course.strugglingStudents, 0)}
                </div>
                <p className="text-sm text-muted-foreground">Students with low progress</p>
                <Button variant="outline" size="sm" className="mt-3 w-full bg-transparent">
                  View Details
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {analyticsData.courses.reduce((acc: number, course: any) => acc + course.topPerformers, 0)}
                </div>
                <p className="text-sm text-muted-foreground">High-achieving students</p>
                <Button variant="outline" size="sm" className="mt-3 w-full bg-transparent">
                  Recognize Achievement
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-blue-500" />
                  Active This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-2">{analyticsData.overview.activeStudents}</div>
                <p className="text-sm text-muted-foreground">Students actively learning</p>
                <Button variant="outline" size="sm" className="mt-3 w-full bg-transparent">
                  Send Encouragement
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <div className="grid gap-6">
            {analyticsData.courses.map((course: any) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5" />
                          {course.title}
                        </CardTitle>
                        <CardDescription>
                          {course.students} students • {course.rating} ⭐ rating
                        </CardDescription>
                      </div>
                      <Badge variant="outline">+{course.lastWeekEnrollments} this week</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{course.averageProgress}%</div>
                        <div className="text-sm text-muted-foreground">Avg Progress</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{course.completionRate}%</div>
                        <div className="text-sm text-muted-foreground">Completion</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{course.strugglingStudents}</div>
                        <div className="text-sm text-muted-foreground">Need Help</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">${course.revenue.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Revenue</div>
                      </div>
                    </div>

                    <ProgressBar
                      progress={course.averageProgress}
                      completedLessons={Math.round((course.averageProgress / 100) * 20)}
                      totalLessons={20}
                      showDetails={false}
                    />

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Message Students
                      </Button>
                      <Button variant="outline" size="sm">
                        Course Analytics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                Students Who Need Support
              </CardTitle>
              <CardDescription>Students with low progress or engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.strugglingStudents.map((student: any) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {student.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-muted-foreground">{student.course}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-sm font-medium">{student.progress}%</div>
                        <div className="text-xs text-muted-foreground">Progress</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">{student.averageScore}%</div>
                        <div className="text-xs text-muted-foreground">Avg Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">{student.lastActive}</div>
                        <div className="text-xs text-muted-foreground">Last Active</div>
                      </div>
                      <Button size="sm">Send Message</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Engagement Rate"
              value={analyticsData.overview.engagementRate}
              format="percentage"
              change={4.2}
              changeLabel="vs last month"
              icon={<TrendingUp className="w-8 h-8" />}
            />
            <MetricCard
              title="Retention Rate"
              value={analyticsData.overview.retentionRate}
              format="percentage"
              change={-1.5}
              changeLabel="vs last month"
              icon={<Users className="w-8 h-8" />}
            />
            <MetricCard
              title="Active Students"
              value={analyticsData.overview.activeStudents}
              change={8.7}
              changeLabel="vs last month"
              icon={<PlayCircle className="w-8 h-8" />}
            />
          </div>

          <ChartContainer title="Engagement Trends" onRefresh={fetchAnalyticsData}>
            <CustomLineChart data={analyticsData.engagementTrends} color="#10b981" />
          </ChartContainer>
        </TabsContent>
      </Tabs>
    </div>
  )
}
