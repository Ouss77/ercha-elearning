/**
 * Module Queries
 * 
 * Database query functions for module CRUD operations
 */

import { db } from "@/lib/db"
import { modules, chapters, contentItems, chapterProgress } from "@/drizzle/schema"
import { eq, asc, and, sql } from "drizzle-orm"
import type { Module, ModuleWithChapters } from "@/types/module"
import type { ChapterWithContent, ContentItem } from "@/types/chapter"

/**
 * Get all modules for a course, ordered by orderIndex
 */
export async function getModulesByCourseId(courseId: number): Promise<Module[]> {
  try {
    const result = await db
      .select()
      .from(modules)
      .where(eq(modules.courseId, courseId))
      .orderBy(asc(modules.orderIndex))
    
    return result
  } catch (error) {
    console.error("Error fetching modules by course ID:", error)
    throw new Error("Failed to fetch modules")
  }
}

/**
 * Get a single module by ID
 */
export async function getModuleById(id: number): Promise<Module | null> {
  try {
    const [module] = await db
      .select()
      .from(modules)
      .where(eq(modules.id, id))
      .limit(1)
    
    return module || null
  } catch (error) {
    console.error("Error fetching module by ID:", error)
    throw new Error("Failed to fetch module")
  }
}

/**
 * Get modules with their chapters (batch fetch optimization)
 */
export async function getModulesWithChapters(courseId: number): Promise<ModuleWithChapters[]> {
  try {
    // Fetch all modules for the course
    const modulesData = await db
      .select()
      .from(modules)
      .where(eq(modules.courseId, courseId))
      .orderBy(asc(modules.orderIndex))
    
    if (modulesData.length === 0) {
      return []
    }
    
    // Fetch all chapters for these modules in one query
    const moduleIds = modulesData.map(m => m.id)
    const chaptersData = await db
      .select()
      .from(chapters)
      .where(
        sql`${chapters.moduleId} IN (${sql.join(moduleIds.map(id => sql`${id}`), sql`, `)})`
      )
      .orderBy(asc(chapters.orderIndex))
    
    // Group chapters by moduleId
    const chaptersByModule = chaptersData.reduce((acc, chapter) => {
      if (!acc[chapter.moduleId]) {
        acc[chapter.moduleId] = []
      }
      acc[chapter.moduleId].push(chapter)
      return acc
    }, {} as Record<number, typeof chaptersData>)
    
    // Combine modules with their chapters
    return modulesData.map(module => ({
      ...module,
      chapters: chaptersByModule[module.id] || []
    }))
  } catch (error) {
    console.error("Error fetching modules with chapters:", error)
    throw new Error("Failed to fetch modules with chapters")
  }
}

/**
 * Get modules with their chapters and content items (for student view)
 * Extended type for modules containing chapters with content
 */
export interface ModuleWithChaptersAndContent extends Module {
  chapters: ChapterWithContent[]
}

export async function getModulesWithChaptersAndContent(
  courseId: number
): Promise<ModuleWithChaptersAndContent[]> {
  try {
    // Fetch all modules for the course
    const modulesData = await db
      .select()
      .from(modules)
      .where(eq(modules.courseId, courseId))
      .orderBy(asc(modules.orderIndex))
    
    if (modulesData.length === 0) {
      return []
    }
    
    // Fetch all chapters for these modules
    const moduleIds = modulesData.map(m => m.id)
    const chaptersData = await db
      .select()
      .from(chapters)
      .where(
        sql`${chapters.moduleId} IN (${sql.join(moduleIds.map(id => sql`${id}`), sql`, `)})`
      )
      .orderBy(asc(chapters.orderIndex))
    
    if (chaptersData.length === 0) {
      return modulesData.map(module => ({
        ...module,
        chapters: []
      }))
    }
    
    // Fetch all content items for these chapters
    const chapterIds = chaptersData.map(ch => ch.id)
    const contentItemsData = await db
      .select()
      .from(contentItems)
      .where(
        sql`${contentItems.chapterId} IN (${sql.join(chapterIds.map(id => sql`${id}`), sql`, `)})`
      )
      .orderBy(asc(contentItems.orderIndex))
    
    // Group content items by chapterId
    const contentByChapter = contentItemsData.reduce((acc, item) => {
      if (!acc[item.chapterId]) {
        acc[item.chapterId] = []
      }
      acc[item.chapterId].push(item)
      return acc
    }, {} as Record<number, typeof contentItemsData>)
    
    // Group chapters by moduleId, adding content items
    const chaptersByModule = chaptersData.reduce((acc, chapter) => {
      if (!acc[chapter.moduleId]) {
        acc[chapter.moduleId] = []
      }
      acc[chapter.moduleId].push({
        ...chapter,
        contentItems: (contentByChapter[chapter.id] || []) as ContentItem[]
      })
      return acc
    }, {} as Record<number, ChapterWithContent[]>)
    
    // Combine modules with their chapters (with content)
    return modulesData.map(module => ({
      ...module,
      chapters: chaptersByModule[module.id] || []
    }))
  } catch (error) {
    console.error("Error fetching modules with chapters and content:", error)
    throw new Error("Failed to fetch modules with chapters and content")
  }
}

