import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { paymentIntentId, courseId, userId } = await request.json()

  // Mock payment confirmation
  const payment = {
    id: `pay_${Math.random().toString(36).substr(2, 9)}`,
    paymentIntentId,
    courseId,
    userId,
    amount: 99.99,
    currency: "usd",
    status: "succeeded",
    createdAt: new Date().toISOString(),
    method: "card",
  }

  // Mock enrollment creation
  const enrollment = {
    id: `enr_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    courseId,
    enrolledAt: new Date().toISOString(),
    status: "active",
    progress: 0,
  }

  return NextResponse.json({
    success: true,
    payment,
    enrollment,
    message: "Payment successful! You are now enrolled in the course.",
  })
}
