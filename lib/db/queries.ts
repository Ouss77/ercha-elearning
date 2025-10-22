/**
 * Central query index and complex multi-table queries
 * 
 * This module serves two purposes:
 * 1. Re-exports all domain-specific queries for backward compatibility
 * 2. Provides complex queries that span multiple domains (dashboard stats, analytics, etc.)
 * 
 * Performance notes:
 * - Dashboard queries use parallel execution where possible to reduce latency
 * - Complex queries use query composition to avoid N+1 problems
 * - Aggregations are performed at the database level for efficiency
 * 
 * @module queries
 */

// Re-export all queries from domain-specific files for backward compatibility
// This file serves as a central index for all database queries
import { eq, and, desc, sql } from "drizzle-orm";
import { db, handleDbError } from "./index";
import {
    users,
    courses,
    enrollments,
    domains,
    chapters,
    chapterProgress,
    quizzes,
    quizAttempts,
    finalProjects,
    projectSubmissions,
    classes,
    classEnrollments,
} from "@/drizzle/schema";
import { validateId } from "./validation";
import { DbErrorCode } from "./types";
import {
  chapterCountSql,
  completedChapterCountSql,
} from "./query-builders";

// User queries
export {
  getUserByEmail,
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  getTeachers,
  validateTeacherAssignment,
} from "./user-queries";

// Course queries
export {
  createCourse,
  updateCourse,
  getCourseById,
  getAllCourses,
  getCoursesByTeacherId,
  getCoursesByDomainId,
  deleteCourse,
  getCoursesWithDetails,
  getCourseWithDetails,
  courseHasEnrollments,
} from "./course-queries";

// Enrollment queries
export {
  getEnrollmentById,
  getEnrollmentsByStudentId,
  getEnrollmentsByCourseId,
  createEnrollment,
} from "./enrollment-queries";

// Domain queries
export {
  getAllDomains,
  getDomainById,
  createDomain,
  updateDomain,
  deleteDomain,
  getDomainsWithCounts,
  domainNameExists,
  domainHasCourses,
} from "./domain-queries";

// Chapter queries (from dedicated chapter-queries.ts file)
export {
  canManageChapter,
  canViewChapter,
  getChaptersByCourseId,
  getChaptersWithContent,
  createContentItem,
  updateContentItem,
  deleteContentItem,
  getContentItemById,
  getContentItemsByChapterId,
  reorderContentItems,
  getCourseIdByChapterId,
  getCourseIdByContentItemId,
} from "./chapter-queries";

// Progress queries
export {
  getChapterProgress,
  getStudentProgressByCourse,
  markChapterComplete,
  unmarkChapterComplete,
} from "./progress-queries";

// Quiz queries
export {
  getQuizById,
  getQuizzesByChapter,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizAttemptById,
  getQuizAttemptsByStudent,
  getAllQuizAttemptsByStudent,
  createQuizAttempt,
  getBestQuizAttempt,
} from "./quiz-queries";

// Project queries
export {
  getFinalProjectById,
  getFinalProjectsByCourse,
  createFinalProject,
  updateFinalProject,
  deleteFinalProject,
  getProjectSubmissionById,
  getProjectSubmissionsByStudent,
  getProjectSubmissionsByProject,
  getStudentSubmissionForProject,
  createProjectSubmission,
  updateProjectSubmission,
  deleteProjectSubmission,
} from "./project-queries";

