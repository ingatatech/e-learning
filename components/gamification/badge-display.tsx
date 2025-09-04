import { Badge } from "lucide-react"

interface BadgeProps {
  badge: {
    id: string
    name: string
    description: string
    icon: string
    rarity: "common" | "rare" | "epic" | "legendary"
  }
  size?: "sm" | "md" | "lg"
  showAnimation?: boolean
  isNew?: boolean
}

const rarityColors = {
  common: "from-gray-400 to-gray-600",
  rare: "from-blue-400 to-blue-600",
  epic: "from-purple-400 to-purple-600",
  legendary: "from-yellow-400 to-yellow-600",
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
}

export function BadgeDisplay({ badge, size = "md", showAnimation = false, isNew = false }: BadgeProps) {
  return (
    <div className={`relative ${showAnimation ? "animate-badge-bounce" : ""}`}>
      <div
        className={`
        ${sizeClasses[size]}
        rounded-full
        flex items-center justify-center
        bg-gradient-to-br ${rarityColors[badge.rarity]}
        shadow-lg
        border-2 border-white
        ${isNew ? "ring-2 ring-yellow-400 ring-opacity-75" : ""}
      `}
      >
        <Badge className={`text-white ${size === "lg" ? "w-8 h-8" : "w-6 h-6"}`} />
      </div>

      {isNew && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />}

      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
        <div
          className={`
          px-1 py-0.5 rounded text-xs font-bold text-white
          bg-gradient-to-r ${rarityColors[badge.rarity]}
        `}
        >
          {badge.rarity.toUpperCase()}
        </div>
      </div>
    </div>
  )
}
