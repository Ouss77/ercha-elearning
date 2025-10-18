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
