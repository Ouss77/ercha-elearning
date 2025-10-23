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

// User queries
export {
  getUserByEmail,
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  getTeachers,
  validateTeacherAssignment,
  getTeacherStudentsStats,
  getTeacherStudents,
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
  getTeacherCoursesWithStats,
  getTeacherRecentActivity,
  getTeacherCourseDetails,
  getTeacherDashboardSummary,
} from "./course-queries";

// Enrollment queries
export {
  getEnrollmentById,
  getEnrollmentsByStudentId,
  getEnrollmentsByCourseId,
  createEnrollment,
  getStudentEnrolledCoursesWithProgress,
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

// Class queries
export {
  createClass,
  getAllClasses,
  getTeacherClasses,
  getClassDetails,
  getClassStudents,
  addStudentToClass,
  removeStudentFromClass,
  updateClass,
  deleteClass,
  getClassById,
  assignCourseToClass,
  removeCourseFromClass,
  getClassCourses,
  autoEnrollStudentInClassCourses,
} from "./class-queries";

// Progress queries
export {
  getChapterProgress,
  getStudentProgressByCourse,
  markChapterComplete,
  unmarkChapterComplete,
} from "./progress-queries";

// Note: Quiz functionality has been moved to content_items system
// Quizzes are now content items with contentType="quiz"
// Quiz attempts are tracked in content_item_attempts

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
  getTeacherProjectSubmissions,
} from "./project-queries";

// Class Management Types
export type {
  CreateClassData,
  ClassWithStats,
  ClassDetails,
} from "./class-queries";
