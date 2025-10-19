import { requireAuth } from "@/lib/auth/auth";
import { StudentProgress } from "@/components/teacher/student-progress";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Étudiants | Formateur",
  description: "Suivez la progression de vos étudiants",
};

export default async function TeacherStudentsPage() {
  const user = await requireAuth(["TRAINER"]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Étudiants</h1>
        <p className="text-muted-foreground mt-2">
          Suivez la progression de vos étudiants
        </p>
      </div>
      <StudentProgress />
    </div>
  );
}
