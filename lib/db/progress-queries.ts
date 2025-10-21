import { eq, and } from "drizzle-orm";
import { db, handleDbError } from "./index";
import { chapterProgress, chapters } from "@/drizzle/schema";

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

