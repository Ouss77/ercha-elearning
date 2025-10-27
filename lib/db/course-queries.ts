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
import {
  courses,
  domains,
  users,
  enrollments,
  modules,
} from "@/drizzle/schema";
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
  const titleValidation = validateString(data.title, "title", {
    minLength: 1,
    maxLength: 255,
  });
  if (!titleValidation.success) return titleValidation;

  const domainIdValidation = validateId(data.domainId);
  if (!domainIdValidation.success) return domainIdValidation;

  // Validate foreign key references
  const domainExists = await validateForeignKey(
    domains,
    domains.id,
    data.domainId,
    "domainId"
  );
  if (!domainExists.success) return domainExists as any;

  if (data.teacherId) {
    const teacherIdValidation = validateId(data.teacherId);
    if (!teacherIdValidation.success) return teacherIdValidation;

    const teacherExists = await validateForeignKey(
      users,
      users.id,
      data.teacherId,
      "teacherId"
    );
    if (!teacherExists.success) return teacherExists as any;
  }

  try {
    // Generate a unique slug
    const baseSlug = generateSlug(titleValidation.data);
    const existingCourses = await db
      .select({ slug: courses.slug })
      .from(courses);
    const existingSlugs = existingCourses.map((c) => c.slug);
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
    return handleDbError(error, "createCourse");
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
    const titleValidation = validateString(data.title, "title", {
      minLength: 1,
      maxLength: 255,
    });
    if (!titleValidation.success) return titleValidation;
  }

  // Validate domainId if provided
  if (data.domainId !== undefined) {
    const domainIdValidation = validateId(data.domainId);
    if (!domainIdValidation.success) return domainIdValidation;

    const domainExists = await validateForeignKey(
      domains,
      domains.id,
      data.domainId,
      "domainId"
    );
    if (!domainExists.success) return domainExists as any;
  }

  // Validate teacherId if provided
  if (data.teacherId !== undefined && data.teacherId !== null) {
    const teacherIdValidation = validateId(data.teacherId);
    if (!teacherIdValidation.success) return teacherIdValidation;

    const teacherExists = await validateForeignKey(
      users,
      users.id,
      data.teacherId,
      "teacherId"
    );
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
    return handleDbError(error, "updateCourse");
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
    return handleDbError(error, "getCourseById");
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
    const result = await courseWithStatsBase().orderBy(desc(courses.createdAt));

    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error, "getCoursesWithDetails");
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
    return handleDbError(error, "getCourseWithDetails");
  }
}

/**
 * Check if a course has any enrollments
 * Uses the exists utility for optimized performance
 *
 * @param courseId - Course ID
 * @returns Result with boolean indicating if enrollments exist
 */
export async function courseHasEnrollments(
  courseId: number
): Promise<DbResult<boolean>> {
  const idValidation = validateId(courseId);
  if (!idValidation.success) return idValidation;

  try {
    // Use the base queries exists utility for better performance
    const enrollmentBaseQueries = createBaseQueries(
      enrollments,
      enrollments.id
    );
    const result = await enrollmentBaseQueries.exists(
      eq(enrollments.courseId, idValidation.data)
    );

    return result;
  } catch (error) {
    return handleDbError(error, "courseHasEnrollments");
  }
}

/**
 * Get teacher's courses with enrollment and progress statistics
 * Uses query composition helpers for aggregations
 *
 * @param teacherId - The teacher ID
 * @returns Result with courses and statistics
 *
 * @performance
 * - Complexity: O(n) where n = number of courses
 * - Uses database-level aggregations for efficiency
 * - Groups by course to calculate statistics
 * - Recommended: Paginate results for teachers with many courses
 * - Consider caching with 10-minute TTL for dashboard views
 */
