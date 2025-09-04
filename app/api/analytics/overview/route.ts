import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period") || "30d"
  const role = searchParams.get("role") || "admin"

  // Mock analytics data based on role
  const analyticsData = {
    admin: {
      totalUsers: 15420,
      totalCourses: 342,
      totalRevenue: 125890.5,
      activeUsers: 8750,
      courseCompletions: 2340,
      averageRating: 4.6,
      userGrowth: 12.5,
      revenueGrowth: 18.3,
      engagementRate: 76.2,
      churnRate: 3.8,
    },
    instructor: {
      totalStudents: 1250,
      totalCourses: 8,
      totalRevenue: 15420.75,
      averageRating: 4.7,
      completionRate: 68.5,
      engagementRate: 82.1,
      monthlyEarnings: 3240.5,
      newEnrollments: 145,
    },
    student: {
      coursesEnrolled: 12,
      coursesCompleted: 8,
      totalPoints: 8750,
      currentLevel: 9,
      streakDays: 15,
      studyTime: 145, // hours
      averageScore: 87.5,
      certificatesEarned: 6,
    },
  }

  return NextResponse.json({
    data: analyticsData[role as keyof typeof analyticsData],
    period,
  })
}
