"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/course/progress-bar"
import { ProgressRing } from "@/components/gamification/progress-ring"
import { Leaderboard } from "@/components/gamification/leaderboard"
import { BadgeDisplay } from "@/components/gamification/badge-display"
import { MetricCard } from "@/components/analytics/metric-card"
import {
  BookOpen,
  Trophy,
  Clock,
  Target,
  Star,
  TrendingUp,
  Award,
  Calendar,
  CheckCircle,
  PlayCircle,
  Users,
  File as Fire,
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

interface StudentProgressDashboardProps {
  userId: string
}

export function StudentProgressDashboard({ userId }: StudentProgressDashboardProps) {
  const [progressData, setProgressData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchProgressData()
  }, [userId])

  const fetchProgressData = async () => {
    setLoading(true)
    try {
      // Mock data - replace with real API calls
      const mockData = {
        overview: {
          totalPoints: 2450,
          level: 8,
          streakDays: 12,
          coursesEnrolled: 5,
          coursesCompleted: 2,
          averageScore: 87,
          studyTime: 45,
          weeklyGoal: 10,
          weeklyProgress: 7,
        },
        courses: [
          {
            id: "1",
            title: "Complete React Development Bootcamp",
            progress: 75,
            completedLessons: 18,
            totalLessons: 24,
            timeSpent: 320,
            estimatedTime: 80,
            lastAccessed: "2024-01-15",
            nextLesson: "Advanced Hooks",
            instructor: "John Doe",
            rating: 4.8,
          },
          {
            id: "2",
            title: "JavaScript Fundamentals",
            progress: 100,
            completedLessons: 15,
            totalLessons: 15,
            timeSpent: 180,
            estimatedTime: 0,
            lastAccessed: "2024-01-10",
            completedAt: "2024-01-10",
            instructor: "Jane Smith",
            rating: 4.9,
          },
          {
            id: "3",
            title: "Node.js Backend Development",
            progress: 45,
            completedLessons: 9,
            totalLessons: 20,
            timeSpent: 150,
            estimatedTime: 200,
            lastAccessed: "2024-01-12",
            nextLesson: "Express.js Routing",
            instructor: "Mike Johnson",
            rating: 4.7,
          },
        ],
        achievements: [
          {
            id: "1",
            name: "First Course",
            description: "Completed your first course",
            icon: "🎓",
            rarity: "common",
            earnedAt: "2024-01-10",
            isNew: false,
          },
          {
            id: "2",
            name: "Speed Learner",
            description: "Completed 5 lessons in one day",
            icon: "⚡",
            rarity: "rare",
            earnedAt: "2024-01-14",
            isNew: true,
          },
          {
            id: "3",
            name: "Streak Master",
            description: "Maintained a 10-day learning streak",
            icon: "🔥",
            rarity: "epic",
            earnedAt: "2024-01-15",
            isNew: true,
          },
        ],
        weeklyActivity: [
          { day: "Mon", minutes: 45, lessons: 2 },
          { day: "Tue", minutes: 60, lessons: 3 },
          { day: "Wed", minutes: 30, lessons: 1 },
          { day: "Thu", minutes: 75, lessons: 4 },
          { day: "Fri", minutes: 90, lessons: 3 },
          { day: "Sat", minutes: 0, lessons: 0 },
          { day: "Sun", minutes: 120, lessons: 5 },
        ],
      }

      setTimeout(() => {
        setProgressData(mockData)
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Failed to fetch progress data:", error)
      setLoading(false)
    }
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getStreakColor = (days: number) => {
    if (days >= 30) return "text-purple-600"
    if (days >= 14) return "text-orange-600"
    if (days >= 7) return "text-yellow-600"
    return "text-blue-600"
  }

  if (loading || !progressData) {
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
          <h1 className="text-3xl font-bold">My Learning Progress</h1>
          <p className="text-muted-foreground">Track your learning journey and achievements</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`flex items-center gap-1 ${getStreakColor(progressData.overview.streakDays)}`}
          >
            <Fire className="w-4 h-4" />
            {progressData.overview.streakDays} day streak
          </Badge>
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            Level {progressData.overview.level}
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Points"
          value={progressData.overview.totalPoints}
          icon={<Trophy className="w-8 h-8 text-yellow-500" />}
        />
        <MetricCard
          title="Courses Completed"
          value={`${progressData.overview.coursesCompleted}/${progressData.overview.coursesEnrolled}`}
          icon={<BookOpen className="w-8 h-8 text-blue-500" />}
        />
        <MetricCard
          title="Study Time"
          value={`${progressData.overview.studyTime}h`}
          icon={<Clock className="w-8 h-8 text-green-500" />}
        />
        <MetricCard
          title="Average Score"
          value={progressData.overview.averageScore}
          format="percentage"
          icon={<Target className="w-8 h-8 text-purple-500" />}
        />
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weekly Goal Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  Weekly Goal
                </CardTitle>
                <CardDescription>Complete {progressData.overview.weeklyGoal} hours this week</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ProgressRing
                  progress={(progressData.overview.weeklyProgress / progressData.overview.weeklyGoal) * 100}
                  size={120}
                  color="#3b82f6"
                  label={`${progressData.overview.weeklyProgress}/${progressData.overview.weeklyGoal} hours`}
                />
              </CardContent>
            </Card>

            {/* Level Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Level Progress
                </CardTitle>
                <CardDescription>Progress to Level {progressData.overview.level + 1}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ProgressRing progress={75} size={120} color="#eab308" label={`Level ${progressData.overview.level}`} />
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-500" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {progressData.achievements.slice(0, 3).map((achievement: any) => (
                    <div key={achievement.id} className="flex items-center gap-3">
                      <BadgeDisplay badge={achievement} size="sm" isNew={achievement.isNew} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{achievement.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{achievement.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-500" />
                Weekly Activity
              </CardTitle>
              <CardDescription>Your learning activity this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {progressData.weeklyActivity.map((day: any, index: number) => (
                  <div key={day.day} className="text-center">
                    <div className="text-xs text-muted-foreground mb-2">{day.day}</div>
                    <div
                      className={`h-20 rounded-lg flex flex-col items-center justify-center text-white text-xs font-medium ${
                        day.minutes > 0 ? "bg-gradient-to-t from-blue-500 to-blue-400" : "bg-gray-200 dark:bg-gray-700"
                      }`}
                      style={{
                        height: `${Math.max(20, (day.minutes / 120) * 80)}px`,
                      }}
                    >
                      {day.minutes > 0 && (
                        <>
                          <div>{day.minutes}m</div>
                          <div>{day.lessons}📚</div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <div className="grid gap-6">
            {progressData.courses.map((course: any) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5" />
                          {course.title}
                        </CardTitle>
                        <CardDescription>
                          Instructor: {course.instructor} • Rating: {course.rating} ⭐
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {course.progress === 100 ? (
                          <Badge className="bg-green-500 hover:bg-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        ) : (
                          <Badge variant="outline">{Math.round(course.progress)}% Complete</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ProgressBar
                      progress={course.progress}
                      completedLessons={course.completedLessons}
                      totalLessons={course.totalLessons}
                      timeSpent={course.timeSpent}
                      estimatedTime={course.estimatedTime}
                    />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(course.timeSpent)} spent</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Last: {new Date(course.lastAccessed).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {course.progress === 100 ? (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/courses/${course.id}/certificate`}>
                              <Award className="w-4 h-4 mr-2" />
                              Certificate
                            </Link>
                          </Button>
                        ) : (
                          <Button size="sm" asChild>
                            <Link href={`/courses/${course.id}/continue`}>
                              <PlayCircle className="w-4 h-4 mr-2" />
                              Continue: {course.nextLesson}
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {progressData.achievements.map((achievement: any) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`relative ${achievement.isNew ? "ring-2 ring-yellow-400" : ""}`}>
                  {achievement.isNew && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      New!
                    </div>
                  )}
                  <CardContent className="p-6 text-center">
                    <BadgeDisplay
                      badge={achievement}
                      size="lg"
                      isNew={achievement.isNew}
                      showAnimation={achievement.isNew}
                    />
                    <h3 className="font-bold text-lg mt-4">{achievement.name}</h3>
                    <p className="text-sm text-muted-foreground mt-2">{achievement.description}</p>
                    <div className="text-xs text-muted-foreground mt-3">
                      Earned on {new Date(achievement.earnedAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Leaderboard period="weekly" />
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Your Rank
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">#12</div>
                  <div className="text-sm text-muted-foreground">This week</div>
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="text-sm font-medium">Points to next rank</div>
                    <div className="text-lg font-bold text-primary">150 pts</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Weekly Points</span>
                    <span className="font-medium">450</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Rank Change</span>
                    <span className="font-medium text-green-600">+3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Best Streak</span>
                    <span className="font-medium">12 days</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
