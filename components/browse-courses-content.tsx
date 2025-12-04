"use client"

import { useState, useMemo } from "react"
import { ChevronDown, X, Check } from "lucide-react"
import { BrowseCourseCard } from "@/components/course/browse-course-card"

export function BrowseCoursesContent() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["All"])
  const [selectedLevels, setSelectedLevels] = useState<string[]>(["All"])
  const [expandedFilters, setExpandedFilters] = useState({
    category: true,
    level: true,
  })
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)

  const COURSES = [
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
      category: "Programming",
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
      description:
        "Create native mobile applications for iOS and Android using modern frameworks and development tools.",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&h=375&fit=crop",
      partner: "Mobile Dev Academy",
      level: "Intermediate",
      format: "Instructor-led",
      duration: "10 weeks",
      price: "Free",
      category: "Programming",
    },
  ]

  const categories = ["All", ...new Set(COURSES.map((course) => course.category))]
  const levels = ["All", "Beginner", "Intermediate", "Advanced"]
  const showMoreButton = categories.length > 6
  const visibleCategories = showMoreButton ? categories.slice(0, 5) : categories

  const filteredCourses = useMemo(() => {
    return COURSES.filter((course) => {
      const categoryMatch = selectedCategories.includes("All") || selectedCategories.includes(course.category)
      const levelMatch = selectedLevels.includes("All") || selectedLevels.includes(course.level)
      return categoryMatch && levelMatch
    })
  }, [selectedCategories, selectedLevels])

  const handleCategorySelect = (category: string) => {
    if (category === "All") {
      setSelectedCategories(["All"])
    } else {
      setSelectedCategories((prev) => {
        const newCategories = prev.filter((cat) => cat !== "All")
        if (newCategories.includes(category)) {
          return newCategories.filter((cat) => cat !== category)
        } else {
          return [...newCategories, category]
        }
      })
    }
  }

  const handleLevelSelect = (level: string) => {
    if (level === "All") {
      setSelectedLevels(["All"])
    } else {
      setSelectedLevels((prev) => {
        const newLevels = prev.filter((lvl) => lvl !== "All")
        if (newLevels.includes(level)) {
          return newLevels.filter((lvl) => lvl !== level)
        } else {
          return [...newLevels, level]
        }
      })
    }
  }

  const getLevelColor = (level: string) => {
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

  const toggleFilter = (filter: "category" | "level") => {
    setExpandedFilters((prev) => ({
      ...prev,
      [filter]: !prev[filter],
    }))
  }

  const clearAllFilters = () => {
    setSelectedCategories(["All"])
    setSelectedLevels(["All"])
  }

  const hasActiveFilters =
    selectedCategories.length > 1 ||
    selectedLevels.length > 1 ||
    selectedCategories[0] !== "All" ||
    selectedLevels[0] !== "All"

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full lg:w-64 flex-shrink-0">
        <div className="sticky top-24 space-y-6">
          {/* Category Filter */}
          <div className="bg-white dark:bg-accent rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            <button
              onClick={() => toggleFilter("category")}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted transition-colors"
            >
              <h3 className="font-bold text-lg text-foreground">Category</h3>
              <ChevronDown className={`w-5 h-5 transition-transform ${expandedFilters.category ? "rotate-180" : ""}`} />
            </button>
            {expandedFilters.category && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
                {visibleCategories.map((category) => (
                  <label key={category} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => handleCategorySelect(category)}
                      className="w-4 h-4 cursor-pointer rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {category}
                    </span>
                  </label>
                ))}
                {showMoreButton && (
                  <button
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="w-full text-left text-sm font-medium text-primary hover:text-primary/80 transition-colors pt-2"
                  >
                    + More categories
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Level Filter */}
          <div className="bg-white dark:bg-accent rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            <button
              onClick={() => toggleFilter("level")}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted transition-colors"
            >
              <h3 className="font-bold text-lg text-foreground">Level</h3>
              <ChevronDown className={`w-5 h-5 transition-transform ${expandedFilters.level ? "rotate-180" : ""}`} />
            </button>
            {expandedFilters.level && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
                {levels.map((level) => (
                  <label key={level} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedLevels.includes(level)}
                      onChange={() => handleLevelSelect(level)}
                      className="w-4 h-4 cursor-pointer rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {level}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="px-6 py-4 bg-muted rounded-lg">
            <p className="text-sm font-medium text-foreground">
              {filteredCourses.length} {filteredCourses.length === 1 ? "course" : "courses"} found
              {hasActiveFilters && (
                <span className="block text-xs text-muted-foreground mt-1">
                  {selectedCategories[0] !== "All" &&
                    `${selectedCategories.length} categor${selectedCategories.length === 1 ? "y" : "ies"}`}
                  {selectedCategories[0] !== "All" && selectedLevels[0] !== "All" && " • "}
                  {selectedLevels[0] !== "All" &&
                    `${selectedLevels.length} level${selectedLevels.length === 1 ? "" : "s"}`}
                </span>
              )}
            </p>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="w-full px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary/20"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">
            <span className="underline decoration-primary decoration-2 underline-offset-8">Browse</span> Courses
          </h1>
          <p className="text-muted-foreground text-lg">
            Explore our curated collection of {filteredCourses.length} courses
          </p>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mb-6 flex flex-wrap gap-2">
            {selectedCategories[0] !== "All" &&
              selectedCategories.map((category) => (
                <span
                  key={category}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                >
                  {category}
                  <button
                    onClick={() => handleCategorySelect(category)}
                    className="hover:text-primary/70 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            {selectedLevels[0] !== "All" &&
              selectedLevels.map((level) => (
                <span
                  key={level}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-sm font-medium"
                >
                  {level}
                  <button onClick={() => handleLevelSelect(level)} className="hover:text-blue-500 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
          </div>
        )}

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <BrowseCourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                image={course.image}
                partner={course.partner}
                level={course.level}
                language={course.language}
                duration={course.duration}
                price={course.price}
                category={course.category}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg mb-4">No courses found matching your filters.</p>
            <button onClick={clearAllFilters} className="px-6 py-2 text-sm font-medium text-primary hover:underline">
              Clear filters
            </button>
          </div>
        )}
      </main>

      {/* Categories Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-accent rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-300">Select Categories</h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
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
                        : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span className="font-medium">{category}</span>
                    {selectedCategories.includes(category) && <Check className="w-5 h-5" />}
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
                onClick={() => setIsCategoryModalOpen(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary rounded hover:bg-primary/90 transition-colors"
              >
                Apply ({selectedCategories.filter((cat) => cat !== "All").length} selected)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
