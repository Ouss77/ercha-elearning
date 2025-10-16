import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

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

  return (
    <div className="min-h-screen bg-background">
      <Sidebar role="ADMIN" />
      <div className="lg:pl-64">
        <Header user={user} />
        <main className="py-6 px-4 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
