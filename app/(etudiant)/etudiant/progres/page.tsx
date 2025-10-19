import { getCurrentUser } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { ProgressView } from "@/components/student/progress-view";
import {
  getStudentEnrolledCoursesWithProgress,
  getStudentQuizAttemptsWithDetails,
} from "@/lib/db/queries";

export default async function ProgressPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "STUDENT") {
    redirect("/unauthorized");
  }

  // Fetch enrolled courses with progress
  const userId = parseInt(user.id);
  const [enrolledCoursesResult, quizAttemptsResult] = await Promise.all([
    getStudentEnrolledCoursesWithProgress(userId),
    getStudentQuizAttemptsWithDetails(userId),
  ]);

  const enrolledCourses = enrolledCoursesResult.success
    ? enrolledCoursesResult.data
    : [];
  const quizAttempts = quizAttemptsResult.success
    ? quizAttemptsResult.data
    : [];

  return (
    <ProgressView
      user={user}
      enrolledCourses={enrolledCourses}
      quizAttempts={quizAttempts}
    />
  );
}
