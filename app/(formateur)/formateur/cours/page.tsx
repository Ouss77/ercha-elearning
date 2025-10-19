import { requireAuth } from "@/lib/auth/auth";
import { MyCourses } from "@/components/teacher/my-courses";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mes Cours | Formateur",
  description: "Gérez et créez vos cours",
};

export default async function TeacherCoursesPage() {
  const user = await requireAuth(["TRAINER"]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mes Cours</h1>
        <p className="text-muted-foreground mt-2">Gérez et créez vos cours</p>
      </div>
      <MyCourses />
    </div>
  );
}
