/**
 * Centralized User type definitions
 * 
 * This file exports the canonical user types used throughout the application.
 * Import from here instead of creating local interfaces to ensure consistency.
 */

import type { users } from "@/drizzle/schema"
import type { Role } from "@/lib/schemas/user"

/**
 * Database user record (inferred from Drizzle schema)
 * This is the raw type from the database with all fields in camelCase
 */
export type DbUser = typeof users.$inferSelect

/**
 * Application User type
 * This is the main user type used throughout the application.
 * Uses avatarUrl consistently with database schema.
 */
export type User = DbUser

/**
 * Authentication User type
 * Minimal user type used in session management (NextAuth)
 */
export type AuthUser = {
  id: string
  email: string
  name: string
  role: Role
  image?: string
}

/**
 * User List Item type
 * Simplified user type for displaying in lists/tables
 */
export type UserListItem = {
  id: number
  email: string
  name: string
  role: Role
  isActive: boolean
  createdAt: string | Date
  avatarUrl?: string | null
  password?: string
  enrolledCourses?: string[]
}

/**
 * User Profile type
 * User type for profile display/editing
 */
export type UserProfile = {
  id: number
  email: string
  name: string
  role: Role
  avatarUrl?: string | null
  isActive: boolean
  phone?: string | null
  dateOfBirth?: Date | null
  address?: string | null
  city?: string | null
  postalCode?: string | null
  country?: string | null
  bio?: string | null
  createdAt: Date
  updatedAt: Date
}
