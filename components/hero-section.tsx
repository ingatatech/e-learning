"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Play, Award, User } from "lucide-react"
import { useRouter } from "next/navigation"

export function HeroSection() {
  const router = useRouter()
  const { theme } = useTheme()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section id="hero" className="relative h-screen">
      {/* Blurred Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: theme === "light" ? "" : "brightness(0.6) opacity(0.8)",
        }}
      />

      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-background/40 via-background/60 to-background/80" />

      {/* Content */}
      <div
        className="relative z-20 flex items-center justify-center px-4 pt-16"
        style={{ height: "calc(100vh - 4rem)" }}
      >
        <div className="container mx-auto text-center max-w-5xl">
          {/* Main Heading */}
          <h1
            className={`text-4xl md:text-6xl font-bold mb-6 text-balance transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <span className="text-neutral-800 dark:text-neutral-200">Master New Skills.</span>
            <br />
            <span className="text-neutral-800 dark:text-neutral-200">Unlock Your </span>
            <span className="text-primary relative inline-block">
              Potential
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M0 8 Q50 2, 100 8 T200 8"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  className="text-primary"
                />
              </svg>
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className={`text-md md:text-xl text-foreground/80 mb-12 text-pretty max-w-3xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Join thousands of learners worldwide in an immersive educational experience. Gamified courses, real-time
            progress tracking, and personalized learning paths designed to help you succeed.
          </p>

          {/* CTA Buttons */}
          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-500 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <button 
              onClick={() => router.push("/register")} 
              className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Start Learning Free
            </button>
            <button
              onClick={() => router.push("/browse")}
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold bg-background/80 backdrop-blur-sm text-foreground border-2 border-foreground/20 rounded hover:border-primary/50 hover:bg-background/90 transition-all duration-300 hover:scale-105"
            >
              Explore Courses
            </button>
          </div>

          {/* Social Proof */}
          <div
            className={`mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-foreground/70 transition-all duration-700 delay-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/60 border-2 border-background flex items-center justify-center"
                  >
                    <User className="w-6 h-6 text-primary/30" />
                  </div>
                ))}
              </div>
              <span className="font-medium">50,000+ Active Learners</span>
            </div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-foreground/30" />
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              <span className="font-medium">Industry-Recognized Certificates</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
