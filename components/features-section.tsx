"use client"

import { Award, TrendingUp, Users, BookOpen } from "lucide-react"

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Ingata E-learning?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built for modern learners with cutting-edge features that make education engaging and effective.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card text-card-foreground rounded border p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center mx-auto mb-4">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Gamification</h3>
            <p className="text-muted-foreground">
              Earn points, badges, and climb leaderboards while learning. Make education fun and competitive.
            </p>
          </div>

          <div className="bg-card text-card-foreground rounded border p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Analytics</h3>
            <p className="text-muted-foreground">
              Track your progress with detailed analytics and insights. Understand your learning patterns.
            </p>
          </div>

          <div className="bg-card text-card-foreground rounded border p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Multi-tenant</h3>
            <p className="text-muted-foreground">
              Perfect for organizations, schools, and businesses. Manage multiple learning environments.
            </p>
          </div>

          <div className="bg-card text-card-foreground rounded border p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Interactive Content</h3>
            <p className="text-muted-foreground">
              Rich multimedia content, quizzes, assignments, and real-time collaboration tools.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
