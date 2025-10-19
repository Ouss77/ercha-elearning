import { requireAuth } from "@/lib/auth/auth";
import { CourseAnalytics } from "@/components/teacher/course-analytics";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analyses | Formateur",
  description: "Statistiques et performances de vos cours",
};

export default async function TeacherAnalyticsPage() {
  const user = await requireAuth(["TRAINER"]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analyses</h1>
        <p className="text-muted-foreground mt-2">
          Statistiques et performances de vos cours
        </p>
      </div>
      <CourseAnalytics />
    </div>
  );
}
