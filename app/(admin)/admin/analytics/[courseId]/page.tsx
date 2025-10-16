import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { ProgressAnalytics } from "@/components/progress/progress-analytics"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface PageProps {
  params: {
    courseId: string
  }
}

export default async function CourseAnalyticsPage({ params }: PageProps) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) {
    redirect("/connexion")
  }

  const user = getSession(token)
  if (!user || user.role !== "admin") {
    redirect("/non-autorise")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Analyses du Cours</h1>
              <p className="text-sm text-muted-foreground">Statistiques détaillées et performance des étudiants</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <ProgressAnalytics courseId={params.courseId} />
      </div>
    </div>
  )
}
