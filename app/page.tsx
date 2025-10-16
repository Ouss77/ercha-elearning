import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, GraduationCap, BarChart3 } from "lucide-react"
import { getCurrentUser } from "@/lib/auth/auth"
import { HomeHeader } from "@/components/layout/home-header"
import Link from "next/link"
import { getDashboardUrl } from "@/lib/utils/utils"

//TODO : Rename Route Groups to French



export default async function HomePage() {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <HomeHeader user={user} />

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-background via-accent/20 to-primary/5">
        {/* Decorative circles */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-chart-2/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">
              🎓 Plateforme d'apprentissage moderne
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance leading-tight">
            Commencez à apprendre auprès des{" "}
            <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
              meilleures institutions
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto text-pretty">
            Une expérience d'apprentissage complète avec des cours interactifs, des quiz personnalisés et un suivi de
            progression en temps réel. Rejoignez des milliers d'étudiants qui transforment leur carrière.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {user ? (
              <Button size="lg" className="px-8 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/30" asChild>
                <Link href={getDashboardUrl(user.role)}>Aller au tableau de bord</Link>
              </Button>
            ) : (
              <>
                <Button size="lg" className="px-8 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/30" asChild>
                  <Link href="/inscription">Commencer maintenant</Link>
                </Button>
                <Button variant="outline" size="lg" className="px-8 border-2 hover:bg-accent" asChild>
                  <Link href="/connexion">Se connecter</Link>
                </Button>
              </>
            )}
          </div>
          
          {/* Stats row */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">19.5K</div>
              <div className="text-sm text-muted-foreground mt-1">Étudiants actifs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">12.5K</div>
              <div className="text-sm text-muted-foreground mt-1">Cours complétés</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">96%</div>
              <div className="text-sm text-muted-foreground mt-1">Taux de satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">325+</div>
              <div className="text-sm text-muted-foreground mt-1">Cours disponibles</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">
              Fonctionnalités
            </span>
            <h3 className="text-3xl md:text-4xl font-bold mt-6 mb-4 text-foreground">
              Explorez nos cours en vedette
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Découvrez une large gamme de cours conçus par des experts pour vous aider à atteindre vos objectifs
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-border/50 bg-card hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary to-chart-2"></div>
              <CardHeader>
                <div className="h-12 w-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Cours interactifs</CardTitle>
                <CardDescription className="text-base">
                  Chapitres avec vidéos, textes, images et liens pour un apprentissage complet et engageant
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 bg-card hover:shadow-xl hover:shadow-chart-2/10 transition-all duration-300 group overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-chart-2 to-primary"></div>
              <CardHeader>
                <div className="h-12 w-12 bg-gradient-to-br from-chart-2/20 to-chart-2/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-chart-2" />
                </div>
                <CardTitle className="text-xl">Gestion complète</CardTitle>
                <CardDescription className="text-base">
                  Administration intuitive des étudiants, professeurs et contenus pédagogiques
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 bg-card hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary to-chart-2"></div>
              <CardHeader>
                <div className="h-12 w-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Suivi en temps réel</CardTitle>
                <CardDescription className="text-base">
                  Tableaux de bord détaillés pour suivre l'avancement et analyser les performances
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 bg-card hover:shadow-xl hover:shadow-chart-2/10 transition-all duration-300 group overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-chart-2 to-primary"></div>
              <CardHeader>
                <div className="h-12 w-12 bg-gradient-to-br from-chart-2/20 to-chart-2/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <GraduationCap className="h-6 w-6 text-chart-2" />
                </div>
                <CardTitle className="text-xl">Évaluations</CardTitle>
                <CardDescription className="text-base">
                  Quiz interactifs et projets finaux pour valider vos compétences acquises
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-accent/20 to-chart-2/5">
        <div className="container mx-auto text-center">
          <Card className="max-w-3xl mx-auto border-primary/20 bg-card/80 backdrop-blur-sm shadow-2xl">
            <CardHeader className="pb-8">
              <div className="inline-block mb-4">
                <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                  {user ? "🚀 Continuez votre apprentissage" : "✨ Offre spéciale"}
                </span>
              </div>
              <CardTitle className="text-3xl md:text-4xl mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                {user ? "Continuez votre parcours d'apprentissage" : "Prêt à transformer votre carrière ?"}
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                {user 
                  ? "Accédez à votre tableau de bord pour continuer vos cours et suivre votre progression."
                  : "Rejoignez notre communauté d'apprenants et accédez à des cours de qualité dans tous les domaines. Obtenez 50% de réduction pour les 50 premiers inscrits !"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8">
              {user ? (
                <Button size="lg" className="px-10 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/30" asChild>
                  <Link href={getDashboardUrl(user.role)}>Accéder au tableau de bord</Link>
                </Button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="px-10 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/30" asChild>
                    <Link href="/inscription">Commencer gratuitement</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="px-10 border-2" asChild>
                    <Link href="/connexion">Se connecter</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-gradient-to-br from-card to-muted/30 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 bg-gradient-to-br from-primary to-chart-2 rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-foreground">EduPlatform</h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Transformez votre avenir avec notre plateforme d'apprentissage moderne
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">À propos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Notre mission</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">L'équipe</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Carrières</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Ressources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Tutoriels</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Partenariats</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Communauté</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center">
            <p className="text-muted-foreground text-sm">
              © 2025 EduPlatform. Tous droits réservés. Plateforme d'apprentissage moderne.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
