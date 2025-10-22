/**
 * Example usage of query composition helpers
 * 
 * This file demonstrates how to use the query-builders utilities
 * to compose complex queries from simpler building blocks.
 */

import { eq, desc } from "drizzle-orm";
import { db } from "./db";
import { courses, enrollments, users } from "@/drizzle/schema";
import {
  paginate,
  orderBy,
  courseWithStatsBase,
  courseWithDetailsBase,
  enrollmentWithDetailsBase,
  enrollmentCountSql,
  chapterCountSql,
  completionPercentageSql,
  activeFilter,
  roleFilter,
  combineFilters,
  createPaginationMeta,
  type PaginationOptions,
} from "./query-builders";

// ============================================================================
// Example 1: Simple pagination
// ============================================================================

export async function getCoursesWithPagination(options: PaginationOptions) {
  // Get total count
  const totalResult = await db
    .select({ count: enrollmentCountSql() })
    .from(courses)
    .leftJoin(enrollments, eq(courses.id, enrollments.courseId));
  
  const count = totalResult[0]?.count || 0;

  // Get paginated results - use $dynamic() for type compatibility
  const query = db
    .select()
    .from(courses)
    .orderBy(desc(courses.createdAt))
    .$dynamic();
  
  const paginatedQuery = paginate(query, options);
  const items = await paginatedQuery;

  // Create pagination metadata
  const meta = createPaginationMeta(count, options);

  return {
    success: true,
    data: { items, meta },
  };
}

// ============================================================================
// Example 2: Using query fragment builders
// ============================================================================

export async function getCourseWithStats(courseId: number) {
  const result = await courseWithStatsBase()
    .where(eq(courses.id, courseId))
    .limit(1);

  return {
    success: true,
    data: result[0] || null,
  };
}

export async function getTeacherCoursesWithStats(teacherId: number) {
  const result = await courseWithStatsBase()
    .where(eq(courses.teacherId, teacherId))
    .orderBy(desc(courses.createdAt));

  return {
    success: true,
    data: result,
  };
}

// ============================================================================
// Example 3: Using aggregation helpers
// ============================================================================

export async function getCoursesWithCounts() {
  const result = await db
    .select({
      id: courses.id,
      title: courses.title,
      enrollmentCount: enrollmentCountSql(),
      chapterCount: chapterCountSql(),
    })
    .from(courses)
    .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
    .groupBy(courses.id);

  return {
    success: true,
    data: result,
  };
}

// ============================================================================
// Example 4: Using filter helpers
// ============================================================================

export async function getActiveStudents() {
  const filters = combineFilters(
    activeFilter(users),
    roleFilter("STUDENT")
  );

  const result = await db
    .select()
    .from(users)
    .where(filters);

  return {
    success: true,
    data: result,
  };
}

// ============================================================================
// Example 5: Combining multiple helpers
// ============================================================================

export async function getStudentEnrollmentsWithPagination(
  studentId: number,
  options: PaginationOptions
) {
  // Get total count
  const totalResult = await db
    .select({ count: enrollmentCountSql() })
    .from(enrollments)
    .where(eq(enrollments.studentId, studentId));
  
  const count = totalResult[0]?.count || 0;

  // Get paginated results with details - use $dynamic() for type compatibility
  const query = enrollmentWithDetailsBase()
    .where(eq(enrollments.studentId, studentId))
    .orderBy(desc(enrollments.createdAt))
    .$dynamic();

  const paginatedQuery = paginate(query, options);
  const items = await paginatedQuery;

  // Create pagination metadata
  const meta = createPaginationMeta(count, options);

  return {
    success: true,
    data: { items, meta },
  };
}

// ============================================================================
// Example 6: Custom query with composition
// ============================================================================

export async function getActiveCoursesByDomain(domainId: number) {
  const result = await courseWithDetailsBase()
    .where(
      combineFilters(
        eq(courses.domainId, domainId),
        activeFilter(courses)
      )
    )
    .orderBy(desc(courses.createdAt));

  return {
    success: true,
    data: result,
  };
}

// ============================================================================
// Example 7: Using orderBy helper
// ============================================================================

export async function getCoursesSortedByTitle() {
  const query = db.select().from(courses).$dynamic();
  const sortedQuery = orderBy(query, courses.title, 'asc');
  const result = await sortedQuery;

  return {
    success: true,
    data: result,
  };
}
