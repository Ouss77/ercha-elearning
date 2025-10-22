/**
 * Course query operations
 * 
 * This module provides all database operations related to courses,
 * including CRUD operations, course statistics, and course-domain-teacher relationships.
 * 
 * All functions return DbResult types for consistent error handling.
 * 
 * @module course-queries
 */

import { eq, desc } from "drizzle-orm";
import { db } from "./index";
import { courses, domains, users, enrollments } from "@/drizzle/schema";
import { mapCourseFromDb } from "./mappers";
import { generateSlug, generateUniqueSlug } from "@/lib/utils/slug";
import { createBaseQueries } from "./base-queries";
import { validateId, validateString, validateForeignKey } from "./validation";
import { courseWithStatsBase } from "./query-builders";
import { DbResult } from "./types";
import { handleDbError } from "./error-handler";

// Create base query operations for courses
const courseBaseQueries = createBaseQueries(courses, courses.id);

/**
 * Create a new course with validation and unique slug generation
 * 
 * @param data - Course creation data
 * @returns Result with created course or error
 */
export async function createCourse(data: {
  title: string;
  description?: string | null;
  domainId: number;
  teacherId?: number | null;
  thumbnailUrl?: string | null;
  isActive?: boolean;
}): Promise<DbResult<any>> {
  // Validate required fields
  const titleValidation = validateString(data.title, 'title', { minLength: 1, maxLength: 255 });
  if (!titleValidation.success) return titleValidation;

  const domainIdValidation = validateId(data.domainId);
  if (!domainIdValidation.success) return domainIdValidation;

  // Validate foreign key references
  const domainExists = await validateForeignKey(domains, domains.id, data.domainId, 'domainId');
  if (!domainExists.success) return domainExists as any;

  if (data.teacherId) {
    const teacherIdValidation = validateId(data.teacherId);
    if (!teacherIdValidation.success) return teacherIdValidation;

    const teacherExists = await validateForeignKey(users, users.id, data.teacherId, 'teacherId');
    if (!teacherExists.success) return teacherExists as any;
  }

  try {
    // Generate a unique slug
    const baseSlug = generateSlug(titleValidation.data);
    const existingCourses = await db.select({ slug: courses.slug }).from(courses);
    const existingSlugs = existingCourses.map(c => c.slug);
    const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);

    const result = await courseBaseQueries.create({
      title: titleValidation.data,
      slug: uniqueSlug,
      description: data.description ?? null,
      domainId: domainIdValidation.data,
      teacherId: data.teacherId ?? null,
      thumbnailUrl: data.thumbnailUrl ?? null,
      isActive: data.isActive ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (!result.success) return result;

    const mappedCourse = mapCourseFromDb(result.data);
    return { success: true, data: mappedCourse };
  } catch (error) {
    return handleDbError(error, 'createCourse');
  }
}

/**
 * Update an existing course
 * 
 * @param id - Course ID
 * @param data - Partial course data to update
 * @returns Result with updated course or error
 */
export async function updateCourse(
  id: number,
  data: Partial<{
    title: string;
    description: string | null;
    domainId: number;
    teacherId: number | null;
    thumbnailUrl: string | null;
    isActive: boolean;
  }>
): Promise<DbResult<any>> {
  const idValidation = validateId(id);
  if (!idValidation.success) return idValidation;

  // Validate title if provided
  if (data.title !== undefined) {
    const titleValidation = validateString(data.title, 'title', { minLength: 1, maxLength: 255 });
    if (!titleValidation.success) return titleValidation;
  }

  // Validate domainId if provided
  if (data.domainId !== undefined) {
    const domainIdValidation = validateId(data.domainId);
    if (!domainIdValidation.success) return domainIdValidation;

    const domainExists = await validateForeignKey(domains, domains.id, data.domainId, 'domainId');
    if (!domainExists.success) return domainExists as any;
  }

  // Validate teacherId if provided
  if (data.teacherId !== undefined && data.teacherId !== null) {
    const teacherIdValidation = validateId(data.teacherId);
    if (!teacherIdValidation.success) return teacherIdValidation;

    const teacherExists = await validateForeignKey(users, users.id, data.teacherId, 'teacherId');
    if (!teacherExists.success) return teacherExists as any;
  }

  try {
    const result = await courseBaseQueries.update(idValidation.data, {
      ...data,
      updatedAt: new Date(),
    } as any);

    if (!result.success) return result;

    const mappedCourse = mapCourseFromDb(result.data);
    return { success: true, data: mappedCourse };
  } catch (error) {
    return handleDbError(error, 'updateCourse');
  }
}

/**
 * Get a course by ID
 * 
 * @param id - Course ID
 * @returns Result with course or null if not found
 */
export async function getCourseById(id: number): Promise<DbResult<any>> {
  const idValidation = validateId(id);
  if (!idValidation.success) return idValidation;

  try {
    const result = await courseBaseQueries.findById(idValidation.data);
    if (!result.success) return result;

    if (!result.data) {
      return { success: true, data: null };
    }

    const mappedCourse = mapCourseFromDb(result.data);
    return { success: true, data: mappedCourse };
  } catch (error) {
    return handleDbError(error, 'getCourseById');
  }
}

export async function getAllCourses() {
  try {
    const result = await db.select().from(courses);
    const mappedCourses = result.map(mapCourseFromDb).filter((c) => c !== null);
    return { success: true, data: mappedCourses };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getCoursesByTeacherId(teacherId: number) {
  try {
    const result = await db
      .select()
      .from(courses)
      .where(eq(courses.teacherId, teacherId));
    const mappedCourses = result.map(mapCourseFromDb).filter((c) => c !== null);
    return { success: true, data: mappedCourses };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getCoursesByDomainId(domainId: number) {
  try {
    const result = await db
      .select()
      .from(courses)
      .where(eq(courses.domainId, domainId));
    const mappedCourses = result.map(mapCourseFromDb).filter((c) => c !== null);
    return { success: true, data: mappedCourses };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function deleteCourse(id: number) {
  try {
    const result = await db
      .delete(courses)
      .where(eq(courses.id, id))
      .returning();

    const mappedCourse = mapCourseFromDb(result[0]);
    return { success: true, data: mappedCourse };
  } catch (error) {
    return handleDbError(error);
  }
}

/**
 * Get all courses with details (domain, teacher, enrollment count, chapter count)
 * Uses query composition for maintainability
 * 
 * @returns Result with array of courses with details
 */
export async function getCoursesWithDetails(): Promise<DbResult<any[]>> {
  try {
    // Use the query composition helper for courses with stats
    const result = await courseWithStatsBase()
      .orderBy(desc(courses.createdAt));

    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error, 'getCoursesWithDetails');
  }
}

/**
 * Get a single course with details (domain, teacher, enrollment count, chapter count)
 * Uses query composition for maintainability
 * 
 * @param id - Course ID
 * @returns Result with course details or null if not found
 */
export async function getCourseWithDetails(id: number): Promise<DbResult<any>> {
  const idValidation = validateId(id);
  if (!idValidation.success) return idValidation;

  try {
    // Use the query composition helper for courses with stats
    const query = courseWithStatsBase();
    const result = await query
      .where(eq(courses.id, idValidation.data))
      .limit(1);

    return { success: true, data: result[0] || null };
  } catch (error) {
    return handleDbError(error, 'getCourseWithDetails');
  }
}

/**
 * Check if a course has any enrollments
 * Uses the exists utility for optimized performance
 * 
 * @param courseId - Course ID
 * @returns Result with boolean indicating if enrollments exist
 */
export async function courseHasEnrollments(courseId: number): Promise<DbResult<boolean>> {
  const idValidation = validateId(courseId);
  if (!idValidation.success) return idValidation;

  try {
    // Use the base queries exists utility for better performance
    const enrollmentBaseQueries = createBaseQueries(enrollments, enrollments.id);
    const result = await enrollmentBaseQueries.exists(eq(enrollments.courseId, idValidation.data));

    return result;
  } catch (error) {
    return handleDbError(error, 'courseHasEnrollments');
  }
}

