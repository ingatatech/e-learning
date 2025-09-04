"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { BadgeDisplay } from "./badge-display"
import { Sparkles } from "lucide-react"

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  rarity: "common" | "rare" | "epic" | "legendary"
  points?: number
}

interface AchievementModalProps {
  achievement: Achievement | null
  isOpen: boolean
  onClose: () => void
}

export function AchievementModal({ achievement, isOpen, onClose }: AchievementModalProps) {
  if (!achievement) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            Achievement Unlocked!
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 py-6">
          <div className="animate-badge-bounce">
            <BadgeDisplay badge={achievement} size="lg" showAnimation={true} isNew={true} />
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-primary-600 dark:text-primary-400">{achievement.name}</h3>
            <p className="text-gray-600 dark:text-gray-400">{achievement.description}</p>
            {achievement.points && (
              <div className="flex items-center justify-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
                <Sparkles className="w-4 h-4" />+{achievement.points} points earned
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <Button onClick={onClose} className="w-full">
            Awesome!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
