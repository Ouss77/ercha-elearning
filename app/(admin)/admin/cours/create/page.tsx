import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth/auth"

export default async function CreateCoursePage() {
  await requireAuth(["admin"])

  // Redirect to main courses page - creation is handled via dialog there
  redirect("/admin/cours")
}
