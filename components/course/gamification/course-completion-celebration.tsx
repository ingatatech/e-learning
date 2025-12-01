"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

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
  const router = useRouter()
  const { user } = useAuth() 

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >

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

              {/* Title */}
              <div className="space-y-2">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold text-gray-900 dark:text-white"
                >
                Course Published!
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-600 dark:text-gray-300"
                >
                  "{courseTitle}" {user!.role == "sysAdmin" ? "is now live and ready for students!" : "is now ready to be reviewed!"} 
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
                transition={{ delay: 0.5 }}
                className="flex gap-3 justify-center"
              >
                <Button onClick={() => router.push(`/${user!.role}/courses`)} size="lg" className="rounded">
                  View Courses
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
