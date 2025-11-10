"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { GraduationCapIcon, Moon, Sun, Menu, X, Users, Target, Award } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useState } from "react"

export default function AboutPage() {
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const team = [
    {
      name: "Sarah Chen",
      role: "Founder & CEO",
      bio: "EdTech pioneer with 15+ years in education technology",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    },
    {
      name: "Marcus Johnson",
      role: "VP of Product",
      bio: "Former product lead at major e-learning platforms",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    },
    {
      name: "Elena Rodriguez",
      role: "Head of Curriculum",
      bio: "Expert in pedagogical design and interactive learning",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    },
    {
      name: "David Park",
      role: "CTO",
      bio: "Blockchain and AI specialist building the future of education",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    },
  ]

  const values = [
    {
      icon: Users,
      title: "Accessibility",
      description: "Education should be available to everyone, regardless of background or location.",
    },
    {
      icon: Target,
      title: "Engagement",
      description: "We make learning fun through gamification and interactive experiences.",
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We partner with top institutions to deliver world-class content and instruction.",
    },
  ]

  useState(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-background/95 backdrop-blur-md border-b border-border/40 shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded flex items-center justify-center">
                <GraduationCapIcon className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-primary">Ingata E-learning</h1>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Pricing
              </Link>
              <Link href="/about" className="text-sm font-medium text-primary transition-colors">
                About
              </Link>
              <Link
                href="/contact"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Contact
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-9 w-9 rounded hover:bg-accent flex items-center justify-center transition-colors"
              >
                {theme === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              <div className="hidden md:flex items-center gap-2">
                <button className="px-4 py-2 text-sm font-medium rounded transition-colors cursor-pointer hover:bg-muted">
                  Sign In
                </button>
                <button className="px-4 py-2 text-sm font-medium bg-transparent border border-primary text-primary cursor-pointer hover:bg-primary hover:text-primary-foreground rounded transition-colors">
                  Start Learning
                </button>
              </div>

              <button
                className="md:hidden h-9 w-9 flex items-center justify-center"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border/40">
              <nav className="flex flex-col gap-4">
                <Link href="/" className="text-sm font-medium py-2">
                  Home
                </Link>
                <Link href="/pricing" className="text-sm font-medium py-2">
                  Pricing
                </Link>
                <Link href="/about" className="text-sm font-medium py-2">
                  About
                </Link>
                <Link href="/contact" className="text-sm font-medium py-2">
                  Contact
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      <div className="pt-16">
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About Ingata E-learning</h1>
            <p className="text-xl text-foreground/70">
              Transforming education through innovative technology and gamified learning experiences.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-3xl">
            <Card className="p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-foreground/70 leading-relaxed mb-4">
                At Ingata, we believe that quality education should be accessible to everyone, everywhere. Our mission
                is to democratize learning through innovative technology and engaging course content that empowers
                individuals to achieve their career goals.
              </p>
              <p className="text-lg text-foreground/70 leading-relaxed">
                We combine gamification, interactive content, and advanced analytics to create an education experience
                that's not just effective, but genuinely enjoyable.
              </p>
            </Card>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12">Our Core Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {values.map((value, idx) => (
                <Card key={idx} className="p-8 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                  <p className="text-foreground/70">{value.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">50K+</div>
                <div className="text-foreground/70">Active Learners</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <div className="text-foreground/70">Courses Available</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">95%</div>
                <div className="text-foreground/70">Completion Rate</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">150+</div>
                <div className="text-foreground/70">Partner Institutions</div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, idx) => (
                <Card key={idx} className="overflow-hidden">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold mb-1">{member.name}</h3>
                    <p className="text-sm text-primary font-medium mb-2">{member.role}</p>
                    <p className="text-sm text-foreground/70">{member.bio}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-primary via-primary/90 to-primary/80">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Join the Learning Revolution</h2>
            <p className="text-lg text-white/90 mb-8">
              Be part of a global community transforming how people learn and grow.
            </p>
            <Button className="bg-white text-primary hover:bg-gray-100">Start Your Journey</Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t bg-muted py-12 px-4">
          <div className="container mx-auto text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Ingata E-learning. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
