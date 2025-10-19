import { requireAuth } from "@/lib/auth/auth";
import { StudentDashboard } from "@/components/student/student-dashboard";
import { getStudentEnrolledCoursesWithProgress } from "@/lib/db/queries";

export default async function StudentPage() {
  const user = await requireAuth(["student"]);

  // Fetch enrolled courses with progress
  const userId = parseInt(user.id);
  const enrolledCoursesResult = await getStudentEnrolledCoursesWithProgress(
    userId
  );
  const enrolledCourses = enrolledCoursesResult.success
    ? enrolledCoursesResult.data
    : [];

  return <StudentDashboard user={user} enrolledCourses={enrolledCourses} />;
}
