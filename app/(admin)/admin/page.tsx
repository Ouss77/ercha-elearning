import { requireAuth } from "@/lib/auth/auth"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default async function AdminPage() {
  const user = await requireAuth(["admin"])

  return <AdminDashboard user={user} />
}
