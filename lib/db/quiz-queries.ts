/**
 * Quiz query functions
 * 
 * This module provides database operations for quizzes and quiz attempts.
 * Uses base query utilities for consistent patterns and error handling.
 */

import { eq, and, desc } from "drizzle-orm";
import { db } from "./index";
import { handleDbError } from "./error-handler";
import { quizzes, quizAttempts, chapters } from "@/drizzle/schema";
import { createBaseQueries } from "./base-queries";
import { validateId, validateRequired, validateForeignKey, validateNumberRange } from "./validation";
import { DbResult } from "./types";

// Create base query operations for quizzes and quiz attempts
const quizBaseQueries = createBaseQueries(quizzes, quizzes.id);
const quizAttemptBaseQueries = createBaseQueries(quizAttempts, quizAttempts.id);

/**
 * Get a quiz by ID
 * 
 * @param id - The quiz ID
 * @returns Result with quiz data or null if not found
 * 
 * @example
 * ```typescript
 * const quiz = await getQuizById(1);
 * if (!quiz.success) return quiz;
 * ```
 */
export async function getQuizById(id: number): Promise<DbResult<typeof quizzes.$inferSelect | null>> {
  return quizBaseQueries.findById(id);
}

/**
 * Get all quizzes for a specific chapter
 * 
 * @param chapterId - The chapter ID
 * @returns Result with array of quizzes
 */
export async function getQuizzesByChapter(chapterId: number): Promise<DbResult<(typeof quizzes.$inferSelect)[]>> {
  const validId = validateId(chapterId);
  if (!validId.success) return validId as any;

  return quizBaseQueries.findMany(eq(quizzes.chapterId, validId.data));
}

/**
 * Create a new quiz with chapter validation
 * 
 * @param data - Quiz data including chapterId, title, questions, and optional passingScore
 * @returns Result with created quiz
 * 
 * @example
 * ```typescript
 * const quiz = await createQuiz({
 *   chapterId: 1,
 *   title: 'Chapter 1 Quiz',
 *   questions: [{ question: 'What is...', options: [...] }],
 *   passingScore: 80
 * });
 * ```
 */
export async function createQuiz(data: {
  chapterId: number;
  title: string;
  questions: any;
  passingScore?: number;
}): Promise<DbResult<typeof quizzes.$inferSelect>> {
  // Validate chapter ID
  const validChapterId = validateId(data.chapterId);
  if (!validChapterId.success) return validChapterId as any;

  // Validate title
  const validTitle = validateRequired(data.title, 'title');
  if (!validTitle.success) return validTitle as any;

  // Validate questions
  const validQuestions = validateRequired(data.questions, 'questions');
  if (!validQuestions.success) return validQuestions as any;

  // Validate passing score if provided
  if (data.passingScore !== undefined) {
    const validScore = validateNumberRange(data.passingScore, 'passingScore', 0, 100);
    if (!validScore.success) return validScore as any;
  }

  // Validate that chapter exists
  const chapterExists = await validateForeignKey(
    chapters,
    chapters.id,
    validChapterId.data,
    'chapterId'
  );
  if (!chapterExists.success) return chapterExists as any;

  // Create quiz
  return quizBaseQueries.create({
    chapterId: validChapterId.data,
    title: validTitle.data,
    questions: validQuestions.data,
    passingScore: data.passingScore ?? 70,
  });
}

/**
 * Update a quiz
 * 
 * @param id - The quiz ID
 * @param data - Partial quiz data to update
 * @returns Result with updated quiz
 */
export async function updateQuiz(
  id: number,
  data: Partial<{
    title: string;
    questions: any;
    passingScore: number;
  }>
): Promise<DbResult<typeof quizzes.$inferSelect>> {
  // Validate passing score if provided
  if (data.passingScore !== undefined) {
    const validScore = validateNumberRange(data.passingScore, 'passingScore', 0, 100);
    if (!validScore.success) return validScore as any;
  }

  return quizBaseQueries.update(id, data);
}

/**
 * Delete a quiz
 * 
 * @param id - The quiz ID
 * @returns Result with deleted quiz
 */
export async function deleteQuiz(id: number): Promise<DbResult<typeof quizzes.$inferSelect>> {
  return quizBaseQueries.delete(id);
}

// Quiz Attempt query functions

/**
 * Get a quiz attempt by ID
 * 
 * @param id - The quiz attempt ID
 * @returns Result with quiz attempt data or null if not found
 */
export async function getQuizAttemptById(id: number): Promise<DbResult<typeof quizAttempts.$inferSelect | null>> {
  return quizAttemptBaseQueries.findById(id);
}

/**
 * Get all quiz attempts for a specific student and quiz
 * 
 * @param studentId - The student ID
 * @param quizId - The quiz ID
 * @returns Result with array of quiz attempts ordered by most recent first
 */
