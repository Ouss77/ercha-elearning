import { eq, and, desc } from "drizzle-orm"
import { db, handleDbError } from "./index"
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
  projectSubmissions 
} from "@/drizzle/schema"
import { mapUserFromDb, mapUserToDb, mapCourseFromDb, mapEnrollmentFromDb, type AppUser } from "./mappers"

// User query functions
export async function getUserByEmail(email: string) {
  try {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1)
    const mappedUser = mapUserFromDb(result[0])
    return { success: true, data: mappedUser }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function createUser(data: {
  email: string
  password: string
  name: string
  role?: "STUDENT" | "TRAINER" | "SUB_ADMIN" | "ADMIN"
  photoUrl?: string | null
}) {
  try {
    // Map application data to database format
    const dbData = mapUserToDb(data)
    
    const result = await db
      .insert(users)
      .values({
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role || "STUDENT",
        avatarUrl: dbData.avatarUrl,
      })
      .returning()
    
    const mappedUser = mapUserFromDb(result[0])
    return { success: true, data: mappedUser }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function getUserById(id: number) {
  try {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1)
    const mappedUser = mapUserFromDb(result[0])
    return { success: true, data: mappedUser }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function getAllUsers() {
  try {
    const result = await db.select().from(users)
    const mappedUsers = result.map(mapUserFromDb).filter((u): u is AppUser => u !== null)
    return { success: true, data: mappedUsers }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function updateUser(id: number, data: Partial<{
  email: string
  password: string
  name: string
  role: "STUDENT" | "TRAINER" | "SUB_ADMIN" | "ADMIN"
  photoUrl: string | null
  isActive: boolean
}>) {
  try {
    // Map application data to database format
    const dbData = mapUserToDb(data)
    
    const result = await db
      .update(users)
      .set(dbData)
      .where(eq(users.id, id))
      .returning()
    
    const mappedUser = mapUserFromDb(result[0])
    return { success: true, data: mappedUser }
  } catch (error) {
    return handleDbError(error)
  }
}

// Course query functions
export async function getCourseById(id: number) {
  try {
    const result = await db.select().from(courses).where(eq(courses.id, id)).limit(1)
    const mappedCourse = mapCourseFromDb(result[0])
    return { success: true, data: mappedCourse }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function getAllCourses() {
  try {
    const result = await db.select().from(courses)
    const mappedCourses = result.map(mapCourseFromDb).filter(c => c !== null)
    return { success: true, data: mappedCourses }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function getCoursesByTeacherId(teacherId: number) {
  try {
    const result = await db.select().from(courses).where(eq(courses.teacherId, teacherId))
    const mappedCourses = result.map(mapCourseFromDb).filter(c => c !== null)
    return { success: true, data: mappedCourses }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function getCoursesByDomainId(domainId: number) {
  try {
    const result = await db.select().from(courses).where(eq(courses.domainId, domainId))
    const mappedCourses = result.map(mapCourseFromDb).filter(c => c !== null)
    return { success: true, data: mappedCourses }
  } catch (error) {
    return handleDbError(error)
  }
}

// Enrollment query functions
export async function getEnrollmentById(id: number) {
  try {
    const result = await db.select().from(enrollments).where(eq(enrollments.id, id)).limit(1)
    const mappedEnrollment = mapEnrollmentFromDb(result[0])
    return { success: true, data: mappedEnrollment }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function getEnrollmentsByStudentId(studentId: number) {
  try {
    const result = await db.select().from(enrollments).where(eq(enrollments.studentId, studentId))
    const mappedEnrollments = result.map(mapEnrollmentFromDb).filter(e => e !== null)
    return { success: true, data: mappedEnrollments }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function getEnrollmentsByCourseId(courseId: number) {
  try {
    const result = await db.select().from(enrollments).where(eq(enrollments.courseId, courseId))
    const mappedEnrollments = result.map(mapEnrollmentFromDb).filter(e => e !== null)
    return { success: true, data: mappedEnrollments }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function createEnrollment(data: {
  studentId: number
  courseId: number
}) {
  try {
    const result = await db
      .insert(enrollments)
      .values({
        studentId: data.studentId,
        courseId: data.courseId,
      })
      .returning()
    
    const mappedEnrollment = mapEnrollmentFromDb(result[0])
    return { success: true, data: mappedEnrollment }
  } catch (error) {
    return handleDbError(error)
  }
}

// Domain query functions
export async function getAllDomains() {
  try {
    const result = await db.select().from(domains)
    return { success: true, data: result }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function getDomainById(id: number) {
  try {
    const result = await db.select().from(domains).where(eq(domains.id, id)).limit(1)
    return { success: true, data: result[0] || null }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function createDomain(data: {
  name: string
  description?: string | null
  color?: string
}) {
  try {
    const result = await db
      .insert(domains)
      .values({
        name: data.name,
        description: data.description,
        color: data.color || "#6366f1",
      })
      .returning()
    
    return { success: true, data: result[0] }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function updateDomain(id: number, data: Partial<{
  name: string
  description: string | null
  color: string
}>) {
  try {
    const result = await db
      .update(domains)
      .set(data)
      .where(eq(domains.id, id))
      .returning()
    
    return { success: true, data: result[0] }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function deleteDomain(id: number) {
  try {
    const result = await db
      .delete(domains)
      .where(eq(domains.id, id))
      .returning()
    
    return { success: true, data: result[0] }
  } catch (error) {
    return handleDbError(error)
  }
}

// Chapter query functions
export async function getChapterById(id: number) {
  try {
    const result = await db.select().from(chapters).where(eq(chapters.id, id)).limit(1)
    return { success: true, data: result[0] || null }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function getChaptersByCourseId(courseId: number) {
  try {
    const result = await db
      .select()
      .from(chapters)
      .where(eq(chapters.courseId, courseId))
      .orderBy(chapters.orderIndex)
    
    return { success: true, data: result }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function createChapter(data: {
  courseId: number
  title: string
  description?: string | null
  orderIndex: number
  contentType: string
  contentData: any
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
      .returning()
    
    return { success: true, data: result[0] }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function updateChapter(id: number, data: Partial<{
  title: string
  description: string | null
  orderIndex: number
  contentType: string
  contentData: any
}>) {
  try {
    const result = await db
      .update(chapters)
      .set(data)
      .where(eq(chapters.id, id))
      .returning()
    
    return { success: true, data: result[0] }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function deleteChapter(id: number) {
  try {
    const result = await db
      .delete(chapters)
      .where(eq(chapters.id, id))
      .returning()
    
    return { success: true, data: result[0] }
  } catch (error) {
    return handleDbError(error)
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
    )
    
    await Promise.all(updates)
    
    return { success: true, data: { message: "Chapters reordered successfully" } }
  } catch (error) {
    return handleDbError(error)
  }
}

// Chapter Progress query functions
export async function getChapterProgress(studentId: number, chapterId: number) {
  try {
    const result = await db
      .select()
      .from(chapterProgress)
      .where(and(
        eq(chapterProgress.studentId, studentId),
        eq(chapterProgress.chapterId, chapterId)
      ))
      .limit(1)
    
    return { success: true, data: result[0] || null }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function getStudentProgressByCourse(studentId: number, courseId: number) {
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
      .where(and(
        eq(chapterProgress.studentId, studentId),
        eq(chapters.courseId, courseId)
      ))
      .orderBy(chapters.orderIndex)
    
    return { success: true, data: result }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function markChapterComplete(studentId: number, chapterId: number) {
  try {
    // Check if already completed
    const existing = await db
      .select()
      .from(chapterProgress)
      .where(and(
        eq(chapterProgress.studentId, studentId),
        eq(chapterProgress.chapterId, chapterId)
      ))
      .limit(1)
    
    if (existing.length > 0) {
      return { success: true, data: existing[0] }
    }
    
    // Create new progress record
    const result = await db
      .insert(chapterProgress)
      .values({
        studentId,
        chapterId,
      })
      .returning()
    
    return { success: true, data: result[0] }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function unmarkChapterComplete(studentId: number, chapterId: number) {
  try {
    const result = await db
      .delete(chapterProgress)
      .where(and(
        eq(chapterProgress.studentId, studentId),
        eq(chapterProgress.chapterId, chapterId)
      ))
      .returning()
    
    return { success: true, data: result[0] || null }
  } catch (error) {
    return handleDbError(error)
  }
}

// Quiz query functions
export async function getQuizById(id: number) {
  try {
    const result = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, id))
      .limit(1)
    
    return { success: true, data: result[0] || null }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function getQuizzesByChapter(chapterId: number) {
  try {
    const result = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.chapterId, chapterId))
    
    return { success: true, data: result }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function createQuiz(data: {
  chapterId: number
  title: string
  questions: any
  passingScore?: number
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
      .returning()
    
    return { success: true, data: result[0] }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function updateQuiz(id: number, data: Partial<{
  title: string
  questions: any
  passingScore: number
}>) {
  try {
    const result = await db
      .update(quizzes)
      .set(data)
      .where(eq(quizzes.id, id))
      .returning()
    
    return { success: true, data: result[0] }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function deleteQuiz(id: number) {
  try {
    const result = await db
      .delete(quizzes)
      .where(eq(quizzes.id, id))
      .returning()
    
    return { success: true, data: result[0] }
  } catch (error) {
    return handleDbError(error)
  }
}

// Quiz Attempt query functions
export async function getQuizAttemptById(id: number) {
  try {
    const result = await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.id, id))
      .limit(1)
    
    return { success: true, data: result[0] || null }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function getQuizAttemptsByStudent(studentId: number, quizId: number) {
  try {
    const result = await db
      .select()
      .from(quizAttempts)
      .where(and(
        eq(quizAttempts.studentId, studentId),
        eq(quizAttempts.quizId, quizId)
      ))
      .orderBy(desc(quizAttempts.attemptedAt))
    
    return { success: true, data: result }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function getAllQuizAttemptsByStudent(studentId: number) {
  try {
    const result = await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.studentId, studentId))
      .orderBy(desc(quizAttempts.attemptedAt))
    
    return { success: true, data: result }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function createQuizAttempt(data: {
  studentId: number
  quizId: number
  answers: any
  score: number
  passed: boolean
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
      .returning()
    
    return { success: true, data: result[0] }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function getBestQuizAttempt(studentId: number, quizId: number) {
  try {
    const result = await db
      .select()
      .from(quizAttempts)
      .where(and(
        eq(quizAttempts.studentId, studentId),
        eq(quizAttempts.quizId, quizId)
      ))
      .orderBy(desc(quizAttempts.score))
      .limit(1)
    
    return { success: true, data: result[0] || null }
  } catch (error) {
    return handleDbError(error)
  }
}

// Final Project query functions
export async function getFinalProjectById(id: number) {
  try {
    const result = await db
      .select()
      .from(finalProjects)
      .where(eq(finalProjects.id, id))
      .limit(1)
    
    return { success: true, data: result[0] || null }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function getFinalProjectsByCourse(courseId: number) {
  try {
    const result = await db
      .select()
      .from(finalProjects)
      .where(eq(finalProjects.courseId, courseId))
    
    return { success: true, data: result }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function createFinalProject(data: {
  courseId: number
  title: string
  description: string
  requirements?: any
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
      .returning()
    
    return { success: true, data: result[0] }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function updateFinalProject(id: number, data: Partial<{
  title: string
  description: string
  requirements: any
}>) {
  try {
    const result = await db
      .update(finalProjects)
      .set(data)
      .where(eq(finalProjects.id, id))
      .returning()
    
    return { success: true, data: result[0] }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function deleteFinalProject(id: number) {
  try {
    const result = await db
      .delete(finalProjects)
      .where(eq(finalProjects.id, id))
      .returning()
    
    return { success: true, data: result[0] }
  } catch (error) {
    return handleDbError(error)
  }
}

// Project Submission query functions
export async function getProjectSubmissionById(id: number) {
  try {
    const result = await db
      .select()
      .from(projectSubmissions)
      .where(eq(projectSubmissions.id, id))
      .limit(1)
    
    return { success: true, data: result[0] || null }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function getProjectSubmissionsByStudent(studentId: number) {
  try {
    const result = await db
      .select()
      .from(projectSubmissions)
      .where(eq(projectSubmissions.studentId, studentId))
      .orderBy(desc(projectSubmissions.submittedAt))
    
    return { success: true, data: result }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function getProjectSubmissionsByProject(finalProjectId: number) {
  try {
    const result = await db
      .select()
      .from(projectSubmissions)
      .where(eq(projectSubmissions.finalProjectId, finalProjectId))
      .orderBy(desc(projectSubmissions.submittedAt))
    
    return { success: true, data: result }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function getStudentSubmissionForProject(studentId: number, finalProjectId: number) {
  try {
    const result = await db
      .select()
      .from(projectSubmissions)
      .where(and(
        eq(projectSubmissions.studentId, studentId),
        eq(projectSubmissions.finalProjectId, finalProjectId)
      ))
      .orderBy(desc(projectSubmissions.submittedAt))
      .limit(1)
    
    return { success: true, data: result[0] || null }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function createProjectSubmission(data: {
  studentId: number
  finalProjectId: number
  submissionUrl?: string | null
  description?: string | null
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
      .returning()
    
    return { success: true, data: result[0] }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function updateProjectSubmission(id: number, data: Partial<{
  submissionUrl: string | null
  description: string | null
  status: string
  feedback: string | null
  grade: number | null
}>) {
  try {
    const updateData: any = { ...data }
    
    // If status is being changed to reviewed, set reviewedAt
    if (data.status && data.status !== "submitted") {
      updateData.reviewedAt = new Date()
    }
    
    const result = await db
      .update(projectSubmissions)
      .set(updateData)
      .where(eq(projectSubmissions.id, id))
      .returning()
    
    return { success: true, data: result[0] }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function deleteProjectSubmission(id: number) {
  try {
    const result = await db
      .delete(projectSubmissions)
      .where(eq(projectSubmissions.id, id))
      .returning()
    
    return { success: true, data: result[0] }
  } catch (error) {
    return handleDbError(error)
  }
}
