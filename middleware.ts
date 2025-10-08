import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

const secret = new TextEncoder().encode(JWT_SECRET)

// Define protected routes
const protectedRoutes = ["/admin", "/instructor", "/student", "/profile", "/settings", "/sysAdmin"]
const authRoutes = ["/login", "/verify-otp"]

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch (err) {
    console.error("Token verification failed:", err)
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get("accessToken")?.value

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // If accessing auth routes while logged in, redirect to dashboard
  if (isAuthRoute && accessToken) {
    const decoded: any = await verifyToken(accessToken)
    if (decoded) {
      const dashboardUrl = `/${decoded.role}`
      return NextResponse.redirect(new URL(dashboardUrl, request.url))
    }
  }

  // If accessing protected route without token, redirect to login
  if (isProtectedRoute && !accessToken) {
    console.log("Protected route accessed without token")
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If accessing protected route with token, verify it
  if (isProtectedRoute && accessToken) {
    const decoded: any = await verifyToken(accessToken)
    if (!decoded) {
      return NextResponse.redirect(new URL("/login", request.url))
    }


    // Role checks
    if (!pathname.startsWith("/profile") && !pathname.startsWith("/settings") && !pathname.startsWith(`/${decoded.role}`)) {
      return NextResponse.redirect(new URL(`/${decoded.role}`, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