export async function getTeacherCoursesWithStats(teacherId: number) {
  const validId = validateId(teacherId);
  if (!validId.success) return validId as any;

  try {
    const { chapters, chapterProgress, modules } = await import(
      "@/drizzle/schema"
    );
    const { sql } = await import("drizzle-orm");
    const { chapterCountSql, completedChapterCountSql } = await import(
      "./query-builders"
    );

    const result = await db
      .select({
        courseId: courses.id,
        courseTitle: courses.title,
        courseDescription: courses.description,
        courseThumbnailUrl: courses.thumbnailUrl,
        courseIsActive: courses.isActive,
        domainId: domains.id,
        domainName: domains.name,
        domainColor: domains.color,
        totalStudents: sql<number>`cast(count(distinct ${enrollments.studentId}) as int)`,
        totalChapters: chapterCountSql(),
        completedEnrollments: sql<number>`cast(count(distinct case when ${enrollments.completedAt} is not null then ${enrollments.id} end) as int)`,
        totalProgress: completedChapterCountSql(),
      })
      .from(courses)
      .leftJoin(domains, eq(courses.domainId, domains.id))
      .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
      .leftJoin(modules, eq(courses.id, modules.courseId))
      .leftJoin(chapters, eq(modules.id, chapters.moduleId))
      .leftJoin(chapterProgress, eq(chapters.id, chapterProgress.chapterId))
      .where(eq(courses.teacherId, validId.data))
      .groupBy(
        courses.id,
        courses.title,
        courses.description,
        courses.thumbnailUrl,
        courses.isActive,
        domains.id,
        domains.name,
        domains.color
      )
      .orderBy(desc(courses.createdAt));

    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error, "getTeacherCoursesWithStats");
  }
}

/**
 * Get recent activity for teacher's courses
 * Optimized to use a single query with UNION ALL for better performance
 *
 * @param teacherId - The teacher ID
 * @param limit - Maximum number of activities to return (default: 10)
 * @returns Result with recent activity items
 */
export async function getTeacherRecentActivity(teacherId: number, limit = 10) {
  const validId = validateId(teacherId);
  if (!validId.success) return validId as any;

  try {
    const { chapters, chapterProgress } = await import("@/drizzle/schema");
    const { sql } = await import("drizzle-orm");

    // Use a single query with UNION ALL to combine all activity types
    // This is more efficient than 3 separate queries + application-level sorting
    const allActivity = await db.execute<{
      id: number;
      type: string;
      studentId: number;
      studentName: string;
      courseTitle: string;
      chapterTitle: string | null;
      score: number | null;
      timestamp: Date;
    }>(sql`
      (
        SELECT 
          ${chapterProgress.id} as id,
          'chapter_completed' as type,
          ${users.id} as "studentId",
          ${users.name} as "studentName",
          ${courses.title} as "courseTitle",
          ${chapters.title} as "chapterTitle",
          NULL as score,
          ${chapterProgress.completedAt} as timestamp
        FROM ${chapterProgress}
        INNER JOIN ${users} ON ${chapterProgress.studentId} = ${users.id}
        INNER JOIN ${chapters} ON ${chapterProgress.chapterId} = ${chapters.id}
        INNER JOIN ${modules} ON ${chapters.moduleId} = ${modules.id}
        INNER JOIN ${courses} ON ${modules.courseId} = ${courses.id}
        WHERE ${courses.teacherId} = ${validId.data}
          AND ${chapterProgress.completedAt} IS NOT NULL
      )
      UNION ALL
      (
        SELECT 
          ${enrollments.id} as id,
          'course_enrolled' as type,
          ${users.id} as "studentId",
          ${users.name} as "studentName",
          ${courses.title} as "courseTitle",
          NULL as "chapterTitle",
          NULL as score,
          ${enrollments.createdAt} as timestamp
        FROM ${enrollments}
        INNER JOIN ${users} ON ${enrollments.studentId} = ${users.id}
        INNER JOIN ${courses} ON ${enrollments.courseId} = ${courses.id}
        WHERE ${courses.teacherId} = ${validId.data}
          AND ${enrollments.createdAt} IS NOT NULL
      )
      ORDER BY timestamp DESC
      LIMIT ${limit}
    `);

    return { success: true, data: allActivity.rows };
  } catch (error) {
    return handleDbError(error, "getTeacherRecentActivity");
  }
}

