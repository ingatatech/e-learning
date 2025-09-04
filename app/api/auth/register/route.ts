import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, role = "student", organizationId } = await request.json()

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Check if user already exists (mock check)
    const existingUser = mockUsers.find((u) => u.email === email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const newUser = {
      id: (mockUsers.length + 1).toString(),
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      isEmailVerified: false,
      isActive: true,
      preferredLanguage: "en",
      theme: "light",
      totalPoints: 0,
      level: 1,
      streakDays: 0,
      organizationId: organizationId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Add to mock database
    mockUsers.push(newUser)

    // Generate email verification token
    const verificationToken = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_SECRET, {
      expiresIn: "24h",
    })

    // TODO: Send verification email
    console.log(`Verification email would be sent to ${email} with token: ${verificationToken}`)

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: "Registration successful. Please check your email to verify your account.",
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Mock users array (in real app, this would be in database)
const mockUsers: any[] = []
