"use client"

import type React from "react"
import { useState, useRef, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useSearchParams } from "next/navigation"

export function OTPVerificationForm() {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const { verifyOtp, isLoading } = useAuth()

  const params = useSearchParams()
  const email = params.get("email") as string
  

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0]?.focus()
    }
  }, [])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return // Only allow numbers

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== "") && index === 5) {
      handleSubmit()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Move focus to previous input on backspace
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").slice(0, 6)
    
    if (!/^\d+$/.test(pastedData)) return // Only allow numbers

    const pastedArray = pastedData.split("")
    const newOtp = [...otp]
    
    // Fill OTP array with pasted values
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedArray[i] || ""
    }
    
    setOtp(newOtp)
    
    // Focus on the last input with content or the last input if all are filled
    const focusIndex = Math.min(pastedData.length, 5)
    inputRefs.current[focusIndex]?.focus()
  }

  

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setError("")
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Check if all fields are filled
      if (otp.some(digit => digit === "")) {
        setError("Please enter the complete verification code")
        return
      }
      
      const otpValue = otp.join("")
      
     const res = await verifyOtp(email, otpValue)
      if (!res?.success) {
        setError(res?.message)
      }
    } catch (err: any) {
      setError(err.message || "Verification failed. Please try again.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Verification Code
        </label>
        <div className="flex justify-between space-x-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="flex h-10 w-10 rounded-md border border-input bg-background px-0 text-center text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              maxLength={1}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code sent to your email
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Verify
      </Button>

      <div className="text-center text-sm">
        Didn't receive the code?{" "}
        <button
          type="button"
          className="text-primary hover:underline"
          onClick={() => {
            // Resend OTP logic here
            alert("New code sent!")
          }}
        >
          Resend
        </button>
      </div>
    </form>
  )
}