/**
 * Example implementations showing how to use performance optimization features
 * 
 * This file demonstrates best practices for:
 * - Query result caching
 * - Pagination
 * - Query profiling
 * 
 * These examples can be used as templates for optimizing existing queries.
 * 
 * @module optimized-queries.example
 */

import { eq, desc, sql, and } from "drizzle-orm";
import { db } from "./db";
import { users, courses, enrollments, domains } from "@/drizzle/schema";
import { withCache, CacheKeys, CacheTTL, CacheInvalidation } from "./cache";
import { executePaginatedQuery, validatePaginationParams, PaginationParams } from "./pagination";
import { profileQuery } from "./profiler";
import { DbResult } from "./types";
import { handleDbError } from "./error-handler";

// ============================================================================
// EXAMPLE 1: Adding Caching to Existing Query
// ============================================================================

/**
 * Original query without caching
 */
export async function getDomainsOriginal() {
  try {
    const result = await db.select().from(domains);
    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error);
  }
}

/**
 * Optimized query with caching
 * Domains rarely change, so we cache for 5 minutes
 */
export async function getDomainsOptimized() {
  return withCache(
    CacheKeys.domains(),
    CacheTTL.STATIC,
    async () => {
      try {
        const result = await db.select().from(domains);
        return { success: true, data: result };
      } catch (error) {
        return handleDbError(error);
      }
    }
  );
}

// ============================================================================
// EXAMPLE 2: Adding Pagination to List Query
// ============================================================================

/**
 * Original query returning all users
 */
export async function getAllUsersOriginal() {
  try {
    const result = await db.select().from(users);
    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error);
  }
}

/**
 * Optimized query with pagination
 */
export async function getAllUsersOptimized(
  params: Partial<PaginationParams> = {}
) {
  const validParams = validatePaginationParams(params);

  const dataQuery = db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      avatarUrl: users.avatarUrl,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  const countQuery = db
    .select({ count: sql<number>`count(*)::int` })
    .from(users);

  return executePaginatedQuery(dataQuery, countQuery, validParams);
}

// ============================================================================
// EXAMPLE 3: Adding Profiling to Complex Query
// ============================================================================

/**
 * Original complex query without profiling
 */
