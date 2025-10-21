import { HomeHeader } from "@/components/layout/home-header";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
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
import { getCurrentUser } from "@/lib/auth/auth";

export default async function MarketingDigitalPage() {
  const user = await getCurrentUser();

  const courseModules = [
    "Introduction au marketing digital",
    "Stratégie digitale et persona",
    "SEO - Optimisation pour moteurs de recherche",
    "SEM - Publicité sur les moteurs de recherche",
    "Marketing sur les réseaux sociaux",
    "Content Marketing et storytelling",
    "Email Marketing et automation",
    "Google Analytics et analyse de données",
    "ROI et mesure de performance",
    "Projet final: Campagne marketing complète",
  ];

  const objectives = [
    "Élaborer une stratégie marketing digitale efficace",
    "Maîtriser le SEO et le référencement naturel",
    "Créer et gérer des campagnes publicitaires",
    "Utiliser les réseaux sociaux professionnellement",
    "Analyser les données et mesurer le ROI",
    "Développer du contenu engageant",
  ];

  const prerequisites = [
    "Aucune expérience en marketing requise",
    "Connaissance basique d'internet",
    "Motivation pour apprendre le digital",
  ];

  return (
    <div className="min-h-screen bg-background">
      Todo : Fix Use client Error
      <HomeHeader user={user} />

      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 dark:from-green-950/30 dark:via-gray-900 dark:to-green-950/30">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-200/20 dark:bg-green-900/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-200/20 dark:bg-emerald-900/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-950 border border-green-200 dark:border-green-800 mb-4">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-900 dark:text-green-100">
                  Formation Professionnelle
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Marketing Digital
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Développez vos compétences en marketing digital et maîtrisez le
                SEO, les réseaux sociaux et la publicité en ligne
              </p>

              {/* Quick Info */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950">
                    <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Durée
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      8 semaines
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950">
                    <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Modules
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      10 modules
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950">
                    <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Niveau
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Tous niveaux
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950">
                    <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Formateur
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Anas ElGhamraoui
                    </p>
                  </div>
                </div>
              </div>

              <Link href="/contact">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                >
                  S'inscrire maintenant
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/marketing-course-concept.png"
                alt="Marketing Digital"
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
            <Card className="bg-white dark:bg-gray-900 border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-lg bg-green-100 dark:bg-green-950">
                    <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Objectifs du cours
                  </h2>
                </div>
                <ul className="space-y-3">
                  {objectives.map((objective, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {objective}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-lg bg-green-100 dark:bg-green-950">
                    <Laptop className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Prérequis
                  </h2>
                </div>
                <ul className="space-y-3">
                  {prerequisites.map((prereq, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
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
              10 modules pour maîtriser le marketing digital
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courseModules.map((module, idx) => (
              <Card
                key={idx}
                className="bg-white dark:bg-gray-900 hover:border-green-300 dark:hover:border-green-700 transition-colors"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 text-sm font-semibold">
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
            Prêt à booster votre présence en ligne ?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Contactez-nous pour plus d'informations sur cette formation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
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
