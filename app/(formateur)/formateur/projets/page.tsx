import { requireAuth } from "@/lib/auth/auth";
import { getTeacherProjectSubmissions } from "@/lib/db/queries";
import { ProjectSubmissions } from "@/components/teacher/project-submissions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projets | Formateur",
  description: "Gérer et évaluer les projets soumis par vos étudiants",
};

export default async function TeacherProjectsPage() {
  const user = await requireAuth(["TRAINER"]);

  const result = await getTeacherProjectSubmissions(Number(user.id));
  const submissions = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Projets Soumis</h1>
        <p className="text-muted-foreground mt-2">
          Gérer et évaluer les projets finaux soumis par vos étudiants
        </p>
      </div>
      <ProjectSubmissions submissions={submissions} />
    </div>
  );
}
