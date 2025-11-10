"use client"

import { useState, useEffect } from "react"
import { Clock, Lock, Filter, ChevronLeft, ChevronRight, Share2, X, Check } from "lucide-react"
import { useRouter } from "next/navigation"

const courses = [
  {
    id: 1,
    title: "Introduction to Python Programming",
    description:
      "Learn the basics of Python programming from scratch. Perfect for beginners who want to start their coding journey.",
    image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=500&h=375&fit=crop",
    partner: "Tech University",
    level: "Beginner",
    format: "Self-paced",
    duration: "6 weeks",
    price: "Free",
    category: "Programming",
  },
  {
    id: 2,
    title: "Digital Marketing Fundamentals",
    description:
      "Master the essentials of digital marketing including SEO, social media, and content marketing strategies.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=375&fit=crop",
    partner: "Marketing Academy",
    level: "Beginner",
    format: "Instructor-led",
    duration: "4 weeks",
    price: "Free",
    category: "Marketing",
  },
  {
    id: 3,
    title: "Data Science with R",
    description:
      "Explore data analysis and visualization techniques using R programming language and statistical methods.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=375&fit=crop",
    partner: "Data Institute",
    level: "Intermediate",
    format: "Self-paced",
    duration: "8 weeks",
    price: "Free",
    category: "Data Science",
  },
  {
    id: 4,
    title: "Web Development Bootcamp",
    description: "Build modern websites with HTML, CSS, and JavaScript. Learn responsive design and best practices.",
    image: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=500&h=375&fit=crop",
    partner: "Code Academy",
    level: "Beginner",
    format: "Instructor-led",
    duration: "10 weeks",
    price: "Free",
    category: "Web Development",
  },
  {
    id: 5,
    title: "Machine Learning Basics",
    description:
      "Introduction to machine learning algorithms, models, and practical applications in real-world scenarios.",
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=500&h=375&fit=crop",
    partner: "AI Learning Hub",
    level: "Advanced",
    format: "Self-paced",
    duration: "12 weeks",
    price: "Free",
    category: "Data Science",
  },
  {
    id: 6,
    title: "Graphic Design Essentials",
    description:
      "Learn design principles, color theory, and typography. Create stunning visuals using industry-standard tools.",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=375&fit=crop",
    partner: "Design School",
    level: "Beginner",
    format: "Instructor-led",
    duration: "6 weeks",
    price: "Free",
    category: "Design",
  },
  {
    id: 7,
    title: "Business Strategy & Management",
    description:
      "Develop strategic thinking skills and learn how to manage teams effectively in a business environment.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&h=375&fit=crop",
    partner: "Business School",
    level: "Intermediate",
    format: "Self-paced",
    duration: "7 weeks",
    price: "Free",
    category: "Business",
  },
  {
    id: 8,
    title: "Mobile App Development",
    description: "Create native mobile applications for iOS and Android using modern frameworks and development tools.",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&h=375&fit=crop",
    partner: "Mobile Dev Academy",
    level: "Intermediate",
    format: "Instructor-led",
    duration: "10 weeks",
    price: "Free",
    category: "Programming",
  },
]

