import { requireAuth } from "@/lib/auth"
import { CourseEditor } from "@/components/course/course-editor"

interface EditCoursePageProps {
  params: Promise<{ id: string }>
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const user = await requireAuth(["admin"])
  const { id } = await params

  return <CourseEditor courseId={Number.parseInt(id)} user={user} />
}
