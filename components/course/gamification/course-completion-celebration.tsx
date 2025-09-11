"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Star, Sparkles, BookOpen, PlayCircle, Target, Award, X, Share2, Download } from "lucide-react"
import { useRouter } from "next/navigation"

interface CourseCompletionCelebrationProps {
  courseTitle: string
  stats: {
    modules: number
    lessons: number
    assessments: number
    qualityScore: number
  }
  onClose: () => void
}

export function CourseCompletionCelebration({ courseTitle, stats, onClose }: CourseCompletionCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()

  const achievements = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Course Creator",
      description: "Successfully created your first course",
      color: "text-blue-500",
    },
    {
      icon: <PlayCircle className="w-8 h-8" />,
      title: "Content Master",
      description: `Created ${stats.lessons} engaging lessons`,
      color: "text-green-500",
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Assessment Expert",
      description: `Built ${stats.assessments} assessments`,
      color: "text-orange-500",
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Quality Champion",
      description: `Achieved ${stats.qualityScore}% quality score`,
      color: "text-yellow-500",
    },
  ]

  const xpEarned = 500 + stats.modules * 50 + stats.lessons * 25 + stats.assessments * 75

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < achievements.length - 1) {
          return prev + 1
        }
        clearInterval(interval)
        return prev
      })
    }, 800)

    return () => clearInterval(interval)
  }, [achievements.length])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        {/* Confetti Effect */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 1,
                  y: -100,
                  x: Math.random() * window.innerWidth,
                  rotate: 0,
                }}
                animate={{
                  y: window.innerHeight + 100,
                  rotate: 360,
                }}
                transition={{
                  duration: 3,
                  delay: Math.random() * 2,
                  ease: "easeOut",
                }}
                className={`absolute w-3 h-3 ${
                  ["bg-yellow-400", "bg-blue-400", "bg-green-400", "bg-red-400", "bg-purple-400"][i % 5]
                } rounded-full`}
              />
            ))}
          </div>
        )}

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative max-w-2xl w-full"
        >
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 via-green-400 to-blue-400" />

            <CardContent className="p-8 text-center space-y-6">
              <Button variant="ghost" size="sm" onClick={onClose} className="absolute top-4 right-4">
                <X className="w-4 h-4" />
              </Button>

              {/* Main Trophy */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                className="relative"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Trophy className="w-12 h-12 text-white" />
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="absolute -top-2 -right-2"
                >
                  <Sparkles className="w-8 h-8 text-yellow-400" />
                </motion.div>
              </motion.div>

              {/* Title */}
              <div className="space-y-2">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="text-3xl font-bold text-gray-900 dark:text-white"
                >
                  🎉 Course Published!
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="text-gray-600 dark:text-gray-300"
                >
                  "{courseTitle}" is now live and ready for students!
                </motion.p>
              </div>

              {/* Course Stats */}
              <div className="grid grid-cols-4 gap-4 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.modules}</div>
                  <div className="text-xs text-gray-600">Modules</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.lessons}</div>
                  <div className="text-xs text-gray-600">Lessons</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.assessments}</div>
                  <div className="text-xs text-gray-600">Assessments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.qualityScore}%</div>
                  <div className="text-xs text-gray-600">Quality</div>
                </div>
              </div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.5 }}
                className="flex gap-3 justify-center"
              >
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Success
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Certificate
                </Button>
                <Button onClick={() => router.push('/instructor/courses')} size="sm">
                  Continue
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
