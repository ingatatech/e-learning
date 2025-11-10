"use client"

import { ArrowRight, Search, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export function CtaSection() {
  const router = useRouter()
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80" />

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />

      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="text-center">
          {/* Heading */}
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to Transform Your Future?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of learners already advancing their careers. Start learning today with our free courses and
            unlock your potential.
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {["Free courses available", "Learn at your own pace", "Expert instructors", "Recognized certificates"].map(
              (benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">{benefit}</span>
                </div>
              ),
            )}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
            onClick={() => router.push('/register')}
            className="px-8 py-4 text-lg font-semibold rounded-full bg-white text-primary hover:bg-gray-100 transition-all hover:scale-105 shadow-xl inline-flex items-center gap-2">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
            onClick={() => router.push('/browse')}
            className="px-8 py-4 text-lg font-semibold rounded-full border-2 border-white text-white hover:bg-white/10 transition-colors inline-flex items-center gap-2">
              Browse Courses
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
