import { requireAuth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { MyCourses } from "@/components/teacher/my-courses";
import { getTeacherCoursesWithStats } from "@/lib/db/queries";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mes Cours | Formateur",
  description: "Gérez et créez vos cours",
};

export default async function TeacherCoursesPage() {
  const user = await requireAuth(["TRAINER"]);

  // Fetch teacher's courses from database
  const teacherId = parseInt(user.id);
  const coursesResult = await getTeacherCoursesWithStats(teacherId);

  if (!coursesResult.success) {
    redirect("/non-autorise");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mes Cours</h1>
        <p className="text-muted-foreground mt-2">Gérez et créez vos cours</p>
      </div>
      <MyCourses courses={coursesResult.data} />
    </div>
  );
}
