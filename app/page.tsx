"use client"

import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { CoursesSection } from "@/components/courses-section"
import { FeaturesSection } from "@/components/features-section"
import { StatsSection } from "@/components/stats-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { PartnersSection } from "@/components/partners-section"
import { CtaSection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <CoursesSection />
      <FeaturesSection />
      <StatsSection />
      <HowItWorksSection />
      <PartnersSection />
      <CtaSection />
      <Footer />
    </div>
  )
}
