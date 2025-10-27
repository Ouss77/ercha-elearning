import { requireAuth } from "@/lib/auth/auth";
import { CourseContentView } from "@/components/student/course-content-view";
import {
  getCourseById,
  getChaptersWithContent,
  getUserById,
  getDomainById,
  getQuizzesByCourseWithAttempts,
} from "@/lib/db/queries";
import { getModulesWithChaptersAndContent } from "@/lib/db/module-queries";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { chapterProgress } from "@/drizzle/schema";
import { eq, and, inArray } from "drizzle-orm";

// Revalidate this page every 10 seconds to keep quiz attempts fresh
export const revalidate = 10;

interface CoursePageProps {
  params: { id: string };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const user = await requireAuth(["student"]);
  const courseId = parseInt(params.id);

  if (isNaN(courseId)) {
    notFound();
  }

  // Fetch course details
  const courseResult = await getCourseById(courseId);
  if (!courseResult.success || !courseResult.data) {
    notFound();
  }

  const course = courseResult.data;

  // Fetch modules with chapters (modular structure)
  const modules = await getModulesWithChaptersAndContent(courseId);

  // Calculate total chapters across all modules
  const totalChapters = modules.reduce(
    (sum, module) => sum + module.chapters.length,
    0
  );
  const allChapterIds = modules.flatMap((module) =>
    module.chapters.map((ch) => ch.id)
  );

  // Fetch domain
  let domain = null;
  if (course.domainId) {
    const domainResult = await getDomainById(course.domainId);
    if (domainResult.success && domainResult.data) {
      domain = domainResult.data;
    }
  }

  // Fetch teacher
  let teacher = null;
  if (course.teacherId) {
    const teacherResult = await getUserById(course.teacherId);
    if (teacherResult.success && teacherResult.data) {
      teacher = teacherResult.data;
    }
  }

  // Fetch completed chapters for this student
  const studentId = parseInt(user.id);
  let completedChapters: number[] = [];

  if (allChapterIds.length > 0) {
    const completedChaptersData = await db
      .select({ chapterId: chapterProgress.chapterId })
      .from(chapterProgress)
      .where(eq(chapterProgress.studentId, studentId));

    completedChapters = completedChaptersData
      .map((cp) => cp.chapterId)
      .filter((id): id is number => id !== null);
  }

  // Fetch quiz attempts for all quizzes in this course
  const quizAttemptsResult = await getQuizzesByCourseWithAttempts(
    courseId,
    studentId
  );
  const quizzes = quizAttemptsResult.success ? quizAttemptsResult.data : [];

  // Transform to the format expected by CourseContentView
  const quizAttempts = quizzes.map((quiz) => ({
    quizId: quiz.quizId,
    totalAttempts: quiz.totalAttempts,
    bestScore: quiz.bestScore,
    passed: quiz.passed,
    maxAttempts: quiz.maxAttempts,
  }));

  return (
    <CourseContentView
      user={user}
      course={course}
      domain={domain}
      teacher={teacher}
      modules={modules}
      completedChapters={completedChapters}
      totalChapters={totalChapters}
      quizAttempts={quizAttempts}
    />
  );
}
