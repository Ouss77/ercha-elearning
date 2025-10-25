import { db } from "@/lib/db/db"
import { modules, chapters, chapterProgress, users } from "@/drizzle/schema"
import { eq, and, sql } from "drizzle-orm"

export interface ModuleCompletionReport {
  moduleId: number
  moduleTitle: string
  courseId: number
  totalStudents: number
  studentsCompleted: number
  completionRate: number
  recentCompletions: {
    studentId: number
    studentName: string
    completedAt: string
  }[]
  chapterCompletionBreakdown: {
    chapterId: number
    chapterTitle: string
    completionCount: number
  }[]
}

export interface CourseModuleCompletionSummary {
  courseId: number
  totalModules: number
  moduleCompletions: {
    moduleId: number
    moduleTitle: string
    completionRate: number
  }[]
  overallCompletionRate: number
  topPerformingModules: {
    moduleId: number
    moduleTitle: string
    completionRate: number
  }[]
  strugglingModules: {
    moduleId: number
    moduleTitle: string
    completionRate: number
  }[]
}

/**
 * Generate comprehensive module completion report
 */
export async function generateModuleCompletionReport(
  moduleId: number
): Promise<ModuleCompletionReport | null> {
  try {
    // Get module information
    const moduleInfo = await db
      .select({
        moduleId: modules.id,
        moduleTitle: modules.title,
        courseId: modules.courseId,
      })
      .from(modules)
      .where(eq(modules.id, moduleId))
      .limit(1)

    if (moduleInfo.length === 0) {
      return null
    }

    const moduleData = moduleInfo[0]

    // Get all chapters in this module
    const moduleChapters = await db
      .select({
        id: chapters.id,
        title: chapters.title,
      })
      .from(chapters)
      .where(eq(chapters.moduleId, moduleId))

    // Get students who completed ALL chapters in this module
    const completionData = await db
      .select({
        studentId: chapterProgress.studentId,
        studentName: users.name,
        completedAt: sql<string>`MAX(${chapterProgress.completedAt})`,
        totalProgress: sql<number>`COUNT(${chapterProgress.id})`,
      })
      .from(chapterProgress)
      .innerJoin(chapters, eq(chapterProgress.chapterId, chapters.id))
      .innerJoin(users, eq(chapterProgress.studentId, users.id))
      .where(
        and(
          eq(chapters.moduleId, moduleId),
          sql`${chapterProgress.completedAt} IS NOT NULL`
        )
      )
      .groupBy(chapterProgress.studentId, users.name)
      .having(sql`COUNT(${chapterProgress.id}) = ${moduleChapters.length}`)

    // Get total enrolled students for this course
    const totalStudentsResult = await db
      .select({
        count: sql<number>`COUNT(DISTINCT ${chapterProgress.studentId})`,
      })
      .from(chapterProgress)
      .innerJoin(chapters, eq(chapterProgress.chapterId, chapters.id))
      .where(eq(chapters.moduleId, moduleId))

    const totalStudents = totalStudentsResult[0]?.count || 0
    const studentsCompleted = completionData.length
    const completionRate = totalStudents > 0 ? (studentsCompleted / totalStudents) * 100 : 0

    // Get recent completions (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentCompletions = completionData
      .filter((student) => new Date(student.completedAt) >= sevenDaysAgo)
      .filter((student) => student.studentId !== null) // Filter out null studentIds
      .map((student) => ({
        studentId: student.studentId!,
        studentName: student.studentName,
        completedAt: student.completedAt,
      }))
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())

    // Get chapter completion breakdown
    const chapterBreakdown = await Promise.all(
      moduleChapters.map(async (chapter) => {
        const chapterCompletions = await db
          .select({
            count: sql<number>`COUNT(*)`,
          })
          .from(chapterProgress)
          .where(
            and(
              eq(chapterProgress.chapterId, chapter.id),
              sql`${chapterProgress.completedAt} IS NOT NULL`
            )
          )

        return {
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          completionCount: chapterCompletions[0]?.count || 0,
        }
      })
    )

    return {
      moduleId: moduleData.moduleId,
      moduleTitle: moduleData.moduleTitle,
      courseId: moduleData.courseId,
      totalStudents,
      studentsCompleted,
      completionRate: Math.round(completionRate * 100) / 100,
      recentCompletions,
      chapterCompletionBreakdown: chapterBreakdown,
    }
  } catch (error) {
    console.error("Error generating module completion report:", error)
    return null
  }
}

