import { type NextRequest, NextResponse } from "next/server"

// Mock leaderboard data
const MOCK_LEADERBOARD = [
  {
    id: "1",
    firstName: "Alice",
    lastName: "Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    totalPoints: 15420,
    level: 12,
    rank: 1,
  },
  {
    id: "2",
    firstName: "Bob",
    lastName: "Smith",
    avatar: "/placeholder.svg?height=40&width=40",
    totalPoints: 14890,
    level: 12,
    rank: 2,
  },
  {
    id: "3",
    firstName: "Carol",
    lastName: "Davis",
    avatar: "/placeholder.svg?height=40&width=40",
    totalPoints: 13750,
    level: 11,
    rank: 3,
  },
  {
    id: "4",
    firstName: "David",
    lastName: "Wilson",
    avatar: "/placeholder.svg?height=40&width=40",
    totalPoints: 12980,
    level: 11,
    rank: 4,
  },
  {
    id: "5",
    firstName: "Emma",
    lastName: "Brown",
    avatar: "/placeholder.svg?height=40&width=40",
    totalPoints: 11650,
    level: 10,
    rank: 5,
  },
  {
    id: "6",
    firstName: "Frank",
    lastName: "Miller",
    avatar: "/placeholder.svg?height=40&width=40",
    totalPoints: 10420,
    level: 10,
    rank: 6,
  },
  {
    id: "7",
    firstName: "Grace",
    lastName: "Taylor",
    avatar: "/placeholder.svg?height=40&width=40",
    totalPoints: 9890,
    level: 9,
    rank: 7,
  },
  {
    id: "8",
    firstName: "Henry",
    lastName: "Anderson",
    avatar: "/placeholder.svg?height=40&width=40",
    totalPoints: 8750,
    level: 9,
    rank: 8,
  },
  {
    id: "9",
    firstName: "Ivy",
    lastName: "Thomas",
    avatar: "/placeholder.svg?height=40&width=40",
    totalPoints: 7980,
    level: 8,
    rank: 9,
  },
  {
    id: "10",
    firstName: "Jack",
    lastName: "Jackson",
    avatar: "/placeholder.svg?height=40&width=40",
    totalPoints: 7250,
    level: 8,
    rank: 10,
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period") || "all-time"
  const organizationId = searchParams.get("organizationId")

  // Filter by organization if provided
  const leaderboard = MOCK_LEADERBOARD
  if (organizationId) {
    // In real implementation, filter by organization
  }

  // Add rank badges
  const leaderboardWithBadges = leaderboard.map((user) => ({
    ...user,
    badge: getRankBadge(user.rank),
  }))

  return NextResponse.json({
    users: leaderboardWithBadges,
    period,
    currentUser: leaderboardWithBadges[4], // Mock current user as 5th place
  })
}

function getRankBadge(rank: number): string {
  if (rank === 1) return "🥇"
  if (rank === 2) return "🥈"
  if (rank === 3) return "🥉"
  if (rank <= 10) return "⭐"
  return ""
}
