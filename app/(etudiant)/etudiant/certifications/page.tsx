import { getCurrentUser } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { CertificatesView } from "@/components/student/certificates-view";
import { getStudentEnrolledCoursesWithProgress } from "@/lib/db/queries";

export default async function CertificatesPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "STUDENT") {
    redirect("/unauthorized");
  }

  // Fetch enrolled courses with progress
  const userId = parseInt(user.id);
  const enrolledCoursesResult = await getStudentEnrolledCoursesWithProgress(
    userId
  );
  const enrolledCourses = enrolledCoursesResult.success
    ? enrolledCoursesResult.data
    : [];

  return <CertificatesView user={user} enrolledCourses={enrolledCourses} />;
}
