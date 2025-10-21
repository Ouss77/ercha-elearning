"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Code, Palette, TrendingUp, Users } from "lucide-react";

/**
 * Teachers Section
 * Displays the platform's instructors and their specializations
 */
export function Teachers() {
  const teachers = [
    {
      name: "Walid Draa",
      role: "Formateur Développement Web",
      specialty: "Développement Web",
      description:
        "Expert en développement web moderne, spécialisé dans React, Next.js et les technologies front-end avancées.",
      initials: "WD",
      color: "bg-blue-500",
      icon: Code,
      iconBg:
        "bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-950 dark:to-indigo-950",
      iconColor: "text-blue-600 dark:text-blue-400",
      cardBorder: "border-blue-200 dark:border-blue-800",
      cardBg:
        "bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20",
    },
    {
      name: "Adam Khairi",
      role: "Formateur Design Graphique",
      specialty: "Design Graphique",
      description:
        "Designer créatif avec une expertise en UI/UX, branding et design visuel pour le web et les médias numériques.",
      initials: "AK",
      color: "bg-violet-500",
      icon: Palette,
      iconBg:
        "bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-950 dark:to-purple-950",
      iconColor: "text-violet-600 dark:text-violet-400",
      cardBorder: "border-violet-200 dark:border-violet-800",
      cardBg:
        "bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-950/20 dark:to-purple-950/20",
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
      iconBg:
        "bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-950 dark:to-green-950",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      cardBorder: "border-emerald-200 dark:border-emerald-800",
      cardBg:
        "bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-emerald-950/20 dark:to-green-950/20",
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

        {/* Instructors Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {teachers.map((teacher, index) => {
              const IconComponent = teacher.icon;
              return (
                <Card
                  key={index}
                  className={`group ${teacher.cardBg} border-2 ${teacher.cardBorder} hover:shadow-xl transition-all duration-300 hover:-translate-y-2`}
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
                      <div className={`p-2 rounded-lg ${teacher.iconBg}`}>
                        <IconComponent
                          className={`h-5 w-5 ${teacher.iconColor}`}
                        />
                      </div>
                    </div>

                    {/* Name & Role */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {teacher.name}
                      </h3>
                      <p
                        className={`text-sm font-medium mb-3 ${teacher.iconColor}`}
                      >
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