/**
 * Get detailed course information for teacher view
 * Uses query composition and parallel queries for better performance
 *
 * @param courseId - The course ID
 * @param teacherId - The teacher ID (for authorization)
 * @returns Result with detailed course information
 */
export async function getTeacherCourseDetails(
  courseId: number,
  teacherId: number
) {
  const validCourseId = validateId(courseId);
  if (!validCourseId.success) return validCourseId as any;

  const validTeacherId = validateId(teacherId);
  if (!validTeacherId.success) return validTeacherId as any;

  try {
    const { chapters, chapterProgress } = await import("@/drizzle/schema");
    const { and, sql } = await import("drizzle-orm");
    const { completedChapterCountSql } = await import("./query-builders");
    const { DbErrorCode } = await import("./types");

    // Get course basic info with teacher and domain
    const courseResult = await db
      .select({
        id: courses.id,
        title: courses.title,
        slug: courses.slug,
        description: courses.description,
        thumbnailUrl: courses.thumbnailUrl,
        isActive: courses.isActive,
        createdAt: courses.createdAt,
        updatedAt: courses.updatedAt,
        domainId: domains.id,
        domainName: domains.name,
        domainColor: domains.color,
        domainDescription: domains.description,
        teacherId: users.id,
        teacherName: users.name,
        teacherEmail: users.email,
        teacherAvatarUrl: users.avatarUrl,
        teacherBio: users.bio,
      })
      .from(courses)
      .leftJoin(domains, eq(courses.domainId, domains.id))
      .leftJoin(users, eq(courses.teacherId, users.id))
      .where(
        and(
          eq(courses.id, validCourseId.data),
          eq(courses.teacherId, validTeacherId.data)
        )
      )
      .limit(1);

    if (!courseResult[0]) {
      return {
        success: false,
        error: "Course not found or access denied",
        code: DbErrorCode.NOT_FOUND,
      };
    }

    const course = courseResult[0];

    // Execute remaining queries in parallel for better performance
    const [chaptersResult, enrollmentStats, progressStats, recentEnrollments] =
      await Promise.all([
        // Get chapters with their details (through modules)
        db
          .select({
            id: chapters.id,
            title: chapters.title,
            description: chapters.description,
            orderIndex: chapters.orderIndex,
            createdAt: chapters.createdAt,
          })
          .from(chapters)
          .innerJoin(modules, eq(chapters.moduleId, modules.id))
          .where(eq(modules.courseId, validCourseId.data))
          .orderBy(chapters.orderIndex),

        // Get enrollment statistics
        db
          .select({
            totalStudents: sql<number>`cast(count(distinct ${enrollments.studentId}) as int)`,
            completedStudents: sql<number>`cast(count(distinct case when ${enrollments.completedAt} is not null then ${enrollments.studentId} end) as int)`,
          })
          .from(enrollments)
          .where(eq(enrollments.courseId, validCourseId.data)),

        // Get progress statistics (through modules)
        db
          .select({
            totalProgress: completedChapterCountSql(),
          })
          .from(chapterProgress)
          .innerJoin(chapters, eq(chapterProgress.chapterId, chapters.id))
          .innerJoin(modules, eq(chapters.moduleId, modules.id))
          .where(eq(modules.courseId, validCourseId.data)),

        // Get recent student enrollments
        db
          .select({
            studentId: users.id,
            studentName: users.name,
            studentEmail: users.email,
            studentAvatarUrl: users.avatarUrl,
            enrolledAt: enrollments.createdAt,
            completedAt: enrollments.completedAt,
          })
          .from(enrollments)
          .innerJoin(users, eq(enrollments.studentId, users.id))
          .where(eq(enrollments.courseId, validCourseId.data))
          .orderBy(desc(enrollments.createdAt))
          .limit(10),
      ]);

    const stats = enrollmentStats[0];
    const totalChapters = chaptersResult.length;
    const totalStudents = stats.totalStudents;
    const averageProgress =
      totalChapters > 0 && totalStudents > 0
        ? Math.round(
            (progressStats[0].totalProgress / (totalChapters * totalStudents)) *
              100
          )
        : 0;

    return {
      success: true,
      data: {
        course,
        chapters: chaptersResult,
        stats: {
          totalStudents: stats.totalStudents,
          completedStudents: stats.completedStudents,
          totalChapters,
          averageProgress,
          completionRate:
            totalStudents > 0
              ? Math.round((stats.completedStudents / totalStudents) * 100)
              : 0,
        },
        recentEnrollments,
      },
    };
  } catch (error) {
    return handleDbError(error, "getTeacherCourseDetails");
  }
}

