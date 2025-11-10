"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, GraduationCapIcon, Moon, Sun, Menu } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useState } from "react"

export default function PricingPage() {
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [billingCycle, setBillingCycle] = useState("monthly")

  const plans = [
    {
      name: "Starter",
      description: "Perfect for individuals just getting started",
      price: billingCycle === "monthly" ? 0 : 0,
      period: billingCycle === "monthly" ? "/month" : "/year",
      tag: "Free",
      features: [
        { included: true, text: "Access to free courses" },
        { included: true, text: "Basic progress tracking" },
        { included: true, text: "Community forums" },
        { included: false, text: "Certificate of completion" },
        { included: false, text: "Priority support" },
        { included: false, text: "Advanced analytics" },
      ],
      cta: "Get Started",
      featured: false,
    },
    {
      name: "Professional",
      description: "For learners serious about growth",
      price: billingCycle === "monthly" ? 29 : 290,
      period: billingCycle === "monthly" ? "/month" : "/year",
      tag: "Popular",
      features: [
        { included: true, text: "All Starter features" },
        { included: true, text: "Certificate of completion" },
        { included: true, text: "Priority support" },
        { included: true, text: "Advanced analytics" },
        { included: true, text: "Personalized learning path" },
        { included: false, text: "One-on-one mentorship" },
      ],
      cta: "Start Free Trial",
      featured: true,
    },
    {
      name: "Enterprise",
      description: "For organizations and teams",
      price: "Custom",
      period: "",
      tag: "Business",
      features: [
        { included: true, text: "All Professional features" },
        { included: true, text: "One-on-one mentorship" },
        { included: true, text: "Custom course creation" },
        { included: true, text: "SSO & advanced security" },
        { included: true, text: "Dedicated account manager" },
        { included: true, text: "Custom integrations" },
      ],
      cta: "Contact Sales",
      featured: false,
    },
  ]

  const handleItemClick = (i) => {
    setActiveDropdown(i === activeDropdown ? null : i)
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
              <Link href="/pricing" className="text-sm font-medium text-primary transition-colors">
                Pricing
              </Link>
              <Link href="/about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Choose Your Learning Plan</h1>
            <p className="text-xl text-foreground/70 mb-8">
              Affordable pricing options for everyone. Start free, upgrade anytime.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span
                className={`text-sm font-medium ${billingCycle === "monthly" ? "text-foreground" : "text-foreground/60"}`}
              >
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
                className="relative inline-flex h-8 w-14 items-center rounded-full bg-muted"
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                    billingCycle === "yearly" ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
              <span
                className={`text-sm font-medium ${billingCycle === "yearly" ? "text-foreground" : "text-foreground/60"}`}
              >
                Yearly
              </span>
              {billingCycle === "yearly" && <Badge className="bg-primary/10 text-primary">Save 17%</Badge>}
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                    plan.featured
                      ? "border-primary shadow-xl scale-105 bg-primary/5"
                      : "border-border bg-white dark:bg-accent"
                  }`}
                >
                  {/* Plan Header */}
                  <div className={`p-6 ${plan.featured ? "bg-gradient-to-r from-primary/20 to-primary/10" : ""}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold">{plan.name}</h3>
                      <Badge variant={plan.featured ? "default" : "secondary"}>{plan.tag}</Badge>
                    </div>
                    <p className="text-sm text-foreground/70 mb-6">{plan.description}</p>

                    {/* Price */}
                    <div className="mb-6">
                      {typeof plan.price === "number" ? (
                        <>
                          <span className="text-4xl font-bold">${plan.price}</span>
                          <span className="text-foreground/70">{plan.period}</span>
                        </>
                      ) : (
                        <span className="text-4xl font-bold">{plan.price}</span>
                      )}
                    </div>

                    <Button
                      className={`w-full ${
                        plan.featured
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-foreground/10 hover:bg-foreground/20"
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </div>

                  {/* Features */}
                  <div className="p-6 border-t border-border/40">
                    <ul className="space-y-4">
                      {plan.features.map((feature, fidx) => (
                        <li key={fidx} className="flex items-start gap-3">
                          {feature.included ? (
                            <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          ) : (
                            <X className="w-5 h-5 text-foreground/30 mt-0.5 flex-shrink-0" />
                          )}
                          <span className={feature.included ? "text-foreground" : "text-foreground/50"}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>

            <div className="space-y-4">
              {[
                {
                  q: "Can I change my plan anytime?",
                  a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
                },
                {
                  q: "Is there a free trial?",
                  a: "Yes! Our Starter plan is completely free with access to all basic courses and features.",
                },
                {
                  q: "What payment methods do you accept?",
                  a: "We accept all major credit cards, PayPal, and bank transfers for enterprise customers.",
                },
                {
                  q: "Do you offer refunds?",
                  a: "Yes, we offer a 30-day money-back guarantee for all paid plans. No questions asked.",
                },
              ].map((faq, idx) => (
                <div key={idx} className="bg-white dark:bg-accent rounded-lg border border-border p-6">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-foreground/70">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-primary via-primary/90 to-primary/80">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to start learning?</h2>
            <p className="text-lg text-white/90 mb-8">
              Join thousands of learners already transforming their careers with Ingata.
            </p>
            <Button className="bg-white text-primary hover:bg-gray-100">Get Started Free</Button>
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
