"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Play, User, CheckCircle } from "lucide-react";
import type { User as UserType } from "@/lib/auth/auth";

interface StudentDashboardProps {
  user: UserType;
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
    totalModules: number;
  }>;
}

interface Course {
  id: number;
  title: string;
  description: string;
  domain: string;
  domainColor?: string;
  teacher: string;
  thumbnail: string;
  progress: number;
  totalChapters: number;
  completedChapters: number;
  totalModules?: number;
  lastAccessed?: string;
  isCompleted: boolean;
}

export function StudentDashboard({
  user,
  enrolledCourses: rawEnrolledCourses,
}: StudentDashboardProps) {
  // Transform database data to match component's Course interface
  const enrolledCourses: Course[] = useMemo(() => {
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
        domainColor: enrollment.domainColor || undefined,
        teacher: enrollment.teacherName || "Non assigné",
        thumbnail: enrollment.courseThumbnailUrl || "/placeholder.svg",
        progress,
        totalChapters: enrollment.totalChapters,
        completedChapters: enrollment.completedChapters,
        totalModules: enrollment.totalModules,
        lastAccessed: enrollment.enrolledAt.toISOString().split("T")[0],
        isCompleted: enrollment.completedAt !== null,
      };
    });
  }, [rawEnrolledCourses]);

  const stats = {
    totalCourses: enrolledCourses.length,
    completedChapters: enrolledCourses.reduce(
      (acc, course) => acc + course.completedChapters,
      0
    ),
  };

  // Get all unique domains
  const allDomains = useMemo(() => {
    const domainMap = new Map<
      string,
      { count: number; color: string | undefined }
    >();
    enrolledCourses.forEach((course) => {
      if (course.domain && course.domain !== "Non classé") {
        const existing = domainMap.get(course.domain) || {
          count: 0,
          color: course.domainColor,
        };
        domainMap.set(course.domain, {
          count: existing.count + 1,
          color: course.domainColor,
        });
      }
    });

    return Array.from(domainMap.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      color: data.color || "#3b82f6",
    }));
  }, [enrolledCourses]);

  const inProgressCourses = enrolledCourses.filter(
    (course) => !course.isCompleted && course.progress > 0
  );

  return (
    <div className="space-y-6">
      {/* Student Profile Card */}
      <Card className="border-border bg-gradient-to-br from-teal-50/50 to-emerald-50/50 dark:from-teal-950/20 dark:to-emerald-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {user.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>

            {/* Student Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-1">
                {user.name}
              </h2>
              <p className="text-sm text-muted-foreground mb-3">{user.email}</p>

              {allDomains.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {allDomains.map((domain) => (
                    <Badge
                      key={domain.name}
                      className="text-xs px-3 py-1 font-medium"
                      style={{
                        backgroundColor: `${domain.color}20`,
                        color: domain.color,
                        borderColor: `${domain.color}40`,
                      }}
                    >
                      {domain.name} ({domain.count})
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats - Desktop */}
            <div className="hidden md:flex flex-col gap-3 text-right">
              <div>
                <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                  {stats.totalCourses}
                </div>
                <div className="text-xs text-muted-foreground">Cours</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.completedChapters}
                </div>
                <div className="text-xs text-muted-foreground">
                  Chapitres complétés
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats - Mobile */}
          <div className="flex md:hidden gap-4 pt-4 mt-4 border-t border-border">
            <div className="flex-1 text-center">
              <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                {stats.totalCourses}
              </div>
              <div className="text-xs text-muted-foreground">Cours</div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {stats.completedChapters}
              </div>
              <div className="text-xs text-muted-foreground">
                Chapitres complétés
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-8">
        {/* Continue Learning */}
        {inProgressCourses.length > 0 && (
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Play className="h-5 w-5 text-primary" />
                <span>Continuer l'apprentissage</span>
              </CardTitle>
              <CardDescription>
                Reprenez là où vous vous êtes arrêté
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {inProgressCourses.slice(0, 3).map((course) => (
                  <Link
                    key={course.id}
                    href={`/etudiant/cours/${course.id}`}
                    className="block"
                  >
                    <div className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all">
                      {/* Course Thumbnail */}
                      <div
                        className="w-20 h-20 rounded-lg bg-cover bg-center flex-shrink-0"
                        style={{
                          backgroundImage: `url(${course.thumbnail})`,
                          backgroundColor: course.domainColor || "#3b82f6",
                        }}
                      />

                      {/* Course Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-base line-clamp-1">
                            {course.title}
                          </h3>
                          <Badge
                            variant="outline"
                            className="text-xs flex-shrink-0"
                            style={{
                              borderColor: course.domainColor || "#3b82f6",
                              color: course.domainColor || "#3b82f6",
                              backgroundColor: course.domainColor
                                ? `${course.domainColor}10`
                                : "#3b82f610",
                            }}
                          >
                            {course.domain}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
                          {course.description}
                        </p>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              Progression
                            </span>
                            <span className="font-medium">
                              {course.progress}%
                            </span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {course.teacher}
                            </span>
                            <span>
                              {course.completedChapters}/{course.totalChapters}{" "}
                              chapitres
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Courses */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Mes Cours</CardTitle>
            <CardDescription>Tous vos cours inscrits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {enrolledCourses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Vous n'êtes inscrit à aucun cours pour le moment
                </div>
              ) : (
                enrolledCourses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/etudiant/cours/${course.id}`}
                    className="block"
                  >
                    <div className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all">
                      {/* Course Thumbnail */}
                      <div
                        className="w-20 h-20 rounded-lg bg-cover bg-center flex-shrink-0 relative"
                        style={{
                          backgroundImage: `url(${course.thumbnail})`,
                          backgroundColor: course.domainColor || "#3b82f6",
                        }}
                      >
                        {course.isCompleted && (
                          <div className="absolute inset-0 bg-emerald-500/90 rounded-lg flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Course Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base line-clamp-1">
                              {course.title}
                            </h3>
                            {course.isCompleted && (
                              <Badge
                                variant="outline"
                                className="text-xs mt-1 bg-emerald-50 text-emerald-700 border-emerald-200"
                              >
                                Terminé
                              </Badge>
                            )}
                          </div>
                          <Badge
                            variant="outline"
                            className="text-xs flex-shrink-0"
                            style={{
                              borderColor: course.domainColor || "#3b82f6",
                              color: course.domainColor || "#3b82f6",
                              backgroundColor: course.domainColor
                                ? `${course.domainColor}10`
                                : "#3b82f610",
                            }}
                          >
                            {course.domain}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {course.description}
                        </p>

                        {/* Progress Bar */}
                        {!course.isCompleted && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                Progression
                              </span>
                              <span className="font-medium">
                                {course.progress}%
                              </span>
                            </div>
                            <Progress value={course.progress} className="h-2" />
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {course.teacher}
                              </span>
                              <span>
                                {course.completedChapters}/
                                {course.totalChapters} chapitres
                              </span>
                            </div>
                          </div>
                        )}

                        {course.isCompleted && (
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {course.teacher}
                            </span>
                            <span className="flex items-center gap-1 text-emerald-600 font-medium">
                              <CheckCircle className="h-3 w-3" />
                              {course.totalChapters} chapitres complétés
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