/**
 * Get teacher's dashboard summary
 * Uses parallel queries (Promise.all) for better performance
 *
 * @param teacherId - The teacher ID
 * @returns Result with comprehensive dashboard data
 *
 * @performance
 * - Complexity: O(n) where n = total students across all courses
 * - Executes 3 queries in parallel to reduce latency
 * - Each sub-query is optimized with aggregations
 * - Recommended: Cache results with 5-minute TTL
 * - Typical response time: 100-300ms for teachers with <100 students
 *
 * @example
 * ```typescript
 * const result = await getTeacherDashboardSummary(teacherId);
 * if (result.success) {
 *   console.log(`Total courses: ${result.data.courses.length}`);
 *   console.log(`Total students: ${result.data.students.totalStudents}`);
 * }
 * ```
 */
export async function getTeacherDashboardSummary(teacherId: number) {
  const validId = validateId(teacherId);
  if (!validId.success) return validId as any;

  try {
    const { getTeacherStudentsStats } = await import("./user-queries");

    // Execute all queries in parallel for better performance
    const [coursesResult, studentsResult, activityResult] = await Promise.all([
      getTeacherCoursesWithStats(validId.data),
      getTeacherStudentsStats(validId.data),
      getTeacherRecentActivity(validId.data),
    ]);

    // Check if any query failed
    if (!coursesResult.success) {
      return {
        success: false,
        error: `Failed to fetch courses: ${coursesResult.error}`,
      };
    }
    if (!studentsResult.success) {
      return {
        success: false,
        error: `Failed to fetch students: ${studentsResult.error}`,
      };
    }
    if (!activityResult.success) {
      return {
        success: false,
        error: `Failed to fetch activity: ${activityResult.error}`,
      };
    }

    const courses = coursesResult.data;
    const students = studentsResult.data;

    // Calculate statistics
    const totalCourses = courses.length;
    const activeCourses = courses.filter((c: any) => c.courseIsActive).length;
    const totalStudents = students.length;

    // Get unique students active this month (based on recent activity)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const activeStudents = activityResult.data
      .filter((activity: any) => {
        if (!activity.timestamp) return false;
        return new Date(activity.timestamp) > oneMonthAgo;
      })
      .map((activity: any) => activity.studentId)
      .filter(
        (id: any, index: number, arr: any[]) => arr.indexOf(id) === index
      ).length;

    // Get top performing students (by progress percentage)
    const topStudents = students
      .map((student: any) => ({
        ...student,
        progressPercentage:
          student.totalChapters > 0
            ? Math.round((student.totalProgress / student.totalChapters) * 100)
            : 0,
      }))
      .sort((a: any, b: any) => b.progressPercentage - a.progressPercentage)
      .slice(0, 3);

    return {
      success: true,
      data: {
        stats: {
          totalCourses,
          activeCourses,
          totalStudents,
          activeStudents,
        },
        courses,
        topStudents,
        recentActivity: activityResult.data,
      },
    };
  } catch (error) {
    return handleDbError(error, "getTeacherDashboardSummary");
  }
}
