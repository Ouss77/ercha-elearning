/**
 * Query composition utilities for building complex database queries
 * 
 * This module provides reusable query fragments, pagination, sorting,
 * and common join helpers to compose complex queries from simpler building blocks.
 */

import { SQL, sql, asc, desc, and, eq } from "drizzle-orm";
import type { PgSelect } from "drizzle-orm/pg-core";
import { db } from "./db";
import { 
  courses, 
  domains, 
  users, 
  enrollments, 
  chapters,
  chapterProgress,
  contentItems,
  classes,
  quizzes,
  finalProjects
} from "@/drizzle/schema";

/**
 * Pagination options for query results
 * @deprecated Use PaginationParams from './pagination' instead
 */
export interface PaginationOptions {
  /** Page number (1-indexed) */
  page: number;
  /** Number of items per page */
  pageSize: number;
}

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Apply pagination to a query
 * 
 * @param query - The query builder to paginate
 * @param options - Pagination options (page and pageSize)
 * @returns Query with limit and offset applied
 * 
 * @example
 * ```typescript
 * const query = db.select().from(users);
 * const paginatedQuery = paginate(query, { page: 1, pageSize: 10 });
 * ```
 */
export function paginate<T extends PgSelect>(
  query: T,
  options: PaginationOptions
) {
  const { page, pageSize } = options;
  const offset = (page - 1) * pageSize;
  
  return query.limit(pageSize).offset(offset);
}

/**
 * Create pagination metadata from total count
 * @deprecated Use calculatePaginationMeta from './pagination' instead
 * 
 * @param total - Total number of items
 * @param options - Pagination options
 * @returns Pagination metadata
 */
