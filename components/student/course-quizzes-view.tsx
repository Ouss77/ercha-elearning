"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Trophy,
  Target,
  PlayCircle,
  Calendar,
} from "lucide-react";
import Link from "next/link";

interface CourseQuizzesViewProps {
  courseId: number;
  courseTitle: string;
  quizzes: Array<{
    quizId: number;
    quizTitle: string;
    passingScore: number | null;
    chapterId: number | null;
    chapterTitle: string | null;
    chapterOrder: number | null;
    totalAttempts: number;
    bestScore: number | null;
    passed: boolean;
    lastAttemptedAt: Date | null;
  }>;
}

export function CourseQuizzesView({
  courseId,
  courseTitle,
  quizzes,
}: CourseQuizzesViewProps) {
  const stats = {
    total: quizzes.length,
    completed: quizzes.filter((q) => q.passed).length,
    pending: quizzes.filter((q) => !q.passed).length,
    attempted: quizzes.filter((q) => q.totalAttempts > 0).length,
  };

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Sort quizzes: pending first, then completed
  const sortedQuizzes = [...quizzes].sort((a, b) => {
    if (a.passed !== b.passed) {
      return a.passed ? 1 : -1;
    }
    return (a.chapterOrder || 0) - (b.chapterOrder || 0);
  });

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-border bg-gradient-to-br from-teal-50/50 to-emerald-50/50 dark:from-teal-950/20 dark:to-emerald-950/20 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                  Total Tests
                </p>
                <p className="text-4xl font-bold text-teal-600 dark:text-teal-400">
                  {stats.total}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Dans ce cours
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 shadow-lg">
                <Target className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-gradient-to-br from-emerald-50/50 to-cyan-50/50 dark:from-emerald-950/20 dark:to-cyan-950/20 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                  Réussis
                </p>
                <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.completed}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tests validés
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                  En Attente
                </p>
                <p className="text-4xl font-bold text-amber-600 dark:text-amber-400">
                  {stats.pending}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  À compléter
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
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
                  Tentatives
                </p>
                <p className="text-4xl font-bold text-cyan-600 dark:text-cyan-400">
                  {stats.attempted}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tests essayés
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg">
                <PlayCircle className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">{courseTitle}</h2>
        <p className="text-muted-foreground">Tests et évaluations du cours</p>
      </div>

      {/* Quizzes List */}
      {quizzes.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="text-center py-12">
            <div className="inline-flex p-4 rounded-full bg-muted mb-4">
              <Target className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Aucun test disponible
            </h3>
            <p className="text-muted-foreground mb-6">
              Ce cours ne contient pas encore de tests
            </p>
            <Link href={`/etudiant/cours/${courseId}`}>
              <Button className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white">
                Retour au cours
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedQuizzes.map((quiz) => {
            const isNextToAttempt =
              !quiz.passed &&
              quiz.totalAttempts === 0 &&
              sortedQuizzes.filter((q) => !q.passed).indexOf(quiz) === 0;

            return (
              <Card
                key={quiz.quizId}
                className={`border-border bg-card hover:shadow-lg transition-all duration-300 ${
                  isNextToAttempt ? "ring-2 ring-teal-500/50" : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`p-3 rounded-xl flex-shrink-0 ${
                        quiz.passed
                          ? "bg-gradient-to-br from-emerald-500 to-teal-500"
                          : quiz.totalAttempts > 0
                          ? "bg-gradient-to-br from-amber-500 to-orange-500"
                          : "bg-gradient-to-br from-teal-500 to-cyan-500"
                      }`}
                    >
                      {quiz.passed ? (
                        <Trophy className="h-6 w-6 text-white" />
                      ) : quiz.totalAttempts > 0 ? (
                        <Clock className="h-6 w-6 text-white" />
                      ) : (
                        <Target className="h-6 w-6 text-white" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-foreground mb-1">
                            {quiz.quizTitle}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            Chapitre: {quiz.chapterTitle || "N/A"}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              <Target className="h-3 w-3 mr-1" />
                              Score minimum: {quiz.passingScore}%
                            </Badge>
                            {quiz.totalAttempts > 0 && (
                              <Badge variant="outline" className="text-xs">
                                <PlayCircle className="h-3 w-3 mr-1" />
                                {quiz.totalAttempts} tentative
                                {quiz.totalAttempts > 1 ? "s" : ""}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex-shrink-0">
                          {quiz.passed ? (
                            <Badge className="bg-emerald-500 text-white">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Réussi
                            </Badge>
                          ) : quiz.totalAttempts > 0 ? (
                            <Badge className="bg-amber-500 text-white">
                              <XCircle className="h-3 w-3 mr-1" />
                              En cours
                            </Badge>
                          ) : (
                            <Badge className="bg-teal-500 text-white">
                              <Clock className="h-3 w-3 mr-1" />
                              Non tenté
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Score Info */}
                      {quiz.bestScore !== null && (
                        <div className="mb-3 p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Meilleur score:
                            </span>
                            <span
                              className={`text-lg font-bold ${
                                quiz.passed
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-amber-600 dark:text-amber-400"
                              }`}
                            >
                              {quiz.bestScore}%
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {quiz.lastAttemptedAt && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                Dernier essai:{" "}
                                {formatDate(quiz.lastAttemptedAt)}
                              </span>
                            </div>
                          )}
                        </div>
                        <Link href={`/etudiant/cours/${courseId}`}>
                          <Button
                            size="sm"
                            className={
                              quiz.passed
                                ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                                : "bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
                            }
                          >
                            {quiz.passed ? (
                              <>
                                <Trophy className="h-4 w-4 mr-2" />
                                Revoir
                              </>
                            ) : (
                              <>
                                <PlayCircle className="h-4 w-4 mr-2" />
                                {quiz.totalAttempts > 0
                                  ? "Réessayer"
                                  : "Commencer"}
                              </>
                            )}
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
