"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, Clock, Award } from "lucide-react"

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

interface QuizComponentProps {
  quiz: {
    id: string
    title: string
    description: string
    questions: QuizQuestion[]
    timeLimit?: number
    passingScore: number
  }
  onComplete?: (score: number, passed: boolean) => void
}

export function QuizComponent({ quiz, onComplete }: QuizComponentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [showResults, setShowResults] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(quiz.timeLimit || 0)

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmit = () => {
    const correctAnswers = quiz.questions.filter((question) => answers[question.id] === question.correctAnswer).length

    const score = (correctAnswers / quiz.questions.length) * 100
    const passed = score >= quiz.passingScore

    setShowResults(true)
    onComplete?.(score, passed)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (showResults) {
    const correctAnswers = quiz.questions.filter((question) => answers[question.id] === question.correctAnswer).length
    const score = (correctAnswers / quiz.questions.length) * 100
    const passed = score >= quiz.passingScore

    return (
      <Card>
        <CardHeader className="text-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              passed ? "bg-green-100" : "bg-red-100"
            }`}
          >
            {passed ? <CheckCircle className="w-8 h-8 text-green-600" /> : <XCircle className="w-8 h-8 text-red-600" />}
          </div>
          <CardTitle className={passed ? "text-green-600" : "text-red-600"}>
            {passed ? "Congratulations!" : "Keep Trying!"}
          </CardTitle>
          <CardDescription>
            You scored {score.toFixed(1)}% ({correctAnswers} out of {quiz.questions.length} correct)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">{score.toFixed(1)}%</div>
            <Progress value={score} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">Passing score: {quiz.passingScore}%</p>
          </div>

          {passed && (
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-medium text-green-800">Quiz Completed Successfully!</p>
              <p className="text-sm text-green-600">You've earned 25 points</p>
            </div>
          )}

          <div className="flex gap-2 justify-center">
            <Button onClick={() => window.location.reload()}>Retake Quiz</Button>
            <Button variant="outline">Review Answers</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{quiz.title}</CardTitle>
            <CardDescription>{quiz.description}</CardDescription>
          </div>
          {quiz.timeLimit && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeRemaining)}</span>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </span>
            <span>{progress.toFixed(0)}% Complete</span>
          </div>
          <Progress value={progress} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>
          <RadioGroup
            value={answers[currentQuestion.id]?.toString()}
            onValueChange={(value) => handleAnswerSelect(currentQuestion.id, Number.parseInt(value))}
          >
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
            Previous
          </Button>
          <div className="flex items-center gap-2">
            {quiz.questions.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentQuestionIndex
                    ? "bg-primary"
                    : answers[quiz.questions[index].id] !== undefined
                      ? "bg-green-500"
                      : "bg-muted"
                }`}
              />
            ))}
          </div>
          <Button onClick={handleNext} disabled={answers[currentQuestion.id] === undefined}>
            {currentQuestionIndex === quiz.questions.length - 1 ? "Submit" : "Next"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
