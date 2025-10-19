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

interface TeacherDashboardProps {
  user: User;
}

export function TeacherDashboard({ user }: TeacherDashboardProps) {
  // Mock data - replace with real data from database
  const stats = {
    totalCourses: 3,
    activeCourses: 2,
    totalStudents: 105,
    activeStudents: 89,
    averageCompletion: 72,
    averageQuizScore: 84,
    totalChapters: 30,
  };

  const recentActivity = [
    {
      id: 1,
      type: "quiz_completed",
      student: "Marie Dupont",
      course: "Introduction à React",
      chapter: "Composants et Props",
      score: 85,
      timestamp: "2025-01-15T10:30:00Z",
    },
    {
      id: 2,
      type: "chapter_completed",
      student: "Pierre Bernard",
      course: "Marketing Digital Avancé",
      chapter: "Analytics et KPIs",
      timestamp: "2025-01-15T09:15:00Z",
    },
    {
      id: 3,
      type: "course_enrolled",
      student: "Sophie Martin",
      course: "Design UX/UI Moderne",
      timestamp: "2025-01-14T16:45:00Z",
    },
  ];

  return (
    <div className="space-y-6">
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
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium">Introduction à React</p>
                    <p className="text-sm text-muted-foreground">
                      45 étudiants inscrits
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">68%</p>
                    <p className="text-xs text-muted-foreground">
                      progression moyenne
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium">Marketing Digital Avancé</p>
                    <p className="text-sm text-muted-foreground">
                      32 étudiants inscrits
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">85%</p>
                    <p className="text-xs text-muted-foreground">
                      progression moyenne
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium">Design UX/UI Moderne</p>
                    <p className="text-sm text-muted-foreground">
                      28 étudiants inscrits
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">42%</p>
                    <p className="text-xs text-muted-foreground">
                      progression moyenne
                    </p>
                  </div>
                </div>
              </div>
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
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.student}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.type === "quiz_completed" &&
                          `Quiz terminé - ${activity.chapter} (${activity.score}%)`}
                        {activity.type === "chapter_completed" &&
                          `Chapitre terminé - ${activity.chapter}`}
                        {activity.type === "course_enrolled" &&
                          `Inscrit au cours ${activity.course}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleDateString(
                          "fr-FR"
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Meilleurs Étudiants</CardTitle>
              <CardDescription>Top performers ce mois</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      1
                    </div>
                    <span className="text-sm font-medium">Marie Dupont</span>
                  </div>
                  <Badge variant="secondary">95%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      2
                    </div>
                    <span className="text-sm font-medium">Pierre Bernard</span>
                  </div>
                  <Badge variant="secondary">89%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      3
                    </div>
                    <span className="text-sm font-medium">Sophie Martin</span>
                  </div>
                  <Badge variant="secondary">87%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
