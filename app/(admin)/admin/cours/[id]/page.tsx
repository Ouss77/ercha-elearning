import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/auth";
import { getCourseById, getChaptersWithContent, getEnrollmentsByCourseId } from "@/lib/db/queries";
import { CourseDetailPage } from "@/components/admin/courses";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: {
    id: string;
  };
}

export default async function CourseDetailPageRoute({ params }: PageProps) {
  const user = await requireAuth(["admin", "teacher"]);

  const courseId = parseInt(params.id, 10);
  if (isNaN(courseId)) {
    redirect("/admin/cours");
  }

  const courseResult = await getCourseById(courseId);
  if (!courseResult.success || !courseResult.data) {
    redirect("/admin/cours");
  }

  const course = courseResult.data;

  // For trainers, verify they own this course
  if (user.role === "TRAINER" && course.teacherId !== parseInt(user.id)) {
    redirect("/non-autorise");
  }

  // Fetch chapters
  const chaptersResult = await getChaptersWithContent(courseId);
  const chapters = chaptersResult.success ? chaptersResult.data : [];

  // Fetch enrollments
  const enrollmentsResult = await getEnrollmentsByCourseId(courseId);
  const enrollments = enrollmentsResult.success ? enrollmentsResult.data : [];

  // Calculate stats
  const totalChapters = chapters.length;
  const totalContent = chapters.reduce((acc, ch) => acc + ch.contentItems.length, 0);
  const totalStudents = enrollments.length;
  const completedEnrollments = enrollments.filter(e => e && e.completedAt).length;
  const completionRate = totalStudents > 0 
    ? Math.round((completedEnrollments / totalStudents) * 100) 
    : 0;

  return (
    <CourseDetailPage 
      course={course} 
      userRole={user.role}
      stats={{
        totalChapters,
        totalContent,
        totalStudents,
        completionRate,
      }}
    />
  );
}