export async function getStudentCoursesOriginal(studentId: number) {
  try {
    const result = await db
      .select({
        courseId: courses.id,
        courseTitle: courses.title,
        domainName: domains.name,
        enrolledAt: enrollments.createdAt,
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .leftJoin(domains, eq(courses.domainId, domains.id))
      .where(eq(enrollments.studentId, studentId));

    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error);
  }
}

/**
 * Optimized query with profiling
 */
export async function getStudentCoursesOptimized(studentId: number) {
  return profileQuery(
    'getStudentCourses',
    async () => {
      try {
        const result = await db
          .select({
            courseId: courses.id,
            courseTitle: courses.title,
            domainName: domains.name,
            enrolledAt: enrollments.createdAt,
          })
          .from(enrollments)
          .innerJoin(courses, eq(enrollments.courseId, courses.id))
          .leftJoin(domains, eq(courses.domainId, domains.id))
          .where(eq(enrollments.studentId, studentId));

        return { success: true, data: result };
      } catch (error) {
        return handleDbError(error);
      }
    },
    { studentId }
  );
}

// ============================================================================
// EXAMPLE 4: Combining All Optimizations
// ============================================================================

/**
 * Fully optimized query with caching, pagination, and profiling
 */
export async function getCoursesFullyOptimized(
  params: Partial<PaginationParams> = {},
  domainId?: number
): Promise<DbResult<any>> {
  const validParams = validatePaginationParams(params);

  // Create cache key based on parameters
  const cacheKey = domainId
    ? `courses:domain:${domainId}:page:${validParams.page}:size:${validParams.pageSize}`
    : `courses:all:page:${validParams.page}:size:${validParams.pageSize}`;

  return withCache(
    cacheKey,
    CacheTTL.LIST,
    () =>
      profileQuery(
        'getCoursesPaginated',
        async () => {
          try {
            // Build base query
            let dataQuery = db
              .select({
                id: courses.id,
                title: courses.title,
                description: courses.description,
                thumbnailUrl: courses.thumbnailUrl,
                domainName: domains.name,
                domainColor: domains.color,
                isActive: courses.isActive,
                createdAt: courses.createdAt,
              })
              .from(courses)
              .leftJoin(domains, eq(courses.domainId, domains.id))
              .$dynamic();

            let countQuery = db
              .select({ count: sql<number>`count(*)::int` })
              .from(courses)
              .$dynamic();

            // Apply domain filter if provided
            if (domainId) {
              const domainFilter = eq(courses.domainId, domainId);
              dataQuery = dataQuery.where(domainFilter);
              countQuery = countQuery.where(domainFilter);
            }

            // Apply ordering
            dataQuery = dataQuery.orderBy(desc(courses.createdAt));

            // Execute paginated query
            return executePaginatedQuery(dataQuery, countQuery, validParams);
          } catch (error) {
            return handleDbError(error) as any;
          }
        },
        { domainId, ...validParams }
      )
  );
}

// ============================================================================
// EXAMPLE 5: Cache Invalidation on Updates
// ============================================================================

/**
 * Update course with proper cache invalidation
 */
export async function updateCourseOptimized(
  courseId: number,
  data: Partial<{
    title: string;
    description: string;
    domainId: number;
    isActive: boolean;
  }>
): Promise<DbResult<any>> {
  try {
    // Get current course to know teacher and domain
    const currentCourse = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    if (!currentCourse[0]) {
      return { success: false, error: 'Course not found' };
    }

    // Update the course
    const result = await db
      .update(courses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(courses.id, courseId))
      .returning();

    // Invalidate related caches
    CacheInvalidation.onCourseUpdate(
      courseId,
      currentCourse[0].teacherId || undefined
    );

    // If domain changed, invalidate old domain cache too
    if (data.domainId && data.domainId !== currentCourse[0].domainId) {
      if (currentCourse[0].domainId) {
        CacheInvalidation.onDomainUpdate(currentCourse[0].domainId);
      }
      CacheInvalidation.onDomainUpdate(data.domainId);
    }

    return { success: true, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

// ============================================================================
// EXAMPLE 6: Optimized Dashboard Query
// ============================================================================

/**
 * Teacher dashboard with all optimizations
 */
export async function getTeacherDashboardOptimized(teacherId: number) {
  return withCache(
    CacheKeys.teacherDashboard(teacherId),
    CacheTTL.DASHBOARD,
    () =>
      profileQuery(
        'getTeacherDashboard',
        async () => {
          try {
            // Execute all queries in parallel
            const [coursesResult, studentsResult, statsResult] = await Promise.all([
              // Get courses with enrollment counts
              db
                .select({
                  id: courses.id,
                  title: courses.title,
                  enrollmentCount: sql<number>`count(distinct ${enrollments.id})::int`,
                })
                .from(courses)
                .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
                .where(eq(courses.teacherId, teacherId))
                .groupBy(courses.id)
                .orderBy(desc(courses.createdAt)),

              // Get unique students
              db
                .select({
                  studentId: users.id,
                  studentName: users.name,
                  studentEmail: users.email,
                })
                .from(enrollments)
                .innerJoin(courses, eq(enrollments.courseId, courses.id))
                .innerJoin(users, eq(enrollments.studentId, users.id))
                .where(eq(courses.teacherId, teacherId))
                .groupBy(users.id, users.name, users.email),

              // Get aggregate stats
              db
                .select({
                  totalCourses: sql<number>`count(distinct ${courses.id})::int`,
                  totalEnrollments: sql<number>`count(distinct ${enrollments.id})::int`,
                })
                .from(courses)
                .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
                .where(eq(courses.teacherId, teacherId)),
            ]);

            return {
              success: true,
              data: {
                courses: coursesResult,
                students: studentsResult,
                stats: statsResult[0],
              },
            };
          } catch (error) {
            return handleDbError(error);
          }
        },
        { teacherId }
      )
  );
}

// ============================================================================
// EXAMPLE 7: Cursor-Based Pagination for Infinite Scroll
// ============================================================================

/**
 * Get courses with cursor-based pagination
 * Ideal for infinite scroll implementations
 */
export async function getCoursesInfiniteScroll(
  cursor?: number,
  limit: number = 20
) {
  return profileQuery(
    'getCoursesInfiniteScroll',
    async () => {
      try {
        let query = db
          .select({
            id: courses.id,
            title: courses.title,
            description: courses.description,
            thumbnailUrl: courses.thumbnailUrl,
            createdAt: courses.createdAt,
          })
          .from(courses)
          .orderBy(desc(courses.id))
          .$dynamic();

        // Apply cursor if provided
        if (cursor) {
          query = query.where(sql`${courses.id} < ${cursor}`);
        }

        // Fetch one extra to determine if there are more
        const items = await query.limit(limit + 1);

        const hasMore = items.length > limit;
        const resultItems = hasMore ? items.slice(0, limit) : items;

        const nextCursor =
          hasMore && resultItems.length > 0
            ? resultItems[resultItems.length - 1].id
            : null;

        return {
          success: true,
          data: {
            items: resultItems,
            meta: {
              nextCursor,
              hasMore,
              count: resultItems.length,
            },
          },
        };
      } catch (error) {
        return handleDbError(error);
      }
    },
    { cursor, limit }
  );
}

// ============================================================================
// EXAMPLE 8: Filtered and Paginated Query
// ============================================================================

/**
 * Get users with filters and pagination
 */
export async function getUsersFiltered(
  filters: {
    role?: string;
    isActive?: boolean;
    search?: string;
  },
  params: Partial<PaginationParams> = {}
) {
  const validParams = validatePaginationParams(params);

  return profileQuery(
    'getUsersFiltered',
    async () => {
      try {
        // Build dynamic where conditions
        const conditions = [];
        if (filters.role) {
          conditions.push(eq(users.role, filters.role as any));
        }
        if (filters.isActive !== undefined) {
          conditions.push(eq(users.isActive, filters.isActive));
        }
        if (filters.search) {
          conditions.push(
            sql`${users.name} ILIKE ${`%${filters.search}%`} OR ${users.email} ILIKE ${`%${filters.search}%`}`
          );
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        // Build queries
        let dataQuery = db
          .select({
            id: users.id,
            email: users.email,
            name: users.name,
            role: users.role,
            isActive: users.isActive,
            createdAt: users.createdAt,
          })
          .from(users)
          .$dynamic();

        let countQuery = db
          .select({ count: sql<number>`count(*)::int` })
          .from(users)
          .$dynamic();

        // Apply filters
        if (whereClause) {
          dataQuery = dataQuery.where(whereClause);
          countQuery = countQuery.where(whereClause);
        }

        // Apply ordering
        dataQuery = dataQuery.orderBy(desc(users.createdAt));

        return executePaginatedQuery(dataQuery, countQuery, validParams);
      } catch (error) {
        return handleDbError(error) as any;
      }
    },
    { filters, ...validParams }
  );
}

// ============================================================================
// Usage Examples in API Routes
// ============================================================================

/**
 * Example API route using optimized queries
 * 
 * // app/api/courses/route.ts
 * import { getCoursesFullyOptimized } from '@/lib/db/optimized-queries.example';
 * 
 * export async function GET(request: Request) {
 *   const { searchParams } = new URL(request.url);
 *   const page = parseInt(searchParams.get('page') || '1');
 *   const pageSize = parseInt(searchParams.get('pageSize') || '20');
 *   const domainId = searchParams.get('domainId') 
 *     ? parseInt(searchParams.get('domainId')!) 
 *     : undefined;
 * 
 *   const result = await getCoursesFullyOptimized(
 *     { page, pageSize },
 *     domainId
 *   );
 * 
 *   if (!result.success) {
 *     return Response.json({ error: result.error }, { status: 500 });
 *   }
 * 
 *   return Response.json(result.data);
 * }
 */

/**
 * Example React component using infinite scroll
 * 
 * // components/courses/infinite-course-list.tsx
 * import { useInfiniteQuery } from '@tanstack/react-query';
 * 
 * export function InfiniteCourseList() {
 *   const {
 *     data,
 *     fetchNextPage,
 *     hasNextPage,
 *     isFetchingNextPage,
 *   } = useInfiniteQuery({
 *     queryKey: ['courses', 'infinite'],
 *     queryFn: async ({ pageParam }) => {
 *       const response = await fetch(
 *         `/api/courses/infinite?cursor=${pageParam || ''}`
 *       );
 *       return response.json();
 *     },
 *     getNextPageParam: (lastPage) => lastPage.meta.nextCursor,
 *   });
 * 
 *   return (
 *     <div>
 *       {data?.pages.map((page) =>
 *         page.items.map((course) => (
 *           <CourseCard key={course.id} course={course} />
 *         ))
 *       )}
 *       {hasNextPage && (
 *         <button onClick={() => fetchNextPage()}>
 *           {isFetchingNextPage ? 'Loading...' : 'Load More'}
 *         </button>
 *       )}
 *     </div>
 *   );
 * }
 */
