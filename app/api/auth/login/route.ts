import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

// Mock user database - replace with actual database
const mockUsers = [
  {
    id: "1",
    email: "admin@eduflow.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
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
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
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
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
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

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-refresh-secret"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find user by email
    const user = mockUsers.find((u) => u.email === email)
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json({ error: "Account is deactivated" }, { status: 401 })
    }

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    }

    const accessToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "15m" })
    const refreshToken = jwt.sign(tokenPayload, JWT_REFRESH_SECRET, { expiresIn: "7d" })

    // Set HTTP-only cookies
    const cookieStore = cookies()
    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes
    })

    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: "Login successful",
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
