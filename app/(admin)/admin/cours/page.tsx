import { requireAuth } from "@/lib/auth/auth";
import { CoursesManagement } from "@/components/admin/courses-management";

export default async function CoursesPage() {
  await requireAuth(["admin"]);

  return <CoursesManagement />;
}
