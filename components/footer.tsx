"use client"

import { BookOpen } from "lucide-react"
import Link from "next/link"

export function Footer() {
  const handleSmoothScroll = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <footer className="border-t bg-muted py-12 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-bold text-primary">Ingata E-learning</h3>
            </div>
            <p className="text-muted-foreground">
              Transforming education through innovative technology and gamified learning experiences.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <button onClick={() => handleSmoothScroll("courses")} className="hover:text-primary transition-colors">
                  Courses
                </button>
              </li>
              <li>
                <button onClick={() => handleSmoothScroll("partners")} className="hover:text-primary transition-colors">
                  Instructors
                </button>
              </li>
              <li>
                <button onClick={() => handleSmoothScroll("pricing")} className="hover:text-primary transition-colors">
                  Pricing
                </button>
              </li>
              <li>
                <button onClick={() => handleSmoothScroll("features")} className="hover:text-primary transition-colors">
                  Features
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/help" className="hover:text-primary transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-primary transition-colors">
                  Community
                </Link>
              </li>
              <li>
                <Link href="/status" className="hover:text-primary transition-colors">
                  Status
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-primary transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Ingata E-learning. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
