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

  // Get domain statistics
  const domainStats = useMemo(() => {
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
    return Array.from(domainMap.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      color: data.color,
    }));
  }, [courses]);

  return (
    <div className="space-y-6">
      {/* Domain Focus Section */}
      {domainStats.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">
              Mes Domaines d'Enseignement
            </CardTitle>
            <CardDescription>
              Spécialités et répartition des cours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {domainStats.map((domain) => (
                <Badge
                  key={domain.name}
                  className="text-sm px-4 py-2"
                  style={{
                    backgroundColor: `${domain.color}20`,
                    color: domain.color,
                    borderColor: `${domain.color}40`,
                  }}
                >
                  {domain.name} ({domain.count} cours)
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mes Cours</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeCourses} actifs
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Étudiants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeStudents} actifs ce mois
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Performance Overview */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Performance des Cours</CardTitle>
              <CardDescription>
                Aperçu de la progression dans vos cours
              </CardDescription>
            </CardHeader>
            <CardContent>
              {coursesWithProgress.length > 0 ? (
                <div className="space-y-4">
                  {coursesWithProgress.map((course) => (
                    <div
                      key={course.courseId}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{course.courseTitle}</p>
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
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {course.totalStudents} étudiant
                          {course.totalStudents > 1 ? "s" : ""} inscrit
                          {course.totalStudents > 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {course.averageProgress}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          progression moyenne
                        </p>
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Activité Récente</CardTitle>
              <CardDescription>
                Dernières actions de vos étudiants
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={`${activity.type}-${activity.id}`}
                      className="flex items-start space-x-3"
                    >
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {activity.studentName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.type === "quiz_completed" &&
                            `Quiz terminé - ${activity.chapterTitle} (${activity.score}%)`}
                          {activity.type === "chapter_completed" &&
                            `Chapitre terminé - ${activity.chapterTitle}`}
                          {activity.type === "course_enrolled" &&
                            `Inscrit au cours ${activity.courseTitle}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.timestamp
                            ? new Date(activity.timestamp).toLocaleDateString(
                                "fr-FR"
                              )
                            : "Date inconnue"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucune activité récente
                </p>
              )}
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Meilleurs Étudiants</CardTitle>
              <CardDescription>Top performers ce mois</CardDescription>
            </CardHeader>
            <CardContent>
              {topStudents.length > 0 ? (
                <div className="space-y-3">
                  {topStudents.map((student, index) => (
                    <div
                      key={student.studentId}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                            index === 0
                              ? "bg-yellow-500"
                              : index === 1
                              ? "bg-gray-400"
                              : "bg-orange-500"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium truncate max-w-[120px]">
                          {student.studentName}
                        </span>
                      </div>
                      <Badge variant="secondary">
                        {student.progressPercentage}%
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun étudiant inscrit
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
