"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  XCircle,
  Clock,
  Award,
  Trophy,
  Target,
  Star,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Zap,
  Brain,
  Lightbulb,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { Assessment } from "@/types"

interface InteractiveQuizPlayerProps {
  assessment: Assessment
  onComplete?: (score: number, passed: boolean, answers: Record<string, string>) => void
  onClose?: () => void
}

export function InteractiveQuizPlayer({ assessment, onComplete, onClose }: InteractiveQuizPlayerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(assessment.timeLimit ? assessment.timeLimit * 60 : 0)
  const [isStarted, setIsStarted] = useState(false)
  const [showExplanation, setShowExplanation] = useState<string | null>(null)
  const [streak, setStreak] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)

  const currentQuestion = assessment.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / assessment.questions.length) * 100
  const totalPossiblePoints = assessment.questions.reduce((acc, q) => acc + q.points, 0)

  // Timer effect
  useEffect(() => {
    if (isStarted && timeRemaining > 0 && !showResults) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [isStarted, timeRemaining, showResults])

  const handleStart = () => {
    setIsStarted(true)
  }

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < assessment.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setShowExplanation(null)
    } else {
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setShowExplanation(null)
    }
  }

  const handleSubmit = () => {
    let correctCount = 0
    let earnedPoints = 0
    let currentStreak = 0
    let maxStreak = 0

    assessment.questions.forEach((question) => {
      const userAnswer = answers[question.id]
      const isCorrect = userAnswer === question.correctAnswer

      if (isCorrect) {
        correctCount++
        earnedPoints += question.points
        currentStreak++
        maxStreak = Math.max(maxStreak, currentStreak)
      } else {
        currentStreak = 0
      }
    })

    const score = (correctCount / assessment.questions.length) * 100
    const passed = score >= assessment.passingScore

    setStreak(maxStreak)
    setTotalPoints(earnedPoints)
    setShowResults(true)
    onComplete?.(score, passed, answers)
  }

  const handleRetake = () => {
    setCurrentQuestionIndex(0)
    setAnswers({})
    setShowResults(false)
    setTimeRemaining(assessment.timeLimit ? assessment.timeLimit * 60 : 0)
    setIsStarted(false)
    setShowExplanation(null)
    setStreak(0)
    setTotalPoints(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-blue-600"
    if (score >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 95) return { text: "Perfect!", color: "bg-purple-500", icon: Trophy }
    if (score >= 90) return { text: "Excellent!", color: "bg-green-500", icon: Star }
    if (score >= 80) return { text: "Great Job!", color: "bg-blue-500", icon: Target }
    if (score >= 70) return { text: "Good Work!", color: "bg-yellow-500", icon: Lightbulb }
    return { text: "Keep Trying!", color: "bg-gray-500", icon: Brain }
  }

  // Pre-start screen
  if (!isStarted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">{assessment.title}</CardTitle>
          <CardDescription className="text-lg">{assessment.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Assessment Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-muted rounded-lg">
              <Target className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{assessment.questions.length}</div>
              <div className="text-sm text-muted-foreground">Questions</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{totalPossiblePoints}</div>
              <div className="text-sm text-muted-foreground">Points</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{assessment.timeLimit ? `${assessment.timeLimit}m` : "∞"}</div>
              <div className="text-sm text-muted-foreground">Time Limit</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{assessment.passingScore}%</div>
              <div className="text-sm text-muted-foreground">To Pass</div>
            </div>
          </div>

          {/* Instructions */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Instructions
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                <li>• Read each question carefully before selecting your answer</li>
                <li>• You can navigate between questions using the Previous/Next buttons</li>
                <li>• Your answers are automatically saved as you progress</li>
                {assessment.timeLimit && <li>• You have {assessment.timeLimit} minutes to complete this assessment</li>}
                <li>• You need {assessment.passingScore}% to pass this assessment</li>
                <li>• Click "Submit" when you're ready to see your results</li>
              </ul>
            </CardContent>
          </Card>

          {/* Start Button */}
          <div className="text-center">
            <Button onClick={handleStart} size="lg" className="px-8">
              <Zap className="w-5 h-5 mr-2" />
              Start Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Results screen
  if (showResults) {
    const correctAnswers = assessment.questions.filter(
      (question) => answers[question.id] === question.correctAnswer,
    ).length
    const score = (correctAnswers / assessment.questions.length) * 100
    const passed = score >= assessment.passingScore
    const scoreBadge = getScoreBadge(score)

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto"
      >
        <Card>
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                passed ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {passed ? (
                <Trophy className="w-10 h-10 text-green-600" />
              ) : (
                <XCircle className="w-10 h-10 text-red-600" />
              )}
            </motion.div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
              <CardTitle className={`text-3xl mb-2 ${passed ? "text-green-600" : "text-red-600"}`}>
                {passed ? "Congratulations!" : "Keep Learning!"}
              </CardTitle>
              <CardDescription className="text-lg">
                You scored {score.toFixed(1)}% ({correctAnswers} out of {assessment.questions.length} correct)
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Score Display */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <div className={`text-6xl font-bold mb-4 ${getScoreColor(score)}`}>{score.toFixed(1)}%</div>
              <Progress value={score} className="w-full max-w-md mx-auto mb-4" />
              <Badge className={`${scoreBadge.color} text-white text-lg px-4 py-2`}>
                <scoreBadge.icon className="w-5 h-5 mr-2" />
                {scoreBadge.text}
              </Badge>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{assessment.questions.length - correctAnswers}</div>
                <div className="text-sm text-muted-foreground">Incorrect</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{totalPoints}</div>
                <div className="text-sm text-muted-foreground">Points Earned</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{streak}</div>
                <div className="text-sm text-muted-foreground">Best Streak</div>
              </Card>
            </motion.div>

            {/* Achievement */}
            {passed && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
              >
                <Award className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
                  Assessment Completed Successfully!
                </h3>
                <p className="text-green-700 dark:text-green-300 mb-4">
                  You've earned {totalPoints} points and unlocked the next lesson!
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-medium">+{totalPoints} XP</span>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex gap-4 justify-center"
            >
              <Button onClick={handleRetake} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake Assessment
              </Button>
              <Button onClick={() => setShowExplanation("review")}>
                <Brain className="w-4 h-4 mr-2" />
                Review Answers
              </Button>
              {passed && onClose && (
                <Button onClick={onClose}>
                  Continue Learning
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Quiz interface
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                {assessment.title}
              </CardTitle>
              <CardDescription>
                Question {currentQuestionIndex + 1} of {assessment.questions.length}
              </CardDescription>
            </div>
            {assessment.timeLimit && (
              <div className="flex items-center gap-2">
                <Clock className={`w-5 h-5 ${timeRemaining < 300 ? "text-red-500" : "text-muted-foreground"}`} />
                <span className={`font-mono text-lg ${timeRemaining < 300 ? "text-red-500" : ""}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span>{progress.toFixed(0)}% Complete</span>
            </div>
            <Progress value={progress} />
          </div>
        </CardHeader>
      </Card>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-xl leading-relaxed">{currentQuestion.question}</CardTitle>
                <Badge variant="outline" className="ml-4 flex-shrink-0">
                  {currentQuestion.points} pt{currentQuestion.points !== 1 ? "s" : ""}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Multiple Choice */}
              {currentQuestion.type === "multiple_choice" && (
                <RadioGroup
                  value={answers[currentQuestion.id] || ""}
                  onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
                  className="space-y-3"
                >
                  {currentQuestion.options?.map((option, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-base">
                        {option}
                      </Label>
                    </motion.div>
                  ))}
                </RadioGroup>
              )}

              {/* True/False */}
              {currentQuestion.type === "true_false" && (
                <RadioGroup
                  value={answers[currentQuestion.id] || ""}
                  onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
                  className="flex gap-6 justify-center"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <RadioGroupItem value="true" id="true" />
                    <Label htmlFor="true" className="cursor-pointer text-lg font-medium">
                      True
                    </Label>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <RadioGroupItem value="false" id="false" />
                    <Label htmlFor="false" className="cursor-pointer text-lg font-medium">
                      False
                    </Label>
                  </motion.div>
                </RadioGroup>
              )}

              {/* Short Answer / Essay */}
              {(currentQuestion.type === "short_answer" || currentQuestion.type === "essay") && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Textarea
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
                    placeholder="Enter your answer..."
                    rows={currentQuestion.type === "essay" ? 8 : 4}
                    className="resize-none text-base"
                  />
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {/* Question Indicators */}
            <div className="flex items-center gap-2">
              {assessment.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    index === currentQuestionIndex
                      ? "bg-primary text-primary-foreground"
                      : answers[assessment.questions[index].id]
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <Button
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
              className={
                currentQuestionIndex === assessment.questions.length - 1 ? "bg-green-600 hover:bg-green-700" : ""
              }
            >
              {currentQuestionIndex === assessment.questions.length - 1 ? (
                <>
                  Submit Assessment
                  <CheckCircle className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
