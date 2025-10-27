/**
 * Enrollment query functions
 *
 * This module provides database operations for managing course enrollments,
 * including CRUD operations and queries for student and course relationships.
 */

import { eq, desc } from "drizzle-orm";
import { db } from "./db";
import { enrollments, courses, users } from "@/drizzle/schema";
import { mapEnrollmentFromDb } from "./mappers";
import { createBaseQueries } from "./base-queries";
import { validateId, validateForeignKey } from "./validation";
import { handleDbError } from "./error-handler";
import { DbResult } from "./types";
import type { AppEnrollment } from "./mappers";

// Create base query operations for enrollments
const enrollmentBaseQueries = createBaseQueries(enrollments, enrollments.id);

/**
 * Get an enrollment by ID
 *
 * @param id - The enrollment ID
 * @returns Result with the enrollment or null if not found
 *
 * @example
 * ```typescript
 * const result = await getEnrollmentById(1);
 * if (result.success) {
 *   console.log(result.data);
 * }
 * ```
 */
export async function getEnrollmentById(
  id: number
): Promise<DbResult<AppEnrollment | null>> {
  const result = await enrollmentBaseQueries.findById(id);
  if (!result.success) return result;

  const mappedEnrollment = mapEnrollmentFromDb(result.data);
  return { success: true, data: mappedEnrollment };
}

/**
 * Get all enrollments for a specific student with course details
 * Optimized with a single query using joins
 *
 * @param studentId - The student's user ID
 * @returns Result with array of enrollments with course information
 *
 * @example
 * ```typescript
 * const result = await getEnrollmentsByStudentId(5);
 * if (result.success) {
 *   result.data.forEach(enrollment => {
 *     console.log(enrollment.course.title);
 *   });
 * }
 * ```
 */
export async function getEnrollmentsByStudentId(
  studentId: number
): Promise<DbResult<any[]>> {
  const validId = validateId(studentId);
  if (!validId.success) return validId as any;

  try {
    const result = await db
      .select({
        id: enrollments.id,
        studentId: enrollments.studentId,
        courseId: enrollments.courseId,
        enrolledAt: enrollments.createdAt,
        completedAt: enrollments.completedAt,
        createdAt: enrollments.createdAt,
        updatedAt: enrollments.updatedAt,
        course: {
          id: courses.id,
          title: courses.title,
          slug: courses.slug,
          description: courses.description,
          thumbnailUrl: courses.thumbnailUrl,
          isActive: courses.isActive,
        },
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.studentId, validId.data))
      .orderBy(desc(enrollments.createdAt));

    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error, "getEnrollmentsByStudentId");
  }
}

/**
 * Get all enrollments for a specific course
 * Optimized to return only necessary fields
 *
 * @param courseId - The course ID
 * @returns Result with array of enrollments
 *
 * @example
 * ```typescript
 * const result = await getEnrollmentsByCourseId(10);
 * if (result.success) {
 *   console.log(`${result.data.length} students enrolled`);
 * }
 * ```
 */
export async function getEnrollmentsByCourseId(
  courseId: number
): Promise<DbResult<AppEnrollment[]>> {
  const validId = validateId(courseId);
  if (!validId.success) return validId as any;

  const result = await enrollmentBaseQueries.findMany(
    eq(enrollments.courseId, validId.data)
  );
  if (!result.success) return result;

  const mappedEnrollments = result.data
    .map(mapEnrollmentFromDb)
    .filter((e): e is AppEnrollment => e !== null);

  return { success: true, data: mappedEnrollments };
}

/**
 * Create a new enrollment with foreign key validation
 * Validates that both student and course exist before creating enrollment
 *
 * @param data - Enrollment data with studentId and courseId
 * @returns Result with the created enrollment
 *
 * @example
 * ```typescript
 * const result = await createEnrollment({
 *   studentId: 5,
 *   courseId: 10
 * });
 * if (result.success) {
 *   console.log('Student enrolled successfully');
 * }
 * ```
 */