export function createPaginationMeta(
  total: number,
  options: PaginationOptions
) {
  const { page, pageSize } = options;
  const totalPages = Math.ceil(total / pageSize);
  
  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Apply sorting to a query
 * 
 * @param query - The query builder to sort
 * @param column - The column to sort by
 * @param direction - Sort direction ('asc' or 'desc')
 * @returns Query with ordering applied
 * 
 * @example
 * ```typescript
 * const query = db.select().from(users);
 * const sortedQuery = orderBy(query, users.createdAt, 'desc');
 * ```
 */
export function orderBy<T extends PgSelect>(
  query: T,
  column: any,
  direction: SortDirection = 'asc'
) {
  return query.orderBy(direction === 'asc' ? asc(column) : desc(column));
}

/**
 * Apply multiple sort criteria to a query
 * 
 * @param query - The query builder to sort
 * @param sorts - Array of sort criteria
 * @returns Query with multiple orderings applied
 * 
 * @example
 * ```typescript
 * const query = db.select().from(users);
 * const sortedQuery = orderByMultiple(query, [
 *   { column: users.role, direction: 'asc' },
 *   { column: users.createdAt, direction: 'desc' }
 * ]);
 * ```
 */
export function orderByMultiple<T extends PgSelect>(
  query: T,
  sorts: Array<{ column: any; direction: SortDirection }>
) {
  const orderClauses = sorts.map(({ column, direction }) =>
    direction === 'asc' ? asc(column) : desc(column)
  );
  
  return query.orderBy(...orderClauses);
}

// ============================================================================
// Common Join Helpers
// ============================================================================

/**
 * Add domain join to a course query
 * Includes domain id, name, description, and color
 * 
 * @param query - The query builder
 * @returns Query with domain joined
 * 
 * @example
 * ```typescript
 * const query = db.select().from(courses);
 * const withDomainQuery = withDomain(query);
 * ```
 */
export function withDomain<T extends PgSelect>(query: T) {
  return query.leftJoin(domains, eq(courses.domainId, domains.id));
}

/**
 * Add teacher (user) join to a course query
 * Includes teacher id, name, email, and avatarUrl
 * 
 * @param query - The query builder
 * @returns Query with teacher joined
 * 
 * @example
 * ```typescript
 * const query = db.select().from(courses);
 * const withTeacherQuery = withTeacher(query);
 * ```
 */
export function withTeacher<T extends PgSelect>(query: T) {
  return query.leftJoin(users, eq(courses.teacherId, users.id));
}

/**
 * Add student (user) join to an enrollment query
 * Includes student id, name, email, and avatarUrl
 * 
 * @param query - The query builder
 * @returns Query with student joined
 * 
 * @example
 * ```typescript
 * const query = db.select().from(enrollments);
 * const withStudentQuery = withStudent(query);
 * ```
 */
export function withStudent<T extends PgSelect>(query: T) {
  return query.leftJoin(users, eq(enrollments.studentId, users.id));
}

/**
 * Add course join to an enrollment query
 * Includes course details
 * 
 * @param query - The query builder
 * @returns Query with course joined
 * 
 * @example
 * ```typescript
 * const query = db.select().from(enrollments);
 * const withCourseQuery = withCourse(query);
 * ```
 */
export function withCourse<T extends PgSelect>(query: T) {
  return query.leftJoin(courses, eq(enrollments.courseId, courses.id));
}

/**
 * Add chapters join to a course query
 * 
 * @param query - The query builder
 * @returns Query with chapters joined
 */
export function withChapters<T extends PgSelect>(query: T) {
  return query.leftJoin(chapters, eq(courses.id, chapters.courseId));
}

/**
 * Add content items join to a chapter query
 * 
 * @param query - The query builder
 * @returns Query with content items joined
 */
export function withContentItems<T extends PgSelect>(query: T) {
  return query.leftJoin(contentItems, eq(chapters.id, contentItems.chapterId));
}

/**
 * Add chapter progress join for a specific student
 * 
 * @param query - The query builder
 * @param studentId - The student ID to filter progress
 * @returns Query with chapter progress joined
 */
export function withChapterProgress<T extends PgSelect>(
  query: T,
  studentId: number
) {
  return query.leftJoin(
    chapterProgress,
    and(
      eq(chapterProgress.chapterId, chapters.id),
      eq(chapterProgress.studentId, studentId)
    )
  );
}

// ============================================================================
// Aggregation Helpers
// ============================================================================

/**
 * SQL fragment for counting enrollments
 * Use in select() to get enrollment count
 * 
 * @example
 * ```typescript
 * const result = await db
 *   .select({
 *     ...courses,
 *     enrollmentCount: enrollmentCountSql()
 *   })
 *   .from(courses)
 *   .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
 *   .groupBy(courses.id);
 * ```
 */
export function enrollmentCountSql(): SQL<number> {
  return sql<number>`cast(count(distinct ${enrollments.id}) as int)`;
}

/**
 * SQL fragment for counting chapters
 * Use in select() to get chapter count
 */
export function chapterCountSql(): SQL<number> {
  return sql<number>`cast(count(distinct ${chapters.id}) as int)`;
}

/**
 * SQL fragment for counting completed chapters
 * Use in select() to get completed chapter count
 */
export function completedChapterCountSql(): SQL<number> {
  return sql<number>`cast(count(distinct ${chapterProgress.id}) as int)`;
}

/**
 * SQL fragment for counting content items
 * Use in select() to get content item count
 */
export function contentItemCountSql(): SQL<number> {
  return sql<number>`cast(count(distinct ${contentItems.id}) as int)`;
}

/**
 * SQL fragment for counting students in a class
 * Use in select() to get student count
 */
export function studentCountSql(): SQL<number> {
  return sql<number>`cast(count(distinct ${users.id}) as int)`;
}

/**
 * SQL fragment for calculating completion percentage
 * Returns a value between 0 and 100
 * 
 * @example
 * ```typescript
 * const result = await db
 *   .select({
 *     courseId: courses.id,
 *     completionRate: completionPercentageSql()
 *   })
 *   .from(courses)
 *   .leftJoin(chapters, eq(courses.id, chapters.courseId))
 *   .leftJoin(chapterProgress, eq(chapters.id, chapterProgress.chapterId))
 *   .groupBy(courses.id);
 * ```
 */
export function completionPercentageSql(): SQL<number> {
  return sql<number>`
    CASE 
      WHEN count(distinct ${chapters.id}) = 0 THEN 0
      ELSE cast(
        (count(distinct ${chapterProgress.id})::float / count(distinct ${chapters.id})::float) * 100 
        as int
      )
    END
  `;
}

// ============================================================================
// Query Fragment Builders
// ============================================================================

/**
 * Build a base query for courses with domain and teacher
 * Common starting point for course queries
 * 
 * @returns Query builder with courses, domain, and teacher joined
 * 
 * @example
 * ```typescript
 * const query = courseWithDetailsBase();
 * const result = await query.where(eq(courses.id, courseId));
 * ```
 */
export function courseWithDetailsBase() {
  return db
    .select({
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
      description: courses.description,
      domainId: courses.domainId,
      teacherId: courses.teacherId,
      thumbnailUrl: courses.thumbnailUrl,
      isActive: courses.isActive,
      createdAt: courses.createdAt,
      updatedAt: courses.updatedAt,
      domain: {
        id: domains.id,
        name: domains.name,
        description: domains.description,
        color: domains.color,
      },
      teacher: {
        id: users.id,
        name: users.name,
        email: users.email,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(courses)
    .leftJoin(domains, eq(courses.domainId, domains.id))
    .leftJoin(users, eq(courses.teacherId, users.id));
}

/**
 * Build a base query for courses with stats (enrollments and chapters)
 * 
 * @returns Query builder with courses, stats, domain, and teacher
 * 
 * @example
 * ```typescript
 * const query = courseWithStatsBase();
 * const result = await query.where(eq(courses.teacherId, teacherId));
 * ```
 */
export function courseWithStatsBase() {
  return db
    .select({
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
      description: courses.description,
      domainId: courses.domainId,
      teacherId: courses.teacherId,
      thumbnailUrl: courses.thumbnailUrl,
      isActive: courses.isActive,
      createdAt: courses.createdAt,
      updatedAt: courses.updatedAt,
      domain: {
        id: domains.id,
        name: domains.name,
        color: domains.color,
      },
      teacher: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
      enrollmentCount: enrollmentCountSql(),
      chapterCount: chapterCountSql(),
    })
    .from(courses)
    .leftJoin(domains, eq(courses.domainId, domains.id))
    .leftJoin(users, eq(courses.teacherId, users.id))
    .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
    .leftJoin(chapters, eq(courses.id, chapters.courseId))
    .groupBy(
      courses.id,
      domains.id,
      domains.name,
      domains.description,
      domains.color,
      users.id,
      users.name,
      users.email
    );
}

/**
 * Build a base query for enrollments with course and student details
 * 
 * @returns Query builder with enrollments, course, and student joined
 */
export function enrollmentWithDetailsBase() {
  return db
    .select({
      id: enrollments.id,
      studentId: enrollments.studentId,
      courseId: enrollments.courseId,
      completedAt: enrollments.completedAt,
      createdAt: enrollments.createdAt,
      updatedAt: enrollments.updatedAt,
      course: {
        id: courses.id,
        title: courses.title,
        slug: courses.slug,
        description: courses.description,
        thumbnailUrl: courses.thumbnailUrl,
      },
      student: {
        id: users.id,
        name: users.name,
        email: users.email,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(enrollments)
    .leftJoin(courses, eq(enrollments.courseId, courses.id))
    .leftJoin(users, eq(enrollments.studentId, users.id));
}

/**
 * Build a base query for chapters with content items
 * 
 * @returns Query builder with chapters and content items
 */
export function chapterWithContentBase() {
  return db
    .select({
      id: chapters.id,
      courseId: chapters.courseId,
      title: chapters.title,
      description: chapters.description,
      orderIndex: chapters.orderIndex,
      createdAt: chapters.createdAt,
      updatedAt: chapters.updatedAt,
      contentItemCount: contentItemCountSql(),
    })
    .from(chapters)
    .leftJoin(contentItems, eq(chapters.id, contentItems.chapterId))
    .groupBy(chapters.id);
}

// ============================================================================
// Filter Helpers
// ============================================================================

/**
 * Create a filter for active entities
 * 
 * @param table - Table with isActive column
 * @returns SQL condition for active entities
 */
export function activeFilter(table: typeof courses | typeof users | typeof classes) {
  return eq(table.isActive, true);
}

/**
 * Create a filter for entities by role
 * 
 * @param role - User role to filter by
 * @returns SQL condition for role
 */
export function roleFilter(role: "STUDENT" | "TRAINER" | "SUB_ADMIN" | "ADMIN") {
  return eq(users.role, role);
}

/**
 * Combine multiple SQL conditions with AND
 * 
 * @param conditions - Array of SQL conditions
 * @returns Combined SQL condition
 */
export function combineFilters(...conditions: (SQL | undefined)[]): SQL | undefined {
  const validConditions = conditions.filter((c): c is SQL => c !== undefined);
  
  if (validConditions.length === 0) return undefined;
  if (validConditions.length === 1) return validConditions[0];
  
  return and(...validConditions);
}
