import { requireAuth } from "@/lib/auth/auth";
import { getAllDomains, getTeachers } from "@/lib/db/queries";
import { CourseFormPage } from "@/components/admin/courses";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewCoursePage() {
  const user = await requireAuth(["admin", "teacher"]);

  // Fetch domains and teachers
  const domainsResult = await getAllDomains();
  const teachersResult = await getTeachers();

  const domains = domainsResult.success ? domainsResult.data : [];
  const teachers = teachersResult.success ? teachersResult.data : [];

  return (
    <CourseFormPage
      domains={domains}
      teachers={teachers}
      userRole={user.role}
      userId={parseInt(user.id)}
    />
  );
}
