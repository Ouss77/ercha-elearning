/**
 * Database field mapping utilities
 * 
 * These functions handle the mapping between database field names and application field names.
 * This is necessary because some fields have different names in the database vs. the application layer.
 */

import type { users, courses, enrollments } from "@/drizzle/schema"
import type { User, DbUser } from "@/types/user"

// Re-export for backward compatibility
export type AppUser = User

// Type for database course record
type DbCourse = typeof courses.$inferSelect

// Type for application course record (if needed for legacy compatibility)
export type AppCourse = DbCourse & {
  trainerId?: number | null
}

// Type for database enrollment record
type DbEnrollment = typeof enrollments.$inferSelect

// Type for application enrollment record (if needed for legacy compatibility)
export type AppEnrollment = DbEnrollment & {
  userId?: number | null
  courseId?: number | null
}

/**
 * Map database user record to application user record
 * Returns user as-is since we're now using avatarUrl consistently
 */
export function mapUserFromDb(dbUser: DbUser | null | undefined): User | null {
  if (!dbUser) return null
  return dbUser
}

/**
 * Map application user data to database user data
 * Returns data as-is since we're now using avatarUrl consistently
 */
export function mapUserToDb(appUser: Partial<User>): Partial<Omit<DbUser, 'id' | 'createdAt' | 'updatedAt'>> {
  return appUser
}

/**
 * Map database course record to application course record
 * Adds trainerId as alias for teacherId for backward compatibility
 */
export function mapCourseFromDb(dbCourse: DbCourse | null | undefined): AppCourse | null {
  if (!dbCourse) return null
  
  return {
    ...dbCourse,
    trainerId: dbCourse.teacherId
  }
}

/**
 * Map database enrollment record to application enrollment record
 * Adds userId and courseId as aliases for backward compatibility
 */
export function mapEnrollmentFromDb(dbEnrollment: DbEnrollment | null | undefined): AppEnrollment | null {
  if (!dbEnrollment) return null
  
  return {
    ...dbEnrollment,
    userId: dbEnrollment.studentId,
    courseId: dbEnrollment.courseId
  }
}
