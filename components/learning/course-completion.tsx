"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Award, Download, Star, Target, Clock, BookOpen } from "lucide-react"

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

  useEffect(() => {
    calculateStats()
  }, [progressData, allSteps])

  const calculateStats = () => {
    if (!progressData?.completedSteps || !allSteps.length) return

    const assessmentSteps = allSteps.filter((step) => step.type === "assessment")
    const contentSteps = allSteps.filter((step) => step.type !== "assessment")

    let totalScore = 0
    let totalMarks = 0
    let completedAssessments = 0

    assessmentSteps.forEach((step) => {
      const stepScore = getStepScore(step.id)

      if (stepScore !== undefined) {
        completedAssessments++

        // Calculate total possible marks for this assessment
        const assessmentMarks = step.assessment?.questions?.reduce((sum: number, q: any) => sum + q.points, 0) || 0
        totalMarks += assessmentMarks

        // Calculate actual score in marks
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

  const hasCertificate = course?.hasCertificate || false

  const handleGenerateCertificate = () => {
    // TODO: Implement certificate generation
    console.log("Generating certificate for course:", courseId)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="border-2 border-primary/20">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Trophy className="w-20 h-20 text-yellow-500" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-white fill-white" />
              </div>
            </div>
          </div>
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

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-green-600">{stats.totalScore}</div>
                <div className="text-sm text-muted-foreground">Total Score</div>
                <div className="text-xs text-muted-foreground">out of {stats.totalMarks} marks</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-600">{stats.completedLessons}</div>
                <div className="text-sm text-muted-foreground">Lessons Completed</div>
                <div className="text-xs text-muted-foreground">out of {stats.totalLessons}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Award className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold text-purple-600">{stats.completedAssessments}</div>
                <div className="text-sm text-muted-foreground">Assessments Passed</div>
                <div className="text-xs text-muted-foreground">out of {stats.totalAssessments}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold text-orange-600">{formatTime(stats.timeSpent)}</div>
                <div className="text-sm text-muted-foreground">Time Invested</div>
                <div className="text-xs text-muted-foreground">learning time</div>
              </CardContent>
            </Card>
          </div>

          {/* Achievement Badges */}
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">Your Achievements</h3>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="secondary" className="px-3 py-1">
                <Trophy className="w-3 h-3 mr-1" />
                Course Completed
              </Badge>
              {stats.percentage >= 90 && (
                <Badge variant="secondary" className="px-3 py-1 bg-yellow-100 text-yellow-800">
                  <Star className="w-3 h-3 mr-1" />
                  Excellence Award
                </Badge>
              )}
              {stats.percentage >= 80 && (
                <Badge variant="secondary" className="px-3 py-1 bg-green-100 text-green-800">
                  <Award className="w-3 h-3 mr-1" />
                  High Achiever
                </Badge>
              )}
              {stats.completedAssessments === stats.totalAssessments && stats.totalAssessments > 0 && (
                <Badge variant="secondary" className="px-3 py-1 bg-blue-100 text-blue-800">
                  <Target className="w-3 h-3 mr-1" />
                  Assessment Master
                </Badge>
              )}
            </div>
          </div>

          {/* Certificate Section */}
          {hasCertificate && (
            <div className="text-center p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg">
              <Award className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Certificate of Completion</h3>
              <p className="text-muted-foreground mb-4">Download your certificate to showcase your achievement</p>
              <Button onClick={handleGenerateCertificate} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Generate Certificate
              </Button>
            </div>
          )}

          {/* Next Steps */}
          <div className="text-center p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">What's Next?</h3>
            <p className="text-muted-foreground mb-4">Continue your learning journey with more courses</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline">Browse More Courses</Button>
              <Button>Share Achievement</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
