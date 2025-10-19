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
} from "@/drizzle/schema";

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

// Get student enrolled courses with progress
export async function getStudentEnrolledCoursesWithProgress(studentId: number) {
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
        totalChapters: sql<number>`cast(count(distinct ${chapters.id}) as int)`,
        completedChapters: sql<number>`cast(count(distinct ${chapterProgress.id}) as int)`,
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
          eq(chapterProgress.studentId, studentId)
        )
      )
      .where(eq(enrollments.studentId, studentId))
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
