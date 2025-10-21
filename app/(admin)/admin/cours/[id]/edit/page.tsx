import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/auth";
import { getCourseById, getAllDomains, getTeachers } from "@/lib/db/queries";
import { CourseFormPage } from "@/components/admin/courses";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditCoursePage({ params }: PageProps) {
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

  // Fetch domains and teachers
  const domainsResult = await getAllDomains();
  const teachersResult = await getTeachers();

  const domains = domainsResult.success ? domainsResult.data : [];
  const teachers = teachersResult.success ? teachersResult.data : [];

  return (
    <CourseFormPage
      domains={domains}
      teachers={teachers}
      initialData={course}
      userRole={user.role}
      userId={parseInt(user.id)}
    />
  );
}
