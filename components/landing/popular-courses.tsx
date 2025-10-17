"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, ArrowRight, BookOpen, Layers } from "lucide-react";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  description: string;
  domain: string;
  domainColor: string;
  students: number;
  chapters: number;
  professor: string;
}

/**
 * Popular Courses Section
 * Features:
 * - Three main courses from admin dashboard
 * - Clean design matching hero
 * - Domain badges with colors
 * - Student and chapter counts
 * - "Browse All Courses" link
 */
export function PopularCourses() {
  const courses: Course[] = [
    {
      id: "1",
      title: "Introduction à React",
      description:
        "Apprenez les bases de React et créez vos premières applications",
      domain: "Informatique",
      domainColor:
        "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
      students: 45,
      chapters: 8,
      professor: "Jean Martin",
    },
    {
      id: "2",
      title: "Marketing Digital Avancé",
      description: "Stratégies avancées de marketing digital et analytics",
      domain: "Marketing",
      domainColor:
        "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
      students: 32,
      chapters: 12,
      professor: "Jean Martin",
    },
    {
      id: "3",
      title: "Design UX/UI Moderne",
      description: "Principes de design et création d'interfaces utilisateur",
      domain: "Design",
      domainColor:
        "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
      students: 28,
      chapters: 10,
      professor: "Jean Martin",
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
            <Link href="/insciption">
              Tous les cours
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Course Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {courses.map((course, index) => (
            <Card
              key={course.id}
              className="group relative bg-white dark:bg-card border-2 border-gray-100 dark:border-border hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              {/* Course Header with Gradient */}
              <div className="relative h-32 bg-gradient-to-br from-teal-500 to-emerald-500 dark:from-teal-600 dark:to-emerald-600 overflow-hidden">
                {/* Decorative pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-4 right-4">
                    <BookOpen className="h-16 w-16 text-white" />
                  </div>
                  {/* Decorative circles */}
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full -translate-x-1/2 translate-y-1/2"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2"></div>
                </div>

                {/* Domain Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <Badge
                    className={`${course.domainColor} border-0 font-semibold`}
                  >
                    {course.domain}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-3 pt-6">
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors mb-2">
                  {course.title}
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-muted-foreground leading-relaxed">
                  {course.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Course Stats */}
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100 dark:border-border">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-foreground">
                      {course.students}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-muted-foreground">
                      Étudiants
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-foreground">
                      {course.chapters}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-muted-foreground">
                      Chapitres
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 dark:from-teal-500 dark:to-emerald-500 text-white shadow-lg hover:shadow-xl transition-all"
                  asChild
                >
                  <Link href={`/inscription`}>
                    Découvrir le cours
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
