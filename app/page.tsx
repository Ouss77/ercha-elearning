import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, GraduationCap, BarChart3 } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { LogoutButton } from "@/components/auth/logout-button"

export default async function HomePage() {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">EduPlatform</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-muted-foreground">
                    Bonjour, {user.firstName} ({user.role})
                  </span>
                  <LogoutButton />
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <a href="/login">Connexion</a>
                  </Button>
                  <Button>Commencer</Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl font-bold text-foreground mb-6 text-balance">
            Apprenez à votre rythme avec notre plateforme moderne
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Une expérience d'apprentissage complète avec des cours interactifs, des quiz personnalisés et un suivi de
            progression en temps réel.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" className="px-8">
              Explorer les cours
            </Button>
            <Button variant="outline" size="lg" className="px-8 bg-transparent">
              En savoir plus
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">Fonctionnalités principales</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-border bg-card hover:bg-accent/50 transition-colors">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Cours interactifs</CardTitle>
                <CardDescription>
                  Chapitres avec vidéos, textes, images et liens pour un apprentissage complet
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border bg-card hover:bg-accent/50 transition-colors">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Gestion des utilisateurs</CardTitle>
                <CardDescription>Administration complète des étudiants, professeurs et contenus</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border bg-card hover:bg-accent/50 transition-colors">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Suivi de progression</CardTitle>
                <CardDescription>Tableaux de bord détaillés pour suivre l'avancement et les résultats</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border bg-card hover:bg-accent/50 transition-colors">
              <CardHeader>
                <GraduationCap className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Évaluations</CardTitle>
                <CardDescription>Quiz interactifs et projets finaux pour valider les compétences</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Card className="max-w-2xl mx-auto border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="text-3xl mb-4">Prêt à commencer votre parcours d'apprentissage ?</CardTitle>
              <CardDescription className="text-lg">
                Rejoignez notre plateforme et accédez à des cours de qualité dans tous les domaines.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="px-8">
                Demander l'accès
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 px-4">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">© 2025 EduPlatform. Plateforme d'apprentissage moderne.</p>
        </div>
      </footer>
    </div>
  )
}