export function CoursesSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [slideDirection, setSlideDirection] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["All"])
  const [selectedLevel, setSelectedLevel] = useState("All")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const coursesPerPage = 4
  const router = useRouter()
  

  const maxIndex = Math.max(0, courses.length - coursesPerPage)
  const categories = ["All", ...new Set(courses.map((course) => course.category))]
  const showMoreButton = categories.length > 6
  const visibleCategories = showMoreButton ? categories.slice(0, 5) : categories

  const filteredCourses = courses.filter((course) => {
    const categoryMatch = selectedCategories.includes("All") || selectedCategories.includes(course.category)
    const levelMatch = selectedLevel === "All" || course.level === selectedLevel
    return categoryMatch && levelMatch
  })
  const visibleCourses = filteredCourses.slice(currentIndex, currentIndex + coursesPerPage)

  useEffect(() => {
    setCurrentIndex(0)
  }, [selectedCategories, selectedLevel])

  useEffect(() => {
    if (slideDirection) {
      const timer = setTimeout(() => setSlideDirection(""), 100)
      return () => clearTimeout(timer)
    }
  }, [slideDirection])

  const handleNext = () => {
    if (currentIndex < maxIndex) {
      setSlideDirection("left")
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1)
        setSlideDirection("")
      }, 50)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setSlideDirection("right")
      setTimeout(() => {
        setCurrentIndex((prev) => prev - 1)
        setSlideDirection("")
      }, 50)
    }
  }

  const handleCategorySelect = (category: string) => {
    if (category === "All") {
      setSelectedCategories(["All"])
    } else {
      setSelectedCategories(prev => {
        const newCategories = prev.filter(cat => cat !== "All")
        if (newCategories.includes(category)) {
          return newCategories.filter(cat => cat !== category)
        } else {
          return [...newCategories, category]
        }
      })
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
  }

  const handleApplyCategories = () => {
    setIsModalOpen(false)
  }

  const getLevelColor = (level: any) => {
    switch (level) {
      case "Beginner":
        return "bg-green-500"
      case "Intermediate":
        return "bg-blue-500"
      case "Advanced":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <section id="courses" className="py-20 px-4 bg-muted dark:bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl mb-2 font-bold">
            <span className="font-normal underline decoration-primary decoration-2 underline-offset-8">Popular</span>{" "}
            online courses
          </h2>
        </div>

        {/* Filters Section */}
        <div className="mb-8">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="md:hidden flex items-center gap-2 px-4 py-2 rounded bg-white dark:bg-accent border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors mb-4"
          >
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filters</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {selectedCategories.length > 1 || selectedLevel !== "All" ? "●" : ""}
            </span>
          </button>

          {/* Filter Options */}
          <div className={`${isFilterOpen ? "block" : "hidden"} md:block space-y-4`}>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Category</label>
              <div className="flex flex-wrap gap-2">
                {visibleCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className={`px-4 py-2 rounded text-sm font-medium transition-all duration-300 ${
                      selectedCategories.includes(category)
                        ? "bg-primary text-white shadow-md scale-105"
                        : "bg-white dark:bg-accent text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-sm"
                    }`}
                  >
                    {category}
                  </button>
                ))}
                {showMoreButton && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 rounded text-sm font-medium bg-white dark:bg-accent text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-sm transition-all duration-300"
                  >
                    More +
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredCourses.length} {filteredCourses.length === 1 ? "course" : "courses"}
            {selectedCategories.length > 1 && ` in ${selectedCategories.length} categories`}
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 rounded-full bg-muted border-2 border-muted-foreground hover:text-primary hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shadow-lg transition-all hover:scale-110"
            aria-label="Previous courses"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex >= maxIndex}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 rounded-full bg-muted border-2 border-muted-foreground hover:text-primary hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shadow-lg transition-all hover:scale-110"
            aria-label="Next courses"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Courses Grid */}
          <div className="overflow-hidden">
            {filteredCourses.length > 0 ? (
              <div
                className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-500 ease-in-out ${
                  slideDirection === "left"
                    ? "translate-x-8 opacity-0"
                    : slideDirection === "right"
                      ? "-translate-x-8 opacity-0"
                      : "translate-x-0 opacity-100"
                }`}
              >
                {visibleCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white dark:bg-accent rounded overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-800"
                  >
                    {/* Course Image */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={course.image || "/placeholder.svg"}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span
                          className={`${getLevelColor(course.level)} text-white text-xs font-bold px-3 py-1 rounded`}
                        >
                          {course.level}
                        </span>
                      </div>
                      <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-md transition-colors">
                        <Share2 className="w-4 h-4 text-gray-800" />
                      </button>
                    </div>

                    {/* Course Content */}
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="text-xs text-text font-medium">{course.partner}</div>
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
                        <span>{course.format}</span>
                      </div>

                      <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-gray-300 leading-tight min-h-[3.5rem]">
                        {course.title}
                      </h3>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3 min-h-[3.75rem]">
                        {course.description}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm font-bold text-gray-900 dark:text-gray-300">
                          <Lock className="w-4 h-4" />
                          <span>{course.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No courses found matching your filters.</p>
                <button
                  onClick={() => {
                    setSelectedCategories(["All"])
                    setSelectedLevel("All")
                  }}
                  className="mt-4 px-6 py-2 text-sm font-medium text-primary hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button 
          onClick={() => router.push("/browse")}
          className="px-8 py-3 text-base font-semibold rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors">
            View All Free Courses
          </button>
        </div>
      </div>

      {/* Categories Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-accent rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-300">Select Categories</h3>
              <button
                onClick={handleModalClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className={`w-full flex items-center justify-between p-3 rounded text-left transition-all duration-200 ${
                      selectedCategories.includes(category)
                        ? "bg-primary text-white"
                        : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span className="font-medium">{category}</span>
                    {selectedCategories.includes(category) && (
                      <Check className="w-5 h-5" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setSelectedCategories(["All"])}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={handleApplyCategories}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary rounded hover:bg-primary/90 transition-colors"
              >
                Apply ({selectedCategories.filter(cat => cat !== "All").length} selected)
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}