/**
 * Create a new module with auto-assigned orderIndex
 */
export async function createModule(
  courseId: number,
  data: { title: string; description?: string | null; orderIndex?: number }
): Promise<Module> {
  try {
    // If orderIndex is not provided, get the next available index
    let orderIndex = data.orderIndex
    
    if (orderIndex === undefined) {
      const lastModule = await db
        .select({ maxOrder: sql<number>`COALESCE(MAX(${modules.orderIndex}), -1)` })
        .from(modules)
        .where(eq(modules.courseId, courseId))
      
      orderIndex = (lastModule[0]?.maxOrder ?? -1) + 1
    }
    
    const [newModule] = await db
      .insert(modules)
      .values({
        courseId,
        title: data.title,
        description: data.description || null,
        orderIndex
      })
      .returning()
    
    return newModule
  } catch (error) {
    console.error("Error creating module:", error)
    throw new Error("Failed to create module")
  }
}

/**
 * Update a module
 */
export async function updateModule(
  id: number,
  data: { title?: string; description?: string | null; orderIndex?: number }
): Promise<Module | null> {
  try {
    const [updatedModule] = await db
      .update(modules)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(modules.id, id))
      .returning()
    
    return updatedModule || null
  } catch (error) {
    console.error("Error updating module:", error)
    throw new Error("Failed to update module")
  }
}

/**
 * Delete a module (cascade deletes chapters automatically via DB constraint)
 */
export async function deleteModule(id: number): Promise<boolean> {
  try {
    const result = await db
      .delete(modules)
      .where(eq(modules.id, id))
      .returning({ id: modules.id })
    
    return result.length > 0
  } catch (error) {
    console.error("Error deleting module:", error)
    throw new Error("Failed to delete module")
  }
}

/**
 * Reorder modules within a course (transaction support)
 */
export async function reorderModules(
  courseId: number,
  moduleIds: number[]
): Promise<boolean> {
  try {
    // Use transaction to ensure atomicity
    await db.transaction(async (tx) => {
      for (let i = 0; i < moduleIds.length; i++) {
        await tx
          .update(modules)
          .set({ 
            orderIndex: i,
            updatedAt: new Date()
          })
          .where(
            and(
              eq(modules.id, moduleIds[i]),
              eq(modules.courseId, courseId)
            )
          )
      }
    })
    
    return true
  } catch (error) {
    console.error("Error reordering modules:", error)
    throw new Error("Failed to reorder modules")
  }
}

/**
 * Get module count for a course
 */
export async function getModuleCount(courseId: number): Promise<number> {
  try {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(modules)
      .where(eq(modules.courseId, courseId))
    
    return Number(result[0]?.count || 0)
  } catch (error) {
    console.error("Error getting module count:", error)
    throw new Error("Failed to get module count")
  }
}

/**
 * Check if a module belongs to a specific course (for authorization)
 */
export async function verifyModuleBelongsToCourse(
  moduleId: number,
  courseId: number
): Promise<boolean> {
  try {
    const [module] = await db
      .select({ id: modules.id })
      .from(modules)
      .where(
        and(
          eq(modules.id, moduleId),
          eq(modules.courseId, courseId)
        )
      )
      .limit(1)
    
    return !!module
  } catch (error) {
    console.error("Error verifying module belongs to course:", error)
    return false
  }
}

// ============================================================================
// Progress Tracking Functions
// ============================================================================

/**
 * Module progress data for a student
 */
export interface ModuleProgress {
  moduleId: number
  moduleTitle: string
  totalChapters: number
  completedChapters: number
  percentageComplete: number
  lastActivityAt: Date | null
}

/**
 * Get progress for a specific student in a specific module (T088)
 * 
 * @param studentId - Student user ID
 * @param moduleId - Module ID
 * @returns Module progress data
 */
