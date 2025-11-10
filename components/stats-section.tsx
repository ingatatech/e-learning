"use client"

import { useEffect, useRef, useState } from "react"

function StatCounter({ end, suffix, label }: { end: number; suffix: string; label: string }) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const duration = 2000
    const steps = 60
    const increment = end / steps
    const stepDuration = duration / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [isVisible, end])

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + "K"
    }
    return num.toString()
  }

  return (
    <div ref={ref}>
      <div className="text-4xl font-bold text-primary mb-2">
        {formatNumber(count)}
        {suffix}
      </div>
      <div className="text-muted-foreground">{label}</div>
    </div>
  )
}

export function StatsSection() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <StatCounter end={10000} suffix="+" label="Active Learners" />
          <StatCounter end={500} suffix="+" label="Courses Available" />
          <StatCounter end={50} suffix="+" label="Expert Instructors" />
          <StatCounter end={95} suffix="%" label="Completion Rate" />
        </div>
      </div>
    </section>
  )
}
