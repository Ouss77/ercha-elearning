import { requireAuth } from "@/lib/auth/auth"
import { CourseViewer } from "@/components/student/course-viewer"

interface CoursePageProps {
  params: { id: string }
}

export default async function CoursePage({ params }: CoursePageProps) {
  const user = await requireAuth(["student"])
  const { id } = params

  return <CourseViewer courseId={Number.parseInt(id)} user={user} />
}