export async function getModuleProgress(
  studentId: number,
  moduleId: number
): Promise<ModuleProgress | null> {
  try {
    // Get module details
    const [module] = await db
      .select({
        id: modules.id,
        title: modules.title,
      })
      .from(modules)
      .where(eq(modules.id, moduleId))
      .limit(1)
    
    if (!module) {
      return null
    }
    
    // Get all chapters for this module
    const moduleChapters = await db
      .select({ id: chapters.id })
      .from(chapters)
      .where(eq(chapters.moduleId, moduleId))
    
    const totalChapters = moduleChapters.length
    
    if (totalChapters === 0) {
      return {
        moduleId: module.id,
        moduleTitle: module.title,
        totalChapters: 0,
        completedChapters: 0,
        percentageComplete: 0,
        lastActivityAt: null,
      }
    }
    
    // Get completed chapters for this student in this module
    const chapterIds = moduleChapters.map(ch => ch.id)
    const completedProgress = await db
      .select({
        chapterId: chapterProgress.chapterId,
        completedAt: chapterProgress.completedAt,
      })
      .from(chapterProgress)
      .where(
        and(
          eq(chapterProgress.studentId, studentId),
          sql`${chapterProgress.chapterId} IN (${sql.join(chapterIds.map(id => sql`${id}`), sql`, `)})`
        )
      )
    
    const completedChapters = completedProgress.length
    const percentageComplete = totalChapters > 0 
      ? Math.round((completedChapters / totalChapters) * 100)
      : 0
    
    // Find most recent activity
    const lastActivityAt = completedProgress.length > 0
      ? completedProgress.reduce((latest, curr) => {
          const currDate = curr.completedAt || new Date(0)
          return currDate > (latest || new Date(0)) ? currDate : latest
        }, null as Date | null)
      : null
    
    return {
      moduleId: module.id,
      moduleTitle: module.title,
      totalChapters,
      completedChapters,
      percentageComplete,
      lastActivityAt,
    }
  } catch (error) {
    console.error("Error getting module progress:", error)
    throw new Error("Failed to get module progress")
  }
}

/**
 * Get progress for a student across all modules in a course (T089)
 * 
 * @param studentId - Student user ID
 * @param courseId - Course ID
 * @returns Array of module progress data
 */
export async function getModuleProgressForCourse(
  studentId: number,
  courseId: number
): Promise<ModuleProgress[]> {
  try {
    // Get all modules for the course
    const courseModules = await db
      .select({
        id: modules.id,
        title: modules.title,
      })
      .from(modules)
      .where(eq(modules.courseId, courseId))
      .orderBy(asc(modules.orderIndex))
    
    if (courseModules.length === 0) {
      return []
    }
    
    // Get all chapters for these modules
    const moduleIds = courseModules.map(m => m.id)
    const allChapters = await db
      .select({
        id: chapters.id,
        moduleId: chapters.moduleId,
      })
      .from(chapters)
      .where(
        sql`${chapters.moduleId} IN (${sql.join(moduleIds.map(id => sql`${id}`), sql`, `)})`
      )
    
    // Get all completed chapters for this student in this course
    const chapterIds = allChapters.map(ch => ch.id)
    const completedProgress = chapterIds.length > 0
      ? await db
          .select({
            chapterId: chapterProgress.chapterId,
            completedAt: chapterProgress.completedAt,
          })
          .from(chapterProgress)
          .where(
            and(
              eq(chapterProgress.studentId, studentId),
              sql`${chapterProgress.chapterId} IN (${sql.join(chapterIds.map(id => sql`${id}`), sql`, `)})`
            )
          )
      : []
    
    // Group chapters by module
    const chaptersByModule = allChapters.reduce((acc, chapter) => {
      if (!acc[chapter.moduleId]) {
        acc[chapter.moduleId] = []
      }
      acc[chapter.moduleId].push(chapter.id)
      return acc
    }, {} as Record<number, number[]>)
    
    // Group completed chapters by module
    const completedByModule = completedProgress.reduce((acc, progress) => {
      const chapter = allChapters.find(ch => ch.id === progress.chapterId)
      if (chapter && progress.chapterId) {
        if (!acc[chapter.moduleId]) {
          acc[chapter.moduleId] = []
        }
        acc[chapter.moduleId].push({
          chapterId: progress.chapterId,
          completedAt: progress.completedAt,
        })
      }
      return acc
    }, {} as Record<number, Array<{ chapterId: number; completedAt: Date | null }>>)
    
    // Build progress data for each module
    return courseModules.map(module => {
      const moduleChapterIds = chaptersByModule[module.id] || []
      const totalChapters = moduleChapterIds.length
      const completed = completedByModule[module.id] || []
      const completedChapters = completed.length
      const percentageComplete = totalChapters > 0
        ? Math.round((completedChapters / totalChapters) * 100)
        : 0
      
      const lastActivityAt = completed.length > 0
        ? completed.reduce((latest, curr) => {
            const currDate = curr.completedAt || new Date(0)
            return currDate > (latest || new Date(0)) ? currDate : latest
          }, null as Date | null)
        : null
      
      return {
        moduleId: module.id,
        moduleTitle: module.title,
        totalChapters,
        completedChapters,
        percentageComplete,
        lastActivityAt,
      }
    })
  } catch (error) {
    console.error("Error getting module progress for course:", error)
    throw new Error("Failed to get module progress for course")
  }
}

