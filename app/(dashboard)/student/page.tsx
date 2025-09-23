"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Clock, Award, TrendingUp, Play, Calendar, Target } from "lucide-react"
import Link from "next/link"

export default function StudentDashboard() {

  
  // Mock data - replace with real API calls
  const studentStats = {
    enrolledCourses: 5,
    completedCourses: 2,
    totalPoints: 850,
    level: 2,
    streakDays: 7,
    hoursLearned: 45,
  }

  const enrolledCourses = [
    {
      id: "1",
      title: "React Fundamentals",
      instructor: "John Smith",
      progress: 75,
      totalLessons: 20,
      completedLessons: 15,
      nextLesson: "State Management",
      thumbnail: "/placeholder.svg?height=100&width=150",
    },
    {
      id: "2",
      title: "JavaScript Advanced",
      instructor: "Sarah Wilson",
      progress: 45,
      totalLessons: 25,
      completedLessons: 11,
      nextLesson: "Async/Await",
      thumbnail: "/placeholder.svg?height=100&width=150",
    },
    {
      id: "3",
      title: "UI/UX Design",
      instructor: "Mike Johnson",
      progress: 20,
      totalLessons: 18,
      completedLessons: 4,
      nextLesson: "Color Theory",
      thumbnail: "/placeholder.svg?height=100&width=150",
    },
  ]

  const recentAchievements = [
    { id: 1, name: "First Course", description: "Completed your first course", icon: "🎓", earnedAt: "2 days ago" },
    { id: 2, name: "Week Streak", description: "7 days learning streak", icon: "🔥", earnedAt: "1 day ago" },
    { id: 3, name: "Quick Learner", description: "Completed 5 lessons in one day", icon: "⚡", earnedAt: "3 days ago" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground">Continue your learning journey</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-primary/10 text-primary">Level {studentStats.level}</Badge>
          <Badge variant="outline">{studentStats.totalPoints} points</Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentStats.enrolledCourses}</div>
            <p className="text-xs text-muted-foreground">{studentStats.completedCourses} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Streak</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentStats.streakDays} days</div>
            <p className="text-xs text-muted-foreground">Keep it up!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Learned</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentStats.hoursLearned}h</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentStats.totalPoints}</div>
            <p className="text-xs text-muted-foreground">Level {studentStats.level}</p>
          </CardContent>
        </Card>
      </div>

      {/* Continue Learning */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Continue Learning</CardTitle>
            <CardDescription>Pick up where you left off</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {enrolledCourses.map((course) => (
              <div key={course.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="w-16 h-12 bg-muted rounded flex items-center justify-center">
                  <Play className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{course.title}</h4>
                  <p className="text-sm text-muted-foreground">by {course.instructor}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={course.progress} className="flex-1" />
                    <span className="text-xs text-muted-foreground">{course.progress}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Next: {course.nextLesson}</p>
                </div>
                <Button size="sm" asChild>
                  <Link href={`/courses/${course.id}`}>Continue</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
            <CardDescription>Your latest accomplishments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentAchievements.map((achievement) => (
              <div key={achievement.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-2xl">
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{achievement.name}</h4>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{achievement.earnedAt}</p>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full bg-transparent" asChild>
              <Link href="/student/achievements">
                <Award className="w-4 h-4 mr-2" />
                View All Achievements
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent" asChild>
          <Link href="/courses">
            <BookOpen className="w-6 h-6" />
            Browse Courses
          </Link>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent" asChild>
          <Link href="/leaderboard">
            <TrendingUp className="w-6 h-6" />
            Leaderboard
          </Link>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent" asChild>
          <Link href="/student/calendar">
            <Calendar className="w-6 h-6" />
            My Schedule
          </Link>
        </Button>
      </div>
    </div>
  )
}
