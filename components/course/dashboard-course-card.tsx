"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, BookOpen, Clock, Play, Share2 } from 'lucide-react'
import Link from "next/link"
import { motion } from "framer-motion"
import type { Course } from "@/types"

interface DashboardCourseCardProps {
  course: Course
  index?: number
  variant?: "dashboard" | "admin" | "browse" | "student"
  showActions?: boolean
  onAnalytics?: (courseId: string) => void
}

export function DashboardCourseCard({
  course,
  index = 0,
  variant = "dashboard",
  showActions = true,
  onAnalytics,
}: DashboardCourseCardProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const formatWeeks = (minutes: number) => {
    // Assuming 5 hours per week of study
    const weeks = Math.ceil(minutes / (5 * 60))
    return `${weeks} week${weeks !== 1 ? 's' : ''}`
  }

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "bg-emerald-500 hover:bg-emerald-600 text-white"
      case "intermediate":
        return "bg-blue-500 hover:bg-blue-600 text-white"
      case "advanced":
        return "bg-purple-500 hover:bg-purple-600 text-white"
      default:
        return "bg-gray-500 hover:bg-gray-600 text-white"
    }
  }

  const getBasePath = () => {
    switch (variant) {
      case "admin":
        return "/sysAdmin/courses"
      case "dashboard":
      case "student":
      default:
        return "/instructor/courses"
    }
  }

  const basePath = getBasePath()

  const renderButtons = () => {
    if (variant === "browse" || variant === "student") {
      return (
        <Button className="w-full" asChild>
          <Link href={`/courses/${course.id}`}>
            <Play className="w-4 h-4 mr-2" />
            {variant === "student" ? "Continue Learning" : "View Course"}
          </Link>
        </Button>
      )
    }

    return (
      <Button className="w-full" asChild>
        <Link href={`${basePath}/${course.id}`}>
          <Play className="w-4 h-4 mr-2" />
          Manage Course
        </Link>
      </Button>
    )
  }

  // Extract organization from course data or use default
  const organization = course.instructor || "N/A"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="h-full"
    >
      <Card className="overflow-hidden hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full pt-0">
        {/* Image Section with Level Badge and Share Button */}
        <div className="relative overflow-hidden">
          <img
            src={course.thumbnail || "/placeholder.svg"}
            alt={course.title}
            className="w-full h-56 object-cover"
          />
          
          {/* Level Badge - Top Left */}
          <div className="absolute top-3 left-3">
            <Badge className={`${getLevelColor(course.level)} rounded`}>
              {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
            </Badge>
          </div>
        </div>

        <CardHeader className="pb-3 space-y-2">
          {/* Organization Name */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="w-4 h-4" />
            <span className="font-medium">Course</span>
            <span>|</span>
            <span>{course.isPublished ? "Live" : "Draft"}</span>
          </div>

          {/* Course Title */}
          <CardTitle className="text-xl line-clamp-2 leading-tight">
            {course.title}
          </CardTitle>

          {/* Course Description */}
          <CardDescription className="line-clamp-2 text-sm leading-relaxed">
            {course.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0 mt-auto">
          {/* Duration and Price */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{course.duration > 0 ? formatWeeks(course.duration) : "Self-paced"}</span>
            </div>
            
            <div className="flex items-center gap-1 text-sm font-semibold">
              {course.price === 0 || course.price === null ? (
                "Free"
              ) : (
                `${course.price.toLocaleString()} RWF`
              )}
            </div>
          </div>

          {/* Additional Info for Dashboard/Admin */}
          {(variant === "dashboard" || variant === "admin") && (
            <div className="flex items-center gap-4 mt-3 pt-3 border-t text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{course.enrollmentCount} enrolled</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{course.modules?.length || 0} modules</span>
              </div>
            </div>
          )}

          {/* Action Button */}
          {showActions && (
            <div className="mt-4">
              {renderButtons()}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}