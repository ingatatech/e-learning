"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Play, Clock, Users, Star, Share2, Heart, CheckCircle, Lock } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/layout/header"

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [currentProgress, setCurrentProgress] = useState(0)

  // Mock course data
  const course = {
    id: params.id,
    title: "Complete React Development Course",
    description: "Master React from basics to advanced concepts with hands-on projects and real-world applications",
    longDescription: `
      This comprehensive React course will take you from a complete beginner to an advanced React developer. 
      You'll learn all the core concepts, best practices, and modern techniques used in professional React development.
      
      Throughout the course, you'll build multiple projects including a todo app, weather dashboard, e-commerce site, 
      and a full-stack social media application. By the end, you'll have the skills and confidence to build any 
      React application from scratch.
    `,
    instructor: {
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=80&width=80",
      title: "Senior React Developer",
      bio: "Sarah has 8+ years of experience in frontend development and has worked with companies like Google and Netflix.",
      rating: 4.9,
      students: 15420,
      courses: 12,
    },
    thumbnail: "/react-course-hero-image.jpg",
    level: "intermediate",
    category: "Web Development",
    price: 99,
    originalPrice: 149,
    rating: 4.9,
    reviewCount: 1247,
    studentCount: 3420,
    duration: "12 weeks",
    totalHours: 24,
    lessonsCount: 45,
    projectsCount: 8,
    certificateIncluded: true,
    lastUpdated: "March 2024",
    language: "English",
    tags: ["React", "JavaScript", "Frontend", "Web Development"],
    requirements: [
      "Basic knowledge of HTML, CSS, and JavaScript",
      "Familiarity with ES6+ features",
      "A computer with internet connection",
      "Code editor (VS Code recommended)",
    ],
    whatYouWillLearn: [
      "Build modern React applications from scratch",
      "Master React Hooks and Context API",
      "Implement state management with Redux",
      "Create responsive and interactive UIs",
      "Handle API integration and data fetching",
      "Deploy React applications to production",
      "Write clean, maintainable React code",
      "Debug and optimize React applications",
    ],
    modules: [
      {
        id: "1",
        title: "Getting Started with React",
        duration: "2 hours",
        lessons: [
          { id: "1", title: "Introduction to React", duration: "15 min", isCompleted: true, isFree: true },
          { id: "2", title: "Setting up Development Environment", duration: "20 min", isCompleted: true, isFree: true },
          { id: "3", title: "Your First React Component", duration: "25 min", isCompleted: false, isFree: false },
          { id: "4", title: "JSX Fundamentals", duration: "30 min", isCompleted: false, isFree: false },
        ],
      },
      {
        id: "2",
        title: "React Components and Props",
        duration: "3 hours",
        lessons: [
          { id: "5", title: "Functional vs Class Components", duration: "20 min", isCompleted: false, isFree: false },
          { id: "6", title: "Props and PropTypes", duration: "25 min", isCompleted: false, isFree: false },
          { id: "7", title: "Component Composition", duration: "30 min", isCompleted: false, isFree: false },
          { id: "8", title: "Conditional Rendering", duration: "20 min", isCompleted: false, isFree: false },
        ],
      },
      {
        id: "3",
        title: "State Management and Hooks",
        duration: "4 hours",
        lessons: [
          { id: "9", title: "useState Hook", duration: "30 min", isCompleted: false, isFree: false },
          { id: "10", title: "useEffect Hook", duration: "35 min", isCompleted: false, isFree: false },
          { id: "11", title: "Custom Hooks", duration: "40 min", isCompleted: false, isFree: false },
          { id: "12", title: "Context API", duration: "45 min", isCompleted: false, isFree: false },
        ],
      },
    ],
  }

  const handleEnroll = () => {
    setIsEnrolled(true)
    // TODO: Implement actual enrollment logic
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">{course.category}</Badge>
                <Badge variant="outline">{course.level}</Badge>
                {course.certificateIncluded && <Badge className="bg-green-100 text-green-800">Certificate</Badge>}
              </div>
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-muted-foreground mb-6">{course.description}</p>

              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{course.rating}</span>
                  <span className="text-muted-foreground">({course.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <span>{course.studentCount.toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <span>{course.totalHours} hours</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={course.instructor.avatar || "/placeholder.svg"} />
                  <AvatarFallback>SJ</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{course.instructor.name}</p>
                  <p className="text-sm text-muted-foreground">{course.instructor.title}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enrollment Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <div className="aspect-video relative overflow-hidden rounded-t-lg">
                <img
                  src={course.thumbnail || "/placeholder.svg"}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Button size="lg" className="bg-white/90 text-black hover:bg-white">
                    <Play className="w-5 h-5 mr-2" />
                    Preview Course
                  </Button>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-primary">${course.price}</span>
                    {course.originalPrice > course.price && (
                      <span className="text-lg text-muted-foreground line-through">${course.originalPrice}</span>
                    )}
                  </div>
                  <Badge className="bg-red-100 text-red-800">
                    {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}% OFF
                  </Badge>
                </div>

                {isEnrolled ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Course Progress</span>
                      <span className="text-sm text-muted-foreground">{currentProgress}%</span>
                    </div>
                    <Progress value={currentProgress} />
                    <Button className="w-full" asChild>
                      <Link href={`/courses/${course.id}/learn`}>Continue Learning</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button className="w-full" size="lg" onClick={handleEnroll}>
                      Enroll Now
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent">
                      Add to Wishlist
                    </Button>
                  </div>
                )}

                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Duration</span>
                    <span className="font-medium">{course.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Lessons</span>
                    <span className="font-medium">{course.lessonsCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Projects</span>
                    <span className="font-medium">{course.projectsCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Certificate</span>
                    <span className="font-medium">Included</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Language</span>
                    <span className="font-medium">{course.language}</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-center gap-4">
                  <Button variant="ghost" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Heart className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Course Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="instructor">Instructor</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About This Course</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{course.longDescription}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What You'll Learn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course.whatYouWillLearn.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {course.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="curriculum">
            <Card>
              <CardHeader>
                <CardTitle>Course Curriculum</CardTitle>
                <CardDescription>
                  {course.modules.length} modules • {course.lessonsCount} lessons • {course.totalHours} hours total
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {course.modules.map((module, moduleIndex) => (
                    <AccordionItem key={module.id} value={module.id}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center justify-between w-full mr-4">
                          <span className="font-medium">
                            {moduleIndex + 1}. {module.title}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {module.lessons.length} lessons • {module.duration}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pl-4">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <div key={lesson.id} className="flex items-center justify-between p-3 rounded-lg border">
                              <div className="flex items-center gap-3">
                                {lesson.isCompleted ? (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : lesson.isFree ? (
                                  <Play className="w-5 h-5 text-primary" />
                                ) : (
                                  <Lock className="w-5 h-5 text-muted-foreground" />
                                )}
                                <div>
                                  <p className="font-medium text-sm">{lesson.title}</p>
                                  <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                                </div>
                              </div>
                              {lesson.isFree && (
                                <Button variant="ghost" size="sm">
                                  Preview
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instructor">
            <Card>
              <CardHeader>
                <CardTitle>Meet Your Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={course.instructor.avatar || "/placeholder.svg"} />
                    <AvatarFallback>SJ</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{course.instructor.name}</h3>
                    <p className="text-muted-foreground mb-4">{course.instructor.title}</p>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{course.instructor.rating}</div>
                        <div className="text-sm text-muted-foreground">Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{course.instructor.students.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Students</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{course.instructor.courses}</div>
                        <div className="text-sm text-muted-foreground">Courses</div>
                      </div>
                    </div>

                    <p className="text-muted-foreground leading-relaxed">{course.instructor.bio}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Student Reviews</CardTitle>
                <CardDescription>
                  {course.rating} average rating • {course.reviewCount} reviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Rating Summary */}
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="text-4xl font-bold">{course.rating}</div>
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground">Course Rating</div>
                    </div>

                    <div className="flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center gap-2">
                          <span className="text-sm w-8">{rating}★</span>
                          <Progress value={rating === 5 ? 80 : rating === 4 ? 15 : 3} className="flex-1" />
                          <span className="text-sm text-muted-foreground w-12">
                            {rating === 5 ? "80%" : rating === 4 ? "15%" : "3%"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Individual Reviews */}
                  <div className="space-y-6">
                    {[
                      {
                        name: "John Smith",
                        avatar: "/placeholder.svg?height=40&width=40",
                        rating: 5,
                        date: "2 weeks ago",
                        review:
                          "Excellent course! Sarah explains everything clearly and the projects are really helpful for understanding the concepts.",
                      },
                      {
                        name: "Emily Davis",
                        avatar: "/placeholder.svg?height=40&width=40",
                        rating: 5,
                        date: "1 month ago",
                        review:
                          "This course transformed my understanding of React. The hands-on approach and real-world examples made all the difference.",
                      },
                      {
                        name: "Michael Chen",
                        avatar: "/placeholder.svg?height=40&width=40",
                        rating: 4,
                        date: "2 months ago",
                        review:
                          "Great content and well-structured. Would love to see more advanced topics covered in future updates.",
                      },
                    ].map((review, index) => (
                      <div key={index} className="border-b pb-6 last:border-b-0">
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarImage src={review.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{review.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">{review.name}</span>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= review.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-muted-foreground"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-muted-foreground">{review.date}</span>
                            </div>
                            <p className="text-muted-foreground">{review.review}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
