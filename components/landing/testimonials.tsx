"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Quote } from "lucide-react";

/**
 * Testimonials Section
 * Displays student testimonials with ratings
 */
export function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Benali",
      role: "Développeuse Web",
      content:
        "Les cours de React m'ont permis de décrocher mon premier emploi en développement. La qualité du contenu et l'accompagnement sont exceptionnels !",
      rating: 5,
      initials: "SB",
      color: "bg-teal-500",
    },
    {
      name: "Karim Mansouri",
      role: "Chef de Projet Marketing",
      content:
        "Formation en marketing digital très complète. J'ai pu appliquer immédiatement les concepts appris dans mon travail quotidien.",
      rating: 5,
      initials: "KM",
      color: "bg-emerald-500",
    },
    {
      name: "Amina Ziani",
      role: "Designer UX/UI",
      content:
        "Excellente formation en design. Les exercices pratiques et les retours des formateurs m'ont vraiment aidée à progresser rapidement.",
      rating: 5,
      initials: "AZ",
      color: "bg-purple-500",
    },
    {
      name: "Mehdi Lakhal",
      role: "Étudiant en Informatique",
      content:
        "Interface intuitive, contenu de qualité et communauté bienveillante. Je recommande vivement cette plateforme !",
      rating: 5,
      initials: "ML",
      color: "bg-blue-500",
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
            <Star className="h-4 w-4 text-teal-600 dark:text-teal-400 fill-current" />
            <span className="text-sm font-medium text-teal-900 dark:text-teal-100">
              Témoignages
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Ce Que Disent Nos Étudiants
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Découvrez les expériences de ceux qui ont transformé leur carrière
            grâce à nos formations
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="group bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:shadow-xl hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-300 hover:-translate-y-2"
            >
              <CardContent className="pt-6 space-y-4">
                {/* Quote Icon */}
                <div className="flex justify-between items-start">
                  <Quote className="h-8 w-8 text-teal-200 dark:text-teal-900 fill-current" />
                  {/* Rating */}
                  <div className="flex gap-0.5">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 text-yellow-500 fill-current"
                      />
                    ))}
                  </div>
                </div>

                {/* Content */}
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <Avatar className={`${testimonial.color} h-10 w-10`}>
                    <AvatarFallback className="text-white font-semibold">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
