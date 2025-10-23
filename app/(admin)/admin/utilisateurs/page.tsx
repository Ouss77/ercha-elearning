import { Suspense } from "react"
import { ToastHandler } from "@/components/admin/shared"
import { UsersManagement } from "@/components/admin/users"

export default function UtilisateursPage() {
  return (
    <>
      <Suspense fallback={null}>
        <ToastHandler />
      </Suspense>
      <UsersManagement />
    </>
  )
}
 