import { requireAuth } from "@/lib/auth/auth";
import { CheckpointsView } from "@/components/student/checkpoints-view";
import { getStudentEnrolledCoursesWithProgress } from "@/lib/db/queries";
import { db } from "@/lib/db";
import { quizAttempts, contentItems } from "@/drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export default async function CheckpointsPage() {
  const user = await requireAuth(["student"]);

  // Fetch enrolled courses with progress
  const userId = parseInt(user.id);
  const enrolledCoursesResult = await getStudentEnrolledCoursesWithProgress(
    userId
  );
  const enrolledCourses = enrolledCoursesResult.success
    ? enrolledCoursesResult.data
    : [];

  // Fetch all passed quiz attempts
  const passedQuizzes = await db
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
      and(eq(quizAttempts.studentId, userId), eq(quizAttempts.passed, true))
    )
    .orderBy(desc(quizAttempts.attemptedAt));

  return (
    <CheckpointsView
      user={user}
      enrolledCourses={enrolledCourses}
      passedQuizzes={passedQuizzes}
    />
  );
}
