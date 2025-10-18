"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  GraduationCap,
  Target,
  Users,
  Award,
  BookOpen,
  TrendingUp,
  Eye,
} from "lucide-react";

export function AboutContent() {
  return (
    <div className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            À Propos de{" "}
            <span className="bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
              EduPlatform
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Une plateforme d'apprentissage moderne dédiée à la formation dans
            trois domaines clés : Développement Web, Design Graphique et
            Marketing Digital.
          </p>
        </div>

        {/* Mission Section */}
        <Card className="mb-12 border-border bg-gradient-to-br from-teal-50/50 to-emerald-50/50 dark:from-teal-950/20 dark:to-emerald-950/20">
          <CardContent className="p-8 md:p-12">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-lg bg-gradient-to-br from-teal-600 to-emerald-600 dark:from-teal-500 dark:to-emerald-500">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Notre Mission
                </h2>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  Offrir une formation de qualité dans trois domaines
                  stratégiques : le développement web, le design graphique et le
                  marketing digital. Nous croyons en l'apprentissage pratique et
                  personnalisé, permettant à chaque étudiant de développer des
                  compétences concrètes adaptées aux besoins du marché du
                  travail algérien et régional.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vision Section */}
        <Card className="mb-12 border-border bg-gradient-to-br from-emerald-50/50 to-cyan-50/50 dark:from-emerald-950/20 dark:to-cyan-950/20">
          <CardContent className="p-8 md:p-12">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-lg bg-gradient-to-br from-teal-600 to-emerald-600 dark:from-teal-500 dark:to-emerald-500">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Notre Vision
                </h2>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  Devenir une référence en matière de formation professionnelle
                  en Algérie dans nos trois domaines d'expertise. Nous aspirons
                  à créer des parcours d'apprentissage structurés qui répondent
                  aux standards internationaux, tout en restant accessibles et
                  adaptés au contexte local. Notre objectif est de former des
                  professionnels compétents et confiants.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-foreground mb-10">
            Nos Valeurs
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Accessibilité
                </h3>
                <p className="text-muted-foreground">
                  Rendre la formation accessible à tous, sans barrières
                  géographiques ou financières.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mb-4">
                  <Award className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Excellence
                </h3>
                <p className="text-muted-foreground">
                  Offrir des contenus de haute qualité créés par des experts
                  reconnus dans leurs domaines.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-cyan-100 dark:bg-cyan-900 flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Innovation
                </h3>
                <p className="text-muted-foreground">
                  Utiliser les dernières technologies pour créer une expérience
                  d'apprentissage optimale.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <Card className="border-border text-center">
            <CardContent className="p-6">
              <div className="text-3xl md:text-4xl font-bold text-teal-600 dark:text-teal-400 mb-2">
                15+
              </div>
              <p className="text-sm text-muted-foreground">Cours Disponibles</p>
            </CardContent>
          </Card>

          <Card className="border-border text-center">
            <CardContent className="p-6">
              <div className="text-3xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                60+
              </div>
              <p className="text-sm text-muted-foreground">Étudiants Actifs</p>
            </CardContent>
          </Card>

          <Card className="border-border text-center">
            <CardContent className="p-6">
              <div className="text-3xl md:text-4xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">
                3
              </div>
              <p className="text-sm text-muted-foreground">
                Formateurs Experts
              </p>
            </CardContent>
          </Card>

          <Card className="border-border text-center">
            <CardContent className="p-6">
              <div className="text-3xl md:text-4xl font-bold text-teal-600 dark:text-teal-400 mb-2">
                3
              </div>
              <p className="text-sm text-muted-foreground">Domaines Clés</p>
            </CardContent>
          </Card>
        </div>

        {/* What We Offer Section */}
        <div>
          <h2 className="text-3xl font-bold text-center text-foreground mb-10">
            Ce Que Nous Offrons
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900">
                    <BookOpen className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Trois Domaines Clés
                    </h3>
                    <p className="text-muted-foreground">
                      Formation spécialisée en Développement Web, Design
                      Graphique et Marketing Digital. Chaque cours est structuré
                      en chapitres progressifs avec des quiz d'évaluation et des
                      projets pratiques.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900">
                    <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Suivi de Progression
                    </h3>
                    <p className="text-muted-foreground">
                      Suivez votre avancement en temps réel avec des
                      statistiques détaillées, des graphiques de progression et
                      des rapports personnalisés pour rester motivé.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900">
                    <Award className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Certifications
                    </h3>
                    <p className="text-muted-foreground">
                      Obtenez des certificats reconnus à la fin de chaque
                      formation pour valoriser vos compétences auprès des
                      employeurs et booster votre carrière.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900">
                    <Users className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Accompagnement Personnalisé
                    </h3>
                    <p className="text-muted-foreground">
                      Un formateur expert dédié pour chaque domaine. Suivi
                      individualisé, feedback constructif et support continu
                      pour garantir votre réussite dans votre parcours
                      d'apprentissage.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
