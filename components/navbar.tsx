"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { GraduationCapIcon, ChevronDown, Menu, X, Sun, Moon } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSmoothScroll = (sectionId: string) => {
    // Only smooth scroll if we're on the homepage
    if (pathname === "/") {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
        setMobileMenuOpen(false)
      }
    } else {
      // If not on homepage, navigate to homepage with hash
      router.push(`/#${sectionId}`)
      setMobileMenuOpen(false)
    }
  }

  const toggleDropdown = (dropdown: any) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown)
  }

  const handleItemClick = (i: any) => {
    setActiveDropdown(i === activeDropdown ? null : i)
  }

  // Check if we're on homepage - this will automatically update on navigation
  const isHomepage = pathname === "/"

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-md border-b border-border/40 shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSmoothScroll("hero")}>
            <div className="w-8 h-8 rounded flex items-center justify-center">
              <GraduationCapIcon className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-primary" onClick={() => router.push("/")}>Ingata E-learning</h1>
          </div>

          {/* Desktop Navigation */}
          {isHomepage && (
            <nav className="hidden md:flex items-center gap-8">
              {/* Courses Dropdown */}
              <div className="relative group">
                <button
                  className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer py-2"
                  onClick={() => handleItemClick("courses")}
                >
                  Courses
                  {activeDropdown == "courses" ? (
                    <ChevronDown className="w-4 h-4 rotate-180" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {activeDropdown === "courses" && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-background/95 backdrop-blur-md border rounded shadow-lg py-2">
                    <button
                      onClick={() => router.push("/browse")}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors cursor-pointer"
                    >
                      Browse Courses
                    </button>
                    <button
                      onClick={() => handleSmoothScroll("partners")}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors cursor-pointer"
                    >
                      Learn from Partners
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleSmoothScroll("how-it-works")}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                How It Works
              </button>
              <button
                onClick={() => handleSmoothScroll("features")}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                Features
              </button>
            </nav>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9 rounded hover:bg-accent flex items-center justify-center transition-colors"
            >
              {theme === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => router.push("/login")}
                className="px-4 py-2 text-sm font-medium rounded transition-colors cursor-pointer hover:bg-muted"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push("/register")}
                className="px-4 py-2 text-sm font-medium bg-transparent border border-primary text-primary cursor-pointer hover:bg-primary hover:text-primary-foreground rounded transition-colors"
              >
                Start Learning
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden h-9 w-9 flex items-center justify-center"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/40">
            <nav className="flex flex-col gap-4">
              {/* Only show navigation links on homepage */}
              {isHomepage && (
                <>
                  {/* Mobile Courses */}
                  <div>
                    <button
                      onClick={() => toggleDropdown("courses")}
                      className="flex items-center justify-between w-full text-sm font-medium py-2"
                    >
                      Courses
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${activeDropdown === "courses" ? "rotate-180" : ""}`}
                      />
                    </button>
                    {activeDropdown === "courses" && (
                      <div className="pl-4 mt-2 flex flex-col gap-2">
                        <button
                          onClick={() => router.push("/browse")}
                          className="text-sm py-1 hover:text-primary text-left"
                        >
                          Browse Courses
                        </button>
                        <button
                          onClick={() => handleSmoothScroll("partners")}
                          className="text-sm py-1 hover:text-primary text-left"
                        >
                          Learn from Partners
                        </button>
                      </div>
                    )}
                  </div>

                  <button onClick={() => handleSmoothScroll("how-it-works")} className="text-sm font-medium py-2 text-left">
                    How It Works
                  </button>
                  <button onClick={() => handleSmoothScroll("features")} className="text-sm font-medium py-2 text-left">
                    Features
                  </button>
                </>
              )}

              {/* Mobile Auth Buttons */}
              <div className="flex flex-col gap-2 pt-4 border-t border-border/40">
                <button 
                  onClick={() => router.push("/login")}
                  className="px-4 py-2 text-sm font-medium border rounded"
                >
                  Log in
                </button>
                <button 
                  onClick={() => router.push("/register")}
                  className="px-4 py-2 text-sm font-medium bg-transparent border-2 border-primary text-primary rounded"
                >
                  Start Learning
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}