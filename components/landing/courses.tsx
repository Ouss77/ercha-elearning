"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, ArrowRight, GraduationCap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Course {
  id: number;
  title: string;
  description: string;
  domain: string;
  teacher: string;
  thumbnail: string;
  totalChapters: number;
}

/**
 * Courses Section
 * Features:
 * - Display courses with rich information
 * - Progress tracking
 * - Status badges (completed/in progress)
 * - Domain categorization
 * - Teacher information
 * - Visual thumbnails
 * - Responsive grid layout
 */
export function Courses() {
  // Mock data - replace with real data from database
  const [courses] = useState<Course[]>([
    {
      id: 1,
      title: "Introduction à React",
      description:
        "Apprenez les bases de React et créez vos premières applications",
      domain: "Informatique",
      teacher: "Jean Martin",
      thumbnail: "/react-course.png",
      totalChapters: 8,
    },
    {
      id: 2,
      title: "Marketing Digital Avancé",
      description: "Stratégies avancées de marketing digital et analytics",
      domain: "Marketing",
      teacher: "Jean Martin",
      thumbnail: "/marketing-course-concept.png",
      totalChapters: 12,
    },
    {
      id: 3,
      title: "Design UX/UI Moderne",
      description: "Principes de design et création d'interfaces utilisateur",
      domain: "Design",
      teacher: "Jean Martin",
      thumbnail: "/ux-ui-design-course.png",
      totalChapters: 10,
    },
  ]);

  // Helper function to get domain color
  const getDomainColor = (domain: string) => {
    const colors: Record<string, string> = {
      Informatique:
        "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border-blue-200 dark:border-blue-900",
      Marketing:
        "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 border-green-200 dark:border-green-900",
      Design:
        "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400 border-purple-200 dark:border-purple-900",
    };
    return (
      colors[domain] ||
      "bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-400 border-gray-200 dark:border-gray-900"
    );
  };

  // Calculate statistics
  const stats = {
    totalCourses: courses.length,
    totalChapters: courses.reduce(
      (acc, course) => acc + course.totalChapters,
      0
    ),
    totalStudents: "60+",
    satisfactionRate: 95,
  };

  return (
    <section className="relative py-16 overflow-hidden bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200/20 dark:bg-teal-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-200/20 dark:bg-emerald-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-teal-100 to-emerald-100 dark:from-teal-950 dark:to-emerald-950 border border-teal-200 dark:border-teal-800 mb-4">
            <GraduationCap className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span className="text-sm font-medium text-teal-900 dark:text-teal-100">
              Nos Formations
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Découvrez Nos Cours
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Des formations complètes pour développer vos compétences
            professionnelles
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="border-teal-200 dark:border-teal-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-3 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-950 dark:to-teal-900">
                  <BookOpen className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalCourses}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Cours Disponibles
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 dark:border-emerald-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-3 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-950 dark:to-emerald-900">
                  <GraduationCap className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalChapters}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Chapitres Total
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-cyan-200 dark:border-cyan-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-3 rounded-full bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-950 dark:to-cyan-900">
                  <Users className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalStudents}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Étudiants Inscrits
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 dark:border-purple-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-3 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-950 dark:to-purple-900">
                  <svg
                    className="h-6 w-6 text-purple-600 dark:text-purple-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.satisfactionRate}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Taux de Satisfaction
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="group relative overflow-hidden border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-xl hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-300 flex flex-col"
            >
              {/* Course Thumbnail */}
              <div className="relative h-48 bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-950 dark:to-emerald-950 overflow-hidden">
                {/* Actual Thumbnail Image */}
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Domain Badge - Positioned over image */}
                <div className="absolute bottom-4 left-4 z-10">
                  <Badge
                    className={`${getDomainColor(
                      course.domain
                    )} backdrop-blur-sm`}
                  >
                    {course.domain}
                  </Badge>
                </div>
              </div>

              <CardHeader className="flex-grow">
                <CardTitle className="text-xl group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {course.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {course.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pb-6">
                {/* Course Stats Grid */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950">
                      <BookOpen className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Chapitres
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {course.totalChapters}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950">
                      <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Professeur
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
                        {course.teacher}
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <Link href={`/student/course/${course.id}`} className="block">
                  <Button className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white border-0 shadow-md hover:shadow-lg transition-all group">
                    Voir le cours
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Browse All Courses Link */}
        <div className="text-center">
          <Link href="/student">
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-teal-600 dark:border-teal-400 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950 hover:border-teal-700 dark:hover:border-teal-300 group"
            >
              Voir tous les cours
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
