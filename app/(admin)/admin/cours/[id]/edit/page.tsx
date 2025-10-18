import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth/auth"

export default async function EditCoursePage() {
  await requireAuth(["admin"])

  // Redirect to main courses page - editing is handled via dialog there
  redirect("/admin/cours")
}
