import { type NextRequest, NextResponse } from "next/server"

const POINT_VALUES = {
  lesson_completed: 10,
  quiz_passed: 25,
  course_completed: 100,
  streak_maintained: 5,
  forum_post: 15,
  assignment_submitted: 30,
}

export async function POST(request: NextRequest) {
  const { userId, action, multiplier = 1 } = await request.json()

  const points = POINT_VALUES[action as keyof typeof POINT_VALUES] * multiplier

  if (!points) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }

  // Mock user data update
  const mockUser = {
    id: userId,
    totalPoints: 8750 + points,
    level: calculateLevel(8750 + points),
    streakDays: 15,
  }

  const leveledUp = calculateLevel(8750 + points) > calculateLevel(8750)
  const newBadges = checkBadgeEligibility(mockUser)

  return NextResponse.json({
    points,
    totalPoints: mockUser.totalPoints,
    level: mockUser.level,
    leveledUp,
    newBadges,
  })
}

function calculateLevel(totalPoints: number): number {
  return Math.floor(Math.sqrt(totalPoints / 100)) + 1
}

function checkBadgeEligibility(user: any): any[] {
  const newBadges = []

  // Check for point milestones
  if (user.totalPoints >= 10000) {
    newBadges.push({
      id: "point-master",
      name: "Point Master",
      description: "Earned 10,000 points",
      icon: "star",
      rarity: "epic",
    })
  }

  return newBadges
}
