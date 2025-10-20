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
    <div className="relative py-16 px-4 overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50/30 via-transparent to-emerald-50/30 dark:from-teal-950/10 dark:via-transparent dark:to-emerald-950/10 pointer-events-none" />
      <div className="absolute top-20 right-10 w-96 h-96 bg-teal-200/20 dark:bg-teal-800/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-emerald-200/20 dark:bg-emerald-800/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-in fade-in slide-in-from-top duration-700">
          <div className="inline-block mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900 dark:to-emerald-900">
              <GraduationCap className="h-10 w-10 text-teal-600 dark:text-teal-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            À Propos de{" "}
            <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 dark:from-teal-400 dark:via-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">
              EduPlatform
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Une plateforme d'apprentissage moderne dédiée à la formation dans
            trois domaines clés : Développement Web, Design Graphique et
            Marketing Digital.
          </p>
        </div>

        {/* Mission & Vision Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {/* Mission Section */}
          <Card className="group border-2 border-teal-200/50 dark:border-teal-800/50 bg-gradient-to-br from-teal-50/80 to-emerald-50/80 dark:from-teal-950/40 dark:to-emerald-950/40 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 hover:border-teal-300 dark:hover:border-teal-700">
            <CardContent className="p-8 h-full">
              <div className="flex flex-col gap-6 h-full">
                <div className="p-4 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 dark:from-teal-500 dark:to-emerald-500 w-fit shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <Target className="h-7 w-7 text-white" />
                </div>
                <div className="flex-grow">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    Notre Mission
                  </h2>
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                    Offrir une formation de qualité dans trois domaines
                    stratégiques : le développement web, le design graphique et
                    le marketing digital. Nous croyons en l'apprentissage
                    pratique et personnalisé, permettant à chaque étudiant de
                    développer des compétences concrètes adaptées aux besoins du
                    marché du travail algérien et régional.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vision Section */}
          <Card className="group border-2 border-emerald-200/50 dark:border-emerald-800/50 bg-gradient-to-br from-emerald-50/80 to-cyan-50/80 dark:from-emerald-950/40 dark:to-cyan-950/40 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 hover:border-emerald-300 dark:hover:border-emerald-700">
            <CardContent className="p-8 h-full">
              <div className="flex flex-col gap-6 h-full">
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-600 to-cyan-600 dark:from-emerald-500 dark:to-cyan-500 w-fit shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <Eye className="h-7 w-7 text-white" />
                </div>
                <div className="flex-grow">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Notre Vision
                  </h2>
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                    Devenir une référence en matière de formation
                    professionnelle en Algérie dans nos trois domaines
                    d'expertise. Nous aspirons à créer des parcours
                    d'apprentissage structurés qui répondent aux standards
                    internationaux, tout en restant accessibles et adaptés au
                    contexte local. Notre objectif est de former des
                    professionnels compétents et confiants.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-400 text-sm font-semibold mb-4">
              Nos Principes
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Nos Valeurs
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Les piliers qui guident notre approche pédagogique
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group border-border bg-white/50 dark:bg-gray-900/50 hover:shadow-xl hover:scale-105 transition-all duration-300 hover:border-teal-300 dark:hover:border-teal-700">
              <CardContent className="p-8 text-center">
                <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-100 to-teal-50 dark:from-teal-900 dark:to-teal-950 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Users className="h-10 w-10 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  Accessibilité
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Rendre la formation accessible à tous, sans barrières
                  géographiques ou financières.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-border bg-white/50 dark:bg-gray-900/50 hover:shadow-xl hover:scale-105 transition-all duration-300 hover:border-emerald-300 dark:hover:border-emerald-700">
              <CardContent className="p-8 text-center">
                <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900 dark:to-emerald-950 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Award className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Excellence
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Offrir des contenus de haute qualité créés par des experts
                  reconnus dans leurs domaines.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-border bg-white/50 dark:bg-gray-900/50 hover:shadow-xl hover:scale-105 transition-all duration-300 hover:border-cyan-300 dark:hover:border-cyan-700">
              <CardContent className="p-8 text-center">
                <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-100 to-cyan-50 dark:from-cyan-900 dark:to-cyan-950 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <TrendingUp className="h-10 w-10 text-cyan-600 dark:text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  Innovation
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Utiliser les dernières technologies pour créer une expérience
                  d'apprentissage optimale.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          <Card className="group border-border bg-gradient-to-br from-teal-50/50 to-teal-100/50 dark:from-teal-950/30 dark:to-teal-900/30 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-teal-600 to-teal-700 dark:from-teal-400 dark:to-teal-500 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                15+
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Cours Disponibles
              </p>
            </CardContent>
          </Card>

          <Card className="group border-border bg-gradient-to-br from-emerald-50/50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/30 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-emerald-400 dark:to-emerald-500 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                60+
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Étudiants Actifs
              </p>
            </CardContent>
          </Card>

          <Card className="group border-border bg-gradient-to-br from-cyan-50/50 to-cyan-100/50 dark:from-cyan-950/30 dark:to-cyan-900/30 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-cyan-600 to-cyan-700 dark:from-cyan-400 dark:to-cyan-500 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                3
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Formateurs Experts
              </p>
            </CardContent>
          </Card>

          <Card className="group border-border bg-gradient-to-br from-teal-50/50 to-emerald-100/50 dark:from-teal-950/30 dark:to-emerald-900/30 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-teal-600 to-emerald-700 dark:from-teal-400 dark:to-emerald-500 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                3
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Domaines Clés
              </p>
            </CardContent>
          </Card>
        </div>

        {/* What We Offer Section */}
        <div>
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 text-sm font-semibold mb-4">
              Notre Offre
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ce Que Nous Offrons
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Des outils et services complets pour votre réussite
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="group border-border bg-white/50 dark:bg-gray-900/50 hover:shadow-xl hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-teal-100 to-teal-50 dark:from-teal-900 dark:to-teal-950 group-hover:scale-110 transition-transform duration-300 shadow-md">
                    <BookOpen className="h-7 w-7 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      Trois Domaines Clés
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Formation spécialisée en Développement Web, Design
                      Graphique et Marketing Digital. Chaque cours est structuré
                      en chapitres progressifs avec des quiz d'évaluation et des
                      projets pratiques.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group border-border bg-white/50 dark:bg-gray-900/50 hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900 dark:to-emerald-950 group-hover:scale-110 transition-transform duration-300 shadow-md">
                    <TrendingUp className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      Suivi de Progression
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Suivez votre avancement en temps réel avec des
                      statistiques détaillées, des graphiques de progression et
                      des rapports personnalisés pour rester motivé.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group border-border bg-white/50 dark:bg-gray-900/50 hover:shadow-xl hover:border-cyan-300 dark:hover:border-cyan-700 transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-100 to-cyan-50 dark:from-cyan-900 dark:to-cyan-950 group-hover:scale-110 transition-transform duration-300 shadow-md">
                    <Award className="h-7 w-7 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      Certifications
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Obtenez des certificats reconnus à la fin de chaque
                      formation pour valoriser vos compétences auprès des
                      employeurs et booster votre carrière.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group border-border bg-white/50 dark:bg-gray-900/50 hover:shadow-xl hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-teal-100 to-emerald-50 dark:from-teal-900 dark:to-emerald-950 group-hover:scale-110 transition-transform duration-300 shadow-md">
                    <Users className="h-7 w-7 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      Accompagnement Personnalisé
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
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
