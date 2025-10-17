import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth/auth"
import { LayoutWrapper } from "@/components/layout/layout-wrapper"

export default async function SubAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verify user is authenticated and has SUB_ADMIN role
  const user = await requireAuth(["SUB_ADMIN"])

  if (!user) {
    redirect("/connexion")
  }

  return <LayoutWrapper role="SUB_ADMIN" user={user}>{children}</LayoutWrapper>
}
