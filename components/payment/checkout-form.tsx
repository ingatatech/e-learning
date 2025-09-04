"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Lock, Shield } from "lucide-react"

interface CheckoutFormProps {
  course: {
    id: string
    title: string
    price: number
    thumbnail: string
    instructor: string
  }
  onPaymentSuccess: () => void
}

export function CheckoutForm({ course, onPaymentSuccess }: CheckoutFormProps) {
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card")
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    name: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create payment intent
      const intentResponse = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: course.price,
          courseId: course.id,
          userId: "current-user-id",
        }),
      })

      const { paymentIntent } = await intentResponse.json()

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Confirm payment
      const confirmResponse = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId: paymentIntent.id,
          courseId: course.id,
          userId: "current-user-id",
        }),
      })

      const result = await confirmResponse.json()

      if (result.success) {
        onPaymentSuccess()
      }
    } catch (error) {
      console.error("Payment failed:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Course Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <img
              src={course.thumbnail || "/placeholder.svg"}
              alt={course.title}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold">{course.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">by {course.instructor}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Course Price</span>
              <span>${course.price}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>$0.00</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>${course.price}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Shield className="w-4 h-4" />
            <span>30-day money-back guarantee</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Secure Checkout
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment Method Selection */}
            <div className="space-y-3">
              <Label>Payment Method</Label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={paymentMethod === "card" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("card")}
                  className="flex-1"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Credit Card
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === "paypal" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("paypal")}
                  className="flex-1"
                >
                  PayPal
                </Button>
              </div>
            </div>

            {paymentMethod === "card" && (
              <>
                {/* Card Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={(e) => setFormData((prev) => ({ ...prev, cardNumber: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                        value={formData.expiryDate}
                        onChange={(e) => setFormData((prev) => ({ ...prev, expiryDate: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={formData.cvv}
                        onChange={(e) => setFormData((prev) => ({ ...prev, cvv: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Billing Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Billing Information</h3>

                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="123 Main St"
                      value={formData.address}
                      onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="New York"
                        value={formData.city}
                        onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        placeholder="10001"
                        value={formData.zipCode}
                        onChange={(e) => setFormData((prev) => ({ ...prev, zipCode: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Processing..." : `Complete Purchase - $${course.price}`}
            </Button>

            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              By completing your purchase, you agree to our Terms of Service and Privacy Policy. Your payment
              information is encrypted and secure.
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
