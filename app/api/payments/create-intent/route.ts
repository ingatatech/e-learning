import { type NextRequest, NextResponse } from "next/server"

// Mock Stripe integration
export async function POST(request: NextRequest) {
  const { amount, currency = "usd", courseId, userId } = await request.json()

  // Mock payment intent creation
  const paymentIntent = {
    id: `pi_${Math.random().toString(36).substr(2, 9)}`,
    client_secret: `pi_${Math.random().toString(36).substr(2, 9)}_secret_${Math.random().toString(36).substr(2, 9)}`,
    amount: amount * 100, // Convert to cents
    currency,
    status: "requires_payment_method",
    metadata: {
      courseId,
      userId,
    },
  }

  return NextResponse.json({ paymentIntent })
}
