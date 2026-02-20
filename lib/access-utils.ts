import type { Enrollment } from "@/types"

/**
 * Check if access is about to expire (within 7 days)
 */
export function isAccessExpiringSoon(enrollment: Enrollment): boolean {
  if (!enrollment.accessExpiresAt) return false

  const now = new Date()
  const expiryDate = new Date(enrollment.accessExpiresAt)
  const daysUntilExpiry = (expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)

  return daysUntilExpiry >= 0 && daysUntilExpiry <= 7
}

/**
 * Check if access has expired
 */
export function hasAccessExpired(enrollment: Enrollment): boolean {
  if (!enrollment.accessExpiresAt) return false

  const now = new Date()
  const expiryDate = new Date(enrollment.accessExpiresAt)

  return expiryDate < now
}

/**
 * Check if student has hit the 1-year limit
 */
export function hasHitAccessLimit(enrollment: Enrollment): boolean {
  return enrollment.totalAccessDays >= 365 || enrollment.isAccessRevoked
}

/**
 * Calculate remaining days of access budget
 */
export function getRemainingAccessDays(enrollment: Enrollment): number {
  return Math.max(0, 365 - enrollment.totalAccessDays)
}

/**
 * Calculate days until expiry
 */
export function getDaysUntilExpiry(enrollment: Enrollment): number {
  if (!enrollment.accessExpiresAt) return 0

  const now = new Date()
  const expiryDate = new Date(enrollment.accessExpiresAt)
  const daysRemaining = (expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)

  return Math.ceil(Math.max(0, daysRemaining))
}

/**
 * Get access status with human-readable message
 */
export function getAccessStatus(enrollment: Enrollment): {
  status: "active" | "expiring_soon" | "expired" | "revoked"
  message: string
  daysRemaining?: number
} {
  if (enrollment.isAccessRevoked) {
    return {
      status: "revoked",
      message: "Your access to this course has been revoked after 1 year of access.",
    }
  }

  if (hasAccessExpired(enrollment)) {
    return {
      status: "expired",
      message: "Your access to this course has expired. You can no longer access course materials.",
    }
  }

  if (isAccessExpiringSoon(enrollment)) {
    const daysRemaining = getDaysUntilExpiry(enrollment)
    return {
      status: "expiring_soon",
      message: `Your access will expire in ${daysRemaining} days. You can extend it to continue learning.`,
      daysRemaining,
    }
  }

  const daysRemaining = getDaysUntilExpiry(enrollment)
  return {
    status: "active",
    message: `Your access is active. You have ${daysRemaining} days remaining.`,
    daysRemaining,
  }
}
