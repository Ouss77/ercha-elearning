"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Code, Palette, TrendingUp, Users, Shield } from "lucide-react";

/**
 * Teachers Section
 * Displays the platform's instructors and their specializations
 */
export function Teachers() {
  const manager = {
    name: "Oussama Sassour",
    role: "Responsable des Formateurs",
    description:
      "Supervise et coordonne l'équipe pédagogique pour garantir l'excellence de l'enseignement dans tous les domaines.",
    initials: "OS",
    color: "bg-gradient-to-br from-teal-600 to-emerald-600",
  };

  const teachers = [
    {
      name: "Walid Draa",
      role: "Formateur Développement Web",
      specialty: "Développement Web",
      description:
        "Expert en développement web moderne, spécialisé dans React, Next.js et les technologies front-end avancées.",
      initials: "WD",
      color: "bg-teal-500",
      icon: Code,
    },
    {
      name: "Adam Khairi",
      role: "Formateur Design Graphique",
      specialty: "Design Graphique",
      description:
        "Designer créatif avec une expertise en UI/UX, branding et design visuel pour le web et les médias numériques.",
      initials: "AK",
      color: "bg-purple-500",
      icon: Palette,
    },
    {
      name: "Anas ElGhamraoui",
      role: "Formateur Marketing Digital",
      specialty: "Marketing Digital",
      description:
        "Spécialiste en stratégie digitale, SEO, réseaux sociaux et campagnes marketing pour maximiser la visibilité en ligne.",
      initials: "AE",
      color: "bg-emerald-500",
      icon: TrendingUp,
    },
  ];

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200/20 dark:bg-teal-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-200/20 dark:bg-emerald-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-teal-100 to-emerald-100 dark:from-teal-950 dark:to-emerald-950 border border-teal-200 dark:border-teal-800 mb-4">
            <Users className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span className="text-sm font-medium text-teal-900 dark:text-teal-100">
              Notre Équipe
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Nos Formateurs Experts
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Des professionnels passionnés et expérimentés dans leurs domaines
            respectifs
          </p>
        </div>

        {/* Teachers Grid */}
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Manager Card - Featured */}
          <div className="flex justify-center">
            <Card className="w-full max-w-2xl bg-white dark:bg-gray-900 border-2 border-teal-300 dark:border-teal-700 shadow-xl">
              <CardContent className="pt-8 pb-6 px-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Avatar with Badge */}
                  <div className="relative">
                    <Avatar
                      className={`${manager.color} h-24 w-24 ring-4 ring-white dark:ring-gray-900`}
                    >
                      <AvatarFallback className="text-white font-bold text-2xl">
                        {manager.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 p-2 rounded-full bg-teal-600 dark:bg-teal-500 ring-4 ring-white dark:ring-gray-900">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {manager.name}
                    </h3>
                    <p className="text-base font-semibold text-teal-600 dark:text-teal-400 mb-3">
                      {manager.role}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {manager.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Connection Lines Indicator */}
          <div className="flex justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-0.5 bg-gradient-to-b from-teal-300 to-transparent dark:from-teal-700"></div>
              <Users className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              <div className="h-8 w-0.5 bg-gradient-to-b from-transparent to-teal-300 dark:to-teal-700"></div>
            </div>
          </div>

          {/* Instructors Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {teachers.map((teacher, index) => {
              const IconComponent = teacher.icon;
              return (
                <Card
                  key={index}
                  className="group bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:shadow-xl hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-300 hover:-translate-y-2"
                >
                  <CardContent className="pt-8 pb-6 px-6 text-center space-y-4">
                    {/* Avatar */}
                    <div className="flex flex-col items-center gap-4">
                      <Avatar className={`${teacher.color} h-20 w-20`}>
                        <AvatarFallback className="text-white font-bold text-xl">
                          {teacher.initials}
                        </AvatarFallback>
                      </Avatar>

                      {/* Specialty Icon */}
                      <div className="p-2 rounded-lg bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-950 dark:to-emerald-950">
                        <IconComponent className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                      </div>
                    </div>

                    {/* Name & Role */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {teacher.name}
                      </h3>
                      <p className="text-sm font-medium text-teal-600 dark:text-teal-400 mb-3">
                        {teacher.specialty}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {teacher.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
