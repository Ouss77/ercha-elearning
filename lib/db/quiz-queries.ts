import { eq, and, desc } from "drizzle-orm";
import { db, handleDbError } from "./index";
import { quizzes, quizAttempts, chapters, courses } from "@/drizzle/schema";

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
        passingScore: data.passingScore ?? 70,
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

// Get all quizzes for a course with student attempts
export async function getQuizzesByCourseWithAttempts(
  courseId: number,
  studentId: number
) {
  try {
    const result = await db
      .select({
        quizId: quizzes.id,
        quizTitle: quizzes.title,
        passingScore: quizzes.passingScore,
        chapterId: chapters.id,
        chapterTitle: chapters.title,
        chapterOrder: chapters.orderIndex,
        attemptId: quizAttempts.id,
        score: quizAttempts.score,
        passed: quizAttempts.passed,
        attemptedAt: quizAttempts.attemptedAt,
      })
      .from(quizzes)
      .innerJoin(chapters, eq(quizzes.chapterId, chapters.id))
      .innerJoin(courses, eq(chapters.courseId, courses.id))
      .leftJoin(
        quizAttempts,
        and(
          eq(quizAttempts.quizId, quizzes.id),
          eq(quizAttempts.studentId, studentId)
        )
      )
      .where(eq(courses.id, courseId))
      .orderBy(chapters.orderIndex, quizzes.id);

    // Group by quiz to get best attempt
    const quizzesMap = new Map();
    result.forEach((row) => {
      const quizKey = row.quizId;
      if (!quizzesMap.has(quizKey)) {
        quizzesMap.set(quizKey, {
          quizId: row.quizId,
          quizTitle: row.quizTitle,
          passingScore: row.passingScore,
          chapterId: row.chapterId,
          chapterTitle: row.chapterTitle,
          chapterOrder: row.chapterOrder,
          attempts: [],
        });
      }

      if (row.attemptId) {
        quizzesMap.get(quizKey).attempts.push({
          attemptId: row.attemptId,
          score: row.score,
          passed: row.passed,
          attemptedAt: row.attemptedAt,
        });
      }
    });

    // Convert map to array and add best attempt info
    const quizzesWithAttempts = Array.from(quizzesMap.values()).map((quiz) => {
      const bestAttempt =
        quiz.attempts.length > 0
          ? quiz.attempts.reduce((best: any, current: any) =>
              current.score > best.score ? current : best
            )
          : null;

      return {
        ...quiz,
        totalAttempts: quiz.attempts.length,
        bestScore: bestAttempt?.score || null,
        passed: bestAttempt?.passed || false,
        lastAttemptedAt:
          quiz.attempts.length > 0
            ? quiz.attempts[quiz.attempts.length - 1].attemptedAt
            : null,
      };
    });

    return { success: true, data: quizzesWithAttempts };
  } catch (error) {
    return handleDbError(error);
  }
}
