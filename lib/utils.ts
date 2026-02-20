import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const generateTempId = () => {
  return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}


export const isTempId = (id: any): boolean => {
  if (typeof id !== 'string') return false
  return id.startsWith('temp-')
}

export const toLocalDate = (utcDate: string | Date) => {
  return new Date(utcDate) 
}

/**
 * Convert UTC time to user's local timezone and format it
 * Automatically detects user's timezone and converts the message timestamp
 */
export const formatMessageTime = (dateString: string | Date): string => {
  try {
    const date = new Date(dateString)
    
    if (isNaN(date.getTime())) {
      return "Invalid date"
    }

    // Get current time to calculate relative time
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    // Less than a minute
    if (diffInSeconds < 60) {
      return "just now"
    }

    // Less than an hour
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes}m ago`
    }

    // Less than a day
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours}h ago`
    }

    // Less than a week
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days}d ago`
    }

    // Format as date with local timezone
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }

    return date.toLocaleDateString("en-US", options)
  } catch (error) {
    console.error("Error formatting message time:", error)
    return "Unknown time"
  }
}

/**
 * Get user's timezone offset in hours
 */
export const getUserTimezoneOffset = (): number => {
  return new Date().getTimezoneOffset() / 60
}