// Get all project submissions for a teacher's courses
export async function getTeacherProjectSubmissions(teacherId: number) {
  try {
    const result = await db
      .select({
        submissionId: projectSubmissions.id,
        submissionUrl: projectSubmissions.submissionUrl,
        description: projectSubmissions.description,
        status: projectSubmissions.status,
        feedback: projectSubmissions.feedback,
        grade: projectSubmissions.grade,
        submittedAt: projectSubmissions.submittedAt,
        reviewedAt: projectSubmissions.reviewedAt,

        // Student info
        studentId: users.id,
        studentName: users.name,
        studentEmail: users.email,
        studentAvatar: users.avatarUrl,

        // Project info
        projectId: finalProjects.id,
        projectTitle: finalProjects.title,
        projectDescription: finalProjects.description,

        // Course info
        courseId: courses.id,
        courseTitle: courses.title,
        courseThumbnail: courses.thumbnailUrl,

        // Domain info
        domainId: domains.id,
        domainName: domains.name,
        domainColor: domains.color,
      })
      .from(projectSubmissions)
      .innerJoin(users, eq(projectSubmissions.studentId, users.id))
      .innerJoin(
        finalProjects,
        eq(projectSubmissions.finalProjectId, finalProjects.id)
      )
      .innerJoin(courses, eq(finalProjects.courseId, courses.id))
      .leftJoin(domains, eq(courses.domainId, domains.id))
      .where(eq(courses.teacherId, teacherId))
      .orderBy(desc(projectSubmissions.submittedAt));

    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error);
  }
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
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .leftJoin(domains, eq(courses.domainId, domains.id))
      .leftJoin(users, eq(courses.teacherId, users.id))
      .leftJoin(chapters, eq(courses.id, chapters.courseId))
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
    return handleDbError(error);
  }
}

// Get student quiz attempts with course and chapter details
export async function getStudentQuizAttemptsWithDetails(studentId: number) {
  try {
    const result = await db
      .select({
        attemptId: quizAttempts.id,
        quizId: quizzes.id,
        quizTitle: quizzes.title,
        score: quizAttempts.score,
        maxScore: quizzes.passingScore,
        passed: quizAttempts.passed,
        attemptedAt: quizAttempts.attemptedAt,
        chapterId: chapters.id,
        chapterTitle: chapters.title,
        courseId: courses.id,
        courseTitle: courses.title,
        domainName: domains.name,
      })
      .from(quizAttempts)
      .innerJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
      .innerJoin(chapters, eq(quizzes.chapterId, chapters.id))
      .innerJoin(courses, eq(chapters.courseId, courses.id))
      .leftJoin(domains, eq(courses.domainId, domains.id))
      .where(eq(quizAttempts.studentId, studentId))
      .orderBy(desc(quizAttempts.attemptedAt));

    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error);
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
      .leftJoin(chapters, eq(courses.id, chapters.courseId))
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
    return handleDbError(error);
  }
}

/**
 * Get teacher's students statistics
 * Aggregates student progress across all teacher's courses
 * 
 * @param teacherId - The teacher ID
 * @returns Result with student statistics
 */
