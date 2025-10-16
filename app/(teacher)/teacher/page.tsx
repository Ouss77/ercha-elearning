import { requireAuth } from "@/lib/auth"
import { TeacherDashboard } from "@/components/teacher/teacher-dashboard"

export default async function TeacherPage() {
  const user = await requireAuth(["teacher"])

  return <TeacherDashboard user={user} />
}
