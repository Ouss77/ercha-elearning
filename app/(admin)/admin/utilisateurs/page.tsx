import { Suspense } from "react"
import { requireAuth } from "@/lib/auth/auth"
import { UsersManagement } from "@/components/admin/users-management"
import { ToastHandler } from "@/components/admin/toast-handler"

export default async function UtilisateursPage() {
  await requireAuth(["admin"])

  return (
    <>
      <Suspense fallback={null}>
        <ToastHandler />
      </Suspense>
      <UsersManagement />
    </>
  )
}
