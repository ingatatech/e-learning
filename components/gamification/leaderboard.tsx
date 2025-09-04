"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Medal, Award, Star } from "lucide-react"

interface LeaderboardUser {
  id: string
  firstName: string
  lastName: string
  avatar: string
  totalPoints: number
  level: number
  rank: number
  badge: string
}

interface LeaderboardProps {
  period?: "daily" | "weekly" | "monthly" | "all-time"
  organizationId?: string
}

export function Leaderboard({ period = "all-time", organizationId }: LeaderboardProps) {
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [currentUser, setCurrentUser] = useState<LeaderboardUser | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState(period)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [selectedPeriod, organizationId])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        period: selectedPeriod,
        ...(organizationId && { organizationId }),
      })

      const response = await fetch(`/api/gamification/leaderboard?${params}`)
      const data = await response.json()

      setUsers(data.users)
      setCurrentUser(data.currentUser)
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />
    return <Star className="w-5 h-5 text-blue-500" />
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-400 to-yellow-600"
    if (rank === 2) return "bg-gradient-to-r from-gray-300 to-gray-500"
    if (rank === 3) return "bg-gradient-to-r from-amber-400 to-amber-600"
    return "bg-gradient-to-r from-blue-400 to-blue-600"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse"
              >
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3" />
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Leaderboard
        </CardTitle>
        <div className="flex gap-2">
          {["daily", "weekly", "monthly", "all-time"].map((p) => (
            <Button
              key={p}
              variant={selectedPeriod === p ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(p as any)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1).replace("-", " ")}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className={`
                flex items-center gap-3 p-3 rounded-lg transition-all
                ${
                  user.id === currentUser?.id
                    ? "bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800"
                    : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
                }
              `}
            >
              <div
                className={`
                w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm
                ${getRankColor(user.rank)}
              `}
              >
                {user.rank <= 3 ? getRankIcon(user.rank) : user.rank}
              </div>

              <Avatar className="w-10 h-10">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={`${user.firstName} ${user.lastName}`} />
                <AvatarFallback>
                  {user.firstName[0]}
                  {user.lastName[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {user.firstName} {user.lastName}
                  </span>
                  {user.badge && <span className="text-lg">{user.badge}</span>}
                  {user.id === currentUser?.id && (
                    <Badge variant="secondary" className="text-xs">
                      You
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Level {user.level} • {user.totalPoints.toLocaleString()} points
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
