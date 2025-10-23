"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, CheckCircle2, PlayCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { User } from "@/lib/auth/auth";

interface MyCoursesViewProps {
  user: User;
  enrolledCourses: Array<{
    enrollmentId: number;
    courseId: number;
    courseTitle: string;
    courseDescription: string | null;
    courseThumbnailUrl: string | null;
    enrolledAt: Date;
    completedAt: Date | null;
    domainId: number | null;
    domainName: string | null;
    domainColor: string | null;
    teacherId: number | null;
    teacherName: string | null;
    totalChapters: number;
    completedChapters: number;
  }>;
}

interface Course {
  id: number;
  title: string;
  description: string;
  domain: string;
  teacher: string;
  thumbnail: string;
  progress: number;
  totalChapters: number;
  completedChapters: number;
  lastAccessed?: string;
  isCompleted: boolean;
}

export function MyCoursesView({
  user,
  enrolledCourses: rawEnrolledCourses,
}: MyCoursesViewProps) {
  // Create domain color mapping from database
  const domainColorMap = useMemo(() => {
    const colorMap: Record<string, string> = {};
    rawEnrolledCourses.forEach((enrollment) => {
      if (enrollment.domainName && enrollment.domainColor) {
        colorMap[enrollment.domainName] = enrollment.domainColor;
      }
    });
    return colorMap;
  }, [rawEnrolledCourses]);

  // Transform database data to match component's Course interface
  const courses: Course[] = useMemo(() => {
    return rawEnrolledCourses.map((enrollment) => {
      const progress =
        enrollment.totalChapters > 0
          ? Math.round(
              (enrollment.completedChapters / enrollment.totalChapters) * 100
            )
          : 0;

      return {
        id: enrollment.courseId,
        title: enrollment.courseTitle,
        description:
          enrollment.courseDescription || "Pas de description disponible",
        domain: enrollment.domainName || "Non classé",
        teacher: enrollment.teacherName || "Non assigné",
        thumbnail: enrollment.courseThumbnailUrl || "/placeholder.svg",
        progress,
        totalChapters: enrollment.totalChapters,
        completedChapters: enrollment.completedChapters,
        lastAccessed: enrollment.enrolledAt.toISOString().split("T")[0],
        isCompleted: enrollment.completedAt !== null,
      };
    });
  }, [rawEnrolledCourses]);

  const getDomainColor = (domain: string) => {
    // Use database domain colors or fallback to default colors
    if (domainColorMap[domain]) {
      // The domain color from DB is in format like "bg-blue-500"
      // We need to convert it to badge-friendly classes
      const baseColor = domainColorMap[domain].replace("bg-", "");
      return `bg-${baseColor.replace("500", "100")} text-${baseColor.replace(
        "500",
        "700"
      )} dark:bg-${baseColor.replace(
        "500",
        "950"
      )} dark:text-${baseColor.replace("500", "400")}`;
    }

    // Fallback colors in case domain color is not in database
    const fallbackColors: Record<string, string> = {
      Informatique:
        "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
      "Développement Web":
        "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
      Marketing:
        "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
      "Marketing Digital":
        "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
      Design:
        "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
      "Design Graphique":
        "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
    };
    return (
      fallbackColors[domain] ||
      "bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-400"
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border bg-gradient-to-br from-teal-50/50 to-emerald-50/50 dark:from-teal-950/20 dark:to-emerald-950/20 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                  Cours Inscrits
                </p>
                <p className="text-4xl font-bold text-teal-600 dark:text-teal-400">
                  {courses.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {courses.filter((c) => c.isCompleted).length} terminés
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
                  En Cours
                </p>
                <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                  {
                    courses.filter((c) => !c.isCompleted && c.progress > 0)
                      .length
                  }
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Cours en progression
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg">
                <PlayCircle className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Mes Cours</h2>
        <p className="text-muted-foreground">
          Gérez et continuez vos formations en cours
        </p>
      </div>

      {/* Courses Display */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {courses.map((course) => (
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
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute top-3 right-3 flex gap-2">
                {course.isCompleted && (
                  <Badge className="bg-emerald-500 text-white shadow-lg backdrop-blur-sm">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Terminé
                  </Badge>
                )}
              </div>
              <div className="absolute bottom-3 left-3">
                <Badge
                  className="shadow-lg backdrop-blur-sm"
                  style={{
                    backgroundColor: domainColorMap[course.domain]
                      ? `${domainColorMap[course.domain]}90`
                      : "#6366f190",
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

                {/* Progress Bar */}
                {!course.isCompleted && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-muted-foreground font-medium">
                        Progression
                      </span>
                      <span className="font-semibold text-teal-600 dark:text-teal-400">
                        {course.progress}%
                      </span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/50 mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">
                      {course.completedChapters}/{course.totalChapters}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      chapitre{course.totalChapters > 1 ? "s" : ""}
                    </span>
                  </div>
                  {course.lastAccessed && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {formatDate(course.lastAccessed)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Button - Pushed to Bottom */}
                <div className="mt-auto">
                  <Link href={`/etudiant/cours/${course.id}`} className="block">
                    <Button className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 transition-all duration-300">
                      {course.isCompleted ? "Revoir le cours" : "Continuer"}
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <Card className="border-border bg-card">
          <CardContent className="text-center py-12">
            <div className="inline-flex p-4 rounded-full bg-muted mb-4">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Aucun cours inscrit
            </h3>
            <p className="text-muted-foreground">
              Vous n'êtes inscrit à aucun cours pour le moment
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
