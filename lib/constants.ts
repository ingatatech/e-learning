import { PointAction, BadgeRarity } from "@/types"

export const POINT_VALUES: Record<PointAction, number> = {
  [PointAction.LESSON_COMPLETED]: 10,
  [PointAction.QUIZ_PASSED]: 25,
  [PointAction.COURSE_COMPLETED]: 100,
  [PointAction.STREAK_MAINTAINED]: 5,
  [PointAction.FORUM_POST]: 15,
  [PointAction.ASSIGNMENT_SUBMITTED]: 30,
}

export const BADGE_DEFINITIONS = [
  {
    id: "first-course",
    name: "First Steps",
    description: "Complete your first course",
    icon: "graduation-cap",
    rarity: BadgeRarity.COMMON,
    pointsRequired: 0,
    criteria: { type: "courses" as const, threshold: 1 },
  },
  {
    id: "streak-warrior",
    name: "Streak Warrior",
    description: "Maintain a 30-day learning streak",
    icon: "flame",
    rarity: BadgeRarity.RARE,
    pointsRequired: 0,
    criteria: { type: "streak" as const, threshold: 30 },
  },
  {
    id: "point-master",
    name: "Point Master",
    description: "Earn 10,000 points",
    icon: "star",
    rarity: BadgeRarity.EPIC,
    pointsRequired: 10000,
    criteria: { type: "points" as const, threshold: 10000 },
  },
  {
    id: "course-collector",
    name: "Course Collector",
    description: "Complete 10 courses",
    icon: "book-open",
    rarity: BadgeRarity.RARE,
    pointsRequired: 0,
    criteria: { type: "courses" as const, threshold: 10 },
  },
  {
    id: "legend",
    name: "Legend",
    description: "Reach level 50",
    icon: "crown",
    rarity: BadgeRarity.LEGENDARY,
    pointsRequired: 250000,
    criteria: { type: "points" as const, threshold: 250000 },
  },
]

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "rw", name: "Kinyarwanda", flag: "🇷🇼" },
]

export const COURSE_LEVELS = [
  { value: "beginner", label: "Beginner", color: "bg-green-100 text-green-800" },
  { value: "intermediate", label: "Intermediate", color: "bg-yellow-100 text-yellow-800" },
  { value: "advanced", label: "Advanced", color: "bg-red-100 text-red-800" },
]

export const USER_ROLES = [
  { value: "student", label: "Student", description: "Can enroll in courses and track progress" },
  { value: "instructor", label: "Instructor", description: "Can create and manage courses" },
  { value: "admin", label: "Admin", description: "Full system access and management" },
]

export const RARITY_COLORS = {
  [BadgeRarity.COMMON]: "text-gray-600",
  [BadgeRarity.RARE]: "text-blue-600",
  [BadgeRarity.EPIC]: "text-purple-600",
  [BadgeRarity.LEGENDARY]: "text-yellow-600",
}

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    VERIFY_EMAIL: "/auth/verify-email",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },
  USERS: {
    PROFILE: "/users/profile",
    UPDATE: "/users/update",
    LIST: "/users",
    DELETE: "/users",
  },
  COURSES: {
    LIST: "/courses",
    CREATE: "/courses",
    UPDATE: "/courses",
    DELETE: "/courses",
    ENROLL: "/courses/enroll",
    PROGRESS: "/courses/progress",
  },
  GAMIFICATION: {
    BADGES: "/gamification/badges",
    LEADERBOARD: "/gamification/leaderboard",
    AWARD_POINTS: "/gamification/award-points",
    ACHIEVEMENTS: "/gamification/achievements",
  },
  MESSAGES: {
    SEND_PRIVATE: "/messages/private/send",
    GET_INBOX: "/messages/inbox",
    GET_CONVERSATION: "/messages/conversation",
    MARK_READ: "/messages/mark-read",
    GET_UNREAD_COUNT: "/messages/unread-count",
  },
  COMMENTS: {
    GET_COURSE_COMMENTS: "/comments/course",
    CREATE_COMMENT: "/comments/create",
    UPDATE_COMMENT: "/comments/update",
    DELETE_COMMENT: "/comments/delete",
    REPORT_COMMENT: "/comments/report",
    GET_REPORTED_COMMENTS: "/comments/reported",
  },
  ACCESS: {
    CHECK_STATUS: "/access/status",
    REQUEST_EXTENSION: "/access/request-extension",
    EXTEND_ACCESS: "/access/extend",
    REVOKE_ACCESS: "/access/revoke",
    GET_EXTENSIONS: "/access/my-extensions",
  },
  REGISTRAR: {
    DASHBOARD: "/registrar/dashboard",
    GET_INSTRUCTORS: "/registrar/instructors",
    GET_INSTRUCTOR_MESSAGES: "/registrar/messages",
    GET_INSTRUCTOR_ACTIVITY: "/registrar/activity",
    REVIEW_COMMENT_REPORT: "/registrar/comment-reports",
  },
}
