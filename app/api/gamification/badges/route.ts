import { type NextRequest, NextResponse } from "next/server"

const BADGE_DEFINITIONS = [
  {
    id: "first-course",
    name: "First Steps",
    description: "Complete your first course",
    icon: "graduation-cap",
    rarity: "common",
    criteria: { type: "courses", threshold: 1 },
  },
  {
    id: "streak-warrior",
    name: "Streak Warrior",
    description: "Maintain a 30-day learning streak",
    icon: "flame",
    rarity: "rare",
    criteria: { type: "streak", threshold: 30 },
  },
  {
    id: "point-master",
    name: "Point Master",
    description: "Earn 10,000 points",
    icon: "star",
    rarity: "epic",
    criteria: { type: "points", threshold: 10000 },
  },
  {
    id: "quiz-champion",
    name: "Quiz Champion",
    description: "Pass 50 quizzes with perfect scores",
    icon: "trophy",
    rarity: "legendary",
    criteria: { type: "quizzes", threshold: 50 },
  },
  {
    id: "early-bird",
    name: "Early Bird",
    description: "Complete lessons before 9 AM for 7 days",
    icon: "sunrise",
    rarity: "rare",
    criteria: { type: "activity", threshold: 7, timeframe: "morning" },
  },
]

export async function GET() {
  return NextResponse.json({ badges: BADGE_DEFINITIONS })
}

export async function POST(request: NextRequest) {
  const { userId, badgeId } = await request.json()

  // Mock awarding badge
  const badge = BADGE_DEFINITIONS.find((b) => b.id === badgeId)
  if (!badge) {
    return NextResponse.json({ error: "Badge not found" }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    badge,
    earnedAt: new Date().toISOString(),
  })
}
