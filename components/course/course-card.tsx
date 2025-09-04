import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Clock, Users, Play, BookOpen } from "lucide-react"
import Link from "next/link"

interface CourseCardProps {
  course: {
    id: string
    title: string
    description: string
    instructor: string
    instructorAvatar: string
    thumbnail: string
    level: string
    category: string
    price: number
    originalPrice?: number
    rating: number
    reviewCount: number
    studentCount: number
    duration: string
    lessonsCount: number
    tags: string[]
    isPopular?: boolean
  }
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative">
        <img src={course.thumbnail || "/placeholder.svg"} alt={course.title} className="w-full h-48 object-cover" />
        {course.isPopular && <Badge className="absolute top-2 left-2 bg-orange-500 hover:bg-orange-600">Popular</Badge>}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <Button size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" asChild>
            <Link href={`/courses/${course.id}`}>
              <Play className="w-4 h-4 mr-2" />
              Preview
            </Link>
          </Button>
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="text-xs">
            {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
          </Badge>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{course.rating}</span>
            <span className="text-xs text-muted-foreground">({course.reviewCount})</span>
          </div>
        </div>
        <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center gap-2 mb-3">
          <img
            src={course.instructorAvatar || "/placeholder.svg"}
            alt={course.instructor}
            className="w-6 h-6 rounded-full"
          />
          <span className="text-sm text-muted-foreground">{course.instructor}</span>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {course.studentCount.toLocaleString()}
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            {course.lessonsCount} lessons
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {course.duration}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">${course.price}</span>
            {course.originalPrice && course.originalPrice > course.price && (
              <span className="text-sm text-muted-foreground line-through">${course.originalPrice}</span>
            )}
          </div>
          <Button size="sm" asChild>
            <Link href={`/courses/${course.id}`}>View Course</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
