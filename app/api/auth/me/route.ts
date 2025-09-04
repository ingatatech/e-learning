import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Mock user database
const mockUsers = [
  {
    id: "1",
    email: "admin@eduflow.com",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    isEmailVerified: true,
    isActive: true,
    totalPoints: 0,
    level: 1,
    streakDays: 0,
    organizationId: null,
  },
  {
    id: "2",
    email: "instructor@eduflow.com",
    firstName: "John",
    lastName: "Instructor",
    role: "instructor",
    isEmailVerified: true,
    isActive: true,
    totalPoints: 1250,
    level: 3,
    streakDays: 15,
    organizationId: null,
  },
  {
    id: "3",
    email: "student@eduflow.com",
    firstName: "Jane",
    lastName: "Student",
    role: "student",
    isEmailVerified: true,
    isActive: true,
    totalPoints: 850,
    level: 2,
    streakDays: 7,
    organizationId: null,
  },
]

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const accessToken = cookieStore.get("accessToken")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "No access token provided" }, { status: 401 })
    }

    // Verify token
    const decoded = jwt.verify(accessToken, JWT_SECRET) as any

    // Find user
    const user = mockUsers.find((u) => u.id === decoded.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Invalid access token" }, { status: 401 })
  }
}
