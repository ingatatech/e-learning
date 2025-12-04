"use client"
import { Clock, Lock } from "lucide-react"

interface BrowseCourseCardProps {
  id: number | string
  title: string
  description: string
  image: string
  partner: string
  level: string
  language: string
  duration: string
  price: string | number
  category: string
}

export function BrowseCourseCard({
  id,
  title,
  description,
  image,
  partner,
  level,
  language,
  duration,
  price,
  category,
}: BrowseCourseCardProps) {
  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "bg-green-500"
      case "intermediate":
        return "bg-blue-500"
      case "advanced":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="bg-white dark:bg-accent rounded overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-800">
      {/* Course Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={image || "/placeholder.svg"} alt={title} className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3">
          <span className={`${getLevelColor(level)} text-white text-xs font-bold px-3 py-1 rounded`}>{level}</span>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="text-xs text-foreground font-medium">{partner}</div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <span>Course</span>
          <span>|</span>
          <span>{language}</span>
        </div>

        <h3 className="text-lg font-bold mb-3 text-foreground leading-tight line-clamp-2">{title}</h3>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-3 min-h-[3.75rem]">{description}</p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1 text-sm text-foreground">
            <Clock className="w-4 h-4" />
            <span className="font-medium">{duration}</span>
          </div>
          <div className="flex items-center gap-1 text-sm font-bold text-foreground">
            <Lock className="w-4 h-4" />
            <span>{price}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
