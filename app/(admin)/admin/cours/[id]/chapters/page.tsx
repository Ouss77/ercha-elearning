import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth/auth"
import type { Role } from "@/lib/schemas/user"
import {getChaptersWithContent, getCourseById} from "@/lib/db/queries";
import { ChapterManagementPage } from "@/components/course";

// Force dynamic rendering to prevent caching issues
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: {
    id: string
  }
}

export default async function ChaptersPage({ params }: PageProps) {
  // Require authentication - only admins and trainers can manage chapters
  const user = await requireAuth(["admin", "teacher"])

  // Parse course ID
  const courseId = parseInt(params.id, 10)
  if (isNaN(courseId)) {
    redirect("/admin/cours")
  }

  // Verify course exists
  const courseResult = await getCourseById(courseId)
  if (!courseResult.success || !courseResult.data) {
    redirect("/admin/cours")
  }

  const course = courseResult.data

  // For trainers, verify they own this course
  if (user.role === "TRAINER" && course.teacherId !== parseInt(user.id)) {
    redirect("/non-autorise")
  }

  // Fetch chapters with content items
  const chaptersResult = await getChaptersWithContent(courseId)
  
  if (!chaptersResult.success) {
    console.error("Failed to fetch chapters:", chaptersResult.error)
    // Continue with empty chapters array rather than failing
  }

  const chapters = chaptersResult.success ? chaptersResult.data : []

  return (
    <ChapterManagementPage
      courseId={courseId}
      courseTitle={course.title}
      initialChapters={chapters}
      userRole={user.role as Role}
      userId={parseInt(user.id)}
    />
  )
}
