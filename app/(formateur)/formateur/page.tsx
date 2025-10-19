import { requireAuth } from "@/lib/auth/auth";
import { TeacherDashboard } from "@/components/teacher/teacher-dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tableau de bord | Formateur",
  description: "Vue d'ensemble de vos cours et étudiants",
};

export default async function TeacherPage() {
  const user = await requireAuth(["TRAINER"]);

  return <TeacherDashboard user={user} />;
}
