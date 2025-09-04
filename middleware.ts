import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Define protected routes
const protectedRoutes = ["/session"]
// const protectedRoutes = ["/admin", "/instructor", "/student", "/profile", "/settings"]
const authRoutes = ["/login", "/register"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get("accessToken")?.value

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // If accessing auth routes while logged in, redirect to dashboard
  if (isAuthRoute && accessToken) {
    try {
      const decoded = jwt.verify(accessToken, JWT_SECRET) as any
      const dashboardUrl = `/${decoded.role}`
      return NextResponse.redirect(new URL(dashboardUrl, request.url))
    } catch (error) {
      // Invalid token, continue to auth route
    }
  }

  // If accessing protected route without token, redirect to login
  if (isProtectedRoute && !accessToken) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If accessing protected route with token, verify it
  if (isProtectedRoute && accessToken) {
    try {
      const decoded = jwt.verify(accessToken, JWT_SECRET) as any

      // Check role-based access
      if (pathname.startsWith("/admin") && decoded.role !== "admin") {
        return NextResponse.redirect(new URL(`/${decoded.role}`, request.url))
      }
      if (pathname.startsWith("/instructor") && !["admin", "instructor"].includes(decoded.role)) {
        return NextResponse.redirect(new URL(`/${decoded.role}`, request.url))
      }
      if (pathname.startsWith("/student") && decoded.role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url))
      }
    } catch (error) {
      // Invalid token, redirect to login
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
