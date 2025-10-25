import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/auth";
import { getCourseById, getEnrollmentsByCourseId } from "@/lib/db/queries";
import { getModulesWithChaptersAndContent } from "@/lib/db/module-queries";
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

  // Fetch modules with chapters and content
  const modules = await getModulesWithChaptersAndContent(courseId);

  // Fetch enrollments
  const enrollmentsResult = await getEnrollmentsByCourseId(courseId);
  const enrollments = enrollmentsResult.success ? enrollmentsResult.data : [];

  // Calculate module-level statistics
  const totalModules = modules.length;
  const totalChapters = modules.reduce((acc, m) => acc + m.chapters.length, 0);
  const totalContent = modules.reduce((acc, m) => 
    acc + m.chapters.reduce((sum, ch) => sum + ch.contentItems.length, 0), 0
  );
  const totalStudents = enrollments.length;
  const completedEnrollments = enrollments.filter(e => e && e.completedAt).length;
  const completionRate = totalStudents > 0 
    ? Math.round((completedEnrollments / totalStudents) * 100) 
    : 0;

  return (
    <CourseDetailPage 
      course={course}
      modules={modules}
      userRole={user.role}
      stats={{
        totalModules,
        totalChapters,
        totalContent,
        totalStudents,
        completionRate,
      }}
    />
  );
}
