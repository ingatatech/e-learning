import { type NextRequest, NextResponse } from "next/server"

const SUBSCRIPTION_PLANS = [
  {
    id: "basic",
    name: "Basic Plan",
    description: "Access to basic courses and features",
    price: 29.99,
    currency: "usd",
    interval: "month",
    features: ["Access to 50+ courses", "Basic progress tracking", "Community access", "Mobile app access"],
  },
  {
    id: "premium",
    name: "Premium Plan",
    description: "Full access to all courses and premium features",
    price: 59.99,
    currency: "usd",
    interval: "month",
    features: [
      "Access to all courses",
      "Advanced analytics",
      "Priority support",
      "Offline downloads",
      "Certificates",
      "Live sessions",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise Plan",
    description: "Custom solution for organizations",
    price: 199.99,
    currency: "usd",
    interval: "month",
    features: [
      "Everything in Premium",
      "Custom branding",
      "Advanced admin tools",
      "API access",
      "Dedicated support",
      "Custom integrations",
    ],
  },
]

export async function GET() {
  return NextResponse.json({ plans: SUBSCRIPTION_PLANS })
}

export async function POST(request: NextRequest) {
  const { planId, userId } = await request.json()

  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId)
  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 })
  }

  // Mock subscription creation
  const subscription = {
    id: `sub_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    planId,
    status: "active",
    currentPeriodStart: new Date().toISOString(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  }

  return NextResponse.json({ subscription })
}
