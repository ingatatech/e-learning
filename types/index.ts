export enum UserRole {
  ADMIN = "admin",
  INSTRUCTOR = "instructor",
  STUDENT = "student",
  SYSADMIN = "sysAdmin",
}

export enum CourseLevel {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
}

export enum BadgeRarity {
  COMMON = "common",
  RARE = "rare",
  EPIC = "epic",
  LEGENDARY = "legendary",
}

export enum PointAction {
  LESSON_COMPLETED = "lesson_completed",
  QUIZ_PASSED = "quiz_passed",
  COURSE_COMPLETED = "course_completed",
  STREAK_MAINTAINED = "streak_maintained",
  FORUM_POST = "forum_post",
  ASSIGNMENT_SUBMITTED = "assignment_submitted",
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  profilePicUrl?: string
  profilePicture?: string
  role: UserRole
  isEmailVerified: boolean
  isActive: boolean
  preferredLanguage: string
  theme: string
  totalPoints: number
  level: number
  streakDays: number
  organizationId?: string
  organization?: Organization
  enrollments?: Enrollment[]
  badges?: UserBadge[]
  createdAt: Date
  updatedAt: Date
  rating: number
  bio?: string
  firstLogin?: boolean
  twostepv?: boolean
  signUrl?: string
  signature?: string
}

export interface Organization {
  id: string
  name: string
  tin?: string
  address?: string
  contactInfo?: Record<string, any>
  users?: User[]
  courses?: Course[]
  createdAt: Date
  updatedAt: Date
  website?: string
  phoneNumber?: string
  description?: string
  stampUrl?: string
  director?: User
}

export interface Course {
  id: string
  title: string
  description: string
  thumbnail?: string
  level: CourseLevel
  price: number
  isPublished: boolean
  duration: number
  durationInHours?: number
  enrollmentCount: number
  rating: number
  tags: string[]
  instructorId: string
  instructor?: User
  organizationId?: string
  organization?: Organization
  modules?: Module[]
  enrollments?: Enrollment[]
  createdAt: Date
  updatedAt: Date
  category: Category
  originalPrice: number
  reviewCount: number
  studentCount: number
  lessonsCount: number
  isPopular: boolean
  lastUpdated: string
  instructorprofilePicUrl?: string
  certificateIncluded: boolean
  totalHours: number
  projectsCount: number
  language: string
  about: string
  whatYouWillLearn: string[]
  requirements: string[]
}

export interface Module {
  id: string
  title: string
  description: string
  order: number
  duration: number
  courseId: string
  course?: Course
  lessons?: Lesson[]
  createdAt: Date
  updatedAt: Date
}

export interface Lesson {
  id: string
  title: string
  content: string
  videoUrl?: string
  imageFiles?: File[] | null
  imageUrl?: string
  duration: number
  order: number
  moduleId: string
  module?: Module
  assessments?: Assessment[]
  progress?: Progress[]
  createdAt: Date
  updatedAt: Date
  isCompleted?: boolean
  isFree?: boolean
  isExercise: boolean
  isProject: boolean
  resources?: Array<{
    url: string
    title: string
    description?: string
  }>
}

export interface Assessment {
  id: string
  title: string
  description: string
  type: "quiz" | "assignment" | "project"
  questions: AssessmentQuestion[]
  passingScore: number
  timeLimit?: number
  lessonId?: string
  lesson?: Lesson
  courseId?: string
  course?: Course
  createdAt: Date
  updatedAt: Date
}

export interface AssessmentQuestion {
  id: string
  question: string
  type: "multiple_choice" | "true_false" | "short_answer" | "essay"
  options?: string[]
  correctAnswer: string | string[]
  points: number
}

export interface Answer {
  id: string
  question: AssessmentQuestion
  questionId: string
  assessment: Assessment
  user: User
  answer: string | string[]
  isCorrect: boolean
  pointsEarned: number
  createdAt: string
}

export interface Enrollment {
  id: string
  studentId: string
  student?: User
  courseId: string
  course?: Course
  enrolledAt: Date
  completedAt?: Date
  accessExpiresAt?: Date
  progress: number
  isCompleted: boolean
  certificateId?: string
  certificate?: Certificate
}

export interface Category {
  id: string
  name: string
  description: string
  courses: Course[]
  createdAt: Date
  updatedAt: Date
}

export interface Progress {
  id: string
  userId: string
  user?: User
  lessonId: string
  lesson?: Lesson
  isCompleted: boolean
  timeSpent: number
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  rarity: BadgeRarity
  pointsRequired: number
  criteria: BadgeCriteria
  createdAt: Date
}

export interface BadgeCriteria {
  type: "points" | "courses" | "streak" | "activity"
  threshold: number
  timeframe?: "daily" | "weekly" | "monthly" | "all-time"
  specific?: string[]
}

export interface UserBadge {
  id: string
  userId: string
  user?: User
  badgeId: string
  badge?: Badge
  earnedAt: Date
  isNew: boolean
}

export interface Achievement {
  id: string
  userId: string
  user?: User
  type: string
  title: string
  description: string
  points: number
  earnedAt: Date
}

export interface Payment {
  id: string
  userId: string
  user?: User
  courseId: string
  course?: Course
  amount: number
  currency: string
  status: "pending" | "completed" | "failed" | "refunded"
  paymentMethod: "stripe" | "paypal" | "razorpay"
  transactionId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Certificate {
  id: string
  userId: string
  user?: User
  courseId: string
  course?: Course
  certificateUrl: string
  issuedAt: Date
  verificationCode?: string
}

export interface Document {
  id: string
  title: string
  content: string
  instructorId: string
  instructor?: User
  status: "draft" | "submitted" | "approved" | "rejected"
  submittedAt?: Date
  reviewedAt?: Date
  reviewedBy?: string
  reviewNotes?: string
  createdAt: Date
  updatedAt: Date
  lastEditedAt: Date | string
  fileUrl?: string
  fileType?: string
}

export interface Notification {
  id: string
  userId: string
  user?: User
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  isRead: boolean
  createdAt: Date
}

export interface LeaderboardEntry {
  rank: number
  user: User
  points: number
  badge: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
