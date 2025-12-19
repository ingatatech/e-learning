"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Trophy, Award, Download, Star, Target, Clock, BookOpen, Loader2, Eye } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/components/ui/use-toast"
import { Certificate } from "./certificate"

interface CourseCompletionProps {
  courseId: string
  courseTitle: string
  progressData: any
  allSteps: any[]
  getStepScore: (stepId: string) => number | undefined
  course: any
}

export function CourseCompletion({
  courseId,
  courseTitle,
  progressData,
  allSteps,
  getStepScore,
  course,
}: CourseCompletionProps) {
  const [stats, setStats] = useState({
    totalScore: 0,
    totalMarks: 0,
    percentage: 0,
    completedLessons: 0,
    totalLessons: 0,
    completedAssessments: 0,
    totalAssessments: 0,
    timeSpent: 0,
  })
  const [showCertificate, setShowCertificate] = useState(false)
  const [certificateData, setCertificateData] = useState<any>(null)
  const [loadingCertificate, setLoadingCertificate] = useState(false)
  const [existingCertificate, setExistingCertificate] = useState<any>(null)
  const [checkingCertificate, setCheckingCertificate] = useState(false)

  const { token, user } = useAuth()

  const hasCertificate = course?.certificateIncluded || false

  useEffect(() => {
    calculateStats()
  }, [progressData, allSteps])

  useEffect(() => {
    if (hasCertificate && token && user && stats.percentage > 0) {
      checkExistingCertificate()
    }
  }, [hasCertificate, token, user, courseId, stats.percentage])

  const checkExistingCertificate = async () => {
    setCheckingCertificate(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/certificates/checkExists/user/${user?.id}/course/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.ok) {
        const data = await response.json()
        setExistingCertificate(data)
        setCertificateData({
          studentName: `${user?.firstName} ${user?.lastName}`,
          courseName: courseTitle,
          score: data.score || stats.percentage,
          instructorName: course.instructor?.firstName + " " + course.instructor?.lastName || "Course Instructor",
          institutionName: course.organization?.name || "Learning Management System",
          directorName: course.organization?.director || "Institution Director",
          completionDate: data.issuedAt || new Date().toISOString(),
          verificationCode: data.code,
        })
      }
    } catch (error) {
      console.error("Failed to check existing certificate:", error)
    } finally {
      setCheckingCertificate(false)
    }
  }

  const calculateStats = () => {
    if (!progressData?.completedSteps || !allSteps.length) return
    const assessmentSteps = allSteps.filter((step) => step.type === "assessment")
    const contentSteps = allSteps.filter((step) => step.type !== "assessment")

    let totalScore = 0
    let totalMarks = 0
    let completedAssessments = 0

    assessmentSteps.forEach((step) => {
      const stepScore = getStepScore(step.dbId)

      if (stepScore !== undefined) {
        completedAssessments++

        const assessmentMarks = step.assessment?.questions?.reduce((sum: number, q: any) => sum + q.points, 0) || 0
        totalMarks += assessmentMarks

        const actualMarks = Math.round((stepScore / 100) * assessmentMarks)
        totalScore += actualMarks
      }
    })

    const completedLessons = contentSteps.filter((step) =>
      progressData.completedSteps.some(
        (cs: any) =>
          (cs.lessonId && step.lessonId === cs.lessonId.toString() && step.id.includes(cs.lessonId)) ||
          (cs.assessmentId && step.assessment?.id === cs.assessmentId),
      ),
    ).length

    const timeSpent = allSteps
      .filter((step) =>
        progressData.completedSteps.some(
          (cs: any) =>
            (cs.lessonId && step.lessonId === cs.lessonId.toString() && step.id.includes(cs.lessonId)) ||
            (cs.assessmentId && step.assessment?.id === cs.assessmentId),
        ),
      )
      .reduce((total, step) => total + (step.duration || 0), 0)

    setStats({
      totalScore,
      totalMarks,
      percentage: totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0,
      completedLessons,
      totalLessons: contentSteps.length,
      completedAssessments,
      totalAssessments: assessmentSteps.length,
      timeSpent,
    })
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const handleGenerateCertificate = async () => {
    if (!token || !user) return

    setLoadingCertificate(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/certificates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          courseId: courseId,
          courseName: courseTitle,
          score: stats.percentage,
        }),
      })

      if (response.ok) {
        const data = await response.json()

        const instructorSignature = course.instructor?.signature || undefined
        const directorSignature = user.organization?.director?.signature || undefined
        const organizationStamp = course.organization?.stampUrl || undefined

        setCertificateData({
          studentName: `${user.firstName} ${user.lastName}`,
          courseName: courseTitle,
          score: stats.percentage,
          instructorName: course.instructor?.firstName + " " + course.instructor?.lastName || "Course Instructor",
          institutionName: course.organization?.name || "Learning Management System",
          directorName: course.organization?.director || "Institution Director",
          completionDate: new Date().toISOString(),
          verificationCode: data.verificationCode,
          instructorSignature,
          directorSignature,
          organizationStamp,
        })
        setExistingCertificate(data)
        setShowCertificate(true)
      } else {
        throw new Error("Failed to generate certificate")
      }
    } catch (error) {
      console.error("Failed to generate certificate:", error)
      toast({
        title: "Error",
        description: "Failed to generate certificate. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingCertificate(false)
    }
  }

  const handleViewCertificate = () => {
    setShowCertificate(true)
  }

  return (
    <>
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-0 shadow-none">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl mb-2">Congratulations!</CardTitle>
            <p className="text-xl text-muted-foreground">You have successfully completed</p>
            <p className="text-2xl font-bold text-primary mt-2">{courseTitle}</p>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Overall Progress */}
            <div className="text-center">
              <div className="text-6xl font-bold text-primary mb-2">{stats.percentage}%</div>
              <p className="text-lg text-muted-foreground">Overall Score</p>
              <Progress value={stats.percentage} className="w-full max-w-md mx-auto mt-4" />
            </div>

            {/* Certificate Section */}
            {hasCertificate && (
              <div className="text-center p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg">
                <Award className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Certificate of Completion</h3>
                <p className="text-muted-foreground mb-4">
                  {existingCertificate
                    ? "Your certificate is ready to view and download."
                    : "Congratulations! You've earned a certificate for completing this course."}
                </p>
                <div className="flex w-full justify-center">
                  {checkingCertificate ? (
                    <Button disabled className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Checking...
                    </Button>
                  ) : existingCertificate ? (
                    <Button onClick={handleViewCertificate} className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      View Certificate
                    </Button>
                  ) : (
                    <Button
                      onClick={handleGenerateCertificate}
                      className="flex items-center gap-2"
                      disabled={loadingCertificate}
                    >
                      {loadingCertificate ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Get Your Certificate
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="text-center p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-2">What's Next?</h3>
              <p className="text-muted-foreground mb-4">Continue your learning journey with more courses</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => (window.location.href = "/student/courses")}>
                  Browse More Courses
                </Button>
                <Button onClick={() => (window.location.href = `/courses/${courseId}`)}>View Course Details</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showCertificate && certificateData && (
        <div className="fixed inset-0 z-50 bg-background overflow-auto">
          <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto">
              {/* Header with close button */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Certificate of Completion</h2>
                  <p className="text-muted-foreground">{courseTitle}</p>
                </div>
                <Button variant="outline" onClick={() => setShowCertificate(false)}>
                  Close
                </Button>
              </div>

              {/* Certificate component */}
              <Certificate {...certificateData} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
