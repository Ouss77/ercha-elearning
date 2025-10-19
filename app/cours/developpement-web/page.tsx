import { HomeHeader } from "@/components/layout/home-header";
import { Footer } from "@/components/layout/footer";
import { getCurrentUser } from "@/lib/auth/auth";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Code,
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

export default async function DeveloppementWebPage() {
  const user = await getCurrentUser();

  const courseModules = [
    "Introduction au développement web",
    "HTML5 - Structure et sémantique",
    "CSS3 - Mise en forme avancée",
    "JavaScript - Les fondamentaux",
    "JavaScript ES6+ - Fonctionnalités modernes",
    "React - Composants et hooks",
    "Next.js - Framework fullstack",
    "Git & GitHub - Contrôle de version",
    "Responsive Design & Mobile First",
    "APIs & Fetch",
    "State Management",
    "Déploiement et production",
    "Projet 1: Site web personnel",
    "Projet 2: Application React",
    "Projet final: Application Next.js complète",
  ];

  const objectives = [
    "Créer des sites web modernes et responsifs",
    "Maîtriser JavaScript et ses frameworks",
    "Développer des applications React performantes",
    "Utiliser Next.js pour des projets fullstack",
    "Comprendre les bonnes pratiques du web",
    "Déployer vos projets en production",
  ];

  const prerequisites = [
    "Aucune expérience en programmation requise",
    "Ordinateur avec connexion internet",
    "Motivation et curiosité pour apprendre",
  ];

  return (
    <div className="min-h-screen bg-background">
      <HomeHeader user={user} />

      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 dark:from-blue-950/30 dark:via-gray-900 dark:to-blue-950/30">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 dark:bg-blue-900/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-200/20 dark:bg-cyan-900/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 mb-4">
                <Code className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Formation Professionnelle
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Développement Web
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Maîtrisez les technologies modernes du web et créez des
                applications professionnelles avec React et Next.js
              </p>

              {/* Quick Info */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950">
                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Durée
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      12 semaines
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Modules
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      15 modules
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950">
                    <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Niveau
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Débutant à Avancé
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Formateur
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Walid Draa
                    </p>
                  </div>
                </div>
              </div>

              <Link href="/contact">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg"
                >
                  S'inscrire maintenant
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/react-course.png"
                alt="Développement Web"
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
            <Card className="bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-950">
                    <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Objectifs du cours
                  </h2>
                </div>
                <ul className="space-y-3">
                  {objectives.map((objective, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {objective}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-950">
                    <Laptop className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Prérequis
                  </h2>
                </div>
                <ul className="space-y-3">
                  {prerequisites.map((prereq, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
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
              15 modules pour vous transformer en développeur web professionnel
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courseModules.map((module, idx) => (
              <Card
                key={idx}
                className="bg-white dark:bg-gray-900 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 text-sm font-semibold">
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
            Prêt à démarrer votre carrière en développement web ?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Contactez-nous pour plus d'informations sur cette formation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg"
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
