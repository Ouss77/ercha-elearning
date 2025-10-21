import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { requireAuth } from "@/lib/auth/auth";
import { getTeacherStudents } from "@/lib/db/queries";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
// Dynamically load the StudentProgress component as a client component
const StudentProgress = dynamic<{
  students: any[];
  teacherId: number;
}>(
  () =>
    import("@/components/teacher/student-progress").then(
      (mod) => mod.StudentProgress
    ),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "Étudiants | Formateur",
  description: "Suivez la progression de vos étudiants",
};

export default async function TeacherStudentsPage() {
  const user = await requireAuth(["TRAINER"]);

  const studentsResult = await getTeacherStudents(Number(user.id));

  if (!studentsResult.success) {
    console.error(
      "Failed to fetch students:",
      "error" in studentsResult ? studentsResult.error : "Unknown error"
    );
  }

  return (
    <div className="space-y-6">
      <StudentProgress
        students={studentsResult.success ? studentsResult.data : []}
        teacherId={Number(user.id)}
      />
    </div>
  );
}