export async function getTeacherStudentsStats(teacherId: number) {
  const validId = validateId(teacherId);
  if (!validId.success) return validId as any;

  try {
    // Get all unique students enrolled in teacher's courses
    const studentsResult = await db
      .select({
        studentId: users.id,
        studentName: users.name,
        studentEmail: users.email,
        studentAvatarUrl: users.avatarUrl,
        totalCourses: sql<number>`cast(count(distinct ${enrollments.courseId}) as int)`,
        totalProgress: completedChapterCountSql(),
        totalChapters: chapterCountSql(),
        completedCourses: sql<number>`cast(count(distinct case when ${enrollments.completedAt} is not null then ${enrollments.id} end) as int)`,
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .innerJoin(users, eq(enrollments.studentId, users.id))
      .leftJoin(chapters, eq(courses.id, chapters.courseId))
      .leftJoin(
        chapterProgress,
        and(
          eq(chapterProgress.chapterId, chapters.id),
          eq(chapterProgress.studentId, enrollments.studentId)
        )
      )
      .where(eq(courses.teacherId, validId.data))
      .groupBy(users.id, users.name, users.email, users.avatarUrl)
      .orderBy(desc(completedChapterCountSql()));

    return { success: true, data: studentsResult };
  } catch (error) {
    return handleDbError(error);
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
          ${quizAttempts.id} as id,
          'quiz_completed' as type,
          ${users.id} as "studentId",
          ${users.name} as "studentName",
          ${courses.title} as "courseTitle",
          ${chapters.title} as "chapterTitle",
          ${quizAttempts.score} as score,
          ${quizAttempts.attemptedAt} as timestamp
        FROM ${quizAttempts}
        INNER JOIN ${users} ON ${quizAttempts.studentId} = ${users.id}
        INNER JOIN ${quizzes} ON ${quizAttempts.quizId} = ${quizzes.id}
        INNER JOIN ${chapters} ON ${quizzes.chapterId} = ${chapters.id}
        INNER JOIN ${courses} ON ${chapters.courseId} = ${courses.id}
        WHERE ${courses.teacherId} = ${validId.data}
          AND ${quizAttempts.attemptedAt} IS NOT NULL
      )
      UNION ALL
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
        INNER JOIN ${courses} ON ${chapters.courseId} = ${courses.id}
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
    return handleDbError(error);
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
    // Execute all queries in parallel for better performance
    const [coursesResult, studentsResult, activityResult] = await Promise.all([
      getTeacherCoursesWithStats(validId.data),
      getTeacherStudentsStats(validId.data),
      getTeacherRecentActivity(validId.data),
    ]);

    // Check if any query failed
    if (!coursesResult.success) {
      return { success: false, error: `Failed to fetch courses: ${coursesResult.error}` };
    }
    if (!studentsResult.success) {
      return { success: false, error: `Failed to fetch students: ${studentsResult.error}` };
    }
    if (!activityResult.success) {
      return { success: false, error: `Failed to fetch activity: ${activityResult.error}` };
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
      .filter((id: any, index: number, arr: any[]) => arr.indexOf(id) === index).length;

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
    return handleDbError(error);
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
      .where(and(eq(courses.id, validCourseId.data), eq(courses.teacherId, validTeacherId.data)))
      .limit(1);

    if (!courseResult[0]) {
      return { success: false, error: "Course not found or access denied", code: DbErrorCode.NOT_FOUND };
    }

    const course = courseResult[0];

    // Execute remaining queries in parallel for better performance
    const [chaptersResult, enrollmentStats, progressStats, recentEnrollments] = await Promise.all([
      // Get chapters with their details
      db
        .select({
          id: chapters.id,
          title: chapters.title,
          description: chapters.description,
          orderIndex: chapters.orderIndex,
          createdAt: chapters.createdAt,
        })
        .from(chapters)
        .where(eq(chapters.courseId, validCourseId.data))
        .orderBy(chapters.orderIndex),

      // Get enrollment statistics
      db
        .select({
          totalStudents: sql<number>`cast(count(distinct ${enrollments.studentId}) as int)`,
          completedStudents: sql<number>`cast(count(distinct case when ${enrollments.completedAt} is not null then ${enrollments.studentId} end) as int)`,
        })
        .from(enrollments)
        .where(eq(enrollments.courseId, validCourseId.data)),

      // Get progress statistics
      db
        .select({
          totalProgress: completedChapterCountSql(),
        })
        .from(chapterProgress)
        .innerJoin(chapters, eq(chapterProgress.chapterId, chapters.id))
        .where(eq(chapters.courseId, validCourseId.data)),

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
    return handleDbError(error);
  }
}

/**
 * Get all students enrolled in teacher's courses
 * Optimized to reduce N+1 queries by using parallel queries and efficient joins
 * 
 * @param teacherId - The teacher ID
 * @returns Result with enriched student data including progress and quiz stats
 */
export async function getTeacherStudents(teacherId: number) {
  const validId = validateId(teacherId);
  if (!validId.success) return validId as any;

  try {
    // Execute all queries in parallel to avoid sequential N+1 queries
    const [studentsResult, courseChapters, courseQuizzes, quizStats] = await Promise.all([
      // Main student query with enrollment and progress data
      db
        .select({
          studentId: users.id,
          studentName: users.name,
          studentEmail: users.email,
          studentAvatarUrl: users.avatarUrl,
          studentPhone: users.phone,
          studentCity: users.city,
          courseId: courses.id,
          courseTitle: courses.title,
          courseThumbnailUrl: courses.thumbnailUrl,
          domainId: domains.id,
          domainName: domains.name,
          domainColor: domains.color,
          enrolledAt: enrollments.createdAt,
          completedAt: enrollments.completedAt,
          lastActivityDate: sql<Date | null>`MAX(${chapterProgress.completedAt})`,
          chaptersCompleted: sql<number>`cast(count(distinct ${chapterProgress.chapterId}) as int)`,
        })
        .from(enrollments)
        .innerJoin(users, eq(enrollments.studentId, users.id))
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .leftJoin(domains, eq(courses.domainId, domains.id))
        .leftJoin(
          chapterProgress,
          and(
            eq(chapterProgress.studentId, enrollments.studentId),
            sql`${chapterProgress.chapterId} IN (SELECT id FROM ${chapters} WHERE course_id = ${courses.id})`
          )
        )
        .where(eq(courses.teacherId, validId.data))
        .groupBy(
          users.id,
          users.name,
          users.email,
          users.avatarUrl,
          users.phone,
          users.city,
          courses.id,
          courses.title,
          courses.thumbnailUrl,
          domains.id,
          domains.name,
          domains.color,
          enrollments.createdAt,
          enrollments.completedAt
        )
        .orderBy(desc(enrollments.createdAt)),

      // Get total chapters for each course
      db
        .select({
          courseId: chapters.courseId,
          totalChapters: sql<number>`cast(count(*) as int)`,
        })
        .from(chapters)
        .groupBy(chapters.courseId),

      // Get total quizzes for each course
      db
        .select({
          courseId: courses.id,
          totalQuizzes: sql<number>`cast(count(distinct ${quizzes.id}) as int)`,
        })
        .from(quizzes)
        .innerJoin(chapters, eq(quizzes.chapterId, chapters.id))
        .innerJoin(courses, eq(chapters.courseId, courses.id))
        .where(eq(courses.teacherId, validId.data))
        .groupBy(courses.id),

      // Get quiz statistics for each student
      db
        .select({
          studentId: quizAttempts.studentId,
          courseId: courses.id,
          averageScore: sql<number>`cast(avg(${quizAttempts.score}) as int)`,
          quizzesCompleted: sql<number>`cast(count(distinct ${quizAttempts.quizId}) as int)`,
        })
        .from(quizAttempts)
        .innerJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
        .innerJoin(chapters, eq(quizzes.chapterId, chapters.id))
        .innerJoin(courses, eq(chapters.courseId, courses.id))
        .where(eq(courses.teacherId, validId.data))
        .groupBy(quizAttempts.studentId, courses.id),
    ]);

    // Create lookup maps for efficient data enrichment
    const chapterMap = new Map(
      courseChapters.map((c) => [c.courseId, c.totalChapters])
    );

    const quizTotalMap = new Map(
      courseQuizzes.map((q) => [q.courseId, q.totalQuizzes])
    );

    const quizStatsMap = new Map(
      quizStats.map((q) => [`${q.studentId}-${q.courseId}`, q])
    );

    // Enrich student data with aggregated statistics
    const enrichedStudents = studentsResult.map((student) => {
      const totalChapters = chapterMap.get(student.courseId) || 0;
      const progress =
        totalChapters > 0
          ? Math.round((student.chaptersCompleted / totalChapters) * 100)
          : 0;

      const quizData = quizStatsMap.get(
        `${student.studentId}-${student.courseId}`
      );

      const totalQuizzes = quizTotalMap.get(student.courseId) || 0;

      // Determine status based on activity and progress
      const daysSinceActivity = student.lastActivityDate
        ? Math.floor(
            (Date.now() - new Date(student.lastActivityDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 999;

      let status: "active" | "inactive" | "struggling";
      if (daysSinceActivity > 7) {
        status = "inactive";
      } else if (progress < 30 && daysSinceActivity > 3) {
        status = "struggling";
      } else {
        status = "active";
      }

      return {
        ...student,
        totalChapters,
        progress,
        averageQuizScore: quizData?.averageScore || 0,
        quizzesCompleted: quizData?.quizzesCompleted || 0,
        totalQuizzes,
        testsCompleted: 0, // TODO: Implement when test entity is added
        totalTests: 0, // TODO: Implement when test entity is added
        status,
      };
    });

    return { success: true, data: enrichedStudents };
  } catch (error) {
    return handleDbError(error);
  }
}

// Class Management Functions
export {
  createClass,
  getTeacherClasses,
  getClassDetails,
  addStudentToClass,
  removeStudentFromClass,
  updateClass,
  deleteClass,
  getClassById,
} from './class-queries';

export type {
  CreateClassData,
  ClassWithStats,
  ClassDetails,
} from './class-queries';
