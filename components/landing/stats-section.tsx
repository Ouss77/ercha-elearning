"use client";

import { Users, BookOpen, Award, TrendingUp } from "lucide-react";

/**
 * Stats Section - Display platform statistics
 * Shows key metrics like active students, completed courses, satisfaction rate, etc.
 */
export function StatsSection() {
  const stats = [
    {
      icon: BookOpen,
      value: "15+",
      label: "Cours disponibles",
      color: "text-teal-600 dark:text-teal-400",
      bgGradient:
        "bg-gradient-to-br from-teal-100 to-teal-50 dark:from-teal-950 dark:to-teal-900",
    },
    {
      icon: Users,
      value: "60+",
      label: "Étudiants actifs",
      color: "text-emerald-600 dark:text-emerald-400",
      bgGradient:
        "bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-950 dark:to-emerald-900",
    },
    {
      icon: Award,
      value: "3",
      label: "Formateurs experts",
      color: "text-cyan-600 dark:text-cyan-400",
      bgGradient:
        "bg-gradient-to-br from-cyan-100 to-cyan-50 dark:from-cyan-950 dark:to-cyan-900",
    },
    {
      icon: TrendingUp,
      value: "3",
      label: "Domaines clés",
      color: "text-emerald-600 dark:text-emerald-400",
      bgGradient:
        "bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-950 dark:to-emerald-900",
    },
  ];

  return (
    <section className="py-16 px-4 bg-white dark:bg-background border-y border-border">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="text-center group hover:scale-105 transition-transform duration-300"
              >
                <div className="flex justify-center mb-3">
                  <div
                    className={`h-12 w-12 rounded-lg flex items-center justify-center ${stat.bgGradient}`}
                  >
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default StatsSection;
