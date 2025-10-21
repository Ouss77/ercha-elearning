"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Flag,
  BookOpen,
  CheckCircle2,
  Clock,
  Calendar,
  Trophy,
  Target,
} from "lucide-react";
import Link from "next/link";
import type { User } from "@/lib/auth/auth";

interface CheckpointsViewProps {
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

interface Checkpoint {
  id: number;
  courseId: number;
  courseTitle: string;
  domainName: string;
  domainColor: string;
  type: "chapter" | "milestone" | "completion";
  title: string;
  description: string;
  progress: number;
  isCompleted: boolean;
  completedAt?: Date;
  dueDate?: Date;
}

export function CheckpointsView({
  user,
  enrolledCourses,
}: CheckpointsViewProps) {
  // Generate checkpoints from enrolled courses
  const checkpoints: Checkpoint[] = useMemo(() => {
    const allCheckpoints: Checkpoint[] = [];

    enrolledCourses.forEach((course) => {
      const progress =
        course.totalChapters > 0
          ? Math.round((course.completedChapters / course.totalChapters) * 100)
          : 0;

      // Milestone at 25%
      if (course.totalChapters >= 4) {
        const milestone25 = Math.ceil(course.totalChapters * 0.25);
        allCheckpoints.push({
          id: course.courseId * 1000 + 1,
          courseId: course.courseId,
          courseTitle: course.courseTitle,
          domainName: course.domainName || "Non classé",
          domainColor: course.domainColor || "#6366f1",
          type: "milestone",
          title: `Premier jalon - ${course.courseTitle}`,
          description: `Complétez ${milestone25} chapitres sur ${course.totalChapters}`,
          progress: Math.min(
            100,
            (course.completedChapters / milestone25) * 100
          ),
          isCompleted: course.completedChapters >= milestone25,
          completedAt:
            course.completedChapters >= milestone25
              ? course.enrolledAt
              : undefined,
        });
      }

      // Milestone at 50%
      if (course.totalChapters >= 2) {
        const milestone50 = Math.ceil(course.totalChapters * 0.5);
        allCheckpoints.push({
          id: course.courseId * 1000 + 2,
          courseId: course.courseId,
          courseTitle: course.courseTitle,
          domainName: course.domainName || "Non classé",
          domainColor: course.domainColor || "#6366f1",
          type: "milestone",
          title: `Mi-parcours - ${course.courseTitle}`,
          description: `Complétez ${milestone50} chapitres sur ${course.totalChapters}`,
          progress: Math.min(
            100,
            (course.completedChapters / milestone50) * 100
          ),
          isCompleted: course.completedChapters >= milestone50,
          completedAt:
            course.completedChapters >= milestone50
              ? course.enrolledAt
              : undefined,
        });
      }

      // Milestone at 75%
      if (course.totalChapters >= 4) {
        const milestone75 = Math.ceil(course.totalChapters * 0.75);
        allCheckpoints.push({
          id: course.courseId * 1000 + 3,
          courseId: course.courseId,
          courseTitle: course.courseTitle,
          domainName: course.domainName || "Non classé",
          domainColor: course.domainColor || "#6366f1",
          type: "milestone",
          title: `Dernier effort - ${course.courseTitle}`,
          description: `Complétez ${milestone75} chapitres sur ${course.totalChapters}`,
          progress: Math.min(
            100,
            (course.completedChapters / milestone75) * 100
          ),
          isCompleted: course.completedChapters >= milestone75,
          completedAt:
            course.completedChapters >= milestone75
              ? course.enrolledAt
              : undefined,
        });
      }

      // Course completion checkpoint
      allCheckpoints.push({
        id: course.courseId * 1000 + 4,
        courseId: course.courseId,
        courseTitle: course.courseTitle,
        domainName: course.domainName || "Non classé",
        domainColor: course.domainColor || "#6366f1",
        type: "completion",
        title: `Terminer - ${course.courseTitle}`,
        description: `Complétez tous les ${course.totalChapters} chapitres`,
        progress,
        isCompleted: course.completedAt !== null,
        completedAt: course.completedAt || undefined,
      });
    });

    // Sort by completion status and progress
    return allCheckpoints.sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      return b.progress - a.progress;
    });
  }, [enrolledCourses]);

  const stats = useMemo(() => {
    const completed = checkpoints.filter((c) => c.isCompleted).length;
    const total = checkpoints.length;
    const inProgress = checkpoints.filter(
      (c) => !c.isCompleted && c.progress > 0
    ).length;

    return {
      completed,
      total,
      inProgress,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [checkpoints]);

  const formatDate = (date?: Date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getCheckpointIcon = (type: Checkpoint["type"]) => {
    switch (type) {
      case "milestone":
        return Flag;
      case "completion":
        return Trophy;
      default:
        return Target;
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border bg-gradient-to-br from-teal-50/50 to-emerald-50/50 dark:from-teal-950/20 dark:to-emerald-950/20 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                  Jalons Complétés
                </p>
                <p className="text-4xl font-bold text-teal-600 dark:text-teal-400">
                  {stats.completed}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Sur {stats.total} jalons
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 shadow-lg">
                <CheckCircle2 className="h-8 w-8 text-white" />
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
                  {stats.inProgress}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Jalons actifs
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg">
                <Clock className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-gradient-to-br from-cyan-50/50 to-blue-50/50 dark:from-cyan-950/20 dark:to-blue-950/20 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                  Progression
                </p>
                <p className="text-4xl font-bold text-cyan-600 dark:text-cyan-400">
                  {stats.percentage}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">Globale</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg">
                <Target className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Mes Jalons</h2>
        <p className="text-muted-foreground">
          Suivez votre progression à travers vos cours
        </p>
      </div>

      {/* Checkpoints List */}
      {checkpoints.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="text-center py-12">
            <div className="inline-flex p-4 rounded-full bg-muted mb-4">
              <Flag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Aucun jalon disponible
            </h3>
            <p className="text-muted-foreground mb-6">
              Inscrivez-vous à des cours pour commencer votre parcours
            </p>
            <Link href="/etudiant/cours">
              <Button className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white">
                Parcourir les cours
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {checkpoints.map((checkpoint, index) => {
            const Icon = getCheckpointIcon(checkpoint.type);
            const isLastInProgress =
              !checkpoint.isCompleted &&
              (index === 0 ||
                checkpoints[index - 1].isCompleted ||
                checkpoints[index - 1].courseId !== checkpoint.courseId);

            return (
              <Card
                key={checkpoint.id}
                className={`border-border bg-card hover:shadow-lg transition-all duration-300 ${
                  isLastInProgress ? "ring-2 ring-teal-500/50" : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`p-3 rounded-xl flex-shrink-0 ${
                        checkpoint.isCompleted
                          ? "bg-gradient-to-br from-emerald-500 to-teal-500"
                          : isLastInProgress
                          ? "bg-gradient-to-br from-teal-500 to-cyan-500"
                          : "bg-muted"
                      }`}
                    >
                      <Icon
                        className={`h-6 w-6 ${
                          checkpoint.isCompleted || isLastInProgress
                            ? "text-white"
                            : "text-muted-foreground"
                        }`}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-foreground mb-1">
                            {checkpoint.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {checkpoint.description}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              style={{
                                backgroundColor: `${checkpoint.domainColor}20`,
                                color: checkpoint.domainColor,
                                borderColor: `${checkpoint.domainColor}40`,
                              }}
                            >
                              {checkpoint.domainName}
                            </Badge>
                            {checkpoint.type === "milestone" && (
                              <Badge variant="outline" className="text-xs">
                                <Flag className="h-3 w-3 mr-1" />
                                Jalon
                              </Badge>
                            )}
                            {checkpoint.type === "completion" && (
                              <Badge variant="outline" className="text-xs">
                                <Trophy className="h-3 w-3 mr-1" />
                                Complétion
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex-shrink-0">
                          {checkpoint.isCompleted ? (
                            <Badge className="bg-emerald-500 text-white">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Complété
                            </Badge>
                          ) : checkpoint.progress > 0 ? (
                            <Badge className="bg-teal-500 text-white">
                              <Clock className="h-3 w-3 mr-1" />
                              En cours
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <Target className="h-3 w-3 mr-1" />À venir
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {!checkpoint.isCompleted && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-muted-foreground font-medium">
                              Progression
                            </span>
                            <span className="font-semibold text-teal-600 dark:text-teal-400">
                              {Math.round(checkpoint.progress)}%
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${checkpoint.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {checkpoint.completedAt && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                Complété le {formatDate(checkpoint.completedAt)}
                              </span>
                            </div>
                          )}
                        </div>
                        <Link
                          href={`/etudiant/cours/${checkpoint.courseId}/tests`}
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="hover:bg-teal-50 hover:text-teal-600 dark:hover:bg-teal-950 dark:hover:text-teal-400"
                          >
                            <BookOpen className="h-4 w-4 mr-2" />
                            Voir les tests
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
