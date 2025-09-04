import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-refresh-secret"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const refreshToken = cookieStore.get("refreshToken")?.value

    if (!refreshToken) {
      return NextResponse.json({ error: "No refresh token provided" }, { status: 401 })
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any

    // Generate new access token
    const tokenPayload = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    }

    const newAccessToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "15m" })

    // Set new access token cookie
    cookieStore.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes
    })

    return NextResponse.json({
      success: true,
      message: "Token refreshed successfully",
    })
  } catch (error) {
    console.error("Token refresh error:", error)
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 })
  }
}
