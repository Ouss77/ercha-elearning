import { requireAuth } from "@/lib/auth"
import { StudentDashboard } from "@/components/student/student-dashboard"

export default async function StudentPage() {
  const user = await requireAuth(["student"])

  return <StudentDashboard user={user} />
}
