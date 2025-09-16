"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, Clock, Award, AlertCircle, FileText, Target } from "lucide-react"

interface Question {
  id: string
  question: string
  type: "multiple_choice" | "true_false" | "essay" | "checkbox"
  options: string[]
  correctAnswer: string
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

interface AssessmentScreenProps {
  assessment: Assessment
  onComplete: (score: number) => void
  isCompleted: boolean
}

export function AssessmentScreen({ assessment, onComplete, isCompleted }: AssessmentScreenProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [timeRemaining, setTimeRemaining] = useState(assessment.timeLimit * 60) // Convert to seconds
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  const currentQuestion = assessment.questions[currentQuestionIndex]
  const totalQuestions = assessment.questions.length
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const handleSubmit = () => {
    // Calculate score
    let totalPoints = 0
    let earnedPoints = 0

    assessment.questions.forEach((question) => {
      totalPoints += question.points
      const userAnswer = answers[question.id]

      if (question.type === "true_false" || question.type === "multiple_choice") {
        if (userAnswer === question.correctAnswer) {
          earnedPoints += question.points
        }
      }
      // For essay questions, we'd need manual grading
    })

    const finalScore = Math.round((earnedPoints / totalPoints) * 100)
    setScore(finalScore)
    setIsSubmitted(true)
    onComplete(finalScore)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  if (isSubmitted || isCompleted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {score >= assessment.passingScore ? (
                <CheckCircle className="w-16 h-16 text-green-500" />
              ) : (
                <AlertCircle className="w-16 h-16 text-red-500" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {score >= assessment.passingScore ? "Congratulations!" : "Assessment Complete"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">{score}%</div>
                <div className="text-sm text-muted-foreground">Your Score</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">{assessment.passingScore}%</div>
                <div className="text-sm text-muted-foreground">Passing Score</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{totalQuestions}</div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </div>
            </div>

            {score >= assessment.passingScore ? (
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <p className="text-green-700 dark:text-green-300 font-medium">
                  Great job! You've passed this assessment.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <p className="text-red-700 dark:text-red-300 font-medium">
                  You need {assessment.passingScore}% to pass. You can retake this assessment.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!currentQuestion) {
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
              <Badge variant="outline" className="flex items-center gap-1">
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
              <RadioGroup
                value={(answers[currentQuestion.id] as string) || ""}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              >
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.type === "true_false" && (
              <RadioGroup
                value={(answers[currentQuestion.id] as string) || ""}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="true" />
                  <Label htmlFor="true">True</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="false" />
                  <Label htmlFor="false">False</Label>
                </div>
              </RadioGroup>
            )}

            {currentQuestion.type === "essay" && (
              <Textarea
                placeholder="Type your answer here..."
                value={(answers[currentQuestion.id] as string) || ""}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                className="min-h-32"
              />
            )}

            {currentQuestion.type === "checkbox" && (
              <div className="space-y-2">
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox
                      id={`checkbox-${index}`}
                      checked={((answers[currentQuestion.id] as string[]) || []).includes(option)}
                      onCheckedChange={(checked) => {
                        const currentAnswers = (answers[currentQuestion.id] as string[]) || []
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
                    <Label htmlFor={`checkbox-${index}`}>{option}</Label>
                  </div>
                ))}
              </div>
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
              <Button onClick={handleSubmit}>Submit Assessment</Button>
            ) : (
              <Button onClick={handleNext}>Next Question</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
