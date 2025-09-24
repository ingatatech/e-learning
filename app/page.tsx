import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, Award, TrendingUp, Play, Star, Clock, User } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-primary">Ingata E-learning</h1>
            </div>
            <nav className="hidden md:flex items-center gap-6 sticky top-0">
              <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">
                Contact
              </Link>
            </nav>
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            Now with AI-Powered Learning
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            Transform Your Learning Journey with <span className="text-primary">Ingata E-learning</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Experience the future of education with our comprehensive Learning Management System. Gamified learning,
            real-time analytics, and multi-language support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/register">
                <Play className="w-5 h-5 mr-2" />
                Start Learning Today
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent" asChild>
              <Link href="/demo">Watch Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Ingata E-learning?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built for modern learners with cutting-edge features that make education engaging and effective.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Gamification</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Earn points, badges, and climb leaderboards while learning. Make education fun and competitive.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Track your progress with detailed analytics and insights. Understand your learning patterns.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Multi-tenant</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Perfect for organizations, schools, and businesses. Manage multiple learning environments.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Interactive Content</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Rich multimedia content, quizzes, assignments, and real-time collaboration tools.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10K+</div>
              <div className="text-muted-foreground">Active Learners</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Courses Available</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">Expert Instructors</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">95%</div>
              <div className="text-muted-foreground">Completion Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Courses</h2>
            <p className="text-xl text-muted-foreground">Discover our most popular and highly-rated courses</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Full Stack Web Development",
                instructor: "Sarah Johnson",
                rating: 4.9,
                students: 1234,
                duration: "12 weeks",
                level: "Intermediate",
                price: "$99",
              },
              {
                title: "Data Science with Python",
                instructor: "Dr. Michael Chen",
                rating: 4.8,
                students: 987,
                duration: "10 weeks",
                level: "Beginner",
                price: "$79",
              },
              {
                title: "UI/UX Design Masterclass",
                instructor: "Emma Wilson",
                rating: 4.9,
                students: 756,
                duration: "8 weeks",
                level: "Advanced",
                price: "$129",
              },
            ].map((course, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Play className="w-12 h-12 text-primary" />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{course.level}</Badge>
                    <div className="text-lg font-bold text-primary">{course.price}</div>
                  </div>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <User className="w-4 h-4" />
                    {course.instructor}
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {course.rating} ({course.students})
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {course.duration}
                    </div>
                  </div>
                  <Button className="w-full" asChild>
                    <Link href={`/courses/${index + 1}`}>Enroll Now</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Card className="max-w-2xl mx-auto bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-3xl mb-4">Ready to Start Your Learning Journey?</CardTitle>
              <CardDescription className="text-primary-foreground/80 text-lg">
                Join thousands of learners who are already transforming their careers with Ingata E-learning.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/register">Get Started Free</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
                  asChild
                >
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
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
                  <Link href="/courses" className="hover:text-primary transition-colors">
                    Courses
                  </Link>
                </li>
                <li>
                  <Link href="/instructors" className="hover:text-primary transition-colors">
                    Instructors
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-primary transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/features" className="hover:text-primary transition-colors">
                    Features
                  </Link>
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
            <p>&copy; 2024 Ingata E-learning. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
