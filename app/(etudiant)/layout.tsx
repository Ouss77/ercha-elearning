import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth/auth"
import { LayoutWrapper } from "@/components/layout/layout-wrapper"

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verify user is authenticated and has STUDENT role
  const user = await requireAuth(["STUDENT"])

  if (!user) {
    redirect("/connexion")
  }

  return <LayoutWrapper role="STUDENT" user={user}>{children}</LayoutWrapper>
}
