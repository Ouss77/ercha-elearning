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
  Sparkles,
  Rocket,
  Heart,
} from "lucide-react";

export function AboutContent() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 mb-8">
            <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span className="text-sm font-medium text-teal-700 dark:text-teal-300">
              À Propos de Nous
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            Votre parcours vers
            <br />
            <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 dark:from-teal-400 dark:via-cyan-400 dark:to-emerald-400 bg-clip-text text-transparent">
              l'excellence digitale
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12">
            Une plateforme d'apprentissage moderne dédiée au développement web,
            design graphique et marketing digital.
          </p>

          <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-left max-w-3xl mx-auto">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-teal-600 dark:text-teal-400 mb-1">
                12+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Cours disponibles
              </div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-teal-600 dark:text-teal-400 mb-1">
                3
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Domaines d'expertise
              </div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-teal-600 dark:text-teal-400 mb-1">
                100%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Formation pratique
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-24 px-4 bg-white dark:bg-gray-950">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Mission Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity" />
              <div className="relative p-8 md:p-10 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 hover:border-teal-500/50 dark:hover:border-teal-500/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950 flex items-center justify-center mb-6">
                  <Target className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Notre Mission
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                  Démocratiser l'accès à une formation digitale de qualité. Nous
                  créons des parcours d'apprentissage pratiques et structurés
                  qui permettent à chacun de développer des compétences
                  recherchées par le marché du travail.
                </p>
              </div>
            </div>

            {/* Vision Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity" />
              <div className="relative p-8 md:p-10 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mb-6">
                  <Eye className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Notre Vision
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                  Devenir la référence francophone en formation digitale. Nous
                  visons l'excellence pédagogique en combinant les meilleurs
                  standards internationaux avec une approche personnalisée et
                  adaptée aux réalités locales.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Nos Valeurs
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Les principes qui guident notre approche pédagogique
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mx-auto mb-6">
                <Heart className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Accessibilité
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Formation accessible à tous, sans barrières géographiques ou
                financières.
              </p>
            </div>

            <div className="p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-6">
                <Award className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Excellence
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Contenus de haute qualité créés par des experts reconnus dans
                leurs domaines.
              </p>
            </div>

            <div className="p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center mx-auto mb-6">
                <Rocket className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Innovation
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Technologies modernes pour une expérience d'apprentissage
                optimale.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Domains Section */}
      <section className="py-24 px-4 bg-white dark:bg-gray-950">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Nos Domaines d'Expertise
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Trois parcours complets pour votre transformation digitale
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Web Development */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity" />
              <div className="relative p-8 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-colors h-full">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Développement Web
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Maîtrisez les technologies modernes du web, de HTML/CSS à
                  React et Node.js.
                </p>
                <ul className="space-y-2">
                  <li className="text-sm text-gray-600 dark:text-gray-500">
                    • Front-end & Back-end
                  </li>
                  <li className="text-sm text-gray-600 dark:text-gray-500">
                    • Frameworks modernes
                  </li>
                  <li className="text-sm text-gray-600 dark:text-gray-500">
                    • Projets pratiques
                  </li>
                </ul>
              </div>
            </div>

            {/* Design */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity" />
              <div className="relative p-8 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-colors h-full">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Design Graphique
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Créez des visuels professionnels avec les outils et techniques
                  de design.
                </p>
                <ul className="space-y-2">
                  <li className="text-sm text-gray-600 dark:text-gray-500">
                    • UI/UX Design
                  </li>
                  <li className="text-sm text-gray-600 dark:text-gray-500">
                    • Outils Adobe & Figma
                  </li>
                  <li className="text-sm text-gray-600 dark:text-gray-500">
                    • Portfolio professionnel
                  </li>
                </ul>
              </div>
            </div>

            {/* Marketing */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity" />
              <div className="relative p-8 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 hover:border-orange-500/50 dark:hover:border-orange-500/50 transition-colors h-full">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-6">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Marketing Digital
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Développez une stratégie digitale efficace et mesurez vos
                  résultats.
                </p>
                <ul className="space-y-2">
                  <li className="text-sm text-gray-600 dark:text-gray-500">
                    • SEO & Social Media
                  </li>
                  <li className="text-sm text-gray-600 dark:text-gray-500">
                    • Content Marketing
                  </li>
                  <li className="text-sm text-gray-600 dark:text-gray-500">
                    • Analytics & ROI
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 px-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Pourquoi Nous Choisir ?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Une approche pédagogique qui fait la différence
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-950 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  Contenu Structuré
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Cours progressifs avec chapitres organisés et objectifs clairs
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                  <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  Apprentissage Pratique
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Projets réels et exercices pour appliquer vos connaissances
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-950 flex items-center justify-center">
                  <Users className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  Suivi Personnalisé
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Accompagnement individuel et feedback sur votre progression
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  Certificats Reconnus
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Validation de vos compétences avec des certifications
                  officielles
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