export async function createEnrollment(data: {
  studentId: number;
  courseId: number;
}): Promise<DbResult<AppEnrollment | null>> {
  // Validate input IDs
  const validStudentId = validateId(data.studentId);
  if (!validStudentId.success) return validStudentId as any;

  const validCourseId = validateId(data.courseId);
  if (!validCourseId.success) return validCourseId as any;

  // Validate foreign key references
  const studentExists = await validateForeignKey(
    users,
    users.id,
    validStudentId.data,
    "studentId"
  );
  if (!studentExists.success) return studentExists as any;

  const courseExists = await validateForeignKey(
    courses,
    courses.id,
    validCourseId.data,
    "courseId"
  );
  if (!courseExists.success) return courseExists as any;

  // Validate that the course is active
  try {
    const course = await db
      .select({ isActive: courses.isActive })
      .from(courses)
      .where(eq(courses.id, validCourseId.data))
      .limit(1);

    if (course.length === 0 || !course[0].isActive) {
      return {
        success: false,
        error: "Cannot enroll in an inactive course",
      } as any;
    }
  } catch (error) {
    return handleDbError(error, "createEnrollment");
  }

  // Create the enrollment
  const result = await enrollmentBaseQueries.create({
    studentId: validStudentId.data,
    courseId: validCourseId.data,
  });

  if (!result.success) return result;

  const mappedEnrollment = mapEnrollmentFromDb(result.data);
  return { success: true, data: mappedEnrollment };
}

/**
 * Get student enrolled courses with progress statistics
 * Uses query composition to build complex query from reusable fragments
 *
 * @param studentId - The student ID
 * @returns Result with enrolled courses and progress data
 *
 * @performance
 * - Complexity: O(n) where n = number of enrollments
 * - Uses joins to avoid N+1 queries
 * - Aggregates chapter progress at database level
 * - Recommended: Cache results for frequently accessed students (5-minute TTL)
 *
 * @example
 * ```typescript
 * const result = await getStudentEnrolledCoursesWithProgress(studentId);
 * if (result.success) {
 *   result.data.forEach(course => {
 *     console.log(`${course.courseTitle}: ${course.completionPercentage}% complete`);
 *   });
 * }
 * ```
 */
export async function getStudentEnrolledCoursesWithProgress(studentId: number) {
  const validId = validateId(studentId);
  if (!validId.success) return validId as any;

  try {
    const { domains, chapters, chapterProgress, modules } = await import(
      "@/drizzle/schema"
    );
    const { and, sql } = await import("drizzle-orm");
    const { chapterCountSql, completedChapterCountSql } = await import(
      "./query-builders"
    );

    const result = await db
      .select({
        enrollmentId: enrollments.id,
        courseId: courses.id,
        courseTitle: courses.title,
        courseDescription: courses.description,
        courseThumbnailUrl: courses.thumbnailUrl,
        enrolledAt: enrollments.createdAt,
        completedAt: enrollments.completedAt,
        domainId: domains.id,
        domainName: domains.name,
        domainColor: domains.color,
        teacherId: users.id,
        teacherName: users.name,
        totalChapters: chapterCountSql(),
        completedChapters: completedChapterCountSql(),
        totalModules: sql<number>`COUNT(DISTINCT ${modules.id})`.as(
          "total_modules"
        ),
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .leftJoin(domains, eq(courses.domainId, domains.id))
      .leftJoin(users, eq(courses.teacherId, users.id))
      .leftJoin(modules, eq(modules.courseId, courses.id))
      .leftJoin(chapters, eq(chapters.moduleId, modules.id))
      .leftJoin(
        chapterProgress,
        and(
          eq(chapterProgress.chapterId, chapters.id),
          eq(chapterProgress.studentId, validId.data)
        )
      )
      .where(eq(enrollments.studentId, validId.data))
      .groupBy(
        enrollments.id,
        courses.id,
        courses.title,
        courses.description,
        courses.thumbnailUrl,
        enrollments.createdAt,
        enrollments.completedAt,
        domains.id,
        domains.name,
        domains.color,
        users.id,
        users.name
      )
      .orderBy(desc(enrollments.createdAt));

    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error, "getStudentEnrolledCoursesWithProgress");
  }
}
