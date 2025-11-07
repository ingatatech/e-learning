"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, Award, TrendingUp, Play, Lock, Clock, User, Moon, Sun, ChevronDown, Menu, X, GraduationCapIcon, ChevronUp, ChevronLeft, ChevronRight, Share2 } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"


export default function HomePage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
const [slideDirection, setSlideDirection] = useState('');

  // Sample courses data
  const courses = [
    {
      title: "Introduction to Python Programming",
      partner: "Tech University",
      level: "Beginner",
      format: "Self-paced",
      description: "Learn the fundamentals of Python programming with hands-on projects and real-world examples.",
      duration: "4 weeks",
      price: "Free",
      image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=300&fit=crop"
    },
    {
      title: "Web Development Fundamentals",
      partner: "Code Academy",
      level: "Beginner",
      format: "Instructor-led",
      description: "Master HTML, CSS, and JavaScript to build modern, responsive websites from scratch.",
      duration: "6 weeks",
      price: "Free",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop"
    },
    {
      title: "Data Science Essentials",
      partner: "Analytics Institute",
      level: "Intermediate",
      format: "Self-paced",
      description: "Explore data analysis, visualization, and machine learning concepts with Python and R.",
      duration: "8 weeks",
      price: "Free",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop"
    },
    {
      title: "Digital Marketing Strategy",
      partner: "Marketing Pro",
      level: "Beginner",
      format: "Self-paced",
      description: "Learn effective digital marketing strategies including SEO, social media, and content marketing.",
      duration: "5 weeks",
      price: "Free",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop"
    },
    {
      title: "Mobile App Development",
      partner: "App Masters",
      level: "Intermediate",
      format: "Instructor-led",
      description: "Build native mobile applications for iOS and Android using modern development frameworks.",
      duration: "10 weeks",
      price: "Free",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop"
    },
    {
      title: "UI/UX Design Principles",
      partner: "Design School",
      level: "Beginner",
      format: "Self-paced",
      description: "Master user interface and user experience design to create intuitive digital products.",
      duration: "6 weeks",
      price: "Free",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop"
    },
    {
      title: "Cloud Computing Basics",
      partner: "Cloud Academy",
      level: "Intermediate",
      format: "Instructor-led",
      description: "Understanding cloud infrastructure, services, and deployment models with AWS and Azure.",
      duration: "7 weeks",
      price: "Free",
      image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop"
    },
    {
      title: "Cybersecurity Fundamentals",
      partner: "Security Institute",
      level: "Advanced",
      format: "Self-paced",
      description: "Learn to protect systems and networks from cyber threats with practical security techniques.",
      duration: "8 weeks",
      price: "Free",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=300&fit=crop"
    }
  ];

  const coursesPerPage = 4;
  const maxIndex = Math.max(0, courses.length - coursesPerPage);

  const handleNext = () => {
    if (currentIndex < maxIndex) {
      setSlideDirection('left');
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setSlideDirection('');
      }, 50);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setSlideDirection('right');
      setTimeout(() => {
        setCurrentIndex(prev => prev - 1);
        setSlideDirection('');
      }, 50);
    }
  };

  const getLevelColor = (level:any) => {
    switch (level) {
      case 'Beginner': return 'bg-green-500';
      case 'Intermediate': return 'bg-blue-500';
      case 'Advanced': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const visibleCourses = courses.slice(currentIndex, currentIndex + coursesPerPage);

  useEffect(() => {
    setIsVisible(true);
    
    // Add scroll event listener for header background
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDropdown = (dropdown:any) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleItemClick = (i:any) => {
    setActiveDropdown(i === activeDropdown ? null : i);
  };

  function StatCounter({ end, suffix, label }: { end: number; suffix: string; label: string }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = end / steps;
    const stepDuration = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isVisible, end]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + 'K';
    }
    return num.toString();
  };

  return (
    <div ref={ref}>
      <div className="text-4xl font-bold text-primary mb-2">
        {formatNumber(count)}{suffix}
      </div>
      <div className="text-muted-foreground">{label}</div>
    </div>
  );
} 

  return (
    <div className="min-h-screen">
      {/* Sticky Header - MOVED OUTSIDE the background container */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/95 backdrop-blur-md border-b border-border/40 shadow-sm' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded flex items-center justify-center">
                <GraduationCapIcon className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-primary">Ingata E-learning</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {/* Courses Dropdown */}
              <div className="relative group">
                <button 
                  className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
                  onClick={() => handleItemClick('courses')}
                >
                  Courses
                  {activeDropdown == 'courses' ? (
                    <ChevronUp className="w-4 h-4" />
                  ): (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {activeDropdown === 'courses' && (
                  <div 
                    className="absolute top-full left-0 mt-1 w-48 bg-background/95 backdrop-blur-md border rounded-lg shadow-lg py-2"
                  >
                    <a href="#" className="block px-4 py-2 text-sm hover:bg-accent transition-colors">All Courses</a>
                    <a href="#" className="block px-4 py-2 text-sm hover:bg-accent transition-colors">Web Development</a>
                    <a href="#" className="block px-4 py-2 text-sm hover:bg-accent transition-colors">Data Science</a>
                    <a href="#" className="block px-4 py-2 text-sm hover:bg-accent transition-colors">Design</a>
                  </div>
                )}
              </div>

              {/* Resources Dropdown */}
              <div className="relative group">
                <button 
                  className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
                  onClick={() => handleItemClick("resources")}
                >
                  Resources
                  {activeDropdown == 'resources' ? (
                    <ChevronUp className="w-4 h-4" />
                  ): (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {activeDropdown === 'resources' && (
                  <div 
                    className="absolute top-full left-0 mt-1 w-48 bg-background/95 backdrop-blur-md border rounded-lg shadow-lg py-2"
                  >
                    <a href="#" className="block px-4 py-2 text-sm hover:bg-accent transition-colors">Blog</a>
                    <a href="#" className="block px-4 py-2 text-sm hover:bg-accent transition-colors">Tutorials</a>
                    <a href="#" className="block px-4 py-2 text-sm hover:bg-accent transition-colors">Documentation</a>
                    <a href="#" className="block px-4 py-2 text-sm hover:bg-accent transition-colors">Community</a>
                  </div>
                )}
              </div>

              {/* Regular Links */}
              <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Pricing
              </a>
              <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                About
              </a>
              <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Contact
              </a>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-9 w-9 rounded-lg hover:bg-accent flex items-center justify-center transition-colors"
              >
                {theme === 'light' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>

              {/* Desktop Auth Buttons */}
              <div className="hidden md:flex items-center gap-2">
                <button onClick={() => router.push('/login')} className="px-4 py-2 text-sm font-medium rounded-lg transition-colors pointer-cursor">
                  Sign In
                </button>
                <button onClick={() => router.push('/register')} className="px-4 py-2 text-sm font-medium bg-transparent border border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded transition-colors">
                  Start Learning
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button 
                className="md:hidden h-9 w-9 flex items-center justify-center"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border/40">
              <nav className="flex flex-col gap-4">
                {/* Mobile Courses */}
                <div>
                  <button 
                    onClick={() => toggleDropdown('courses')}
                    className="flex items-center justify-between w-full text-sm font-medium py-2"
                  >
                    Courses
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'courses' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeDropdown === 'courses' && (
                    <div className="pl-4 mt-2 flex flex-col gap-2">
                      <a href="#" className="text-sm py-1 hover:text-primary">All Courses</a>
                      <a href="#" className="text-sm py-1 hover:text-primary">Web Development</a>
                      <a href="#" className="text-sm py-1 hover:text-primary">Data Science</a>
                      <a href="#" className="text-sm py-1 hover:text-primary">Design</a>
                    </div>
                  )}
                </div>

                {/* Mobile Resources */}
                <div>
                  <button 
                    onClick={() => toggleDropdown('resources')}
                    className="flex items-center justify-between w-full text-sm font-medium py-2"
                  >
                    Resources
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'resources' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeDropdown === 'resources' && (
                    <div className="pl-4 mt-2 flex flex-col gap-2">
                      <a href="#" className="text-sm py-1 hover:text-primary">Blog</a>
                      <a href="#" className="text-sm py-1 hover:text-primary">Tutorials</a>
                      <a href="#" className="text-sm py-1 hover:text-primary">Documentation</a>
                      <a href="#" className="text-sm py-1 hover:text-primary">Community</a>
                    </div>
                  )}
                </div>

                <a href="#" className="text-sm font-medium py-2">Pricing</a>
                <a href="#" className="text-sm font-medium py-2">About</a>
                <a href="#" className="text-sm font-medium py-2">Contact</a>

                {/* Mobile Auth Buttons */}
                <div className="flex flex-col gap-2 pt-4 border-t border-border/40">
                  <button className="px-4 py-2 text-sm font-medium border rounded-lg">
                    Log in
                  </button>
                  <button className="px-4 py-2 text-sm font-medium bg-transparent border-2 border-primary text-primary rounded-lg">
                    Start Learning
                  </button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Background Image Container - Header is now outside this div */}
      <div className="relative h-screen">
        {/* Blurred Background Image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/bg.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: theme === 'light' ? '' : 'brightness(0.6) opacity(0.8)',
          }}
        />
        
        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-background/40 via-background/60 to-background/80" />
        
        {/* Enhanced Hero Section - Added pt-16 to account for fixed header */}
        <section className="relative z-20 flex items-center justify-center px-4 pt-16" style={{ height: 'calc(100vh - 4rem)' }}>
          <div className="container mx-auto text-center max-w-5xl">

            {/* Main Heading with Staggered Animation */}
            <h1 
              className={`text-5xl md:text-7xl font-bold mb-6 text-balance transition-all duration-700 delay-100 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <span className="text-foreground">Master New Skills.</span>
              <br />
              <span className="text-foreground">Unlock Your </span>
              <span className="text-primary relative inline-block">
                Potential
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M0 8 Q50 2, 100 8 T200 8" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    fill="none"
                    className="text-primary"
                  />
                </svg>
              </span>
            </h1>

            {/* Subtitle with Animation */}
            <p 
              className={`text-lg md:text-xl text-foreground/80 mb-12 text-pretty max-w-3xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Join thousands of learners worldwide in an immersive educational experience. 
              Gamified courses, real-time progress tracking, and personalized learning paths 
              designed to help you succeed.
            </p>

            {/* CTA Buttons with Animation */}
            <div 
              className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <button className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Start Learning Free
              </button>
              <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold bg-background/80 backdrop-blur-sm text-foreground border-2 border-foreground/20 rounded-lg hover:border-primary/50 hover:bg-background/90 transition-all duration-300 hover:scale-105">
                Explore Courses
              </button>
            </div>

            {/* Social Proof with Animation */}
            <div 
              className={`mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-foreground/70 transition-all duration-700 delay-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div 
                      key={i} 
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/60 border-2 border-background flex items-center justify-center"
                    >
                      <User className="w-6 h-6 text-primary/30" />
                    </div>
                  ))}
                </div>
                <span className="font-medium">50,000+ Active Learners</span>
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-foreground/30" />
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                <span className="font-medium">Industry-Recognized Certificates</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="">
        {/* Features Section */}
        <section className="py-20 px-4 ">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Ingata E-learning?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Built for modern learners with cutting-edge features that make education engaging and effective.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-card text-card-foreground rounded-lg border p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Gamification</h3>
                <p className="text-muted-foreground">
                  Earn points, badges, and climb leaderboards while learning. Make education fun and competitive.
                </p>
              </div>

              <div className="bg-card text-card-foreground rounded-lg border p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Analytics</h3>
                <p className="text-muted-foreground">
                  Track your progress with detailed analytics and insights. Understand your learning patterns.
                </p>
              </div>

              <div className="bg-card text-card-foreground rounded-lg border p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Multi-tenant</h3>
                <p className="text-muted-foreground">
                  Perfect for organizations, schools, and businesses. Manage multiple learning environments.
                </p>
              </div>

              <div className="bg-card text-card-foreground rounded-lg border p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
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

        {/* Stats Section */}
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

        {/* Popular courses */}
        <section className="py-20 px-4 bg-muted dark:bg-muted/30">
          <div className="container mx-auto max-w-7xl">
            {/* Header */}
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-normal mb-2">
                Popular <span className="font-bold underline decoration-primary decoration-2 underline-offset-4">free online courses</span>
              </h2>
            </div>

            {/* Carousel Container */}
            <div className="relative">
              {/* Navigation Buttons */}
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 rounded-full bg-muted border-2 border-muted-foreground hover:text-primary hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shadow-lg transition-all hover:scale-110"
                aria-label="Previous courses"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={handleNext}
                disabled={currentIndex >= maxIndex}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 rounded-full bg-muted border-2 border-muted-foreground hover:text-primary hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shadow-lg transition-all hover:scale-110"
                aria-label="Next courses"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Courses Grid with Animation */}
              <div className="overflow-hidden">
                <div 
                  className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-500 ease-in-out ${
                    slideDirection === 'left' ? 'translate-x-8 opacity-0' : 
                    slideDirection === 'right' ? '-translate-x-8 opacity-0' : 
                    'translate-x-0 opacity-100'
                  }`}
                >
                  {visibleCourses.map((course, index) => (
                    <div
                      key={currentIndex + index}
                      className="bg-white dark:bg-accent rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-800"
                    >
                      {/* Course Image */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3">
                          <span className={`${getLevelColor(course.level)} text-white text-xs font-bold px-3 py-1 rounded`}>
                            {course.level}
                          </span>
                        </div>
                        <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-md transition-colors">
                          <Share2 className="w-4 h-4 text-gray-800" />
                        </button>
                      </div>

                      {/* Course Content */}
                      <div className="p-5">
                        {/* Partner Logo */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="text-xs text-text font-medium">
                            {course.partner}
                          </div>
                        </div>

                        {/* Course Format */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <span>Course</span>
                          <span>|</span>
                          <span>{course.format}</span>
                        </div>

                        {/* Course Title */}
                        <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-gray-300 leading-tight min-h-[3.5rem]">
                          {course.title}
                        </h3>

                        {/* Course Description */}
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3 min-h-[3.75rem]">
                          {course.description}
                        </p>

                        {/* Course Meta */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-1 text-sm text-gray-600  dark:text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">{course.duration}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm font-bold text-gray-900 dark:text-gray-300">
                            <Lock className="w-4 h-4" />
                            <span>{course.price}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* View All Button */}
            <div className="text-center mt-12">
              <button className="px-8 py-3 text-base font-semibold rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors">
                View All Free Courses
              </button>
            </div>
          </div>
        </section>

        {/* Footer  */}
        <footer className="border-t bg-muted py-12 px-4">
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
    </div>
  )
}