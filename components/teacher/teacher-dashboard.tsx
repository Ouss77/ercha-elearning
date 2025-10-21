"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Users } from "lucide-react";
import type { User } from "@/lib/auth/auth";
import { Badge } from "../ui/badge";
import { useMemo } from "react";

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

interface TopStudent {
  studentId: number;
  studentName: string;
  studentEmail: string;
  studentAvatarUrl: string | null;
  totalCourses: number;
  totalProgress: number;
  totalChapters: number;
  completedCourses: number;
  progressPercentage: number;
}

interface Activity {
  id: number;
  type: string;
  studentId: number;
  studentName: string;
  courseTitle: string;
  chapterTitle: string | null;
  score: number | null;
  timestamp: Date | null;
}

interface DashboardData {
  stats: {
    totalCourses: number;
    activeCourses: number;
    totalStudents: number;
    activeStudents: number;
  };
  courses: CourseWithStats[];
  topStudents: TopStudent[];
  recentActivity: Activity[];
}

interface TeacherDashboardProps {
  user: User;
  dashboardData: DashboardData;
}

export function TeacherDashboard({
  user,
  dashboardData,
}: TeacherDashboardProps) {
  const { stats, courses, topStudents, recentActivity } = dashboardData;

  // Calculate average progress for each course
  const coursesWithProgress = useMemo(() => {
    return courses.map((course) => {
      const averageProgress =
        course.totalChapters > 0 && course.totalStudents > 0
          ? Math.round(
              (course.totalProgress /
                (course.totalChapters * course.totalStudents)) *
                100
            )
          : 0;
      return {
        ...course,
        averageProgress,
      };
    });
  }, [courses]);

  // Calculate total students across all courses
  const totalStudents = useMemo(() => {
    return courses.reduce((sum, course) => sum + course.totalStudents, 0);
  }, [courses]);

  // Get main domain (the one with most courses)
  const mainDomain = useMemo(() => {
    const domainMap = new Map<string, { count: number; color: string }>();
    courses.forEach((course) => {
      if (course.domainName) {
        const existing = domainMap.get(course.domainName) || {
          count: 0,
          color: course.domainColor || "#6366f1",
        };
        domainMap.set(course.domainName, {
          count: existing.count + 1,
          color: course.domainColor || "#6366f1",
        });
      }
    });

    // Get domain with most courses
    let mainDomainData = { name: "", count: 0, color: "#6366f1" };
    domainMap.forEach((data, name) => {
      if (data.count > mainDomainData.count) {
        mainDomainData = { name, count: data.count, color: data.color };
      }
    });

    return mainDomainData.name ? mainDomainData : null;
  }, [courses]);

  return (
    <div className="space-y-6">
      {/* Teacher Profile Card */}
      <Card className="border-border bg-gradient-to-br from-teal-50/50 to-emerald-50/50 dark:from-teal-950/20 dark:to-emerald-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {user.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              {mainDomain && (
                <div
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-gray-900"
                  style={{ backgroundColor: mainDomain.color }}
                >
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
              )}
            </div>

            {/* Teacher Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-1">
                {user.name}
              </h2>
              <p className="text-sm text-muted-foreground mb-3">{user.email}</p>

              {mainDomain && (
                <div className="flex items-center gap-2">
                  <Badge
                    className="text-sm px-4 py-1.5 font-medium"
                    style={{
                      backgroundColor: `${mainDomain.color}20`,
                      color: mainDomain.color,
                      borderColor: `${mainDomain.color}40`,
                    }}
                  >
                    Spécialité: {mainDomain.name}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {mainDomain.count} cours
                  </span>
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
                  {totalStudents}
                </div>
                <div className="text-xs text-muted-foreground">Étudiants</div>
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
                {totalStudents}
              </div>
              <div className="text-xs text-muted-foreground">Étudiants</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course List */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Mes Cours</CardTitle>
          <CardDescription>Liste de tous vos cours disponibles</CardDescription>
        </CardHeader>
        <CardContent>
          {courses.length > 0 ? (
            <div className="space-y-3">
              {courses.map((course) => (
                <div
                  key={course.courseId}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
                        style={{
                          backgroundColor: `${
                            course.domainColor || "#6366f1"
                          }20`,
                        }}
                      >
                        <BookOpen
                          className="h-5 w-5"
                          style={{ color: course.domainColor || "#6366f1" }}
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {course.courseTitle}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {course.domainName && (
                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{
                                backgroundColor: `${
                                  course.domainColor || "#6366f1"
                                }10`,
                                borderColor: course.domainColor || "#6366f1",
                                color: course.domainColor || "#6366f1",
                              }}
                            >
                              {course.domainName}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {course.totalChapters} chapitre
                            {course.totalChapters > 1 ? "s" : ""}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            •
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {course.totalStudents} étudiant
                            {course.totalStudents > 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {course.courseIsActive ? (
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                        Actif
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactif</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucun cours assigné pour le moment
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
