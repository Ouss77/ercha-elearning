import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/auth"
import { LayoutWrapper } from "@/components/layout/layout-wrapper"

export default async function SubAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Access control is enforced by middleware; fetch the current user for UI
  const user = await getCurrentUser()

  if (!user) {
    redirect("/connexion")
  }

  return <LayoutWrapper role="SUB_ADMIN" user={user}>{children}</LayoutWrapper>
}
