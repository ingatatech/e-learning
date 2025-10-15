"use client"

import { use, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2, Award, Calendar, User, BookOpen, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface CertificateVerification {
  valid: boolean
  org: string
  issuedAt: Date
  user: {
    id: string
    name: string
  }
  course: {
    id: string
    title: string
  }
  score: number
}

export default function VerifyCertificatePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params)
  const [verification, setVerification] = useState<CertificateVerification | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifyCertificate = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/certificates/verify/${code}`)

        if (response.ok) {
          const data = await response.json()
          setVerification(data)
        } 
      } catch (error) {
        console.error("Failed to verify certificate:", error)
      } finally {
        setLoading(false)
      }
    }

    verifyCertificate()
  }, [code])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium">Verifying Certificate...</p>
            <p className="text-sm text-muted-foreground mt-2">Please wait while we validate the certificate</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-4">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <Card className="border-2">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              {verification?.valid ? (
                <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <XCircle className="w-12 h-12 text-red-600" />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl">
              {verification?.valid ? "Certificate Verified" : "Verification Failed"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {verification?.valid && verification.user && verification.course ? (
              <>
                <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-green-900 dark:text-green-100">This is a valid certificate</h3>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    This certificate has been verified and is authentic. The details below confirm the completion of the
                    course.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <User className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Student Name</p>
                      <p className="font-medium">{verification.user.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <BookOpen className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Course Name</p>
                      <p className="font-medium">{verification.course.title}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <Award className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Final Score</p>
                      <p className="font-medium">{verification.score}%</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <Calendar className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Issued On</p>
                      <p className="font-medium">
                        {new Date(verification.issuedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <Award className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Issued By</p>
                      <p className="font-medium">{verification.org}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Verification Code</p>
                      <p className="text-xs text-muted-foreground font-mono">{code}</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Verified
                    </Badge>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-red-900 dark:text-red-100">Invalid Certificate</h3>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300">
                    "This certificate could not be verified. Please check the verification code and try again."
                </p>
              </div>
            )}

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                If you have any questions about this certificate, please contact the institution directly.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
