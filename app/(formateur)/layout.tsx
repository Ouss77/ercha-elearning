import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth/auth"
import { LayoutWrapper } from "@/components/layout/layout-wrapper"

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verify user is authenticated and has TRAINER role
  const user = await requireAuth(["TRAINER"])

  if (!user) {
    redirect("/connexion")
  }

  return <LayoutWrapper role="TRAINER" user={user}>{children}</LayoutWrapper>
}
