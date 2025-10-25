import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/auth";
import type { Role } from "@/lib/schemas/user";
import { getChaptersWithContentByModuleId } from "@/lib/db/chapter-queries";
import { getModuleById } from "@/lib/db/module-queries";
import { getCourseById } from "@/lib/db/queries";
import { ChapterManagementPage } from "@/components/admin/chapters";

// Force dynamic rendering to prevent caching issues
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: {
    id: string;
    moduleId: string;
  };
}

export default async function ModuleChaptersPage({ params }: PageProps) {
  // Require authentication - only admins and trainers can manage chapters
  const user = await requireAuth(["admin", "teacher"]);

  // Parse IDs
  const courseId = parseInt(params.id, 10);
  const moduleId = parseInt(params.moduleId, 10);
  
  if (isNaN(courseId) || isNaN(moduleId)) {
    redirect("/admin/cours");
  }

  // Verify course exists
  const courseResult = await getCourseById(courseId);
  if (!courseResult.success || !courseResult.data) {
    redirect("/admin/cours");
  }

  const course = courseResult.data;

  // For trainers, verify they own this course
  if (user.role === "TRAINER" && course.teacherId !== parseInt(user.id)) {
    redirect("/non-autorise");
  }

  // Verify module exists and belongs to this course
  const module = await getModuleById(moduleId);
  if (!module || module.courseId !== courseId) {
    redirect(`/admin/cours/${courseId}`);
  }

  // Fetch chapters with content items for this module
  const chaptersResult = await getChaptersWithContentByModuleId(moduleId);

  if (!chaptersResult.success) {
    console.error("Failed to fetch chapters:", chaptersResult.error);
    // Continue with empty chapters array rather than failing
  }

  const chapters = chaptersResult.success ? chaptersResult.data : [];

  return (
    <ChapterManagementPage
      courseId={courseId}
      courseTitle={course.title}
      courseSlug={course.slug}
      moduleId={moduleId}
      moduleTitle={module.title}
      initialChapters={chapters}
      userRole={user.role as Role}
      userId={parseInt(user.id)}
    />
  );
}
