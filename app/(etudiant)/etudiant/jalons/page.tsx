import { requireAuth } from "@/lib/auth/auth";
import { CheckpointsView } from "@/components/student/checkpoints-view";
import {
  getStudentEnrolledCoursesWithProgress,
  getPassedQuizAttempts,
} from "@/lib/db/queries";

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
  const passedQuizzesResult = await getPassedQuizAttempts(userId);
  const passedQuizzes = passedQuizzesResult.success
    ? passedQuizzesResult.data
    : [];

  return (
    <CheckpointsView
      user={user}
      enrolledCourses={enrolledCourses}
      passedQuizzes={passedQuizzes}
    />
  );
}
