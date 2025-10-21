import { eq, and, desc } from "drizzle-orm";
import { db, handleDbError } from "./index";
import { quizzes, quizAttempts } from "@/drizzle/schema";

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

