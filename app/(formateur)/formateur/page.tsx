import { requireAuth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { TeacherDashboard } from "@/components/teacher/teacher-dashboard";
import { getTeacherDashboardSummary } from "@/lib/db/queries";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tableau de bord | Formateur",
  description: "Vue d'ensemble de vos cours et étudiants",
};

export default async function TeacherPage() {
  const user = await requireAuth(["TRAINER"]);

  // Fetch teacher dashboard data
  const teacherId = parseInt(user.id);
  const dashboardResult = await getTeacherDashboardSummary(teacherId);

  const dashboardData = dashboardResult.success ? dashboardResult.data : [];

  return <TeacherDashboard user={user} dashboardData={dashboardData} />;
}
