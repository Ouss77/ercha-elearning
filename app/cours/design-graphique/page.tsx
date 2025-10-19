import { HomeHeader } from "@/components/layout/home-header";
import { Footer } from "@/components/layout/footer";
import { getCurrentUser } from "@/lib/auth/auth";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Palette,
  ArrowRight,
  BookOpen,
  Clock,
  Award,
  Users,
  CheckCircle2,
  Target,
  Laptop,
} from "lucide-react";
import Image from "next/image";

export default async function DesignGraphiquePage() {
  const user = await getCurrentUser();

  const courseModules = [
    "Introduction au design graphique",
    "Théorie des couleurs et psychologie",
    "Typographie et composition",
    "Principes de design UX/UI",
    "Adobe Photoshop - Niveau débutant",
    "Adobe Photoshop - Techniques avancées",
    "Adobe Illustrator - Fondamentaux",
    "Adobe Illustrator - Design vectoriel",
    "Création de logos et identité visuelle",
    "Design pour les réseaux sociaux",
    "Mockups et prototypage",
    "Portfolio professionnel",
  ];

  const objectives = [
    "Maîtriser les principes fondamentaux du design",
    "Utiliser professionnellement Adobe Photoshop et Illustrator",
    "Créer des designs pour le web et les médias numériques",
    "Développer votre style artistique unique",
    "Construire un portfolio professionnel",
    "Comprendre les besoins des clients",
  ];

  const prerequisites = [
    "Aucune expérience en design requise",
    "Ordinateur (Windows ou Mac)",
    "Créativité et passion pour le design",
  ];

  return (
    <div className="min-h-screen bg-background">
      <HomeHeader user={user} />

      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-purple-950/30 dark:via-gray-900 dark:to-purple-950/30">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-200/20 dark:bg-pink-900/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 mb-4">
                <Palette className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                  Formation Professionnelle
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Design Graphique
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Créez des designs professionnels et maîtrisez Adobe Creative
                Suite pour devenir designer graphique
              </p>

              {/* Quick Info */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950">
                    <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Durée
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      10 semaines
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950">
                    <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Modules
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      12 modules
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950">
                    <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Niveau
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Débutant à Intermédiaire
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950">
                    <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Formateur
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Adam Khairi
                    </p>
                  </div>
                </div>
              </div>

              <Link href="/contact">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                >
                  S'inscrire maintenant
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/ux-ui-design-course.png"
                alt="Design Graphique"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Objectives Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="bg-white dark:bg-gray-900 border-purple-200 dark:border-purple-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-950">
                    <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Objectifs du cours
                  </h2>
                </div>
                <ul className="space-y-3">
                  {objectives.map((objective, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {objective}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border-purple-200 dark:border-purple-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-950">
                    <Laptop className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Prérequis
                  </h2>
                </div>
                <ul className="space-y-3">
                  {prerequisites.map((prereq, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {prereq}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Programme de Formation
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              12 modules pour devenir designer graphique professionnel
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courseModules.map((module, idx) => (
              <Card
                key={idx}
                className="bg-white dark:bg-gray-900 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400 text-sm font-semibold">
                      {idx + 1}
                    </Badge>
                    <p className="text-gray-700 dark:text-gray-300 flex-1">
                      {module}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Prêt à libérer votre créativité ?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Contactez-nous pour plus d'informations sur cette formation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
              >
                Nous contacter
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/cours">
              <Button size="lg" variant="outline" className="border-2">
                Voir toutes les formations
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
