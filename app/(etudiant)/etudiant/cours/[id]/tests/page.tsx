import { requireAuth } from "@/lib/auth/auth";
import { CourseQuizzesView } from "@/components/student/course-quizzes-view";
import {
  getQuizzesByCourseWithAttempts,
  getCourseById,
} from "@/lib/db/queries";
import { notFound } from "next/navigation";

// Revalidate this page every 10 seconds
export const revalidate = 10;

interface CourseQuizzesPageProps {
  params: {
    id: string;
  };
}

export default async function CourseQuizzesPage({
  params,
}: CourseQuizzesPageProps) {
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

  // Fetch quizzes with student attempts
  const userId = parseInt(user.id);
  const quizzesResult = await getQuizzesByCourseWithAttempts(courseId, userId);
  const quizzes = quizzesResult.success ? quizzesResult.data : [];

  return (
    <CourseQuizzesView
      courseId={courseId}
      courseTitle={course.title}
      quizzes={quizzes}
    />
  );
}
