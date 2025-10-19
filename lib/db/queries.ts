import { eq, and, desc, sql, ne } from "drizzle-orm";
import { hash } from "bcryptjs";
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
import {
  mapUserFromDb,
  mapUserToDb,
  mapCourseFromDb,
  mapEnrollmentFromDb,
} from "./mappers";
import type { User } from "@/types/user";
import { generateSlug, generateUniqueSlug } from "@/lib/utils/slug";

// User query functions
export async function getUserByEmail(email: string) {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    const mappedUser = mapUserFromDb(result[0]);
    return { success: true, data: mappedUser };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function createUser(data: {
  email: string;
  password: string;
  name: string;
  role?: "STUDENT" | "TRAINER" | "SUB_ADMIN" | "ADMIN";
  avatarUrl?: string | null;
  phone?: string | null;
  dateOfBirth?: Date | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
  bio?: string | null;
  isActive?: boolean;
}) {
  try {
    // Hash the password before storing
    const hashedPassword = await hash(data.password, 10);

    const insertData: any = {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: data.role || "STUDENT",
      avatarUrl: data.avatarUrl,
      isActive: data.isActive ?? true,
      country: data.country || "Morocco",
    };

    // Add optional fields if they exist
    if (data.phone) insertData.phone = data.phone;
    if (data.dateOfBirth) insertData.dateOfBirth = data.dateOfBirth;
    if (data.address) insertData.address = data.address;
    if (data.city) insertData.city = data.city;
    if (data.postalCode) insertData.postalCode = data.postalCode;
    if (data.bio) insertData.bio = data.bio;

    const result = await db.insert(users).values(insertData).returning();

    const mappedUser = mapUserFromDb(result[0]);
    return { success: true as const, data: mappedUser };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getUserById(id: number) {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    const mappedUser = mapUserFromDb(result[0]);
    return { success: true, data: mappedUser };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getAllUsers() {
  try {
    const usersResult = await db.select().from(users);

    // Fetch all student enrollments in a single query
    const allStudentEnrollments = await db
      .select({
        studentId: enrollments.studentId,
        courseSlug: courses.slug,
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

    const filteredUsers = usersWithCourses.filter(
      (u): u is User & { enrolledCourses: string[] } => u !== null
    );
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
    const existingCourses = await db
      .select({ slug: courses.slug })
      .from(courses);
    const existingSlugs = existingCourses.map((c) => c.slug);

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
      const existingSlugs = existingCourses.map((c) => c.slug);

      // Generate unique slug
      updateData.slug = generateUniqueSlug(baseSlug, existingSlugs);
    }

    const result = await db
      .update(courses)
      .set(updateData)
      .where(eq(courses.id, id))
      .returning();

    const mappedCourse = mapCourseFromDb(result[0]);
    return { success: true, data: mappedCourse };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getCourseById(id: number) {
  try {
    const result = await db
      .select()
      .from(courses)
      .where(eq(courses.id, id))
      .limit(1);
    const mappedCourse = mapCourseFromDb(result[0]);
    return { success: true, data: mappedCourse };
  } catch (error) {
    return handleDbError(error);
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

export async function getCoursesWithDetails() {
  try {
    const result = await db
      .select({
        id: courses.id,
        title: courses.title,
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
        enrollmentCount: sql<number>`cast(count(distinct ${enrollments.id}) as int)`,
        chapterCount: sql<number>`cast(count(distinct ${chapters.id}) as int)`,
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
        domains.color,
        users.id,
        users.name,
        users.email
      )
      .orderBy(desc(courses.createdAt));

    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getCourseWithDetails(id: number) {
  try {
    const result = await db
      .select({
        id: courses.id,
        title: courses.title,
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
        enrollmentCount: sql<number>`cast(count(distinct ${enrollments.id}) as int)`,
        chapterCount: sql<number>`cast(count(distinct ${chapters.id}) as int)`,
      })
      .from(courses)
      .leftJoin(domains, eq(courses.domainId, domains.id))
      .leftJoin(users, eq(courses.teacherId, users.id))
      .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
      .leftJoin(chapters, eq(courses.id, chapters.courseId))
      .where(eq(courses.id, id))
      .groupBy(
        courses.id,
        domains.id,
        domains.name,
        domains.color,
        users.id,
        users.name,
        users.email
      )
      .limit(1);

    return { success: true, data: result[0] || null };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function courseHasEnrollments(courseId: number) {
  try {
    const result = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(enrollments)
      .where(eq(enrollments.courseId, courseId));

    return { success: true, data: result[0].count > 0 };
  } catch (error) {
    return handleDbError(error);
  }
}

// Enrollment query functions
export async function getEnrollmentById(id: number) {
  try {
    const result = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.id, id))
      .limit(1);
    const mappedEnrollment = mapEnrollmentFromDb(result[0]);
    return { success: true, data: mappedEnrollment };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getEnrollmentsByStudentId(studentId: number) {
  try {
    const result = await db
      .select({
        id: enrollments.id,
        studentId: enrollments.studentId,
        courseId: enrollments.courseId,
        enrolledAt: enrollments.createdAt,
        completedAt: enrollments.completedAt,
        course: {
          id: courses.id,
          title: courses.title,
          description: courses.description,
          isActive: courses.isActive,
        },
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.studentId, studentId));

    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getEnrollmentsByCourseId(courseId: number) {
  try {
    const result = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.courseId, courseId));
    const mappedEnrollments = result
      .map(mapEnrollmentFromDb)
      .filter((e) => e !== null);
    return { success: true, data: mappedEnrollments };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function createEnrollment(data: {
  studentId: number;
  courseId: number;
}) {
  try {
    const result = await db
      .insert(enrollments)
      .values({
        studentId: data.studentId,
        courseId: data.courseId,
      })
      .returning();

    const mappedEnrollment = mapEnrollmentFromDb(result[0]);
    return { success: true, data: mappedEnrollment };
  } catch (error) {
    return handleDbError(error);
  }
}

// Domain query functions
export async function getAllDomains() {
  try {
    const result = await db.select().from(domains);
    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getDomainById(id: number) {
  try {
    const result = await db
      .select()
      .from(domains)
      .where(eq(domains.id, id))
      .limit(1);
    return { success: true, data: result[0] || null };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function createDomain(data: {
  name: string;
  description?: string | null;
  color?: string;
}) {
  try {
    const result = await db
      .insert(domains)
      .values({
        name: data.name,
        description: data.description,
        color: data.color || "#6366f1",
      })
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function updateDomain(
  id: number,
  data: Partial<{
    name: string;
    description: string | null;
    color: string;
  }>
) {
  try {
    const result = await db
      .update(domains)
      .set(data)
      .where(eq(domains.id, id))
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function deleteDomain(id: number) {
  try {
    const result = await db
      .delete(domains)
      .where(eq(domains.id, id))
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getDomainsWithCounts() {
  try {
    const result = await db
      .select({
        id: domains.id,
        name: domains.name,
        description: domains.description,
        color: domains.color,
        createdAt: domains.createdAt,
        coursesCount: sql<number>`cast(count(${courses.id}) as int)`,
      })
      .from(domains)
      .leftJoin(courses, eq(domains.id, courses.domainId))
      .groupBy(domains.id)
      .orderBy(desc(domains.createdAt));

    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function domainNameExists(name: string, excludeId?: number) {
  try {
    let query = db
      .select({ id: domains.id })
      .from(domains)
      .where(eq(domains.name, name));

    if (excludeId !== undefined) {
      query = db
        .select({ id: domains.id })
        .from(domains)
        .where(and(eq(domains.name, name), ne(domains.id, excludeId)));
    }

    const result = await query.limit(1);
    return { success: true, data: result.length > 0 };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function domainHasCourses(domainId: number) {
  try {
    const result = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(courses)
      .where(eq(courses.domainId, domainId));

    return { success: true, data: result[0].count > 0 };
  } catch (error) {
    return handleDbError(error);
  }
}

// Chapter query functions
export async function getChapterById(id: number) {
  try {
    const result = await db
      .select()
      .from(chapters)
      .where(eq(chapters.id, id))
      .limit(1);
    return { success: true, data: result[0] || null };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getChaptersByCourseId(courseId: number) {
  try {
    const result = await db
      .select()
      .from(chapters)
      .where(eq(chapters.courseId, courseId))
      .orderBy(chapters.orderIndex);

    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function createChapter(data: {
  courseId: number;
  title: string;
  description?: string | null;
  orderIndex: number;
  contentType: string;
  contentData: any;
}) {
  try {
    const result = await db
      .insert(chapters)
      .values({
        courseId: data.courseId,
        title: data.title,
        description: data.description,
        orderIndex: data.orderIndex,
        contentType: data.contentType,
        contentData: data.contentData,
      })
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function updateChapter(
  id: number,
  data: Partial<{
    title: string;
    description: string | null;
    orderIndex: number;
    contentType: string;
    contentData: any;
  }>
) {
  try {
    const result = await db
      .update(chapters)
      .set(data)
      .where(eq(chapters.id, id))
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function deleteChapter(id: number) {
  try {
    const result = await db
      .delete(chapters)
      .where(eq(chapters.id, id))
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function reorderChapters(courseId: number, chapterIds: number[]) {
  try {
    // Update order_index for each chapter
    const updates = chapterIds.map((chapterId, index) =>
      db
        .update(chapters)
        .set({ orderIndex: index })
        .where(and(eq(chapters.id, chapterId), eq(chapters.courseId, courseId)))
    );

    await Promise.all(updates);

    return {
      success: true,
      data: { message: "Chapters reordered successfully" },
    };
  } catch (error) {
    return handleDbError(error);
  }
}

// Chapter Progress query functions
export async function getChapterProgress(studentId: number, chapterId: number) {
  try {
    const result = await db
      .select()
      .from(chapterProgress)
      .where(
        and(
          eq(chapterProgress.studentId, studentId),
          eq(chapterProgress.chapterId, chapterId)
        )
      )
      .limit(1);

    return { success: true, data: result[0] || null };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getStudentProgressByCourse(
  studentId: number,
  courseId: number
) {
  try {
    const result = await db
      .select({
        id: chapterProgress.id,
        studentId: chapterProgress.studentId,
        chapterId: chapterProgress.chapterId,
        completedAt: chapterProgress.completedAt,
        chapterTitle: chapters.title,
        chapterOrderIndex: chapters.orderIndex,
      })
      .from(chapterProgress)
      .innerJoin(chapters, eq(chapterProgress.chapterId, chapters.id))
      .where(
        and(
          eq(chapterProgress.studentId, studentId),
          eq(chapters.courseId, courseId)
        )
      )
      .orderBy(chapters.orderIndex);

    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function markChapterComplete(
  studentId: number,
  chapterId: number
) {
  try {
    // Check if already completed
    const existing = await db
      .select()
      .from(chapterProgress)
      .where(
        and(
          eq(chapterProgress.studentId, studentId),
          eq(chapterProgress.chapterId, chapterId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return { success: true, data: existing[0] };
    }

    // Create new progress record
    const result = await db
      .insert(chapterProgress)
      .values({
        studentId,
        chapterId,
      })
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function unmarkChapterComplete(
  studentId: number,
  chapterId: number
) {
  try {
    const result = await db
      .delete(chapterProgress)
      .where(
        and(
          eq(chapterProgress.studentId, studentId),
          eq(chapterProgress.chapterId, chapterId)
        )
      )
      .returning();

    return { success: true, data: result[0] || null };
  } catch (error) {
    return handleDbError(error);
  }
}

// Quiz query functions
export async function getQuizById(id: number) {
  try {
    const result = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, id))
      .limit(1);

    return { success: true, data: result[0] || null };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getQuizzesByChapter(chapterId: number) {
  try {
    const result = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.chapterId, chapterId));

    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function createQuiz(data: {
  chapterId: number;
  title: string;
  questions: any;
  passingScore?: number;
}) {
  try {
    const result = await db
      .insert(quizzes)
      .values({
        chapterId: data.chapterId,
        title: data.title,
        questions: data.questions,
        passingScore: data.passingScore || 70,
      })
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function updateQuiz(
  id: number,
  data: Partial<{
    title: string;
    questions: any;
    passingScore: number;
  }>
) {
  try {
    const result = await db
      .update(quizzes)
      .set(data)
      .where(eq(quizzes.id, id))
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function deleteQuiz(id: number) {
  try {
    const result = await db
      .delete(quizzes)
      .where(eq(quizzes.id, id))
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

// Quiz Attempt query functions
export async function getQuizAttemptById(id: number) {
  try {
    const result = await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.id, id))
      .limit(1);

    return { success: true, data: result[0] || null };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getQuizAttemptsByStudent(
  studentId: number,
  quizId: number
) {
  try {
    const result = await db
      .select()
      .from(quizAttempts)
      .where(
        and(
          eq(quizAttempts.studentId, studentId),
          eq(quizAttempts.quizId, quizId)
        )
      )
      .orderBy(desc(quizAttempts.attemptedAt));

    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getAllQuizAttemptsByStudent(studentId: number) {
  try {
    const result = await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.studentId, studentId))
      .orderBy(desc(quizAttempts.attemptedAt));

    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function createQuizAttempt(data: {
  studentId: number;
  quizId: number;
  answers: any;
  score: number;
  passed: boolean;
}) {
  try {
    const result = await db
      .insert(quizAttempts)
      .values({
        studentId: data.studentId,
        quizId: data.quizId,
        answers: data.answers,
        score: data.score,
        passed: data.passed,
      })
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getBestQuizAttempt(studentId: number, quizId: number) {
  try {
    const result = await db
      .select()
      .from(quizAttempts)
      .where(
        and(
          eq(quizAttempts.studentId, studentId),
          eq(quizAttempts.quizId, quizId)
        )
      )
      .orderBy(desc(quizAttempts.score))
      .limit(1);

    return { success: true, data: result[0] || null };
  } catch (error) {
    return handleDbError(error);
  }
}

// Final Project query functions
export async function getFinalProjectById(id: number) {
  try {
    const result = await db
      .select()
      .from(finalProjects)
      .where(eq(finalProjects.id, id))
      .limit(1);

    return { success: true, data: result[0] || null };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getFinalProjectsByCourse(courseId: number) {
  try {
    const result = await db
      .select()
      .from(finalProjects)
      .where(eq(finalProjects.courseId, courseId));

    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function createFinalProject(data: {
  courseId: number;
  title: string;
  description: string;
  requirements?: any;
}) {
  try {
    const result = await db
      .insert(finalProjects)
      .values({
        courseId: data.courseId,
        title: data.title,
        description: data.description,
        requirements: data.requirements,
      })
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function updateFinalProject(
  id: number,
  data: Partial<{
    title: string;
    description: string;
    requirements: any;
  }>
) {
  try {
    const result = await db
      .update(finalProjects)
      .set(data)
      .where(eq(finalProjects.id, id))
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function deleteFinalProject(id: number) {
  try {
    const result = await db
      .delete(finalProjects)
      .where(eq(finalProjects.id, id))
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

// Project Submission query functions
export async function getProjectSubmissionById(id: number) {
  try {
    const result = await db
      .select()
      .from(projectSubmissions)
      .where(eq(projectSubmissions.id, id))
      .limit(1);

    return { success: true, data: result[0] || null };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getProjectSubmissionsByStudent(studentId: number) {
  try {
    const result = await db
      .select()
      .from(projectSubmissions)
      .where(eq(projectSubmissions.studentId, studentId))
      .orderBy(desc(projectSubmissions.submittedAt));

    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getProjectSubmissionsByProject(finalProjectId: number) {
  try {
    const result = await db
      .select()
      .from(projectSubmissions)
      .where(eq(projectSubmissions.finalProjectId, finalProjectId))
      .orderBy(desc(projectSubmissions.submittedAt));

    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getStudentSubmissionForProject(
  studentId: number,
  finalProjectId: number
) {
  try {
    const result = await db
      .select()
      .from(projectSubmissions)
      .where(
        and(
          eq(projectSubmissions.studentId, studentId),
          eq(projectSubmissions.finalProjectId, finalProjectId)
        )
      )
      .orderBy(desc(projectSubmissions.submittedAt))
      .limit(1);

    return { success: true, data: result[0] || null };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function createProjectSubmission(data: {
  studentId: number;
  finalProjectId: number;
  submissionUrl?: string | null;
  description?: string | null;
}) {
  try {
    const result = await db
      .insert(projectSubmissions)
      .values({
        studentId: data.studentId,
        finalProjectId: data.finalProjectId,
        submissionUrl: data.submissionUrl,
        description: data.description,
        status: "submitted",
      })
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function updateProjectSubmission(
  id: number,
  data: Partial<{
    submissionUrl: string | null;
    description: string | null;
    status: string;
    feedback: string | null;
    grade: number | null;
  }>
) {
  try {
    const updateData: any = { ...data };

    // If status is being changed to reviewed, set reviewedAt
    if (data.status && data.status !== "submitted") {
      updateData.reviewedAt = new Date();
    }

    const result = await db
      .update(projectSubmissions)
      .set(updateData)
      .where(eq(projectSubmissions.id, id))
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function deleteProjectSubmission(id: number) {
  try {
    const result = await db
      .delete(projectSubmissions)
      .where(eq(projectSubmissions.id, id))
      .returning();

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
