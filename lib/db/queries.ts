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
      .innerJoin(courses, eq(enrollments.courseId, courses.id));

    // Fetch all trainer courses in a single query
    const allTrainerCourses = await db
      .select({
        teacherId: courses.teacherId,
        courseSlug: courses.slug,
      })
      .from(courses)
      .where(sql`${courses.teacherId} IS NOT NULL`);

    // Create lookup maps for fast access
    const studentEnrollmentMap = new Map<number, string[]>();
    allStudentEnrollments.forEach(({ studentId, courseSlug }) => {
      if (studentId) {
        if (!studentEnrollmentMap.has(studentId)) {
          studentEnrollmentMap.set(studentId, []);
        }
        studentEnrollmentMap.get(studentId)!.push(courseSlug);
      }
    });

    const trainerCoursesMap = new Map<number, string[]>();
    allTrainerCourses.forEach(({ teacherId, courseSlug }) => {
      if (teacherId) {
        if (!trainerCoursesMap.has(teacherId)) {
          trainerCoursesMap.set(teacherId, []);
        }
        trainerCoursesMap.get(teacherId)!.push(courseSlug);
      }
    });

    // Map users with their courses
    const usersWithCourses = usersResult.map((user) => {
      const mappedUser = mapUserFromDb(user);
      if (!mappedUser) return null;

      let enrolledCourses: string[] = [];
      if (user.role === "STUDENT") {
        enrolledCourses = studentEnrollmentMap.get(user.id) || [];
      } else if (user.role === "TRAINER") {
        enrolledCourses = trainerCoursesMap.get(user.id) || [];
      }

      return {
        ...mappedUser,
        enrolledCourses,
      };
    });

    const filteredUsers = usersWithCourses.filter((u): u is User & { enrolledCourses: string[] } => u !== null);
    return { success: true as const, data: filteredUsers };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function updateUser(
  id: number,
  data: Partial<{
    email: string;
    password: string;
    name: string;
    role: "STUDENT" | "TRAINER" | "SUB_ADMIN" | "ADMIN";
    avatarUrl: string | null;
    isActive: boolean;
    phone: string | null;
    dateOfBirth: Date | null;
    address: string | null;
    city: string | null;
    postalCode: string | null;
    country: string | null;
    bio: string | null;
  }>
) {
  try {
    // Hash password if it's being updated
    let dataToUpdate = { ...data };
    if (data.password && data.password.trim() !== "") {
      dataToUpdate.password = await hash(data.password, 10);
    }

    const result = await db
      .update(users)
      .set(dataToUpdate)
      .where(eq(users.id, id))
      .returning();

    const mappedUser = mapUserFromDb(result[0]);
    return { success: true, data: mappedUser };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getTeachers() {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.role, "TRAINER"));

    const mappedUsers = result
      .map(mapUserFromDb)
      .filter((u): u is User => u !== null);
    return { success: true, data: mappedUsers };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function validateTeacherAssignment(teacherId: number) {
  try {
    const result = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(and(eq(users.id, teacherId), eq(users.role, "TRAINER")))
      .limit(1);

    return { success: true, data: result.length > 0 };
  } catch (error) {
    return handleDbError(error);
  }
}

// Course query functions
export async function createCourse(data: {
  title: string;
  description?: string | null;
  domainId: number;
  teacherId?: number | null;
  thumbnailUrl?: string | null;
  isActive?: boolean;
}) {
  try {
    // Generate base slug from title
    const baseSlug = generateSlug(data.title);

    // Get existing slugs to ensure uniqueness
    const existingCourses = await db.select({ slug: courses.slug }).from(courses);
    const existingSlugs = existingCourses.map(c => c.slug);

    // Generate unique slug
    const slug = generateUniqueSlug(baseSlug, existingSlugs);

    const result = await db
      .insert(courses)
      .values({
        title: data.title,
        slug,
        description: data.description,
        domainId: data.domainId,
        teacherId: data.teacherId,
        thumbnailUrl: data.thumbnailUrl,
        isActive: data.isActive ?? false, // Default to false for new courses
      })
      .returning();

    const mappedCourse = mapCourseFromDb(result[0]);
    return { success: true, data: mappedCourse };
  } catch (error) {
    return handleDbError(error);
  }
}

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
) {
  try {
    let updateData: any = { ...data, updatedAt: new Date() };

    // If title is being updated, regenerate slug
    if (data.title) {
      const baseSlug = generateSlug(data.title);

      // Get existing slugs (excluding current course)
      const existingCourses = await db
        .select({ slug: courses.slug })
        .from(courses)
        .where(ne(courses.id, id));
      const existingSlugs = existingCourses.map(c => c.slug);

      // Generate unique slug
      updateData.slug = generateUniqueSlug(baseSlug, existingSlugs);
    }

    const result = await db
      .update(courses)
      .set(updateData)
      .where(eq(courses.id, id))
      .returning();

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

// Get teacher's courses with enrollment and progress statistics
export async function getTeacherCoursesWithStats(teacherId: number) {
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
        totalChapters: sql<number>`cast(count(distinct ${chapters.id}) as int)`,
        completedEnrollments: sql<number>`cast(count(distinct case when ${enrollments.completedAt} is not null then ${enrollments.id} end) as int)`,
        totalProgress: sql<number>`cast(count(distinct ${chapterProgress.id}) as int)`,
      })
      .from(courses)
      .leftJoin(domains, eq(courses.domainId, domains.id))
      .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
      .leftJoin(chapters, eq(courses.id, chapters.courseId))
      .leftJoin(chapterProgress, eq(chapters.id, chapterProgress.chapterId))
      .where(eq(courses.teacherId, teacherId))
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

// Get teacher's students statistics
export async function getTeacherStudentsStats(teacherId: number) {
  try {
    // Get all unique students enrolled in teacher's courses
    const studentsResult = await db
      .select({
        studentId: users.id,
        studentName: users.name,
        studentEmail: users.email,
        studentAvatarUrl: users.avatarUrl,
        totalCourses: sql<number>`cast(count(distinct ${enrollments.courseId}) as int)`,
        totalProgress: sql<number>`cast(count(distinct ${chapterProgress.id}) as int)`,
        totalChapters: sql<number>`cast(count(distinct ${chapters.id}) as int)`,
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
      .where(eq(courses.teacherId, teacherId))
      .groupBy(users.id, users.name, users.email, users.avatarUrl)
      .orderBy(desc(sql`cast(count(distinct ${chapterProgress.id}) as int)`));

    return { success: true, data: studentsResult };
  } catch (error) {
    return handleDbError(error);
  }
}

// Get recent activity for teacher's courses
export async function getTeacherRecentActivity(teacherId: number, limit = 10) {
  try {
    // Get recent quiz attempts
    const quizActivity = await db
      .select({
        id: quizAttempts.id,
        type: sql<string>`'quiz_completed'`,
        studentId: users.id,
        studentName: users.name,
        courseTitle: courses.title,
        chapterTitle: chapters.title,
        score: quizAttempts.score,
        timestamp: quizAttempts.attemptedAt,
      })
      .from(quizAttempts)
      .innerJoin(users, eq(quizAttempts.studentId, users.id))
      .innerJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
      .innerJoin(chapters, eq(quizzes.chapterId, chapters.id))
      .innerJoin(courses, eq(chapters.courseId, courses.id))
      .where(eq(courses.teacherId, teacherId))
      .orderBy(desc(quizAttempts.attemptedAt))
      .limit(limit);

    // Get recent chapter completions
    const chapterActivity = await db
      .select({
        id: chapterProgress.id,
        type: sql<string>`'chapter_completed'`,
        studentId: users.id,
        studentName: users.name,
        courseTitle: courses.title,
        chapterTitle: chapters.title,
        score: sql<number>`null`,
        timestamp: chapterProgress.completedAt,
      })
      .from(chapterProgress)
      .innerJoin(users, eq(chapterProgress.studentId, users.id))
      .innerJoin(chapters, eq(chapterProgress.chapterId, chapters.id))
      .innerJoin(courses, eq(chapters.courseId, courses.id))
      .where(eq(courses.teacherId, teacherId))
      .orderBy(desc(chapterProgress.completedAt))
      .limit(limit);

    // Get recent enrollments
    const enrollmentActivity = await db
      .select({
        id: enrollments.id,
        type: sql<string>`'course_enrolled'`,
        studentId: users.id,
        studentName: users.name,
        courseTitle: courses.title,
        chapterTitle: sql<string>`null`,
        score: sql<number>`null`,
        timestamp: enrollments.createdAt,
      })
      .from(enrollments)
      .innerJoin(users, eq(enrollments.studentId, users.id))
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(courses.teacherId, teacherId))
      .orderBy(desc(enrollments.createdAt))
      .limit(limit);

    // Combine and sort all activities
    const allActivity = [
      ...quizActivity,
      ...chapterActivity,
      ...enrollmentActivity,
    ]
      .filter((activity) => activity.timestamp !== null)
      .sort(
        (a, b) =>
          new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime()
      )
      .slice(0, limit);

    return { success: true, data: allActivity };
  } catch (error) {
    return handleDbError(error);
  }
}

// Get teacher's dashboard summary
export async function getTeacherDashboardSummary(teacherId: number) {
  try {
    const coursesResult = await getTeacherCoursesWithStats(teacherId);
    const studentsResult = await getTeacherStudentsStats(teacherId);
    const activityResult = await getTeacherRecentActivity(teacherId);

    if (
      !coursesResult.success ||
      !studentsResult.success ||
      !activityResult.success
    ) {
      return { success: false, error: "Failed to fetch dashboard data" };
    }

    const courses = coursesResult.data;
    const students = studentsResult.data;

    // Calculate statistics
    const totalCourses = courses.length;
    const activeCourses = courses.filter((c) => c.courseIsActive).length;
    const totalStudents = students.length;

    // Get unique students active this month (based on recent activity)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const activeStudents = activityResult.data
      .filter((activity) => {
        if (!activity.timestamp) return false;
        return new Date(activity.timestamp) > oneMonthAgo;
      })
      .map((activity) => activity.studentId)
      .filter((id, index, arr) => arr.indexOf(id) === index).length;

    // Get top performing students (by progress percentage)
    const topStudents = students
      .map((student) => ({
        ...student,
        progressPercentage:
          student.totalChapters > 0
            ? Math.round((student.totalProgress / student.totalChapters) * 100)
            : 0,
      }))
      .sort((a, b) => b.progressPercentage - a.progressPercentage)
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

// Get detailed course information for teacher view
export async function getTeacherCourseDetails(
  courseId: number,
  teacherId: number
) {
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
      .where(and(eq(courses.id, courseId), eq(courses.teacherId, teacherId)))
      .limit(1);

    if (!courseResult[0]) {
      return { success: false, error: "Course not found or access denied" };
    }

    const course = courseResult[0];

    // Get chapters with their details
    const chaptersResult = await db
      .select({
        id: chapters.id,
        title: chapters.title,
        description: chapters.description,
        orderIndex: chapters.orderIndex,
        contentType: chapters.contentType,
        createdAt: chapters.createdAt,
      })
      .from(chapters)
      .where(eq(chapters.courseId, courseId))
      .orderBy(chapters.orderIndex);

    // Get enrollment statistics
    const enrollmentStats = await db
      .select({
        totalStudents: sql<number>`cast(count(distinct ${enrollments.studentId}) as int)`,
        completedStudents: sql<number>`cast(count(distinct case when ${enrollments.completedAt} is not null then ${enrollments.studentId} end) as int)`,
      })
      .from(enrollments)
      .where(eq(enrollments.courseId, courseId));

    // Get progress statistics
    const progressStats = await db
      .select({
        totalProgress: sql<number>`cast(count(distinct ${chapterProgress.id}) as int)`,
      })
      .from(chapterProgress)
      .innerJoin(chapters, eq(chapterProgress.chapterId, chapters.id))
      .where(eq(chapters.courseId, courseId));

    // Get recent student enrollments
    const recentEnrollments = await db
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
      .where(eq(enrollments.courseId, courseId))
      .orderBy(desc(enrollments.createdAt))
      .limit(10);

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

// Get all students enrolled in teacher's courses
export async function getTeacherStudents(teacherId: number) {
  try {
    const studentsResult = await db
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
      .where(eq(courses.teacherId, teacherId))
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
      .orderBy(desc(enrollments.createdAt));

    // Get total chapters for each course
    const courseChapters = await db
      .select({
        courseId: chapters.courseId,
        totalChapters: sql<number>`cast(count(*) as int)`,
      })
      .from(chapters)
      .groupBy(chapters.courseId);

    const chapterMap = new Map(
      courseChapters.map((c) => [c.courseId, c.totalChapters])
    );

    // Get quiz statistics for each student
    const quizStats = await db
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
      .where(eq(courses.teacherId, teacherId))
      .groupBy(quizAttempts.studentId, courses.id);

    const quizStatsMap = new Map(
      quizStats.map((q) => [`${q.studentId}-${q.courseId}`, q])
    );

    // Combine data
    const enrichedStudents = studentsResult.map((student) => {
      const totalChapters = chapterMap.get(student.courseId) || 0;
      const progress =
        totalChapters > 0
          ? Math.round((student.chaptersCompleted / totalChapters) * 100)
          : 0;

      const quizData =
        quizStatsMap.get(`${student.studentId}-${student.courseId}`) || {};

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
        averageQuizScore: quizData.averageScore || 0,
        quizzesCompleted: quizData.quizzesCompleted || 0,
        status,
      };
    });

    return { success: true, data: enrichedStudents };
  } catch (error) {
    return handleDbError(error);
  }
}

// Class Management Functions

// Create a new class
export async function createClass(data: {
  name: string;
  description?: string;
  teacherId: number;
  domainId?: number;
  maxStudents?: number;
}) {
  try {
    const result = await db
      .insert(classes)
      .values({
        name: data.name,
        description: data.description,
        teacherId: data.teacherId,
        domainId: data.domainId,
        maxStudents: data.maxStudents,
        isActive: true,
      })
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

// Get all classes for a teacher
export async function getTeacherClasses(teacherId: number) {
  try {
    const result = await db
      .select({
        id: classes.id,
        name: classes.name,
        description: classes.description,
        domainId: domains.id,
        domainName: domains.name,
        domainColor: domains.color,
        isActive: classes.isActive,
        maxStudents: classes.maxStudents,
        createdAt: classes.createdAt,
        studentCount: sql<number>`cast(count(distinct ${classEnrollments.studentId}) as int)`,
      })
      .from(classes)
      .leftJoin(domains, eq(classes.domainId, domains.id))
      .leftJoin(classEnrollments, eq(classEnrollments.classId, classes.id))
      .where(eq(classes.teacherId, teacherId))
      .groupBy(
        classes.id,
        classes.name,
        classes.description,
        classes.isActive,
        classes.maxStudents,
        classes.createdAt,
        domains.id,
        domains.name,
        domains.color
      )
      .orderBy(desc(classes.createdAt));

    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error);
  }
}

// Get class details with enrolled students
export async function getClassDetails(classId: number, teacherId: number) {
  try {
    // Get class info
    const classInfo = await db
      .select({
        id: classes.id,
        name: classes.name,
        description: classes.description,
        domainId: domains.id,
        domainName: domains.name,
        domainColor: domains.color,
        isActive: classes.isActive,
        maxStudents: classes.maxStudents,
        createdAt: classes.createdAt,
      })
      .from(classes)
      .leftJoin(domains, eq(classes.domainId, domains.id))
      .where(and(eq(classes.id, classId), eq(classes.teacherId, teacherId)))
      .limit(1);

    if (!classInfo[0]) {
      return { success: false, error: "Class not found or access denied" };
    }

    // Get enrolled students
    const students = await db
      .select({
        studentId: users.id,
        studentName: users.name,
        studentEmail: users.email,
        studentAvatarUrl: users.avatarUrl,
        studentPhone: users.phone,
        enrolledAt: classEnrollments.enrolledAt,
      })
      .from(classEnrollments)
      .innerJoin(users, eq(classEnrollments.studentId, users.id))
      .where(eq(classEnrollments.classId, classId))
      .orderBy(desc(classEnrollments.enrolledAt));

    return {
      success: true,
      data: {
        class: classInfo[0],
        students,
        studentCount: students.length,
      },
    };
  } catch (error) {
    return handleDbError(error);
  }
}

// Add student to class
export async function addStudentToClass(classId: number, studentId: number) {
  try {
    // Check if student is already enrolled
    const existing = await db
      .select()
      .from(classEnrollments)
      .where(
        and(
          eq(classEnrollments.classId, classId),
          eq(classEnrollments.studentId, studentId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return {
        success: false,
        error: "Student already enrolled in this class",
      };
    }

    // Check class capacity
    const classData = await db
      .select({
        maxStudents: classes.maxStudents,
        currentCount: sql<number>`cast(count(${classEnrollments.studentId}) as int)`,
      })
      .from(classes)
      .leftJoin(classEnrollments, eq(classEnrollments.classId, classes.id))
      .where(eq(classes.id, classId))
      .groupBy(classes.id, classes.maxStudents)
      .limit(1);

    if (
      classData[0]?.maxStudents &&
      classData[0].currentCount >= classData[0].maxStudents
    ) {
      return { success: false, error: "Class is full" };
    }

    // Add student to class
    const result = await db
      .insert(classEnrollments)
      .values({
        classId,
        studentId,
      })
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

// Remove student from class
export async function removeStudentFromClass(
  classId: number,
  studentId: number
) {
  try {
    const result = await db
      .delete(classEnrollments)
      .where(
        and(
          eq(classEnrollments.classId, classId),
          eq(classEnrollments.studentId, studentId)
        )
      )
      .returning();

    if (result.length === 0) {
      return { success: false, error: "Enrollment not found" };
    }

    return { success: true, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

// Update class
export async function updateClass(
  classId: number,
  teacherId: number,
  data: {
    name?: string;
    description?: string;
    domainId?: number;
    maxStudents?: number;
    isActive?: boolean;
  }
) {
  try {
    const result = await db
      .update(classes)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(classes.id, classId), eq(classes.teacherId, teacherId)))
      .returning();

    if (result.length === 0) {
      return { success: false, error: "Class not found or access denied" };
    }

    return { success: true, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

// Delete class
export async function deleteClass(classId: number, teacherId: number) {
  try {
    // First delete all enrollments
    await db
      .delete(classEnrollments)
      .where(eq(classEnrollments.classId, classId));

    // Then delete the class
    const result = await db
      .delete(classes)
      .where(and(eq(classes.id, classId), eq(classes.teacherId, teacherId)))
      .returning();

    if (result.length === 0) {
      return { success: false, error: "Class not found or access denied" };
    }

    return { success: true, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

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

// Get teacher's courses with enrollment and progress statistics
export async function getTeacherCoursesWithStats(teacherId: number) {
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
        totalChapters: sql<number>`cast(count(distinct ${chapters.id}) as int)`,
        completedEnrollments: sql<number>`cast(count(distinct case when ${enrollments.completedAt} is not null then ${enrollments.id} end) as int)`,
        totalProgress: sql<number>`cast(count(distinct ${chapterProgress.id}) as int)`,
      })
      .from(courses)
      .leftJoin(domains, eq(courses.domainId, domains.id))
      .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
      .leftJoin(chapters, eq(courses.id, chapters.courseId))
      .leftJoin(chapterProgress, eq(chapters.id, chapterProgress.chapterId))
      .where(eq(courses.teacherId, teacherId))
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

// Get teacher's students statistics
export async function getTeacherStudentsStats(teacherId: number) {
  try {
    // Get all unique students enrolled in teacher's courses
    const studentsResult = await db
      .select({
        studentId: users.id,
        studentName: users.name,
        studentEmail: users.email,
        studentAvatarUrl: users.avatarUrl,
        totalCourses: sql<number>`cast(count(distinct ${enrollments.courseId}) as int)`,
        totalProgress: sql<number>`cast(count(distinct ${chapterProgress.id}) as int)`,
        totalChapters: sql<number>`cast(count(distinct ${chapters.id}) as int)`,
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
      .where(eq(courses.teacherId, teacherId))
      .groupBy(users.id, users.name, users.email, users.avatarUrl)
      .orderBy(desc(sql`cast(count(distinct ${chapterProgress.id}) as int)`));

    return { success: true, data: studentsResult };
  } catch (error) {
    return handleDbError(error);
  }
}

// Get recent activity for teacher's courses
export async function getTeacherRecentActivity(teacherId: number, limit = 10) {
  try {
    // Get recent quiz attempts
    const quizActivity = await db
      .select({
        id: quizAttempts.id,
        type: sql<string>`'quiz_completed'`,
        studentId: users.id,
        studentName: users.name,
        courseTitle: courses.title,
        chapterTitle: chapters.title,
        score: quizAttempts.score,
        timestamp: quizAttempts.attemptedAt,
      })
      .from(quizAttempts)
      .innerJoin(users, eq(quizAttempts.studentId, users.id))
      .innerJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
      .innerJoin(chapters, eq(quizzes.chapterId, chapters.id))
      .innerJoin(courses, eq(chapters.courseId, courses.id))
      .where(eq(courses.teacherId, teacherId))
      .orderBy(desc(quizAttempts.attemptedAt))
      .limit(limit);

    // Get recent chapter completions
    const chapterActivity = await db
      .select({
        id: chapterProgress.id,
        type: sql<string>`'chapter_completed'`,
        studentId: users.id,
        studentName: users.name,
        courseTitle: courses.title,
        chapterTitle: chapters.title,
        score: sql<number>`null`,
        timestamp: chapterProgress.completedAt,
      })
      .from(chapterProgress)
      .innerJoin(users, eq(chapterProgress.studentId, users.id))
      .innerJoin(chapters, eq(chapterProgress.chapterId, chapters.id))
      .innerJoin(courses, eq(chapters.courseId, courses.id))
      .where(eq(courses.teacherId, teacherId))
      .orderBy(desc(chapterProgress.completedAt))
      .limit(limit);

    // Get recent enrollments
    const enrollmentActivity = await db
      .select({
        id: enrollments.id,
        type: sql<string>`'course_enrolled'`,
        studentId: users.id,
        studentName: users.name,
        courseTitle: courses.title,
        chapterTitle: sql<string>`null`,
        score: sql<number>`null`,
        timestamp: enrollments.createdAt,
      })
      .from(enrollments)
      .innerJoin(users, eq(enrollments.studentId, users.id))
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(courses.teacherId, teacherId))
      .orderBy(desc(enrollments.createdAt))
      .limit(limit);

    // Combine and sort all activities
    const allActivity = [
      ...quizActivity,
      ...chapterActivity,
      ...enrollmentActivity,
    ]
      .filter((activity) => activity.timestamp !== null)
      .sort(
        (a, b) =>
          new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime()
      )
      .slice(0, limit);

    return { success: true, data: allActivity };
  } catch (error) {
    return handleDbError(error);
  }
}

// Get teacher's dashboard summary
export async function getTeacherDashboardSummary(teacherId: number) {
  try {
    const coursesResult = await getTeacherCoursesWithStats(teacherId);
    const studentsResult = await getTeacherStudentsStats(teacherId);
    const activityResult = await getTeacherRecentActivity(teacherId);

    if (
      !coursesResult.success ||
      !studentsResult.success ||
      !activityResult.success
    ) {
      return { success: false, error: "Failed to fetch dashboard data" };
    }

    const courses = coursesResult.data;
    const students = studentsResult.data;

    // Calculate statistics
    const totalCourses = courses.length;
    const activeCourses = courses.filter((c) => c.courseIsActive).length;
    const totalStudents = students.length;

    // Get unique students active this month (based on recent activity)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const activeStudents = activityResult.data
      .filter((activity) => {
        if (!activity.timestamp) return false;
        return new Date(activity.timestamp) > oneMonthAgo;
      })
      .map((activity) => activity.studentId)
      .filter((id, index, arr) => arr.indexOf(id) === index).length;

    // Get top performing students (by progress percentage)
    const topStudents = students
      .map((student) => ({
        ...student,
        progressPercentage:
          student.totalChapters > 0
            ? Math.round((student.totalProgress / student.totalChapters) * 100)
            : 0,
      }))
      .sort((a, b) => b.progressPercentage - a.progressPercentage)
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

// Get detailed course information for teacher view
export async function getTeacherCourseDetails(
  courseId: number,
  teacherId: number
) {
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
      .where(and(eq(courses.id, courseId), eq(courses.teacherId, teacherId)))
      .limit(1);

    if (!courseResult[0]) {
      return { success: false, error: "Course not found or access denied" };
    }

    const course = courseResult[0];

    // Get chapters with their details
    const chaptersResult = await db
      .select({
        id: chapters.id,
        title: chapters.title,
        description: chapters.description,
        orderIndex: chapters.orderIndex,
        contentType: chapters.contentType,
        createdAt: chapters.createdAt,
      })
      .from(chapters)
      .where(eq(chapters.courseId, courseId))
      .orderBy(chapters.orderIndex);

    // Get enrollment statistics
    const enrollmentStats = await db
      .select({
        totalStudents: sql<number>`cast(count(distinct ${enrollments.studentId}) as int)`,
        completedStudents: sql<number>`cast(count(distinct case when ${enrollments.completedAt} is not null then ${enrollments.studentId} end) as int)`,
      })
      .from(enrollments)
      .where(eq(enrollments.courseId, courseId));

    // Get progress statistics
    const progressStats = await db
      .select({
        totalProgress: sql<number>`cast(count(distinct ${chapterProgress.id}) as int)`,
      })
      .from(chapterProgress)
      .innerJoin(chapters, eq(chapterProgress.chapterId, chapters.id))
      .where(eq(chapters.courseId, courseId));

    // Get recent student enrollments
    const recentEnrollments = await db
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
      .where(eq(enrollments.courseId, courseId))
      .orderBy(desc(enrollments.createdAt))
      .limit(10);

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

// Get all students enrolled in teacher's courses
export async function getTeacherStudents(teacherId: number) {
  try {
    const studentsResult = await db
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
      .where(eq(courses.teacherId, teacherId))
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
      .orderBy(desc(enrollments.createdAt));

    // Get total chapters for each course
    const courseChapters = await db
      .select({
        courseId: chapters.courseId,
        totalChapters: sql<number>`cast(count(*) as int)`,
      })
      .from(chapters)
      .groupBy(chapters.courseId);

    const chapterMap = new Map(
      courseChapters.map((c) => [c.courseId, c.totalChapters])
    );

    // Get quiz statistics for each student
    const quizStats = await db
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
      .where(eq(courses.teacherId, teacherId))
      .groupBy(quizAttempts.studentId, courses.id);

    const quizStatsMap = new Map(
      quizStats.map((q) => [`${q.studentId}-${q.courseId}`, q])
    );

    // Combine data
    const enrichedStudents = studentsResult.map((student) => {
      const totalChapters = chapterMap.get(student.courseId) || 0;
      const progress =
        totalChapters > 0
          ? Math.round((student.chaptersCompleted / totalChapters) * 100)
          : 0;

      const quizData =
        quizStatsMap.get(`${student.studentId}-${student.courseId}`) || {};

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
        averageQuizScore: quizData.averageScore || 0,
        quizzesCompleted: quizData.quizzesCompleted || 0,
        status,
      };
    });

    return { success: true, data: enrichedStudents };
  } catch (error) {
    return handleDbError(error);
  }
}

// Class Management Functions

// Create a new class
export async function createClass(data: {
  name: string;
  description?: string;
  teacherId: number;
  domainId?: number;
  maxStudents?: number;
}) {
  try {
    const result = await db
      .insert(classes)
      .values({
        name: data.name,
        description: data.description,
        teacherId: data.teacherId,
        domainId: data.domainId,
        maxStudents: data.maxStudents,
        isActive: true,
      })
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

// Get all classes for a teacher
export async function getTeacherClasses(teacherId: number) {
  try {
    const result = await db
      .select({
        id: classes.id,
        name: classes.name,
        description: classes.description,
        domainId: domains.id,
        domainName: domains.name,
        domainColor: domains.color,
        isActive: classes.isActive,
        maxStudents: classes.maxStudents,
        createdAt: classes.createdAt,
        studentCount: sql<number>`cast(count(distinct ${classEnrollments.studentId}) as int)`,
      })
      .from(classes)
      .leftJoin(domains, eq(classes.domainId, domains.id))
      .leftJoin(classEnrollments, eq(classEnrollments.classId, classes.id))
      .where(eq(classes.teacherId, teacherId))
      .groupBy(
        classes.id,
        classes.name,
        classes.description,
        classes.isActive,
        classes.maxStudents,
        classes.createdAt,
        domains.id,
        domains.name,
        domains.color
      )
      .orderBy(desc(classes.createdAt));

    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error);
  }
}

// Get class details with enrolled students
export async function getClassDetails(classId: number, teacherId: number) {
  try {
    // Get class info
    const classInfo = await db
      .select({
        id: classes.id,
        name: classes.name,
        description: classes.description,
        domainId: domains.id,
        domainName: domains.name,
        domainColor: domains.color,
        isActive: classes.isActive,
        maxStudents: classes.maxStudents,
        createdAt: classes.createdAt,
      })
      .from(classes)
      .leftJoin(domains, eq(classes.domainId, domains.id))
      .where(and(eq(classes.id, classId), eq(classes.teacherId, teacherId)))
      .limit(1);

    if (!classInfo[0]) {
      return { success: false, error: "Class not found or access denied" };
    }

    // Get enrolled students
    const students = await db
      .select({
        studentId: users.id,
        studentName: users.name,
        studentEmail: users.email,
        studentAvatarUrl: users.avatarUrl,
        studentPhone: users.phone,
        enrolledAt: classEnrollments.enrolledAt,
      })
      .from(classEnrollments)
      .innerJoin(users, eq(classEnrollments.studentId, users.id))
      .where(eq(classEnrollments.classId, classId))
      .orderBy(desc(classEnrollments.enrolledAt));

    return {
      success: true,
      data: {
        class: classInfo[0],
        students,
        studentCount: students.length,
      },
    };
  } catch (error) {
    return handleDbError(error);
  }
}

// Add student to class
export async function addStudentToClass(classId: number, studentId: number) {
  try {
    // Check if student is already enrolled
    const existing = await db
      .select()
      .from(classEnrollments)
      .where(
        and(
          eq(classEnrollments.classId, classId),
          eq(classEnrollments.studentId, studentId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return {
        success: false,
        error: "Student already enrolled in this class",
      };
    }

    // Check class capacity
    const classData = await db
      .select({
        maxStudents: classes.maxStudents,
        currentCount: sql<number>`cast(count(${classEnrollments.studentId}) as int)`,
      })
      .from(classes)
      .leftJoin(classEnrollments, eq(classEnrollments.classId, classes.id))
      .where(eq(classes.id, classId))
      .groupBy(classes.id, classes.maxStudents)
      .limit(1);

    if (
      classData[0]?.maxStudents &&
      classData[0].currentCount >= classData[0].maxStudents
    ) {
      return { success: false, error: "Class is full" };
    }

    // Add student to class
    const result = await db
      .insert(classEnrollments)
      .values({
        classId,
        studentId,
      })
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

// Remove student from class
export async function removeStudentFromClass(
  classId: number,
  studentId: number
) {
  try {
    const result = await db
      .delete(classEnrollments)
      .where(
        and(
          eq(classEnrollments.classId, classId),
          eq(classEnrollments.studentId, studentId)
        )
      )
      .returning();

    if (result.length === 0) {
      return { success: false, error: "Enrollment not found" };
    }

    return { success: true, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

// Update class
export async function updateClass(
  classId: number,
  teacherId: number,
  data: {
    name?: string;
    description?: string;
    domainId?: number;
    maxStudents?: number;
    isActive?: boolean;
  }
) {
  try {
    const result = await db
      .update(classes)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(classes.id, classId), eq(classes.teacherId, teacherId)))
      .returning();

    if (result.length === 0) {
      return { success: false, error: "Class not found or access denied" };
    }

    return { success: true, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

// Delete class
export async function deleteClass(classId: number, teacherId: number) {
  try {
    // First delete all enrollments
    await db
      .delete(classEnrollments)
      .where(eq(classEnrollments.classId, classId));

    // Then delete the class
    const result = await db
      .delete(classes)
      .where(and(eq(classes.id, classId), eq(classes.teacherId, teacherId)))
      .returning();

    if (result.length === 0) {
      return { success: false, error: "Class not found or access denied" };
    }

    return { success: true, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}
