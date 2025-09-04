"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Star, Clock, Users, Play, BookOpen } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/layout/header"

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Mock courses data
  const courses = [
    {
      id: "1",
      title: "Complete React Development Course",
      description: "Master React from basics to advanced concepts with hands-on projects",
      instructor: "Sarah Johnson",
      instructorAvatar: "/placeholder.svg?height=40&width=40",
      thumbnail: "/react-course-thumbnail.png",
      level: "intermediate",
      category: "Web Development",
      price: 99,
      originalPrice: 149,
      rating: 4.9,
      reviewCount: 1247,
      studentCount: 3420,
      duration: "12 weeks",
      lessonsCount: 45,
      tags: ["React", "JavaScript", "Frontend"],
      isPopular: true,
      lastUpdated: "2024-03-10",
    },
    {
      id: "2",
      title: "Python for Data Science",
      description: "Learn Python programming and data analysis with real-world projects",
      instructor: "Dr. Michael Chen",
      instructorAvatar: "/placeholder.svg?height=40&width=40",
      thumbnail: "/python-data-science-course.png",
      level: "beginner",
      category: "Data Science",
      price: 79,
      originalPrice: 120,
      rating: 4.8,
      reviewCount: 892,
      studentCount: 2156,
      duration: "10 weeks",
      lessonsCount: 38,
      tags: ["Python", "Data Science", "Analytics"],
      isPopular: false,
      lastUpdated: "2024-03-08",
    },
    {
      id: "3",
      title: "UI/UX Design Masterclass",
      description: "Create stunning user interfaces and experiences with modern design principles",
      instructor: "Emma Wilson",
      instructorAvatar: "/placeholder.svg?height=40&width=40",
      thumbnail: "/ui-ux-design-course.png",
      level: "advanced",
      category: "Design",
      price: 129,
      originalPrice: 199,
      rating: 4.9,
      reviewCount: 567,
      studentCount: 1890,
      duration: "8 weeks",
      lessonsCount: 32,
      tags: ["UI/UX", "Design", "Figma"],
      isPopular: true,
      lastUpdated: "2024-03-12",
    },
    {
      id: "4",
      title: "Node.js Backend Development",
      description: "Build scalable backend applications with Node.js and Express",
      instructor: "James Rodriguez",
      instructorAvatar: "/placeholder.svg?height=40&width=40",
      thumbnail: "/nodejs-backend-course.png",
      level: "intermediate",
      category: "Backend Development",
      price: 89,
      originalPrice: 139,
      rating: 4.7,
      reviewCount: 423,
      studentCount: 1234,
      duration: "9 weeks",
      lessonsCount: 41,
      tags: ["Node.js", "Express", "Backend"],
      isPopular: false,
      lastUpdated: "2024-03-05",
    },
  ]

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesLevel = selectedLevel === "all" || course.level === selectedLevel
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory

    return matchesSearch && matchesLevel && matchesCategory
  })

  const categories = ["Web Development", "Data Science", "Design", "Backend Development", "Mobile Development"]
  const levels = ["beginner", "intermediate", "advanced"]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Explore Courses</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover thousands of courses from expert instructors and advance your skills
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {levels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredCourses.length} of {courses.length} courses
          </p>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="relative">
                <img
                  src={course.thumbnail || "/placeholder.svg"}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                {course.isPopular && (
                  <Badge className="absolute top-2 left-2 bg-orange-500 hover:bg-orange-600">Popular</Badge>
                )}
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
                    {course.originalPrice > course.price && (
                      <span className="text-sm text-muted-foreground line-through">${course.originalPrice}</span>
                    )}
                  </div>
                  <Button size="sm" asChild>
                    <Link href={`/courses/${course.id}`}>View Course</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No courses found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}
