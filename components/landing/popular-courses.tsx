"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Star, ArrowRight, BookOpen, Clock } from "lucide-react";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  description: string;
  price: string;
  students: number;
  rating: number;
  duration: string;
  level: string;
  image?: string;
  featured?: boolean;
}

/**
 * Popular Courses Section
 * Features:
 * - Course cards with images
 * - Student count and ratings
 * - Price display
 * - Featured badge
 * - "Browse All Courses" link
 * - Matches hero section design
 */
export function PopularCourses() {
  const courses: Course[] = [
    {
      id: "1",
      title: "Développement Web Complet",
      description:
        "Maîtrisez HTML, CSS, JavaScript et les frameworks modernes pour créer des sites web professionnels.",
      price: "Gratuit",
      students: 156,
      rating: 4.8,
      duration: "8 semaines",
      level: "Débutant",
      featured: true,
    },
    {
      id: "2",
      title: "Introduction à Python",
      description:
        "Apprenez les bases de la programmation Python et créez vos premiers projets.",
      price: "Gratuit",
      students: 298,
      rating: 4.9,
      duration: "6 semaines",
      level: "Débutant",
    },
    {
      id: "3",
      title: "Data Science avec R",
      description:
        "Explorez l'analyse de données, la visualisation et les statistiques avec R.",
      price: "Gratuit",
      students: 162,
      rating: 4.7,
      duration: "10 semaines",
      level: "Intermédiaire",
    },
    {
      id: "4",
      title: "Design UX/UI Moderne",
      description:
        "Créez des interfaces utilisateur attrayantes et des expériences mémorables.",
      price: "Gratuit",
      students: 251,
      rating: 4.9,
      duration: "7 semaines",
      level: "Tous niveaux",
    },
  ];

  return (
    <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 dark:from-background dark:via-background/95 dark:to-background/90">
      {/* Decorative Grid Pattern - Right Side (mirrored from hero) */}
      <div className="absolute right-8 top-20 md:right-16 md:top-32 opacity-20 pointer-events-none">
        <svg
          width="100"
          height="100"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="100"
            stroke="currentColor"
            strokeWidth="2"
            className="text-teal-600 dark:text-teal-400"
          />
          <line
            x1="25"
            y1="0"
            x2="25"
            y2="100"
            stroke="currentColor"
            strokeWidth="2"
            className="text-teal-600 dark:text-teal-400"
          />
          <line
            x1="50"
            y1="0"
            x2="50"
            y2="100"
            stroke="currentColor"
            strokeWidth="2"
            className="text-teal-600 dark:text-teal-400"
          />
          <line
            x1="75"
            y1="0"
            x2="75"
            y2="100"
            stroke="currentColor"
            strokeWidth="2"
            className="text-teal-600 dark:text-teal-400"
          />
          <line
            x1="100"
            y1="0"
            x2="100"
            y2="100"
            stroke="currentColor"
            strokeWidth="2"
            className="text-teal-600 dark:text-teal-400"
          />
          <line
            x1="0"
            y1="0"
            x2="100"
            y2="0"
            stroke="currentColor"
            strokeWidth="2"
            className="text-teal-600 dark:text-teal-400"
          />
          <line
            x1="0"
            y1="25"
            x2="100"
            y2="25"
            stroke="currentColor"
            strokeWidth="2"
            className="text-teal-600 dark:text-teal-400"
          />
          <line
            x1="0"
            y1="50"
            x2="100"
            y2="50"
            stroke="currentColor"
            strokeWidth="2"
            className="text-teal-600 dark:text-teal-400"
          />
          <line
            x1="0"
            y1="75"
            x2="100"
            y2="75"
            stroke="currentColor"
            strokeWidth="2"
            className="text-teal-600 dark:text-teal-400"
          />
          <line
            x1="0"
            y1="100"
            x2="100"
            y2="100"
            stroke="currentColor"
            strokeWidth="2"
            className="text-teal-600 dark:text-teal-400"
          />
        </svg>
      </div>

      {/* Decorative circles */}
      <div className="absolute top-10 left-10 w-32 h-32 md:w-48 md:h-48 bg-emerald-400/20 dark:bg-emerald-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-foreground mb-3">
              Cours Populaires
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-muted-foreground max-w-2xl">
              Découvrez nos formations les plus suivies et commencez votre
              parcours d'apprentissage dès aujourd'hui.
            </p>
          </div>
          <Button
            variant="outline"
            className="mt-4 md:mt-0 border-2 border-teal-600 dark:border-teal-400 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950"
            asChild
          >
            <Link href="/courses">
              Tous les cours
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Course Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="group relative bg-white dark:bg-card border-gray-200 dark:border-border hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              {/* Featured Badge */}
              {course.featured && (
                <div className="absolute top-3 left-3 z-10">
                  <Badge className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-0">
                    POPULAIRE
                  </Badge>
                </div>
              )}

              {/* Course Image Placeholder */}
              <div className="relative h-40 bg-gradient-to-br from-teal-400 to-emerald-400 dark:from-teal-600 dark:to-emerald-600 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-white/30" />
                </div>
                {/* Decorative pattern overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-2">
                  {course.title}
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-muted-foreground line-clamp-2 mt-2">
                  {course.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Course Meta */}
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {course.level}
                  </Badge>
                </div>

                {/* Price */}
                <div className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
                  {course.price}
                </div>

                {/* Students & Rating */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-border">
                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{course.students} étudiants</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(course.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 dark:from-teal-500 dark:to-emerald-500 text-white"
                  asChild
                >
                  <Link href={`/courses/${course.id}`}>
                    Voir le cours
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PopularCourses;
