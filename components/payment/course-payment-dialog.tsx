"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CreditCard, Smartphone, Shield, Lock, CheckCircle, AlertCircle } from "lucide-react"
import type { Course } from "@/types"

interface CoursePaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: Course
  onPaymentSuccess: () => void
  token: string
  userId: string
}

export function CoursePaymentDialog({
  open,
  onOpenChange,
  course,
  onPaymentSuccess,
  token,
  userId,
}: CoursePaymentDialogProps) {
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "mobile_money">("card")
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const [formData, setFormData] = useState({
    // Card payment fields
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",

    // Mobile money fields
    phoneNumber: "",
    provider: "mtn", // mtn, airtel, or tigo for Rwanda

    // Common fields
    email: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setPaymentStatus("processing")
    setErrorMessage("")

    try {
      // Step 1: Create payment intent
      const intentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/create-payment-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: course.price,
          currency: "RWF",
          courseId: course.id,
          userId: userId,
          paymentMethod: paymentMethod,
          metadata: {
            courseTitle: course.title,
            instructorId: course.instructorId,
          },
        }),
      })

      if (!intentResponse.ok) {
        throw new Error("Failed to create payment intent")
      }

      const { payment } = await intentResponse.json()

      // Step 2: Process payment based on method
      let paymentResult
      if (paymentMethod === "card") {
        paymentResult = await processCardPayment(payment.paymentIntentId)
      } else {
        paymentResult = await processMobileMoneyPayment(payment.paymentIntentId)
      }

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || "Payment processing failed")
      }

      // Step 3: Confirm payment and enroll user
      const confirmResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentIntentId: payment.paymentIntentId,
          courseId: course.id,
          userId: userId,
          transactionId: paymentResult.transactionId,
        }),
      })

      if (!confirmResponse.ok) {
        throw new Error("Failed to confirm payment")
      }

      const confirmData = await confirmResponse.json()

      // Step 4: Enroll the user in the course
      const enrollResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/enrollments/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userId,
          courseId: course.id,
          paymentId: confirmData.payment.id,
        }),
      })

      if (!enrollResponse.ok) {
        throw new Error("Payment successful but enrollment failed. Please contact support.")
      }

      // Success!
      setPaymentStatus("success")
      setTimeout(() => {
        onPaymentSuccess()
        onOpenChange(false)
      }, 2000)
    } catch (error) {
      console.error("Payment failed:", error)
      setPaymentStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Payment failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const processCardPayment = async (paymentIntentId: string) => {
    // Simulate card payment processing
    // In production, this would integrate with a real payment gateway
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Validate card details
    if (formData.cardNumber.length < 16) {
      return { success: false, error: "Invalid card number" }
    }
    if (!formData.expiryDate.match(/^\d{2}\/\d{2}$/)) {
      return { success: false, error: "Invalid expiry date (MM/YY)" }
    }
    if (formData.cvv.length < 3) {
      return { success: false, error: "Invalid CVV" }
    }

    return {
      success: true,
      transactionId: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }
  }

  const processMobileMoneyPayment = async (paymentIntentId: string) => {
    // Simulate mobile money payment processing
    // In production, this would integrate with MTN Mobile Money, Airtel Money, etc.
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Validate phone number (Rwanda format)
    if (!formData.phoneNumber.match(/^(\+?250|0)?[7][0-9]{8}$/)) {
      return { success: false, error: "Invalid phone number. Use format: 07XXXXXXXX" }
    }

    return {
      success: true,
      transactionId: `momo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }
  }

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "")
    const chunks = cleaned.match(/.{1,4}/g) || []
    return chunks.join(" ")
  }

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`
    }
    return cleaned
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Lock className="w-6 h-6 text-primary" />
            Secure Course Payment
          </DialogTitle>
          <DialogDescription>Complete your payment to enroll in this course</DialogDescription>
        </DialogHeader>

        {paymentStatus === "success" ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-green-600">Payment Successful!</h3>
            <p className="text-muted-foreground">You have been enrolled in the course. Redirecting...</p>
          </div>
        ) : paymentStatus === "error" ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-red-600">Payment Failed</h3>
            <p className="text-muted-foreground">{errorMessage}</p>
            <Button onClick={() => setPaymentStatus("idle")} variant="outline">
              Try Again
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Course Summary */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex gap-4">
                <img
                  src={course.thumbnail || "/placeholder.svg"}
                  alt={course.title}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    by {course.instructor?.firstName} {course.instructor?.lastName}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Course Price</span>
                  <span className="font-medium">{course.price} RWF</span>
                </div>
                {course.originalPrice > course.price && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Original Price</span>
                    <span className="line-through">{course.originalPrice} RWF</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{course.price} RWF</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                    <CreditCard className="w-5 h-5" />
                    <div>
                      <div className="font-medium">Credit / Debit Card</div>
                      <div className="text-xs text-muted-foreground">Visa, Mastercard, Amex</div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="mobile_money" id="mobile_money" />
                  <Label htmlFor="mobile_money" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Smartphone className="w-5 h-5" />
                    <div>
                      <div className="font-medium">Mobile Money</div>
                      <div className="text-xs text-muted-foreground">MTN, Airtel, Tigo</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Payment Form Fields */}
            {paymentMethod === "card" ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    placeholder="John Doe"
                    value={formData.cardName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, cardName: e.target.value }))}
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={(e) => {
                      const formatted = formatCardNumber(e.target.value.replace(/\s/g, ""))
                      if (formatted.replace(/\s/g, "").length <= 16) {
                        setFormData((prev) => ({ ...prev, cardNumber: formatted }))
                      }
                    }}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      value={formData.expiryDate}
                      onChange={(e) => {
                        const formatted = formatExpiryDate(e.target.value)
                        if (formatted.replace(/\D/g, "").length <= 4) {
                          setFormData((prev) => ({ ...prev, expiryDate: formatted }))
                        }
                      }}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      type="password"
                      maxLength={4}
                      value={formData.cvv}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "")
                        setFormData((prev) => ({ ...prev, cvv: value }))
                      }}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="provider">Mobile Money Provider</Label>
                  <RadioGroup
                    value={formData.provider}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, provider: value }))}
                  >
                    <div className="flex gap-3">
                      <div className="flex items-center space-x-2 border rounded-lg p-3 flex-1 cursor-pointer hover:bg-muted/50">
                        <RadioGroupItem value="mtn" id="mtn" />
                        <Label htmlFor="mtn" className="cursor-pointer flex-1 text-center font-medium">
                          MTN
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-3 flex-1 cursor-pointer hover:bg-muted/50">
                        <RadioGroupItem value="airtel" id="airtel" />
                        <Label htmlFor="airtel" className="cursor-pointer flex-1 text-center font-medium">
                          Airtel
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-3 flex-1 cursor-pointer hover:bg-muted/50">
                        <RadioGroupItem value="tigo" id="tigo" />
                        <Label htmlFor="tigo" className="cursor-pointer flex-1 text-center font-medium">
                          Tigo
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="07XXXXXXXX"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    You will receive a prompt on your phone to confirm the payment
                  </p>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                required
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground mt-1">Receipt will be sent to this email</p>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" size="lg" disabled={loading || paymentStatus === "processing"}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing Payment...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Pay {course.price} RWF
                </>
              )}
            </Button>

            <div className="text-xs text-center text-muted-foreground">
              <Shield className="w-3 h-3 inline mr-1" />
              Your payment information is encrypted and secure. By completing your purchase, you agree to our Terms of
              Service.
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
