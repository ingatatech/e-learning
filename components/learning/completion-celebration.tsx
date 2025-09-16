"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, Award, Share2, Download, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

interface CompletionCelebrationProps {
  isVisible: boolean
  onClose: () => void
  stepTitle: string
  stepType: "content" | "video" | "assessment"
  score?: number
  isLessonComplete?: boolean
  isModuleComplete?: boolean
  isCourseComplete?: boolean
  nextStepTitle?: string
  nextStepId?: string
}

export function CompletionCelebration({
  isVisible,
  onClose,
  stepTitle,
  stepType,
  score,
  isLessonComplete,
  isModuleComplete,
  isCourseComplete,
  nextStepTitle,
  nextStepId,
}: CompletionCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  const getCelebrationMessage = () => {
    if (isCourseComplete) {
      return {
        title: "🎉 Course Complete!",
        message: "Congratulations! You've successfully completed the entire course.",
        icon: <Trophy className="w-12 h-12 text-yellow-500" />,
      }
    }
    if (isModuleComplete) {
      return {
        title: "🎯 Module Complete!",
        message: "Great job! You've finished this module.",
        icon: <Award className="w-12 h-12 text-blue-500" />,
      }
    }
    if (isLessonComplete) {
      return {
        title: "✅ Lesson Complete!",
        message: "Well done! You've completed this lesson.",
        icon: <Star className="w-12 h-12 text-green-500" />,
      }
    }

    return {
      title: `${stepType === "assessment" ? "🏆" : "✨"} Step Complete!`,
      message: `You've successfully completed: ${stepTitle}`,
      icon:
        stepType === "assessment" ? (
          <Award className="w-12 h-12 text-purple-500" />
        ) : (
          <Star className="w-12 h-12 text-blue-500" />
        ),
    }
  }

  const celebration = getCelebrationMessage()

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-md w-full"
          >
            <Card className="border-2 border-primary/20 shadow-2xl">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}>
                    {celebration.icon}
                  </motion.div>
                </div>
                <CardTitle className="text-2xl">{celebration.title}</CardTitle>
                <p className="text-muted-foreground">{celebration.message}</p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Score Display for Assessments */}
                {stepType === "assessment" && score !== undefined && (
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <div className="text-3xl font-bold text-primary mb-1">{score}%</div>
                    <div className="text-sm text-muted-foreground">Your Score</div>
                    {score >= 80 && <Badge className="mt-2 bg-green-500 hover:bg-green-600">Excellent Work!</Badge>}
                  </div>
                )}

                {/* Course Completion Actions */}
                {isCourseComplete && (
                  <div className="space-y-3">
                    <Button className="w-full" size="lg">
                      <Download className="w-4 h-4 mr-2" />
                      Download Certificate
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Achievement
                    </Button>
                  </div>
                )}

                {/* Next Step Actions */}
                {!isCourseComplete && nextStepTitle && nextStepId && (
                  <div className="space-y-3">
                    <Button className="w-full" size="lg" asChild>
                      <Link href={`#${nextStepId}`}>
                        Continue to: {nextStepTitle}
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                )}

                <Button variant="outline" className="w-full bg-transparent" onClick={onClose}>
                  Continue Learning
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Confetti Effect */}
          {showConfetti && (
            <div className="fixed inset-0 pointer-events-none">
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-primary rounded-full"
                  initial={{
                    x: Math.random() * window.innerWidth,
                    y: -10,
                    rotate: 0,
                  }}
                  animate={{
                    y: window.innerHeight + 10,
                    rotate: 360,
                  }}
                  transition={{
                    duration: Math.random() * 2 + 1,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
