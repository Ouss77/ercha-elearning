import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth/auth"
import { LayoutWrapper } from "@/components/layout/layout-wrapper"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verify user is authenticated and has ADMIN role
  const user = await requireAuth(["ADMIN"])

  if (!user) {
    redirect("/connexion")
  }

  return <LayoutWrapper role="ADMIN" user={user}>{children}</LayoutWrapper>
}
