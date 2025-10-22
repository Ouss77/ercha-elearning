/**
 * Chapter progress query operations
 * 
 * This module provides database operations for tracking student progress through course chapters.
 * Includes marking chapters as complete/incomplete and retrieving progress statistics.
 * 
 * @module progress-queries
 */

import { eq, and } from "drizzle-orm";
import { db } from "./db";
import { chapterProgress, chapters } from "@/drizzle/schema";
import { createBaseQueries } from "./base-queries";
import { handleDbError } from "./error-handler";
import { validateId } from "./validation";
import { DbResult } from "./types";

// Create base queries for chapter progress
const progressBaseQueries = createBaseQueries(chapterProgress, chapterProgress.id);

/**
 * Get chapter progress for a specific student and chapter
 * 
 * @param studentId - The student's user ID
 * @param chapterId - The chapter ID
 * @returns Result with the progress record or null if not found
 * 
 * @example
 * ```typescript
 * const progress = await getChapterProgress(1, 5);
 * if (progress.success && progress.data) {
 *   console.log('Completed at:', progress.data.completedAt);
 * }
 * ```
 */
export async function getChapterProgress(
  studentId: number,
  chapterId: number
): Promise<DbResult<typeof chapterProgress.$inferSelect | null>> {
  const validStudentId = validateId(studentId);
  if (!validStudentId.success) return validStudentId as any;

  const validChapterId = validateId(chapterId);
  if (!validChapterId.success) return validChapterId as any;

  return progressBaseQueries.findOne(
    and(
      eq(chapterProgress.studentId, validStudentId.data),
      eq(chapterProgress.chapterId, validChapterId.data)
    )!
  );
}

/**
 * Get all chapter progress for a student in a specific course
 * Optimized with a single join to fetch chapter details
 * 
 * @param studentId - The student's user ID
 * @param courseId - The course ID
 * @returns Result with array of progress records with chapter details
 * 
 * @example
 * ```typescript
 * const progress = await getStudentProgressByCourse(1, 10);
 * if (progress.success) {
 *   console.log(`Completed ${progress.data.length} chapters`);
 * }
 * ```
 */
export async function getStudentProgressByCourse(
  studentId: number,
  courseId: number
): Promise<DbResult<Array<{
  id: number;
  studentId: number | null;
  chapterId: number | null;
  completedAt: Date | null;
  chapterTitle: string;
  chapterOrderIndex: number;
}>>> {
  const validStudentId = validateId(studentId);
  if (!validStudentId.success) return validStudentId as any;

  const validCourseId = validateId(courseId);
  if (!validCourseId.success) return validCourseId as any;

  try {
    // Optimized query with single join and proper ordering
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
          eq(chapterProgress.studentId, validStudentId.data),
          eq(chapters.courseId, validCourseId.data)
        )
      )
      .orderBy(chapters.orderIndex);

    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error, 'getStudentProgressByCourse');
  }
}

/**
 * Mark a chapter as complete for a student
 * Idempotent operation - returns existing record if already completed
 * 
 * @param studentId - The student's user ID
 * @param chapterId - The chapter ID
 * @returns Result with the progress record (existing or newly created)
 * 
 * @example
 * ```typescript
 * const result = await markChapterComplete(1, 5);
 * if (result.success) {
 *   console.log('Chapter marked complete');
 * }
 * ```
 */
export async function markChapterComplete(
  studentId: number,
  chapterId: number
): Promise<DbResult<typeof chapterProgress.$inferSelect>> {
  const validStudentId = validateId(studentId);
  if (!validStudentId.success) return validStudentId as any;

  const validChapterId = validateId(chapterId);
  if (!validChapterId.success) return validChapterId as any;

  // Check if already completed using base query
  const existing = await progressBaseQueries.findOne(
    and(
      eq(chapterProgress.studentId, validStudentId.data),
      eq(chapterProgress.chapterId, validChapterId.data)
    )!
  );

  if (!existing.success) return existing as any;

  // Return existing record if already completed
  if (existing.data) {
    return { success: true, data: existing.data };
  }

  // Create new progress record using base query
  return progressBaseQueries.create({
    studentId: validStudentId.data,
    chapterId: validChapterId.data,
  });
}

/**
 * Unmark a chapter as complete for a student (remove progress record)
 * 
 * @param studentId - The student's user ID
 * @param chapterId - The chapter ID
 * @returns Result with the deleted progress record or null if not found
 * 
 * @example
 * ```typescript
 * const result = await unmarkChapterComplete(1, 5);
 * if (result.success && result.data) {
 *   console.log('Chapter unmarked');
 * }
 * ```
 */
export async function unmarkChapterComplete(
  studentId: number,
  chapterId: number
): Promise<DbResult<typeof chapterProgress.$inferSelect | null>> {
  const validStudentId = validateId(studentId);
  if (!validStudentId.success) return validStudentId as any;

  const validChapterId = validateId(chapterId);
  if (!validChapterId.success) return validChapterId as any;

  try {
    const result = await db
      .delete(chapterProgress)
      .where(
        and(
          eq(chapterProgress.studentId, validStudentId.data),
          eq(chapterProgress.chapterId, validChapterId.data)
        )
      )
      .returning();

    return { success: true, data: result[0] || null };
  } catch (error) {
    return handleDbError(error, 'unmarkChapterComplete');
  }
}

