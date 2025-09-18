"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Star, Clock, Users, Play, BookOpen, Trophy, Target, Zap, Crown, Award, TrendingUp, Filter, X, SquarePen, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { useAuth } from "@/hooks/use-auth"
import { Course } from "@/types"

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedPrice, setSelectedPrice] = useState("all")
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { token, user } = useAuth()

  useEffect(() => {
    const fetcCourses = async () => {
      if (!user || !token) return
      setLoading(true)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/organization/${user?.organization.id}/courses`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          setCourses(data.courses)
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error)
      } finally {
        setLoading(false)
      }
    }

    fetcCourses()
  }, [user, token])

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesLevel = selectedLevel === "all" || course.level === selectedLevel
    const matchesCategory = selectedCategory === "all" || course.category?.name === selectedCategory
    
    const isFree = course.price == 0 || course.price === null || course.price === undefined
    const matchesPrice = selectedPrice === "all" || 
                        (selectedPrice === "free" && isFree) ||
                        (selectedPrice === "paid" && !isFree)

    return matchesSearch && matchesLevel && matchesCategory && matchesPrice
  })

  const categories = ["Web Development", "Data Science", "Design", "Backend Development", "Mobile Development", "testing category"]
  const levels = ["beginner", "intermediate", "advanced"]

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "beginner":
        return <Target className="w-3 h-3" />
      case "intermediate":
        return <Trophy className="w-3 h-3" />
      case "advanced":
        return <Crown className="w-3 h-3" />
      default:
        return <Target className="w-3 h-3" />
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-500 hover:bg-green-600"
      case "intermediate":
        return "bg-blue-500 hover:bg-blue-600"
      case "advanced":
        return "bg-purple-500 hover:bg-purple-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setSelectedLevel("all")
    setSelectedCategory("all")
    setSelectedPrice("all")
  }

  const hasActiveFilters = searchTerm || selectedLevel !== "all" || selectedCategory !== "all" || selectedPrice !== "all"

  if (!user || !token) {
    return null
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} />
        <div className="flex">
          <div className="w-80 h-screen"></div>
          <div className="flex-1 flex justify-center items-center h-screen">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-lg">Loading courses...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      
      
      <div className="flex">
        {/* Fixed Sidebar */}
        <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 bg-card border-r border-border z-40 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}>
          <div className="p-6 h-full overflow-y-auto">
            {/* Back Button */}
      <Button className="mb-8 hover:bg-primary/10" variant="ghost" size="sm" asChild>
        <Link href="/student">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to dashboard
        </Link>
      </Button>
            {/* Sidebar Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">Course Filters</h3>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Search Adventures</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Find your course..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-2 focus:border-primary/50 transition-colors"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="border-2 focus:border-primary/50">
                  <SelectValue placeholder="Choose category" />
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
            </div>

            {/* Level Filter */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Difficulty Level</label>
              <div className="space-y-2">
                {["all", ...levels].map((level) => (
                  <div
                    key={level}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedLevel === level
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedLevel(level)}
                  >
                    <div className="flex items-center gap-2">
                      {level !== "all" && getLevelIcon(level)}
                      <span className="font-medium">
                        {level === "all" ? "All Levels" : level.charAt(0).toUpperCase() + level.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Price Range</label>
              <div className="space-y-2">
                {[
                  { value: "all", label: "All Prices", icon: null, color: "" },
                  { value: "free", label: "Free Courses", icon: <Zap className="w-3 h-3" />, color: "text-green-500" },
                  { value: "paid", label: "Premium Courses", icon: <Crown className="w-3 h-3" />, color: "text-yellow-500" }
                ].map((option) => (
                  <div
                    key={option.value}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedPrice === option.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedPrice(option.value)}
                  >
                    <div className="flex items-center gap-2">
                      <span className={option.color}>{option.icon}</span>
                      <span className="font-medium">{option.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button 
                onClick={clearAllFilters}
                variant="outline" 
                className="w-full"
              >
                <Target className="w-4 h-4 mr-2" />
                Clear All Filters
              </Button>
            )}

            {/* Stats in Sidebar */}
            <div className="mt-8 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-3">Course Statistics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Total Courses:</span>
                  <Badge variant="secondary">{courses.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Free Courses:</span>
                  <Badge className="bg-green-500 hover:bg-green-600">
                    {courses.filter(c => c.price == 0 || c.price === null || c.price === undefined).length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Premium Courses:</span>
                  <Badge className="bg-yellow-500 hover:bg-yellow-600">
                    {courses.filter(c => c.price > 0).length}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-80">
          <div className="px-6 py-8">
            {/* Mobile Filter Toggle */}
            <Button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden mb-6 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
              variant="outline"
            >
              <Filter className="w-4 h-4 mr-2" />
              Show Filters
            </Button>

            {/* Gamified Header */}
            <div className="text-center mb-12 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 rounded-3xl -z-10"></div>
              <div className="py-12">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                  <h1 className="text-4xl font-bold text-primary">
                    Browse the courses
                  </h1>
                </div>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
                  Embark on your learning journey and unlock new achievements
                </p>
                
                {/* Stats Bar */}
                <div className="flex items-center justify-center gap-8 text-sm">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">{filteredCourses.length} Courses Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-500" />
                    <span className="font-medium">Learn & Earn XP</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="px-3 py-1">
                  <Trophy className="w-3 h-3 mr-1" />
                  {filteredCourses.length} Courses Found
                </Badge>
                <span className="text-muted-foreground text-sm">out of {courses.length} total adventures</span>
              </div>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="pt-0 overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group border-2 hover:border-primary/20 bg-gradient-to-b from-card to-card/50">
                  <div className="relative">
                    <img
                      src={course.thumbnail || "/placeholder0.svg"}
                      alt={course.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Enhanced Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {course.isPopular && (
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-md">
                          <Crown className="w-3 h-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                      <Badge className={`${getLevelColor(course.level)} shadow-md flex items-center gap-1`}>
                        {getLevelIcon(course.level)}
                        {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                      </Badge>
                    </div>

                    {/* Price Badge */}
                    <div className="absolute top-2 right-2">
                      {course.price == 0 || course.price === null || course.price === undefined ? (
                        <Badge className="bg-green-500 hover:bg-green-600 shadow-md">
                          <Zap className="w-3 h-3 mr-1" />
                          FREE
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="shadow-md font-bold">
                          {course.price}RWF
                        </Badge>
                      )}
                    </div>

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <Button 
                        size="sm" 
                        className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100 bg-primary/90 hover:bg-primary shadow-lg" 
                        asChild
                      >
                        <Link href={`/courses/${course.id}`}>
                          <Play className="w-4 h-4 mr-2" />
                          Start Course
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-bold">{course.rating}</span>
                        <span className="text-xs text-muted-foreground">({course.reviewCount})</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2 mb-4">
                      <img
                        src={course.instructor?.profilePicUrl || "/placeholder.svg"}
                        alt={course.instructor?.profilePicUrl}
                        className="w-7 h-7 rounded-full border-2 border-primary/20"
                      />
                      <div className="flex items-center gap-1">
                        <Award className="w-3 h-3 text-primary" />
                        <span className="text-sm font-medium text-primary">
                          {course.instructor?.firstName ?? ""} {course.instructor?.lastName ?? ""} 
                          {(course.instructor?.firstName || course.instructor?.lastName) ? "" : "Unknown Instructor"}
                          </span>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                      <div className="flex items-center gap-1 p-2 bg-muted/50 rounded-lg">
                        <Users className="w-3 h-3 text-blue-500" />
                        <span className="font-medium">{course.enrollmentCount?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1 p-2 bg-muted/50 rounded-lg">
                        <BookOpen className="w-3 h-3 text-green-500" />
                        {course.modules?.reduce((sum, mod) => sum + (mod.lessons?.length ?? 0), 0) ?? 0}
                      </div>
                      <div className="flex items-center gap-1 p-2 bg-muted/50 rounded-lg">
                        <Clock className="w-3 h-3 text-orange-500" />
                        <span className="font-medium">{course.duration}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary">
                          {course.price == 0 || course.price === null || course.price === undefined ? "FREE" : `${course.price}RWF`}
                        </span>
                        {course.originalPrice > course.price && (
                          <span className="text-sm text-muted-foreground line-through">{course.originalPrice}RWF</span>
                        )}
                      </div>
                      <Button size="sm" className="bg-primary hover:bg-primary/70 shadow-md" asChild>
                        <Link href={`/courses/${course.id}`}>
                          <SquarePen className="w-3 h-3 mr-1" />
                          Enroll
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Enhanced Empty State */}
            {filteredCourses.length === 0 && (
              <div className="text-center py-16">
                <div className="bg-muted/50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-3">No Courses match your criteria</h3>
                <p className="text-muted-foreground mb-6">Try adjusting your filters to discover more learning adventures</p>
                <Button 
                  onClick={clearAllFilters}
                  variant="outline"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}