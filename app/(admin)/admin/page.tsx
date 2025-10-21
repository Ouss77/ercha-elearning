import { getCurrentUser } from "@/lib/auth/auth"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default async function AdminPage() {
  const user = await getCurrentUser()

  return <AdminDashboard user={user!} />
}
