"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface CourseWithStats {
  courseId: number;
  courseTitle: string;
  courseDescription: string | null;
  courseThumbnailUrl: string | null;
  courseIsActive: boolean | null;
  domainId: number | null;
  domainName: string | null;
  domainColor: string | null;
  totalStudents: number;
  totalChapters: number;
  completedEnrollments: number;
  totalProgress: number;
}

interface MyCoursesProps {
  courses: CourseWithStats[];
}

export function MyCourses({ courses }: MyCoursesProps) {
  // Transform database courses to include calculated fields
  const transformedCourses = useMemo(() => {
    return courses.map((course) => ({
      id: course.courseId,
      title: course.courseTitle,
      description: course.courseDescription || "",
      domain: course.domainName || "Non catégorisé",
      domainColor: course.domainColor || "#6366f1",
      thumbnail: course.courseThumbnailUrl || "/placeholder.svg",
      studentsCount: course.totalStudents,
      chaptersCount: course.totalChapters,
      isActive: course.courseIsActive ?? true,
    }));
  }, [courses]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      all: transformedCourses.length,
    };
  }, [transformedCourses]);

  // Calculate total students across all courses
  const totalStudents = useMemo(() => {
    return transformedCourses.reduce(
      (sum, course) => sum + course.studentsCount,
      0
    );
  }, [transformedCourses]);

  return (
    <div className="space-y-8">
      {/* Statistics Summary - Full Width 2 Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border bg-gradient-to-br from-teal-50/50 to-emerald-50/50 dark:from-teal-950/20 dark:to-emerald-950/20 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                  Cours Assignés
                </p>
                <p className="text-4xl font-bold text-teal-600 dark:text-teal-400">
                  {stats.all}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Par l'administration
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 shadow-lg">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-gradient-to-br from-emerald-50/50 to-cyan-50/50 dark:from-emerald-950/20 dark:to-cyan-950/20 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                  Total Étudiants
                </p>
                <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                  {totalStudents}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Inscrits à vos cours
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Mes Cours</h2>
          <p className="text-muted-foreground">
            Gérez et Voir vos cours assignés
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {transformedCourses.map((course) => (
            <Card
              key={course.id}
              className="group border-border bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col h-full"
            >
              {/* Thumbnail */}
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-3 right-3 flex gap-2">
                  <Badge
                    variant={course.isActive ? "default" : "secondary"}
                    className="shadow-lg backdrop-blur-sm"
                  >
                    {course.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </div>
                <div className="absolute bottom-3 left-3">
                  <Badge
                    className="shadow-lg backdrop-blur-sm"
                    style={{
                      backgroundColor: `${course.domainColor}90`,
                      color: "white",
                      borderColor: "transparent",
                    }}
                  >
                    {course.domain}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <CardContent className="p-6 flex flex-col flex-grow">
                <div className="flex flex-col h-full">
                  {/* Title & Description - Fixed Height */}
                  <div className="mb-4">
                    <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2 h-14 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                      {course.description}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/50 mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold">
                        {course.studentsCount}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        étudiant{course.studentsCount > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold">
                        {course.chaptersCount}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        chapitre{course.chaptersCount > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {/* Action Button - Pushed to Bottom */}
                  <div className="mt-auto">
                    <Link
                      href={`/formateur/cours/${course.id}`}
                      className="block"
                    >
                      <Button className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 transition-all duration-300">
                        Accéder au cours
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {transformedCourses.length === 0 && (
          <Card className="border-border bg-card">
            <CardContent className="text-center py-12">
              <div className="inline-flex p-4 rounded-full bg-muted mb-4">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Aucun cours assigné
              </h3>
              <p className="text-muted-foreground">
                Vous n'avez pas encore de cours assignés. Contactez
                l'administrateur pour plus d'informations.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
