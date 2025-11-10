"use client"

import { useState } from "react"
import { UserPlus, Search, PlayCircle, Award } from "lucide-react"

const steps = [
  {
    number: 1,
    icon: UserPlus,
    title: "Create Your Account",
    description: "Sign up in seconds and get instant access to our entire course library. No credit card required.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    number: 2,
    icon: Search,
    title: "Browse & Choose",
    description: "Explore thousands of courses across multiple categories and find the perfect match for your goals.",
    color: "from-purple-500 to-pink-500",
  },
  {
    number: 3,
    icon: PlayCircle,
    title: "Start Learning",
    description: "Dive into interactive lessons, complete assignments, and track your progress in real-time.",
    color: "from-orange-500 to-red-500",
  },
  {
    number: 4,
    icon: Award,
    title: "Earn Certificates",
    description: "Complete courses, pass assessments, and earn recognized certificates to boost your career.",
    color: "from-green-500 to-emerald-500",
  },
]

export function HowItWorksSection() {
  const [hoveredStep, setHoveredStep] = useState(null)

  return (
    <section id="how-it-works" className="py-20 px-4 bg-muted dark:bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start your learning journey in four simple steps. Join thousands of learners achieving their goals.
          </p>
        </div>

        {/* Desktop Timeline View */}
        <div className="hidden lg:block relative">
          {/* Connection Line */}
          <div className="absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-primary to-green-500 opacity-20" />

          <div className="grid grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div
                key={step.number}
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
                className="relative"
              >
                <div
                  className={`bg-white dark:bg-accent rounded-xl p-6 border border-gray-200 dark:border-gray-800 transition-all duration-300 ${
                    hoveredStep === index ? "shadow-xl -translate-y-2 border-primary" : "shadow-md"
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-4 transition-transform duration-300 ${
                      hoveredStep === index ? "scale-110" : ""
                    }`}
                  >
                    <step.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Step Number */}
                  <div className="text-center mb-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {step.number}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-center mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground text-center leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Stacked View */}
        <div className="lg:hidden space-y-6">
          {steps.map((step, index) => (
            <div key={step.number} className="relative pl-16">
              {/* Vertical Line */}
              {index !== steps.length - 1 && (
                <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 to-transparent" />
              )}

              {/* Icon Circle */}
              <div
                className={`absolute left-0 top-0 w-16 h-16 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center`}
              >
                <step.icon className="w-8 h-8 text-white" />
              </div>

              <div className="bg-white dark:bg-accent rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-md">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs">
                    {step.number}
                  </span>
                  <h3 className="text-lg font-bold">{step.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