export async function getQuizAttemptsByStudent(
  studentId: number,
  quizId: number
): Promise<DbResult<(typeof quizAttempts.$inferSelect)[]>> {
  const validStudentId = validateId(studentId);
  if (!validStudentId.success) return validStudentId as any;

  const validQuizId = validateId(quizId);
  if (!validQuizId.success) return validQuizId as any;

  try {
    const result = await db
      .select()
      .from(quizAttempts)
      .where(
        and(
          eq(quizAttempts.studentId, validStudentId.data),
          eq(quizAttempts.quizId, validQuizId.data)
        )
      )
      .orderBy(desc(quizAttempts.attemptedAt));

    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error, 'getQuizAttemptsByStudent');
  }
}

/**
 * Get all quiz attempts for a specific student across all quizzes
 * 
 * @param studentId - The student ID
 * @returns Result with array of quiz attempts ordered by most recent first
 */
export async function getAllQuizAttemptsByStudent(studentId: number): Promise<DbResult<(typeof quizAttempts.$inferSelect)[]>> {
  const validStudentId = validateId(studentId);
  if (!validStudentId.success) return validStudentId as any;

  try {
    const result = await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.studentId, validStudentId.data))
      .orderBy(desc(quizAttempts.attemptedAt));

    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error, 'getAllQuizAttemptsByStudent');
  }
}

/**
 * Create a new quiz attempt with validation
 * 
 * @param data - Quiz attempt data including studentId, quizId, answers, score, and passed status
 * @returns Result with created quiz attempt
 * 
 * @example
 * ```typescript
 * const attempt = await createQuizAttempt({
 *   studentId: 1,
 *   quizId: 1,
 *   answers: [{ questionId: 1, answer: 'A' }],
 *   score: 85,
 *   passed: true
 * });
 * ```
 */
export async function createQuizAttempt(data: {
  studentId: number;
  quizId: number;
  answers: any;
  score: number;
  passed: boolean;
}): Promise<DbResult<typeof quizAttempts.$inferSelect>> {
  // Validate student ID
  const validStudentId = validateId(data.studentId);
  if (!validStudentId.success) return validStudentId as any;

  // Validate quiz ID
  const validQuizId = validateId(data.quizId);
  if (!validQuizId.success) return validQuizId as any;

  // Validate answers
  const validAnswers = validateRequired(data.answers, 'answers');
  if (!validAnswers.success) return validAnswers as any;

  // Validate score
  const validScore = validateNumberRange(data.score, 'score', 0, 100);
  if (!validScore.success) return validScore as any;

  // Validate passed is boolean
  if (typeof data.passed !== 'boolean') {
    return {
      success: false,
      error: 'passed must be a boolean value',
    };
  }

  // Create quiz attempt
  return quizAttemptBaseQueries.create({
    studentId: validStudentId.data,
    quizId: validQuizId.data,
    answers: validAnswers.data,
    score: validScore.data,
    passed: data.passed,
  });
}

/**
 * Get the best quiz attempt for a student on a specific quiz
 * Optimized to return only the highest scoring attempt
 * 
 * @param studentId - The student ID
 * @param quizId - The quiz ID
 * @returns Result with the best quiz attempt or null if no attempts exist
 * 
 * @example
 * ```typescript
 * const bestAttempt = await getBestQuizAttempt(1, 1);
 * if (bestAttempt.success && bestAttempt.data) {
 *   console.log(`Best score: ${bestAttempt.data.score}`);
 * }
 * ```
 */
export async function getBestQuizAttempt(
  studentId: number,
  quizId: number
): Promise<DbResult<typeof quizAttempts.$inferSelect | null>> {
  const validStudentId = validateId(studentId);
  if (!validStudentId.success) return validStudentId as any;

  const validQuizId = validateId(quizId);
  if (!validQuizId.success) return validQuizId as any;

  try {
    // Optimized query: order by score descending and limit to 1
    // This ensures we get the best attempt without fetching all attempts
    const result = await db
      .select()
      .from(quizAttempts)
      .where(
        and(
          eq(quizAttempts.studentId, validStudentId.data),
          eq(quizAttempts.quizId, validQuizId.data)
        )
      )
      .orderBy(desc(quizAttempts.score))
      .limit(1);

    return { success: true, data: result[0] || null };
  } catch (error) {
    return handleDbError(error, 'getBestQuizAttempt');
  }
}


/**
 * Get student quiz attempts with course and chapter details
 * Includes enriched information about the quiz, chapter, course, and domain
 * 
 * @param studentId - The student ID
 * @returns Result with quiz attempts and related information
 * 
 * @performance
 * - Uses joins to avoid N+1 queries
 * - Ordered by attempt date (most recent first)
 * 
 * @example
 * ```typescript
 * const result = await getStudentQuizAttemptsWithDetails(studentId);
 * if (result.success) {
 *   result.data.forEach(attempt => {
 *     console.log(`${attempt.quizTitle}: ${attempt.score}/${attempt.maxScore}`);
 *   });
 * }
 * ```
 */
export async function getStudentQuizAttemptsWithDetails(studentId: number) {
  const validId = validateId(studentId);
  if (!validId.success) return validId as any;

  try {
    const { courses, domains } = await import("@/drizzle/schema");

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
      .where(eq(quizAttempts.studentId, validId.data))
      .orderBy(desc(quizAttempts.attemptedAt));

    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error, 'getStudentQuizAttemptsWithDetails');
  }
}