/**
 * Student statistics for a module (for teacher view)
 */
export interface ModuleStudentStats {
  moduleId: number
  moduleTitle: string
  totalChapters: number
  totalStudents: number
  studentsNotStarted: number
  studentsInProgress: number
  studentsCompleted: number
}

/**
 * Get module statistics for teacher view - all students' progress by module (T090)
 * 
 * @param courseId - Course ID
 * @returns Array of module statistics
 */
export async function getCourseModuleStats(
  courseId: number
): Promise<ModuleStudentStats[]> {
  try {
    // Get all modules for the course
    const courseModules = await db
      .select({
        id: modules.id,
        title: modules.title,
      })
      .from(modules)
      .where(eq(modules.courseId, courseId))
      .orderBy(asc(modules.orderIndex))
    
    if (courseModules.length === 0) {
      return []
    }
    
    // Get all enrolled students for this course
    const enrolledStudents = await db
      .select({ studentId: sql<number>`student_id` })
      .from(sql`enrollments`)
      .where(sql`course_id = ${courseId}`)
    
    const totalStudents = enrolledStudents.length
    const studentIds = enrolledStudents.map(e => e.studentId)
    
    if (totalStudents === 0) {
      return courseModules.map(module => ({
        moduleId: module.id,
        moduleTitle: module.title,
        totalChapters: 0,
        totalStudents: 0,
        studentsNotStarted: 0,
        studentsInProgress: 0,
        studentsCompleted: 0,
      }))
    }
    
    // Get all chapters for these modules
    const moduleIds = courseModules.map(m => m.id)
    const allChapters = await db
      .select({
        id: chapters.id,
        moduleId: chapters.moduleId,
      })
      .from(chapters)
      .where(
        sql`${chapters.moduleId} IN (${sql.join(moduleIds.map(id => sql`${id}`), sql`, `)})`
      )
    
    // Get all chapter progress for enrolled students
    const chapterIds = allChapters.map(ch => ch.id)
    const allProgress = chapterIds.length > 0 && studentIds.length > 0
      ? await db
          .select({
            studentId: chapterProgress.studentId,
            chapterId: chapterProgress.chapterId,
          })
          .from(chapterProgress)
          .where(
            and(
              sql`${chapterProgress.studentId} IN (${sql.join(studentIds.map(id => sql`${id}`), sql`, `)})`,
              sql`${chapterProgress.chapterId} IN (${sql.join(chapterIds.map(id => sql`${id}`), sql`, `)})`
            )
          )
      : []
    
    // Group chapters by module
    const chaptersByModule = allChapters.reduce((acc, chapter) => {
      if (!acc[chapter.moduleId]) {
        acc[chapter.moduleId] = []
      }
      acc[chapter.moduleId].push(chapter.id)
      return acc
    }, {} as Record<number, number[]>)
    
    // Build statistics for each module
    return courseModules.map(module => {
      const moduleChapterIds = chaptersByModule[module.id] || []
      const totalChapters = moduleChapterIds.length
      
      if (totalChapters === 0) {
        return {
          moduleId: module.id,
          moduleTitle: module.title,
          totalChapters: 0,
          totalStudents,
          studentsNotStarted: totalStudents,
          studentsInProgress: 0,
          studentsCompleted: 0,
        }
      }
      
      // Count progress for each student in this module
      const studentProgress = studentIds.map(studentId => {
        const completedInModule = allProgress.filter(
          p => p.studentId === studentId && moduleChapterIds.includes(p.chapterId!)
        ).length
        
        return {
          studentId,
          completed: completedInModule,
          status: completedInModule === 0
            ? 'not-started'
            : completedInModule === totalChapters
            ? 'completed'
            : 'in-progress',
        }
      })
      
      const studentsNotStarted = studentProgress.filter(s => s.status === 'not-started').length
      const studentsInProgress = studentProgress.filter(s => s.status === 'in-progress').length
      const studentsCompleted = studentProgress.filter(s => s.status === 'completed').length
      
      return {
        moduleId: module.id,
        moduleTitle: module.title,
        totalChapters,
        totalStudents,
        studentsNotStarted,
        studentsInProgress,
        studentsCompleted,
      }
    })
  } catch (error) {
    console.error("Error getting course module stats:", error)
    throw new Error("Failed to get course module stats")
  }
}
