"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  BookOpen,
  Trophy,
  Target,
  Calendar,
  Clock,
  BarChart3,
  CheckCircle2,
  XCircle,
  Award,
  Flame,
} from "lucide-react";
import type { User } from "@/lib/auth/auth";

interface ProgressViewProps {
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
  quizAttempts: Array<{
    attemptId: number;
    quizId: number;
    quizTitle: string;
    score: number;
    maxScore: number | null;
    passed: boolean;
    attemptedAt: Date | null;
    chapterId: number;
    chapterTitle: string;
    courseId: number;
    courseTitle: string;
    domainName: string | null;
  }>;
}

interface CourseProgress {
  id: number;
  title: string;
  domain: string;
  progress: number;
  completedChapters: number;
  totalChapters: number;
  timeSpent: number; // in hours
  lastActivity: string;
}

interface QuizResult {
  id: number;
  courseName: string;
  chapterName: string;
  score: number;
  maxScore: number;
  passed: boolean;
  completedAt: string;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
  category: "course" | "quiz" | "streak" | "special";
}

export function ProgressView({
  user,
  enrolledCourses: rawEnrolledCourses,
  quizAttempts: rawQuizAttempts,
}: ProgressViewProps) {
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

  // Transform enrolled courses data
  const coursesProgress: CourseProgress[] = useMemo(() => {
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
        domain: enrollment.domainName || "Non classé",
        progress,
        completedChapters: enrollment.completedChapters,
        totalChapters: enrollment.totalChapters,
        timeSpent: 0, // TODO: Implement time tracking in the database
        lastActivity: enrollment.enrolledAt.toISOString().split("T")[0],
      };
    });
  }, [rawEnrolledCourses]);

  // Transform quiz attempts data
  const quizResults: QuizResult[] = useMemo(() => {
    return rawQuizAttempts.map((attempt) => ({
      id: attempt.attemptId,
      courseName: attempt.courseTitle,
      chapterName: attempt.chapterTitle,
      score: attempt.score,
      maxScore: attempt.maxScore || 100,
      passed: attempt.passed,
      completedAt: attempt.attemptedAt
        ? attempt.attemptedAt.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    }));
  }, [rawQuizAttempts]);

  // Calculate achievements based on real data
  const achievements: Achievement[] = useMemo(() => {
    const earnedAchievements: Achievement[] = [];

    // Check for completed courses
    const completedCoursesCount = coursesProgress.filter(
      (c) => c.progress === 100
    ).length;
    if (completedCoursesCount > 0) {
      earnedAchievements.push({
        id: 1,
        title: "Premier Cours Terminé",
        description: "Félicitations pour avoir complété votre premier cours !",
        icon: "🎓",
        earnedAt: new Date().toISOString().split("T")[0],
        category: "course",
      });
    }

    // Check for quiz mastery (5 passed quizzes with > 80%)
    const highScoreQuizzes = quizResults.filter(
      (q) => q.passed && q.score >= 80
    );
    if (highScoreQuizzes.length >= 5) {
      earnedAchievements.push({
        id: 2,
        title: "Quiz Master",
        description: "Réussi 5 quiz d'affilée avec plus de 80%",
        icon: "🏆",
        earnedAt: new Date().toISOString().split("T")[0],
        category: "quiz",
      });
    }

    return earnedAchievements;
  }, [coursesProgress, quizResults]);

  // Calculate stats with proper handling for empty arrays
  const totalProgress =
    coursesProgress.length > 0
      ? Math.round(
          coursesProgress.reduce((acc, course) => acc + course.progress, 0) /
            coursesProgress.length
        )
      : 0;
  const totalTimeSpent = coursesProgress.reduce(
    (acc, course) => acc + course.timeSpent,
    0
  );
  const completedCourses = coursesProgress.filter(
    (c) => c.progress === 100
  ).length;
  const averageQuizScore =
    quizResults.length > 0
      ? Math.round(
          quizResults.reduce((acc, quiz) => acc + quiz.score, 0) /
            quizResults.length
        )
      : 0;

  // Get unique domains from enrolled courses
  const uniqueDomains = useMemo(() => {
    const domains = new Set<string>();
    coursesProgress.forEach((course) => {
      if (course.domain) {
        domains.add(course.domain);
      }
    });
    return Array.from(domains);
  }, [coursesProgress]);

  const getDomainColor = (domain: string) => {
    // Use database domain colors or fallback to default colors
    if (domainColorMap[domain]) {
      return domainColorMap[domain];
    }

    // Fallback colors in case domain color is not in database
    const fallbackColors: Record<string, string> = {
      Informatique: "bg-blue-500",
      "Développement Web": "bg-blue-500",
      Marketing: "bg-green-500",
      "Marketing Digital": "bg-green-500",
      Design: "bg-purple-500",
      "Design Graphique": "bg-purple-500",
    };
    return fallbackColors[domain] || "bg-gray-500";
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Ma Progression</h1>
        <p className="text-muted-foreground mt-2">
          Suivez vos progrès et vos performances
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border bg-card hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Progression Globale
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProgress}%</div>
            <Progress value={totalProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-border bg-card hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps d'Étude</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTimeSpent}h</div>
            <p className="text-xs text-muted-foreground">Au total</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cours Terminés
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCourses}</div>
            <p className="text-xs text-muted-foreground">
              sur {coursesProgress.length} cours
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Moyen</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageQuizScore}%</div>
            <p className="text-xs text-muted-foreground">
              Sur {quizResults.length} quiz
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different progress views */}
      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="courses">
            <BookOpen className="h-4 w-4 mr-2" />
            Cours
          </TabsTrigger>
          <TabsTrigger value="quizzes">
            <BarChart3 className="h-4 w-4 mr-2" />
            Quiz
          </TabsTrigger>
          <TabsTrigger value="achievements">
            <Award className="h-4 w-4 mr-2" />
            Réalisations
          </TabsTrigger>
        </TabsList>

        {/* Courses Progress Tab */}
        <TabsContent value="courses" className="space-y-4">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Progression par Cours</CardTitle>
              <CardDescription>
                Détail de votre avancement dans chaque cours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {coursesProgress.map((course) => (
                <div key={course.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{course.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {course.domain}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          <span>
                            {course.completedChapters}/{course.totalChapters}{" "}
                            chapitres
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{course.timeSpent}h</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(course.lastActivity).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "numeric",
                                month: "short",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {course.progress}%
                      </div>
                    </div>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Course Progress Chart */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Progression par Domaine</CardTitle>
              <CardDescription>
                Répartition de vos cours par domaine d'étude
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {uniqueDomains.length > 0 ? (
                  uniqueDomains.map((domain) => {
                    const domainCourses = coursesProgress.filter(
                      (c) => c.domain === domain
                    );
                    const domainProgress =
                      domainCourses.length > 0
                        ? Math.round(
                            domainCourses.reduce(
                              (acc, c) => acc + c.progress,
                              0
                            ) / domainCourses.length
                          )
                        : 0;

                    return (
                      <div key={domain} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${getDomainColor(
                                domain
                              )}`}
                            />
                            <span className="font-medium">{domain}</span>
                            <span className="text-sm text-muted-foreground">
                              ({domainCourses.length}{" "}
                              {domainCourses.length > 1 ? "cours" : "cours"})
                            </span>
                          </div>
                          <span className="font-semibold text-primary">
                            {domainProgress}%
                          </span>
                        </div>
                        <Progress value={domainProgress} className="h-2" />
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Aucun domaine disponible. Inscrivez-vous à un cours pour
                    commencer.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quizzes Tab */}
        <TabsContent value="quizzes" className="space-y-4">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Résultats des Quiz</CardTitle>
              <CardDescription>Historique de vos évaluations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quizResults.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-full ${
                          quiz.passed
                            ? "bg-emerald-100 dark:bg-emerald-950"
                            : "bg-red-100 dark:bg-red-950"
                        }`}
                      >
                        {quiz.passed ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold">{quiz.chapterName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {quiz.courseName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(quiz.completedAt).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {quiz.score}/{quiz.maxScore}
                      </div>
                      <Badge
                        variant={quiz.passed ? "default" : "destructive"}
                        className="mt-1"
                      >
                        {quiz.passed ? "Réussi" : "Échoué"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Mes Réalisations</CardTitle>
              <CardDescription>
                Les badges et trophées que vous avez gagnés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 hover:shadow-md transition-all"
                  >
                    <div className="text-4xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">
                        {achievement.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {achievement.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Obtenu le{" "}
                          {new Date(achievement.earnedAt).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Streak Card */}
          <Card className="border-border bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                Série d'Apprentissage
              </CardTitle>
              <CardDescription>
                Continuez à apprendre chaque jour pour maintenir votre série
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold text-orange-500">7</div>
                  <p className="text-sm text-muted-foreground">
                    jours consécutifs
                  </p>
                </div>
                <div className="text-6xl">🔥</div>
              </div>
              <div className="mt-4 p-3 bg-white dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium mb-2">
                  Prochain objectif : 14 jours
                </p>
                <Progress value={50} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
