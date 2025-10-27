import dynamic from "next/dynamic";
import { requireAuth } from "@/lib/auth/auth";
import { getTeacherStudents, getTeacherClassesWithDetails } from "@/lib/db/queries";
import type { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, FolderOpen } from "lucide-react";

// Dynamically load the components as client components
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

const ClassView = dynamic<{
  classes: any[];
}>(
  () =>
    import("@/components/teacher/class-view").then(
      (mod) => mod.ClassView
    ),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "Étudiants | Formateur",
  description: "Suivez la progression de vos étudiants et gérez vos classes",
};

export default async function TeacherStudentsPage() {
  const user = await requireAuth(["TRAINER"]);

  const [studentsResult, classesResult] = await Promise.all([
    getTeacherStudents(Number(user.id)),
    getTeacherClassesWithDetails(Number(user.id)),
  ]);

  if (!studentsResult.success) {
    console.error(
      "Failed to fetch students:",
      "error" in studentsResult ? studentsResult.error : "Unknown error"
    );
  }

  if (!classesResult.success) {
    console.error(
      "Failed to fetch classes:",
      "error" in classesResult ? classesResult.error : "Unknown error"
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Étudiants & Classes</h1>
        <p className="text-muted-foreground mt-2">
          Gérez vos classes et suivez la progression de vos étudiants
        </p>
      </div>

      <Tabs defaultValue="students" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="students" className="gap-2">
            <Users className="h-4 w-4" />
            Tous les étudiants
          </TabsTrigger>
          <TabsTrigger value="classes" className="gap-2">
            <FolderOpen className="h-4 w-4" />
            Mes classes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <StudentProgress
            students={studentsResult.success ? studentsResult.data : []}
            teacherId={Number(user.id)}
          />
        </TabsContent>

        <TabsContent value="classes">
          <ClassView
            classes={classesResult.success ? classesResult.data : []}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
