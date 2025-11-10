"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { GraduationCapIcon, Moon, Sun, Menu, X, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useState } from "react"

export default function ContactPage() {
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: "support@ingata.com",
      href: "mailto:support@ingata.com",
    },
    {
      icon: Phone,
      label: "Phone",
      value: "+1 (555) 123-4567",
      href: "tel:+15551234567",
    },
    {
      icon: MapPin,
      label: "Address",
      value: "123 Education Ave, Tech City, TC 12345",
      href: "#",
    },
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", formData)
    setFormData({ name: "", email: "", subject: "", message: "" })
  }

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
              <Link href="/about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-sm font-medium text-primary transition-colors">
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Get in Touch</h1>
            <p className="text-xl text-foreground/70">
              Have a question? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {contactInfo.map((info, idx) => (
                <a key={idx} href={info.href} className="group">
                  <Card className="p-6 text-center hover:shadow-lg transition-all">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                      <info.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{info.label}</h3>
                    <p className="text-foreground/70 group-hover:text-primary transition-colors">{info.value}</p>
                  </Card>
                </a>
              ))}
            </div>

            {/* Contact Form */}
            <Card className="p-8 md:p-12">
              <h2 className="text-2xl font-bold mb-8">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 rounded border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 rounded border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="How can we help?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-2 rounded border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Send Message</Button>
              </form>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-2xl">
            <h2 className="text-2xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                {
                  q: "What's the best way to reach support?",
                  a: "You can email us at support@ingata.com or use the contact form above. We typically respond within 24 hours.",
                },
                {
                  q: "Do you offer enterprise support?",
                  a: "Yes! Enterprise customers receive dedicated account managers and priority support. Contact our sales team for details.",
                },
                {
                  q: "Can I schedule a demo?",
                  a: "Absolutely. Please fill out the contact form and select 'Demo Request' as your subject. We'll get back to you shortly.",
                },
                {
                  q: "What are your business hours?",
                  a: "Our support team is available Monday-Friday, 9 AM - 6 PM EST. For urgent issues outside these hours, please email us.",
                },
              ].map((faq, idx) => (
                <Card key={idx} className="p-6">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-foreground/70">{faq.a}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-primary via-primary/90 to-primary/80">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Can't wait to start?</h2>
            <p className="text-lg text-white/90 mb-8">Jump right in and explore thousands of courses today.</p>
            <Button className="bg-white text-primary hover:bg-gray-100">Browse Courses</Button>
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
