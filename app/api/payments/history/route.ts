import { type NextRequest, NextResponse } from "next/server"

const MOCK_PAYMENTS = [
  {
    id: "pay_1",
    courseId: "course_1",
    courseTitle: "Complete React Development Course",
    amount: 99.99,
    currency: "usd",
    status: "succeeded",
    method: "card",
    createdAt: "2024-01-15T10:30:00Z",
    receiptUrl: "#",
  },
  {
    id: "pay_2",
    courseId: "course_2",
    courseTitle: "Python Data Science Masterclass",
    amount: 149.99,
    currency: "usd",
    status: "succeeded",
    method: "paypal",
    createdAt: "2024-02-01T14:20:00Z",
    receiptUrl: "#",
  },
  {
    id: "pay_3",
    courseId: "course_3",
    courseTitle: "Advanced JavaScript Concepts",
    amount: 79.99,
    currency: "usd",
    status: "failed",
    method: "card",
    createdAt: "2024-02-10T09:15:00Z",
    receiptUrl: null,
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const status = searchParams.get("status")

  let payments = MOCK_PAYMENTS

  if (status && status !== "all") {
    payments = payments.filter((p) => p.status === status)
  }

  return NextResponse.json({ payments })
}
