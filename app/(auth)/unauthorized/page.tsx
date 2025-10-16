import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"

export default async function UnauthorizedPage() {
  const session = await getServerSession(authOptions)
  
  // Determine the appropriate dashboard based on user role
  const getDashboardLink = () => {
    if (!session?.user?.role) return "/"
    
    switch (session.user.role) {
      case "ADMIN":
        return "/admin"
      case "SUB_ADMIN":
        return "/sub-admin"
      case "TRAINER":
        return "/teacher"
      case "STUDENT":
        return "/student"
      default:
        return "/"
    }
  }

  const dashboardLink = getDashboardLink()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-destructive/20 bg-card">
        <CardHeader className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold text-destructive">Accès non autorisé</CardTitle>
          <CardDescription>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-center">
          {session?.user ? (
            <Button asChild>
              <Link href={dashboardLink}>Retour à mon tableau de bord</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/login">Se connecter</Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href="/">Retour à l'accueil</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
