import { getCurrentUser } from "@/lib/auth/auth"
import { SubAdminDashboard } from "@/components/sub-admin/sub-admin-dashboard"

export default async function SubAdminPage() {
  const user = await getCurrentUser()

  return <SubAdminDashboard user={user!} />
}
