"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import {
  Search,
  Users,
  BookOpen,
  Trophy,
  Target,
  Zap,
  Crown,
  Award,
  Filter,
  X,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { useAuth } from "@/hooks/use-auth"
import { BrowseCourseCard } from "@/components/course/browse-course-card"
import { useCourses } from "@/hooks/use-courses"

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedPrice, setSelectedPrice] = useState("all")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(6)
  const { token, user } = useAuth()
  const { fetchCourses, courses, loading } = useCourses()

  useEffect(() => {
    if (user && token) {
      fetchCourses(false, "org")
    }
  }, [])
  
  console.log(courses)
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesLevel = selectedLevel === "all" || course.level === selectedLevel
    const matchesCategory = selectedCategory === "all" || course.category?.name === selectedCategory

    const isFree = course.price == 0 || course.price === null || course.price === undefined
    const matchesPrice =
      selectedPrice === "all" || (selectedPrice === "free" && isFree) || (selectedPrice === "paid" && !isFree)

    return matchesSearch && matchesLevel && matchesCategory && matchesPrice
  })

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCourses = filteredCourses.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedLevel, selectedCategory, selectedPrice])

  const categories = [
    "Web Development",
    "Data Science",
    "Design",
    "Backend Development",
    "Mobile Development",
    "testing category",
  ]
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

  const hasActiveFilters =
    searchTerm || selectedLevel !== "all" || selectedCategory !== "all" || selectedPrice !== "all"

  if (!user || !token) {
    return null
  }

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
        <div
          className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 bg-card border-r border-border z-40 transform transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
        >
          <div className="p-6 h-full overflow-y-auto">
            <Button className="mb-8 hover:bg-primary/10" variant="ghost" size="sm" asChild>
              <Link href="/student">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to dashboard
              </Link>
            </Button>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">Course Filters</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="lg:hidden">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Search courses</label>
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

            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Difficulty Level</label>
              <div className="space-y-2">
                {["all", ...levels].map((level) => (
                  <div
                    key={level}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedLevel === level ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
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

            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Price Range</label>
              <div className="space-y-2">
                {[
                  { value: "all", label: "All Prices", icon: null, color: "" },
                  { value: "free", label: "Free Courses", icon: <Zap className="w-3 h-3" />, color: "text-green-500" },
                  {
                    value: "paid",
                    label: "Premium Courses",
                    icon: <Crown className="w-3 h-3" />,
                    color: "text-yellow-500",
                  },
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

            {hasActiveFilters && (
              <Button onClick={clearAllFilters} variant="outline" className="w-full bg-transparent">
                <Target className="w-4 h-4 mr-2" />
                Clear All Filters
              </Button>
            )}

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
                    {courses.filter((c) => c.price == 0 || c.price === null || c.price === undefined).length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Premium Courses:</span>
                  <Badge className="bg-yellow-500 hover:bg-yellow-600">
                    {courses.filter((c) => c.price > 0).length}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-80">
          <div className="px-6 pb-8">
            <Button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden mb-6 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
              variant="outline"
            >
              <Filter className="w-4 h-4 mr-2" />
              Show Filters
            </Button>

            <div className="text-center relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 rounded-3xl -z-10"></div>
              <div className="py-12">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                  <h1 className="text-4xl font-bold text-primary">Browse the courses</h1>
                </div>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
                  Embark on your learning journey and improve your skills with our diverse collection of courses.
                </p>
              </div>
            </div>

            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="px-3 py-1">
                  <Trophy className="w-3 h-3 mr-1" />
                  {filteredCourses.length} Courses Found
                </Badge>
                <span className="text-muted-foreground text-sm">out of {courses.length} total courses</span>
              </div>
            </div>

            {paginatedCourses.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginatedCourses.map((course) => (
                    <BrowseCourseCard
                      key={course.id}
                      id={course.id}
                      title={course.title}
                      description={course.description}
                      image={course.thumbnail}
                      partner={course.organization?.name}
                      level={course.level}
                      language={course.language}
                      duration={course.duration}
                      price={course.price}
                      category={course.category}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>

                        {[...Array(totalPages)].map((_, i) => {
                          const pageNum = i + 1
                          if (
                            pageNum === 1 ||
                            pageNum === totalPages ||
                            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                          ) {
                            return (
                              <PaginationItem key={pageNum}>
                                <PaginationLink
                                  onClick={() => setCurrentPage(pageNum)}
                                  isActive={currentPage === pageNum}
                                  className="cursor-pointer"
                                >
                                  {pageNum}
                                </PaginationLink>
                              </PaginationItem>
                            )
                          } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                            return <PaginationEllipsis key={pageNum} />
                          }
                          return null
                        })}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="bg-muted/50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-3">No Courses match your criteria</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters to discover more learning courses
                </p>
                <Button onClick={clearAllFilters} variant="outline">
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
