import { requireAuth } from "@/lib/auth"
import { SubAdminDashboard } from "@/components/sub-admin/sub-admin-dashboard"

export default async function SubAdminPage() {
  const user = await requireAuth(["sub-admin"])

  return <SubAdminDashboard user={user} />
}
