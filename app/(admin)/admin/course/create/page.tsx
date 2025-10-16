import { requireAuth } from "@/lib/auth/auth"
import { CourseCreator } from "@/components/course/course-creator"

export default async function CreateCoursePage() {
  const user = await requireAuth(["admin"])

  return <CourseCreator user={user} />
}
