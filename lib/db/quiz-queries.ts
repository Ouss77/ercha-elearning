/**
 * Quiz Queries
 *
 * Handles all database queries related to quizzes and quiz attempts.
 * Quizzes are stored as content items with contentType="quiz".
 * Quiz attempts track student answers, scores, and pass/fail status.
 *
 * @module quiz-queries
 */

import { db } from "@/lib/db";
import { quizAttempts, contentItems, chapters, users } from "@/drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";

/**
 * Result type for database operations
 */
type QueryResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Create a new quiz attempt
 */
export async function createQuizAttempt(data: {
  studentId: number;
  quizId: number;
  answers: Record<string, any>;
  score: number;
  passed: boolean;
}): Promise<QueryResult<typeof quizAttempts.$inferSelect>> {
  try {
    const [attempt] = await db
      .insert(quizAttempts)
      .values({
        studentId: data.studentId,
        quizId: data.quizId,
        answers: data.answers,
        score: data.score,
        passed: data.passed,
      })
      .returning();

    return { success: true, data: attempt };
  } catch (error) {
    console.error("Error creating quiz attempt:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create quiz attempt",
    };
  }
}

/**
 * Get all quiz attempts for a student
 */
export async function getQuizAttemptsByStudent(
  studentId: number
): Promise<QueryResult<Array<typeof quizAttempts.$inferSelect>>> {
  try {
    const attempts = await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.studentId, studentId))
      .orderBy(desc(quizAttempts.attemptedAt));

    return { success: true, data: attempts };
  } catch (error) {
    console.error("Error fetching quiz attempts:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch quiz attempts",
    };
  }
}

/**
 * Get all attempts for a specific quiz by a student
 */
export async function getStudentQuizAttempts(
  studentId: number,
  quizId: number
): Promise<QueryResult<Array<typeof quizAttempts.$inferSelect>>> {
  try {
    const attempts = await db
      .select()
      .from(quizAttempts)
      .where(
        and(
          eq(quizAttempts.studentId, studentId),
          eq(quizAttempts.quizId, quizId)
        )
      )
      .orderBy(desc(quizAttempts.attemptedAt));

    return { success: true, data: attempts };
  } catch (error) {
    console.error("Error fetching student quiz attempts:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch student quiz attempts",
    };
  }
}

/**
 * Get best attempt score for a quiz
 */
export async function getBestQuizScore(
  studentId: number,
  quizId: number
): Promise<QueryResult<number>> {
  try {
    const result = await db
      .select({ maxScore: sql<number>`MAX(${quizAttempts.score})` })
      .from(quizAttempts)
      .where(
        and(
          eq(quizAttempts.studentId, studentId),
          eq(quizAttempts.quizId, quizId)
        )
      );

    const maxScore = result[0]?.maxScore ?? 0;
    return { success: true, data: maxScore };
  } catch (error) {
    console.error("Error fetching best quiz score:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch best quiz score",
    };
  }
}

/**
 * Check if student has passed a quiz
 */
export async function hasPassedQuiz(
  studentId: number,
  quizId: number
): Promise<QueryResult<boolean>> {
  try {
    const result = await db
      .select()
      .from(quizAttempts)
      .where(
        and(
          eq(quizAttempts.studentId, studentId),
          eq(quizAttempts.quizId, quizId),
          eq(quizAttempts.passed, true)
        )
      )
      .limit(1);

    return { success: true, data: result.length > 0 };
  } catch (error) {
    console.error("Error checking quiz pass status:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to check quiz pass status",
    };
  }
}

/**
 * Get all quizzes for a course with student attempt data
 */
export async function getQuizzesByCourseWithAttempts(
  courseId: number,
  studentId: number
): Promise<
  QueryResult<
    Array<{
      quizId: number;
      quizTitle: string;
      passingScore: number | null;
      maxAttempts: number;
      chapterId: number | null;
      chapterTitle: string | null;
      chapterOrder: number | null;
      totalAttempts: number;
      bestScore: number | null;
      passed: boolean;
      lastAttemptedAt: Date | null;
    }>
  >
