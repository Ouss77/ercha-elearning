"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  Award,
  Users,
  Clock,
  Video,
  FileText,
  CheckCircle,
  TrendingUp,
} from "lucide-react";

/**
 * Features Section
 * Showcases platform key features with icons and hover animations
 */
export function Features() {
  const features = [
    {
      icon: BookOpen,
      title: "Contenu de Qualité",
      description:
        "Accédez à des cours créés par des experts reconnus dans leur domaine",
      color: "from-teal-500 to-cyan-500",
      bgColor: "bg-teal-50 dark:bg-teal-950",
      iconColor: "text-teal-600 dark:text-teal-400",
      borderColor: "border-teal-200 dark:border-teal-800",
    },
    {
      icon: Video,
      title: "Apprentissage Interactif",
      description:
        "Vidéos, quiz et exercices pratiques pour renforcer vos connaissances",
      color: "from-emerald-500 to-green-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-950",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      borderColor: "border-emerald-200 dark:border-emerald-800",
    },
    {
      icon: Award,
      title: "Certificats Reconnus",
      description:
        "Obtenez des certificats validant vos compétences à la fin de chaque cours",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50 dark:bg-purple-950",
      iconColor: "text-purple-600 dark:text-purple-400",
      borderColor: "border-purple-200 dark:border-purple-800",
    },
    {
      icon: Users,
      title: "Communauté Active",
      description:
        "Rejoignez une communauté d'apprenants passionnés et partagez vos expériences",
      color: "from-blue-500 to-indigo-500",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      iconColor: "text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
      icon: Clock,
      title: "Apprentissage Flexible",
      description:
        "Apprenez à votre rythme, où vous voulez et quand vous voulez",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50 dark:bg-orange-950",
      iconColor: "text-orange-600 dark:text-orange-400",
      borderColor: "border-orange-200 dark:border-orange-800",
    },
    {
      icon: TrendingUp,
      title: "Suivi de Progression",
      description:
        "Suivez vos progrès en temps réel et identifiez vos points d'amélioration",
      color: "from-cyan-500 to-teal-500",
      bgColor: "bg-cyan-50 dark:bg-cyan-950",
      iconColor: "text-cyan-600 dark:text-cyan-400",
      borderColor: "border-cyan-200 dark:border-cyan-800",
    },
    {
      icon: FileText,
      title: "Ressources Complètes",
      description:
        "Téléchargez des supports de cours, fiches et exercices supplémentaires",
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-50 dark:bg-pink-950",
      iconColor: "text-pink-600 dark:text-pink-400",
      borderColor: "border-pink-200 dark:border-pink-800",
    },
    {
      icon: CheckCircle,
      title: "Support Dédié",
      description:
        "Bénéficiez d'un accompagnement personnalisé tout au long de votre formation",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50 dark:bg-green-950",
      iconColor: "text-green-600 dark:text-green-400",
      borderColor: "border-green-200 dark:border-green-800",
    },
  ];

  return (
    <section className="relative py-20 overflow-hidden bg-white dark:bg-gray-950">
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-teal-200/10 dark:bg-teal-900/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-emerald-200/10 dark:bg-emerald-900/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-teal-100 to-emerald-100 dark:from-teal-950 dark:to-emerald-950 border border-teal-200 dark:border-teal-800 mb-4">
            <Award className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span className="text-sm font-medium text-teal-900 dark:text-teal-100">
              Nos Avantages
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Pourquoi Choisir EduPlatform ?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Découvrez les fonctionnalités qui font de notre plateforme le
            meilleur choix pour votre apprentissage
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className={`group ${feature.borderColor} bg-white dark:bg-gray-900 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer`}
              >
                <CardHeader className="space-y-4">
                  <div
                    className={`w-14 h-14 rounded-xl ${feature.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className={`h-7 w-7 ${feature.iconColor}`} />
                  </div>
                  <CardTitle className="text-lg group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
