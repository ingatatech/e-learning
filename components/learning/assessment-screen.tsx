"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  CheckCircle,
  Clock,
  Award,
  AlertCircle,
  FileText,
  Target,
  RotateCcw,
  Eye,
  AlertTriangle,
  Play,
  ChevronRight,
  X,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import type { Answer } from "@/types"
import { toast } from "@/components/ui/use-toast"

interface Question {
  id: string
  question: string
  type: "multiple_choice" | "true_false" | "essay" | "short_answer"
  options: string[]
  correctAnswer: string | string[]
  points: number
}

interface Assessment {
  id: string
  title: string
  description: string
  type: "quiz" | "assignment" | "project"
  passingScore: number
  timeLimit: number
  questions: Question[]
}

interface SavedAnswer {
  id: string
  answer: string
  isCorrect: boolean
  pointsEarned: number
  createdAt: string
  question: Question
}

interface AssessmentScreenProps {
  assessment: Assessment
  onComplete: (score: number, passed: boolean) => void
  onPending: () => void
  isCompleted: boolean
  previousScore?: number
  previousPassed?: boolean
  isStepping?: boolean
  onClose: () => void
  isPending?: boolean
  isFailed?: boolean
  refetch?: () => void
  }

export function AssessmentScreen({
  assessment,
  onComplete,
  onPending,
  isCompleted,
  previousScore,
  previousPassed,
  isStepping,
  onClose,
  isPending,
  isFailed,
  refetch,
}: AssessmentScreenProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [timeRemaining, setTimeRemaining] = useState(assessment.timeLimit * 60)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [showReview, setShowReview] = useState(false)
  const [correctAnswers, setCorrectAnswers] = useState<Record<string, string | string[]>>({})
  const [showStartModal, setShowStartModal] = useState(true)
  const [timerStarted, setTimerStarted] = useState(false)
  const [savedAnswers, setSavedAnswers] = useState<SavedAnswer[]>([])
  const [loadingSavedAnswers, setLoadingSavedAnswers] = useState(false)
  const [passed, setPassed] = useState(false)
  const [loadingRetake, setLoadingRetake] = useState(false)

  const { token, user } = useAuth()

  useEffect(() => {
    const correctAnswersMap: Record<string, string | string[]> = {}

    assessment.questions.forEach((question) => {
      correctAnswersMap[question.id] = question.correctAnswer
    })

    setCurrentQuestionIndex(0)
    setAnswers([])
    setTimeRemaining(assessment.timeLimit * 60)
    setIsSubmitted(false)
    setScore(0)
    setShowReview(false)
    setCorrectAnswers(correctAnswersMap || {})
    setShowStartModal(true)
    setTimerStarted(false)
    setSavedAnswers([])

    if ((isCompleted || isPending || isFailed) && previousScore !== undefined) {
      setShowStartModal(false)
      fetchSavedAnswers()
    }
  }, [assessment.id, assessment.timeLimit, isCompleted, isPending, isFailed, previousScore])

  const fetchSavedAnswers = async () => {
    if (!token || !user) return

    setLoadingSavedAnswers(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/answers/${assessment.id}/user/${user.id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSavedAnswers(data.answers || [])
        setAnswers(data.answers || [])
      }
    } catch (error) {
      console.error("Failed to fetch saved answers:", error)
    } finally {
      setLoadingSavedAnswers(false)
    }
  }

  const saveAnswer = async (questionId: string, answer: string | string[]) => {
    if (!token || !user) return

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/answers/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          assessmentId: assessment.id,
          questionId,
          answer: Array.isArray(answer) ? answer.join(",") : answer,
        }),
      })
    } catch (error) {
      console.error("Failed to save answer:", error)
    }
  }

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers((prev) => {
      // Find if answer already exists for this question
      const existingAnswerIndex = prev.findIndex((a) => a.question.id === questionId)

      if (existingAnswerIndex >= 0) {
        // Update existing answer
        const updatedAnswers = [...prev]
        updatedAnswers[existingAnswerIndex] = {
          ...updatedAnswers[existingAnswerIndex],
          answer: answer,
        }
        return updatedAnswers
      } else {
        // Add new answer - create a minimal question object
        const question = assessment.questions.find((q) => q.id === questionId)
        if (!question) return prev

        const newAnswer: Answer = {
          id: "", 
          answer: answer,
          isCorrect: false, 
          pointsEarned: 0,
          createdAt: new Date().toISOString(),
          question: question,
        }
        return [...prev, newAnswer]
      }
    })

    if (!isCompleted) {
      saveAnswer(questionId, answer)
    }
  }

  useEffect(() => {
    if (!timerStarted || timeRemaining <= 0 || isSubmitted) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timerStarted, timeRemaining, isSubmitted])

  const handleStartAssessment = () => {
    setShowStartModal(false)
    setTimerStarted(true)
  }

  const handleNext = () => {
    if (currentQuestionIndex < assessment.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const handleSubmit = () => {
    let totalPoints = 0
    let earnedPoints = 0
    const correctAnswersMap: Record<string, string | string[]> = {}

    const requiresManualGrading = assessment.questions.some((q) => q.type === "short_answer" || q.type === "essay")

    assessment.questions.forEach((question) => {
      totalPoints += question.points
      const userAnswerObj = answers.find((a) => a.question.id === question.id)
      const userAnswer = userAnswerObj ? userAnswerObj.answer : ""
      correctAnswersMap[question.id] = question.correctAnswer

      if (question.type === "true_false") {
        if (userAnswer === question.correctAnswer) {
          earnedPoints += question.points
        }
      } else if (question.type === "multiple_choice") {
        // Check if correctAnswer is an array (multiple correct answers)
        if (Array.isArray(question.correctAnswer)) {
          // User must select all correct answers
          const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer]
          const correctAnswers = question.correctAnswer

          const isCorrect =
            userAnswers.length === correctAnswers.length &&
            userAnswers.every((answer) => correctAnswers.includes(answer)) &&
            correctAnswers.every((answer) => userAnswers.includes(answer))

          if (isCorrect) {
            earnedPoints += question.points
          }
        } else {
          // Single correct answer
          if (userAnswer === question.correctAnswer) {
            earnedPoints += question.points
          }
        }
      }
    })

    if (requiresManualGrading) {
      onPending()
    }

    const finalScore = Math.round((earnedPoints / totalPoints) * 100)
    const res = finalScore >= assessment.passingScore
    setPassed(res)

    setScore(finalScore)
    setCorrectAnswers(correctAnswersMap)
    setIsSubmitted(true)
  }

  const handleComplete = () => {
    onComplete(score, passed)
  }

  const handleRetake = async () => {
    setCurrentQuestionIndex(0)
    setAnswers([])
    setTimeRemaining(assessment.timeLimit * 60)
    setIsSubmitted(false)
    setScore(0)
    setShowReview(false)
    setShowStartModal(true)
    setTimerStarted(false)

    setLoadingRetake(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/progress/retake-assessment`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        method: "PUT",
        body: JSON.stringify({
          studentId: user!.id,
          assessmentId: assessment.id,
        }),
      })

      if (response.ok) {
        refetch?.()
      }
    } catch (error) {
      console.error("Failed to retake an assessment:", error)
    } finally {
      setLoadingRetake(false)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Get current question and answer
  const currentQuestion = assessment.questions[currentQuestionIndex]
  const currentAnswer = answers.find((a) => a.question.id === currentQuestion?.id)
  const currentAnswerValue = currentAnswer ? currentAnswer.answer : ""

  if (showStartModal && !isSubmitted && !isCompleted && !isPending && !isFailed) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Dialog open={showStartModal} onOpenChange={() => {}}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Award className="w-6 h-6 text-primary" />
                {assessment.title}
              </DialogTitle>
              <DialogDescription className="text-base mt-4">{assessment.description}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">{assessment.questions.length}</div>
                  <div className="text-sm text-muted-foreground">Questions</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{assessment.timeLimit}</div>
                  <div className="text-sm text-muted-foreground">Minutes</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{assessment.passingScore}%</div>
                  <div className="text-sm text-muted-foreground">To Pass</div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200">Important Instructions:</p>
                    <ul className="text-sm text-amber-700 dark:text-amber-300 mt-2 space-y-1">
                      <li>• Once you begin, the timer will start automatically</li>
                      <li>• You cannot pause the assessment once started</li>
                      <li>• The assessment will auto-submit when time runs out</li>
                      <li>• Make sure you have a stable internet connection</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleStartAssessment} className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Begin Assessment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  if (isCompleted && previousScore !== undefined) {
    if (loadingSavedAnswers) {
      return (
        <div className="max-w-4xl mx-auto p-6">
          <Card>
            <CardContent className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your answers...</p>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {previousPassed ? (
                <CheckCircle className="w-16 h-16 text-green-500" />
              ) : (
                <AlertCircle className="w-16 h-16 text-red-500" />
              )}
            </div>
            <CardTitle className="text-2xl">Assessment Review</CardTitle>
            <p className="text-muted-foreground">{assessment.title}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">{previousScore}%</div>
                <div className="text-sm text-muted-foreground">Your Score</div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{assessment.passingScore}%</div>
                <div className="text-sm text-muted-foreground">Passing Score</div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{assessment.questions.length}</div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </div>
            </div>

            <div
              className={`p-4 rounded-lg ${previousPassed ? "bg-green-50 dark:bg-green-950/20" : "bg-blue-50 dark:bg-blue-950/20"}`}
            >
              <p
                className={`font-medium ${previousPassed ? "text-green-700 dark:text-green-300" : "text-blue-700 dark:text-blue-300"}`}
              >
                {previousPassed
                  ? "You have successfully completed this assessment. Review your answers below."
                  : "This assessment has been completed. You can review your answers below."}
              </p>
            </div>

            <div className="text-left">
              <h3 className="text-lg font-semibold mb-4">Your Submitted Answers</h3>
              <div className="space-y-4">
                {assessment.questions.map((question: any, index) => {
                  const userAnswerObj = answers.find((a) => a.question.id === question.id)
                  const userAnswer = userAnswerObj ? userAnswerObj.answer : "Not answered"
                  const correctAnswer = question.correctAnswer
                  const isCorrect = answers.find((a) => a.question.id === question.id)?.isCorrect
                  const pointsEarned = answers.find((a) => a.question.id === question.id)?.pointsEarned

                  return (
                    <div key={question.id} className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                              question.type === "essay" || question.type === "short_answer" ?
                              "bg-gray-100 text-gray-700" : isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium mb-2">{question.question}</p>
                          <div className="text-sm space-y-1">
                            <p>
                              <span className="font-medium">Your answer:</span>{" "}
                              {Array.isArray(userAnswer) ? userAnswer.join(", ") : userAnswer}
                            </p>
                            {(question.type === "multiple_choice" || question.type === "true_false") && (
                              <p>
                                <span className="font-medium">Correct answer:</span>{" "}
                                {Array.isArray(correctAnswer) ? correctAnswer.join(", ") : correctAnswer}
                              </p>
                              )}
                            <p className={`font-medium ${question.type === "essay" || question.type === "short_answer" ? "text-gray-600" : isCorrect ? "text-green-600" : "text-red-600"}`}>
                              {question.type === "essay" || question.type === "short_answer" ? "Graded" : isCorrect ? "✓ Correct" : "✗ Incorrect"} ({pointsEarned} / {question.points} points)
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isPending) {
    return (
        <div className="max-w-4xl mx-auto p-6">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Clock className="w-16 h-16 text-blue-500" />
              </div>
              <CardTitle className="text-2xl">Assessment Submitted</CardTitle>
              <p className="text-muted-foreground">{assessment.title}</p>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Pending Instructor Review
                </h3>
                <p className="text-blue-700 dark:text-blue-300">
                  Your assessment has been submitted successfully and is awaiting manual grading by your instructor.
                  You'll be notified once your assessment has been graded.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">{assessment.questions.length}</div>
                  <div className="text-sm text-muted-foreground">Questions Answered</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{new Date().toLocaleDateString()}</div>
                  <div className="text-sm text-muted-foreground">Submitted On</div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="text-left">
                    <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">What happens next?</p>
                    <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                      <li>• Your instructor will review your answers</li>
                      <li>• Once graded, you can proceed to the next lesson</li>
                    </ul>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      )
  }

  if (isFailed) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-16 h-16 text-red-500" />
            </div>
            <CardTitle className="text-2xl">Assessment Failed</CardTitle>
            <p className="text-muted-foreground">{assessment.title}</p>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">{previousScore}%</div>
                <div className="text-sm text-muted-foreground">Your Score</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">{assessment.passingScore}%</div>
                <div className="text-sm text-muted-foreground">Passing Score</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{assessment.questions.length}</div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </div>
            </div>

              <div className="space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <p className="text-red-700 dark:text-red-300 font-medium">
                    You need {assessment.passingScore}% to pass. You can review your answers and retake this assessment.
                  </p>
                </div>

                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowReview(!showReview)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    {showReview ? "Hide Review" : "Review Answers"}
                  </Button>
                  <Button onClick={handleRetake} className="flex items-center gap-2" disabled={loadingRetake}>
                    <RotateCcw className="w-4 h-4" />
                    {loadingRetake ? "Retaking..." : "Retake Assessment"}
                  </Button>
                </div>
              </div>

            {showReview && (
              <div className="mt-6 text-left">
                <h3 className="text-lg font-semibold mb-4">Review Your Answers</h3>
                <div className="space-y-4">
                  {assessment.questions.map((question, index) => {
                    const userAnswerObj = answers.find((a) => a.question.id === question.id)
                    const userAnswer = userAnswerObj ? userAnswerObj.answer : "Not answered"
                    const correctAnswer = correctAnswers[question.id]
                    const isCorrect = Array.isArray(correctAnswer)
                      ? Array.isArray(userAnswer) &&
                        correctAnswer.every((answer) => userAnswer.includes(answer)) &&
                        userAnswer.every((answer) => correctAnswer.includes(answer))
                      : userAnswer === correctAnswer

                    return (
                      <div key={question.id} className="p-4 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                                question.type === "essay" || question.type === "short_answer" ?
                                "bg-gray-100 text-gray-700" : isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium mb-2">{question.question}</p>
                            <div className="text-sm space-y-1">
                              <p>
                                <span className="font-medium">Your answer:</span> {(Array.isArray(userAnswer) ? userAnswer.join(", ") : userAnswer) || "Not answered"}
                              </p>

                            {(correctAnswer !== null && correctAnswer !== undefined && correctAnswer !== "") && (
                              <p>
                                <span className="font-medium">Correct answer:</span>{" "}
                                {Array.isArray(correctAnswer) ? correctAnswer.join(", ") : correctAnswer}
                              </p>
                              )}
                              <p className={`font-medium ${question.type === "essay" || question.type === "short_answer" ? "text-gray-600" : isCorrect ? "text-green-600" : "text-red-600"}`}>
                                {question.type === "essay" || question.type === "short_answer" ? "Graded" : isCorrect ? "✓ Correct" : "✗ Incorrect"} ({question.points} points)
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSubmitted) {
    const displayScore = score
    const displayPassed = score >= assessment.passingScore

    const requiresManualGrading = assessment.questions.some((q) => q.type === "short_answer" || q.type === "essay")

    if (requiresManualGrading) {
      return (
        <div className="max-w-4xl mx-auto p-6">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Clock className="w-16 h-16 text-blue-500" />
              </div>
              <CardTitle className="text-2xl">Assessment Submitted</CardTitle>
              <p className="text-muted-foreground">{assessment.title}</p>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Pending Instructor Review
                </h3>
                <p className="text-blue-700 dark:text-blue-300">
                  Your assessment has been submitted successfully and is awaiting manual grading by your instructor.
                  You'll be notified once your assessment has been graded.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">{assessment.questions.length}</div>
                  <div className="text-sm text-muted-foreground">Questions Answered</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{new Date().toLocaleDateString()}</div>
                  <div className="text-sm text-muted-foreground">Submitted On</div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="text-left">
                    <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">What happens next?</p>
                    <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                      <li>• Your instructor will review your answers</li>
                      <li>• Once graded, you can proceed to the next lesson</li>
                    </ul>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {displayPassed ? (
                <CheckCircle className="w-16 h-16 text-green-500" />
              ) : (
                <AlertCircle className="w-16 h-16 text-red-500" />
              )}
            </div>
            <CardTitle className="text-2xl">{displayPassed ? "Congratulations!" : "Assessment Complete"}</CardTitle>
            <p className="text-muted-foreground">{assessment.title}</p>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">{displayScore}%</div>
                <div className="text-sm text-muted-foreground">Your Score</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">{assessment.passingScore}%</div>
                <div className="text-sm text-muted-foreground">Passing Score</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{assessment.questions.length}</div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </div>
            </div>

            {displayPassed ? (
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <p className="text-green-700 dark:text-green-300 font-medium">
                  Great job! You've passed this assessment. You can now proceed to the next step.
                </p>
                <Button
                  size="sm"
                  onClick={handleComplete}
                  className="flex items-center gap-2 mt-4"
                  disabled={isStepping}
                >
                  {isStepping ? "Loading..." : "Next"}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <p className="text-red-700 dark:text-red-300 font-medium">
                    You need {assessment.passingScore}% to pass. You can review your answers and retake this assessment.
                  </p>
                </div>

                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowReview(!showReview)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    {showReview ? "Hide Review" : "Review Answers"}
                  </Button>
                  <Button onClick={handleRetake} className="flex items-center gap-2" disabled={isStepping}>
                    <RotateCcw className="w-4 h-4" />
                    {isStepping ? "Retaking..." : "Retake Assessment"}
                  </Button>
                </div>
              </div>
            )}

            {showReview && !displayPassed && (
              <div className="mt-6 text-left">
                <h3 className="text-lg font-semibold mb-4">Review Your Answers</h3>
                <div className="space-y-4">
                  {assessment.questions.map((question, index) => {
                    const userAnswerObj = answers.find((a) => a.question.id === question.id)
                    const userAnswer = userAnswerObj ? userAnswerObj.answer : "Not answered"
                    const correctAnswer = correctAnswers[question.id]
                    const isCorrect = Array.isArray(correctAnswer)
                      ? Array.isArray(userAnswer) &&
                        correctAnswer.every((answer) => userAnswer.includes(answer)) &&
                        userAnswer.every((answer) => correctAnswer.includes(answer))
                      : userAnswer === correctAnswer
                      const pointsEarned = answers.find((a) => a.question.id === question.id)?.pointsEarned

                    return (
                      <div key={question.id} className="p-4 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                                question.type === "essay" || question.type === "short_answer" ?
                                "bg-gray-100 text-gray-700" : isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium mb-2">{question.question}</p>
                            <div className="text-sm space-y-1">
                              <p>
                                <span className="font-medium">Your answer:</span> {(Array.isArray(userAnswer) ? userAnswer.join(", ") : userAnswer) || "Not answered"}
                              </p>
                              {(question.type === "multiple_choice" || question.type === "true_false") && (
                              <p>
                                <span className="font-medium">Correct answer:</span>{" "}
                                {Array.isArray(correctAnswer) ? correctAnswer.join(", ") : correctAnswer}
                              </p>
                              )}
                              <p className={`font-medium ${question.type === "essay" || question.type === "short_answer" ? "text-gray-600" : isCorrect ? "text-green-600" : "text-red-600"}`}>
                              {question.type === "essay" || question.type === "short_answer" ? "Graded" : isCorrect ? "✓ Correct" : "✗ Incorrect"} ({pointsEarned} / {question.points} points)
                            </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!assessment.questions.length) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No questions available for this assessment.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalQuestions = assessment.questions.length
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="text-2xl">{assessment.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{assessment.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                {assessment.passingScore}% to pass
              </Badge>
              <Badge
                variant="outline"
                className={`flex items-center gap-1 ${timeRemaining <= 300 ? "text-red-600 border-red-200" : ""}`}
              >
                <Clock className="w-3 h-3" />
                {formatTime(timeRemaining)}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{currentQuestion.question}</h3>

            {currentQuestion.type === "multiple_choice" && (
              <>
                {currentQuestion.type == "multiple_choice" ? (
                  // Multiple correct answers - use checkboxes
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground mb-3">Select all that apply</p>
                    {currentQuestion.options.map((option, index) => {
                      const currentAnswers = Array.isArray(currentAnswerValue) ? currentAnswerValue : []
                      return (
                        <div
                          key={index}
                          className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50"
                        >
                          <Checkbox
                            id={`checkbox-${index}`}
                            checked={currentAnswers.includes(option)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleAnswerChange(currentQuestion.id, [...currentAnswers, option])
                              } else {
                                handleAnswerChange(
                                  currentQuestion.id,
                                  currentAnswers.filter((a) => a !== option),
                                )
                              }
                            }}
                          />
                          <Label htmlFor={`checkbox-${index}`} className="flex-1 cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  // Single correct answer - use radio buttons
                  <RadioGroup
                    value={currentAnswerValue as string}
                    onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                  >
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </>
            )}

            {currentQuestion.type === "true_false" && (
              <RadioGroup
                value={currentAnswerValue as string}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="true" id="true" />
                  <Label htmlFor="true" className="flex-1 cursor-pointer">
                    True
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="false" id="false" />
                  <Label htmlFor="false" className="flex-1 cursor-pointer">
                    False
                  </Label>
                </div>
              </RadioGroup>
            )}

            {(currentQuestion.type === "essay" || currentQuestion.type === "short_answer") && (
              <Textarea
                placeholder="Type your answer here..."
                value={currentAnswerValue as string}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                className={currentQuestion.type === "essay" ? "min-h-32" : "min-h-20"}
              />
            )}
          </div>

          <div className="flex items-center justify-between pt-6 border-t">
            <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
              Previous
            </Button>

            <div className="text-sm text-muted-foreground">
              {currentQuestion.points} point{currentQuestion.points !== 1 ? "s" : ""}
            </div>

            {currentQuestionIndex === totalQuestions - 1 ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button>Submit Assessment</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      Submit Assessment?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to submit your assessment? Once submitted, you cannot change your answers.
                      {assessment.passingScore > 0 && (
                        <span className="block mt-2 font-medium">
                          You need {assessment.passingScore}% to pass this assessment.
                        </span>
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Review Answers</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSubmit}>Yes, Submit Assessment</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button onClick={handleNext}>Next Question</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
