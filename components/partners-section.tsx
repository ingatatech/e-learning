"use client"

import { useState } from "react"
import { Star, ChevronRight, ArrowRight } from "lucide-react"

const partners = [
  {
    name: "Tech University",
    role: "Technology & Programming",
    image: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400&h=400&fit=crop",
    courses: 45,
    rating: 4.9,
    students: "12K+",
    bio: "Leading institution in computer science and software engineering education.",
  },
  {
    name: "Design Academy",
    role: "Creative & Design",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    courses: 38,
    rating: 4.8,
    students: "8K+",
    bio: "Award-winning design school specializing in UI/UX and graphic design.",
  },
  {
    name: "Business Institute",
    role: "Business & Management",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop",
    courses: 52,
    rating: 4.9,
    students: "15K+",
    bio: "Top-ranked business school with expert faculty and industry connections.",
  },
  {
    name: "Data Science Hub",
    role: "Data & Analytics",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop",
    courses: 41,
    rating: 4.7,
    students: "10K+",
    bio: "Premier institute for data science, machine learning, and AI education.",
  },
]

export function PartnersSection() {
  const [hoveredPartner, setHoveredPartner] = useState(null)

  return (
    <section id="partners" className="py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Learn from the{" "}
            <span className="underline decoration-primary decoration-2 underline-offset-4">Best Institutions</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Partner with world-class universities and industry-leading organizations offering expert instruction.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {partners.map((partner, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredPartner(index)}
              onMouseLeave={() => setHoveredPartner(null)}
              className={`bg-white dark:bg-accent rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 transition-all duration-300 ${
                hoveredPartner === index ? "shadow-xl -translate-y-2 border-primary" : "shadow-md"
              }`}
            >
              {/* Partner Image */}
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={partner.image || "/placeholder.svg"}
                  alt={partner.name}
                  className={`w-full h-full object-cover transition-transform duration-500 ${
                    hoveredPartner === index ? "scale-110" : "scale-100"
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Rating Badge */}
                <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-bold text-gray-900">{partner.rating}</span>
                </div>
              </div>

              {/* Partner Info */}
              <div className="p-5">
                <h3 className="text-lg font-bold mb-1">{partner.name}</h3>
                <p className="text-sm text-primary font-medium mb-3">{partner.role}</p>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{partner.bio}</p>

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{partner.courses}</div>
                    <div className="text-xs text-muted-foreground">Courses</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{partner.students}</div>
                    <div className="text-xs text-muted-foreground">Students</div>
                  </div>
                  <button className="text-primary hover:text-primary/80 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Partners Button */}
        <div className="text-center mt-12">
          <button className="px-8 py-3 text-base font-semibold rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors inline-flex items-center gap-2">
            View All Partners
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