/**
 * Generate course-wide module completion summary
 */
export async function generateCourseModuleCompletionSummary(
  courseId: number
): Promise<CourseModuleCompletionSummary | null> {
  try {
    // Get all modules for the course
    const courseModules = await db
      .select({
        id: modules.id,
        title: modules.title,
      })
      .from(modules)
      .where(eq(modules.courseId, courseId))

    if (courseModules.length === 0) {
      return null
    }

    // Generate completion data for each module
    const moduleCompletions = await Promise.all(
      courseModules.map(async (module) => {
        const report = await generateModuleCompletionReport(module.id)
        return {
          moduleId: module.id,
          moduleTitle: module.title,
          completionRate: report?.completionRate || 0,
        }
      })
    )

    // Calculate overall completion rate
    const overallCompletionRate =
      moduleCompletions.length > 0
        ? moduleCompletions.reduce((acc, m) => acc + m.completionRate, 0) / moduleCompletions.length
        : 0

    // Find top performing modules (highest completion rate)
    const topPerformingModules = [...moduleCompletions]
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 3)
      .map((module) => ({
        moduleId: module.moduleId,
        moduleTitle: module.moduleTitle,
        completionRate: module.completionRate,
      }))

    // Find struggling modules (lowest completion rate)
    const strugglingModules = [...moduleCompletions]
      .filter((m) => m.completionRate < 50) // Less than 50% completion
      .sort((a, b) => a.completionRate - b.completionRate)
      .slice(0, 3)

    return {
      courseId,
      totalModules: courseModules.length,
      moduleCompletions,
      overallCompletionRate: Math.round(overallCompletionRate * 100) / 100,
      topPerformingModules,
      strugglingModules,
    }
  } catch (error) {
    console.error("Error generating course module completion summary:", error)
    return null
  }
}

/**
 * Check if a student has completed a specific module
 */
export async function isModuleCompletedByStudent(
  moduleId: number,
  studentId: number
): Promise<boolean> {
  try {
    // Get all chapters in this module
    const moduleChapters = await db
      .select({ id: chapters.id })
      .from(chapters)
      .where(eq(chapters.moduleId, moduleId))

    if (moduleChapters.length === 0) {
      return false
    }

    // Check if student completed all chapters
    const completedChapters = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(chapterProgress)
      .innerJoin(chapters, eq(chapterProgress.chapterId, chapters.id))
      .where(
        and(
          eq(chapters.moduleId, moduleId),
          eq(chapterProgress.studentId, studentId),
          sql`${chapterProgress.completedAt} IS NOT NULL`
        )
      )

    const completedCount = completedChapters[0]?.count || 0
    return completedCount === moduleChapters.length
  } catch (error) {
    console.error("Error checking module completion:", error)
    return false
  }
}

/**
 * Get recently completed modules for a student (last 7 days)
 */
export async function getRecentlyCompletedModules(
  studentId: number,
  days: number = 7
): Promise<Array<{ moduleId: number; moduleTitle: string; completedAt: string; courseId: number }>> {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const recentCompletions = await db
      .select({
        moduleId: modules.id,
        moduleTitle: modules.title,
        courseId: modules.courseId,
        completedAt: sql<string>`MAX(${chapterProgress.completedAt})`,
        chapterCount: sql<number>`COUNT(DISTINCT ${chapters.id})`,
        completedChapterCount: sql<number>`COUNT(DISTINCT ${chapterProgress.id})`,
      })
      .from(modules)
      .innerJoin(chapters, eq(chapters.moduleId, modules.id))
      .leftJoin(
        chapterProgress,
        and(
          eq(chapterProgress.chapterId, chapters.id),
          eq(chapterProgress.studentId, studentId),
          sql`${chapterProgress.completedAt} IS NOT NULL`
        )
      )
      .where(sql`${chapterProgress.completedAt} >= ${cutoffDate.toISOString()}`)
      .groupBy(modules.id, modules.title, modules.courseId)
      .having(sql`COUNT(DISTINCT ${chapters.id}) = COUNT(DISTINCT ${chapterProgress.id})`)
      .orderBy(sql`MAX(${chapterProgress.completedAt}) DESC`)

    return recentCompletions
  } catch (error) {
    console.error("Error getting recently completed modules:", error)
    return []
  }
}