> {
  try {
    // Get all quiz content items for the course
    const quizzes = await db
      .select({
        quizId: contentItems.id,
        quizTitle: contentItems.title,
        chapterId: contentItems.chapterId,
        chapterTitle: chapters.title,
        chapterOrder: chapters.orderIndex,
        contentData: contentItems.contentData,
      })
      .from(contentItems)
      .innerJoin(chapters, eq(contentItems.chapterId, chapters.id))
      .where(
        and(
          eq(chapters.courseId, courseId),
          eq(contentItems.contentType, "quiz")
        )
      )
      .orderBy(chapters.orderIndex, contentItems.orderIndex);

    // For each quiz, get the student's attempt data
    const quizzesWithAttempts = await Promise.all(
      quizzes.map(async (quiz) => {
        const attempts = await db
          .select()
          .from(quizAttempts)
          .where(
            and(
              eq(quizAttempts.studentId, studentId),
              eq(quizAttempts.quizId, quiz.quizId)
            )
          )
          .orderBy(desc(quizAttempts.attemptedAt));

        const bestAttempt = attempts.reduce<(typeof attempts)[0] | null>(
          (best, current) => {
            if (!best) return current;
            return current.score > best.score ? current : best;
          },
          null
        );

        const passed = attempts.some((attempt) => attempt.passed);
        const contentData = quiz.contentData as any;
        const passingScore =
          contentData?.passingScore || contentData?.passing_score || 70;
        const maxAttempts = contentData?.maxAttempts || contentData?.max_attempts || 3;

        return {
          quizId: quiz.quizId,
          quizTitle: quiz.quizTitle,
          passingScore,
          maxAttempts,
          chapterId: quiz.chapterId,
          chapterTitle: quiz.chapterTitle,
          chapterOrder: quiz.chapterOrder,
          totalAttempts: attempts.length,
          bestScore: bestAttempt?.score ?? null,
          passed,
          lastAttemptedAt: attempts[0]?.attemptedAt ?? null,
        };
      })
    );

    return { success: true, data: quizzesWithAttempts };
  } catch (error) {
    console.error("Error fetching quizzes with attempts:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch quizzes with attempts",
    };
  }
}

/**
 * Get passed quiz attempts with details (for jalons/checkpoints page)
 */
export async function getPassedQuizAttempts(studentId: number): Promise<
  QueryResult<
    Array<{
      id: number;
      quizId: number | null;
      score: number;
      passed: boolean;
      attemptedAt: Date | null;
      quizTitle: string;
      quizType: string;
    }>
  >
> {
  try {
    const passedAttempts = await db
      .select({
        id: quizAttempts.id,
        quizId: quizAttempts.quizId,
        score: quizAttempts.score,
        passed: quizAttempts.passed,
        attemptedAt: quizAttempts.attemptedAt,
        quizTitle: contentItems.title,
        quizType: contentItems.contentType,
      })
      .from(quizAttempts)
      .innerJoin(contentItems, eq(quizAttempts.quizId, contentItems.id))
      .where(
        and(
          eq(quizAttempts.studentId, studentId),
          eq(quizAttempts.passed, true)
        )
      )
      .orderBy(desc(quizAttempts.attemptedAt));

    return { success: true, data: passedAttempts };
  } catch (error) {
    console.error("Error fetching passed quiz attempts:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch passed quiz attempts",
    };
  }
}

/**
 * Get quiz statistics for a student
 */
export async function getStudentQuizStats(studentId: number): Promise<
  QueryResult<{
    totalAttempts: number;
    totalPassed: number;
    totalFailed: number;
    averageScore: number;
  }>
> {
  try {
    const result = await db
      .select({
        totalAttempts: sql<number>`COUNT(*)`,
        totalPassed: sql<number>`COUNT(*) FILTER (WHERE ${quizAttempts.passed} = true)`,
        totalFailed: sql<number>`COUNT(*) FILTER (WHERE ${quizAttempts.passed} = false)`,
        averageScore: sql<number>`AVG(${quizAttempts.score})`,
      })
      .from(quizAttempts)
      .where(eq(quizAttempts.studentId, studentId));

    const stats = result[0] || {
      totalAttempts: 0,
      totalPassed: 0,
      totalFailed: 0,
      averageScore: 0,
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error("Error fetching student quiz stats:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch student quiz stats",
    };
  }
}

/**
 * Delete a quiz attempt (for admin/teacher use)
 */
export async function deleteQuizAttempt(
  attemptId: number
): Promise<QueryResult<void>> {
  try {
    await db.delete(quizAttempts).where(eq(quizAttempts.id, attemptId));

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting quiz attempt:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete quiz attempt",
    };
  }
}
