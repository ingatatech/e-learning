"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BadgeDisplay } from "@/components/gamification/badge-display"
import { ProgressRing } from "@/components/gamification/progress-ring"
import { Leaderboard } from "@/components/gamification/leaderboard"
import { AchievementModal } from "@/components/gamification/achievement-modal"
import { Star, Flame, Award, TrendingUp } from "lucide-react"

export default function GamificationPage() {
  const [userStats, setUserStats] = useState({
    totalPoints: 8750,
    level: 9,
    streakDays: 15,
    coursesCompleted: 12,
    badgesEarned: 8,
    nextLevelPoints: 10000,
  })

  const [badges, setBadges] = useState([])
  const [userBadges, setUserBadges] = useState([
    {
      id: "first-course",
      name: "First Steps",
      description: "Complete your first course",
      icon: "graduation-cap",
      rarity: "common",
      earnedAt: "2024-01-15",
    },
    {
      id: "streak-warrior",
      name: "Streak Warrior",
      description: "Maintain a 15-day learning streak",
      icon: "flame",
      rarity: "rare",
      earnedAt: "2024-02-01",
    },
    {
      id: "quiz-master",
      name: "Quiz Master",
      description: "Pass 25 quizzes",
      icon: "brain",
      rarity: "epic",
      earnedAt: "2024-02-15",
    },
  ])

  const [achievementModal, setAchievementModal] = useState<{
    isOpen: boolean
    achievement: any
  }>({ isOpen: false, achievement: null })

  useEffect(() => {
    fetchBadges()
  }, [])

  const fetchBadges = async () => {
    try {
      const response = await fetch("/api/gamification/badges")
      const data = await response.json()
      setBadges(data.badges)
    } catch (error) {
      console.error("Failed to fetch badges:", error)
    }
  }

  const progressToNextLevel = ((userStats.totalPoints % 1000) / 1000) * 100

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gamification Hub</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your progress, earn badges, and compete with others</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Points</p>
                <p className="text-2xl font-bold text-primary-600">{userStats.totalPoints.toLocaleString()}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Level</p>
                <p className="text-2xl font-bold text-primary-600">{userStats.level}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Learning Streak</p>
                <p className="text-2xl font-bold text-orange-600">{userStats.streakDays} days</p>
              </div>
              <Flame className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Badges Earned</p>
                <p className="text-2xl font-bold text-purple-600">{userStats.badgesEarned}</p>
              </div>
              <Award className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Level Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <ProgressRing
                progress={progressToNextLevel}
                size={120}
                color="#3b82f6"
                label={`Level ${userStats.level}`}
              />
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progress to Level {userStats.level + 1}</span>
                  <span className="text-sm text-gray-500">
                    {userStats.totalPoints} / {userStats.nextLevelPoints}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressToNextLevel}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {userStats.nextLevelPoints - userStats.totalPoints} points to next level
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userBadges.slice(0, 3).map((badge) => (
                <div key={badge.id} className="flex items-center gap-3">
                  <BadgeDisplay badge={badge} size="sm" />
                  <div>
                    <p className="font-medium text-sm">{badge.name}</p>
                    <p className="text-xs text-gray-500">{new Date(badge.earnedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="badges" className="space-y-6">
        <TabsList>
          <TabsTrigger value="badges">My Badges</TabsTrigger>
          <TabsTrigger value="available">Available Badges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="badges">
          <Card>
            <CardHeader>
              <CardTitle>Earned Badges ({userBadges.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {userBadges.map((badge) => (
                  <div key={badge.id} className="text-center space-y-2">
                    <BadgeDisplay badge={badge} size="lg" />
                    <div>
                      <p className="font-medium text-sm">{badge.name}</p>
                      <p className="text-xs text-gray-500">{badge.description}</p>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {badge.rarity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="available">
          <Card>
            <CardHeader>
              <CardTitle>Available Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map((badge: any) => (
                  <div key={badge.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center gap-3">
                      <BadgeDisplay badge={badge} size="md" />
                      <div>
                        <p className="font-medium">{badge.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {badge.rarity}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{badge.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Leaderboard />
        </TabsContent>
      </Tabs>

      <AchievementModal
        achievement={achievementModal.achievement}
        isOpen={achievementModal.isOpen}
        onClose={() => setAchievementModal({ isOpen: false, achievement: null })}
      />
    </div>
  )
}
